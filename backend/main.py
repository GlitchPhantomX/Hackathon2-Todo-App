import os
import logging
from fastapi import FastAPI, Response, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import traceback

from config import settings
from routers import auth_router, tasks
from routers.stats import router as stats_router
from routers.filtered_tasks import router as filtered_tasks_router
from routers.notifications import router as notifications_router
from routers.bulk_operations import router as bulk_operations_router
from routers.import_export import router as import_export_router
from routers.user_preferences import router as user_preferences_router
from routers.user_settings import router as user_settings_router
from routers.projects import router as projects_router
from routers.websocket import router as websocket_router
from routers.profile import router as profile_router
from routers.settings import router as settings_router
from routers.tags import router as tags_router
from routers.chat_router import router as chat_router

from utils.logging import CorrelationIdMiddleware
from utils.metrics import metrics_middleware
from utils.tracing import setup_tracing
from utils.rate_limiter import init_rate_limiter

from db import create_tables, test_connection

from sqlmodel import Session, select
from models import User
import bcrypt

# Import services for Kafka and Dapr initialization
from services.event_producer import event_producer
from services.dapr_service import dapr_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

create_tables()

def create_demo_user():
    """Create a demo user for development if not exists"""
    from db import engine
    with Session(engine) as session:
        statement = select(User).where(User.email == "demo@example.com")
        existing_user = session.exec(statement).first()

        if not existing_user:
            hashed_password = bcrypt.hashpw("demo123".encode(), bcrypt.gensalt()).decode()
            demo_user = User(
                email="demo@example.com",
                name="Demo User",
                hashed_password=hashed_password,
                timezone="UTC",
                locale="en-US"
            )
            session.add(demo_user)
            session.commit()
            session.refresh(demo_user)
            print("✅ Demo user created: demo@example.com / demo123")
            return demo_user
        return existing_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Todo API...")
    # Initialize Kafka and Dapr services
    try:
        # Initialize Kafka producer
        event_producer._initialize_producer()
        logger.info("✅ Kafka producer initialized")
    except Exception as e:
        logger.error(f"⚠️  Failed to initialize Kafka producer: {e}", exc_info=True)

    try:
        # Initialize Dapr service
        dapr_service.client = None  # Will be initialized via context manager when needed
        logger.info("✅ Dapr service prepared")
    except Exception as e:
        logger.error(f"⚠️  Failed to prepare Dapr service: {e}", exc_info=True)

    # Create demo user on startup
    try:
        create_demo_user()
    except Exception as e:
        logger.error(f"⚠️  Failed to create demo user: {e}", exc_info=True)

    # Start the reminder scheduler
    try:
        from services.reminder_scheduler import get_scheduler, ReminderScheduler
        from db import engine
        from sqlmodel import Session

        # Create a session that will be used throughout the app lifecycle
        scheduler_session = Session(engine)
        scheduler = ReminderScheduler(scheduler_session)

        # Start the continuous scheduler as a background task
        import asyncio
        reminder_task = asyncio.create_task(scheduler.schedule_continuous_reminders(interval_minutes=1))
        logger.info("✅ Reminder scheduler started")

        # Store the scheduler and task in the app state for potential cleanup
        app.state.reminder_scheduler = scheduler
        app.state.reminder_task = reminder_task
    except Exception as e:
        logger.error(f"⚠️  Failed to start reminder scheduler: {e}", exc_info=True)

    yield

    # Cleanup on shutdown
    logger.info("Shutting down Todo API...")
    try:
        # Cancel the reminder scheduler task
        if hasattr(app.state, 'reminder_task'):
            app.state.reminder_task.cancel()
            try:
                # We can't use await here in the yield context, so just cancel
                pass
            except Exception:
                pass  # Task might already be cancelled

        # Close the scheduler session
        if hasattr(app.state, 'reminder_scheduler'):
            scheduler_session = app.state.reminder_scheduler.db_session
            if scheduler_session:
                try:
                    scheduler_session.close()
                except Exception as session_close_error:
                    logger.error(f"⚠️  Error closing scheduler session: {session_close_error}")

        event_producer.close()
        logger.info("✅ Kafka producer closed")
    except Exception as e:
        logger.error(f"⚠️  Error during shutdown: {e}", exc_info=True)

# Create app
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Environment config
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# ✅ FIXED: Extract user from token instead of hardcoding demo user
@app.middleware("http")
async def dev_mode_auth(request: Request, call_next):
    """
    Development mode: Extract user from JWT token
    ✅ FIXED: No longer hardcodes demo user - validates token instead
    ✅ FIXED: Handle OPTIONS requests to prevent CORS issues
    """
    # ✅ Handle preflight OPTIONS requests immediately
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response

    if DEV_MODE and request.url.path.startswith("/api/chat"):
        print("\n" + "🔐" * 30)
        print("🔐 DEV_MODE MIDDLEWARE: Processing /api/chat request")

        # Try to extract user from Authorization header
        auth_header = request.headers.get("Authorization", "")

        if auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")

            try:
                from jose import jwt
                from config import settings

                # Decode token
                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=[settings.ALGORITHM]
                )

                print(f"🔓 Token decoded: {payload}")

                # Extract user_id from token
                user_id = payload.get("sub") or payload.get("user_id")

                if user_id:
                    # Get user from database
                    from db import engine
                    with Session(engine) as session:
                        user = session.get(User, int(user_id))

                        if user:
                            # ✅ SET CORRECT USER FROM TOKEN
                            request.state.user = {
                                "user_id": user.id,
                                "email": user.email,
                                "name": user.name
                            }
                            print(f"✅ DEV_MODE: Set user from token")
                            print(f"   👤 User ID: {user.id}")
                            print(f"   📧 Email: {user.email}")
                            print(f"   📛 Name: {user.name}")
                        else:
                            print(f"⚠️ DEV_MODE: User {user_id} not found in database")
                else:
                    print(f"⚠️ DEV_MODE: No user_id/sub in token payload")

            except Exception as e:
                print(f"⚠️ DEV_MODE: Token validation failed: {e}")
                import traceback
                traceback.print_exc()
                # Don't set request.state.user if token is invalid
        else:
            print(f"⚠️ DEV_MODE: No Authorization header found")

        print("🔐" * 30 + "\n")

    response = await call_next(request)
    return response

# ==================== CORS CONFIGURATION ====================
# ==================== CORS CONFIGURATION ====================
# Read CORS origins from environment or allow all for development
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # ✅ Use property from config
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

print(f"CORS enabled for origins: {settings.cors_origins}")

# ==================== GLOBAL EXCEPTION HANDLER ====================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catches ALL unhandled exceptions and ensures CORS headers are present
    """
    print("\n" + "="*80)
    print("[ERROR] GLOBAL EXCEPTION HANDLER TRIGGERED")
    print("="*80)
    print(f"Path: {request.url.path}")
    print(f"Method: {request.method}")
    print(f"Error Type: {type(exc).__name__}")
    print(f"Error Message: {str(exc)}")
    print("\n[TRACEBACK] Full Traceback:")
    print("-"*80)
    traceback.print_exc()
    print("="*80 + "\n")

    # Get the origin from request - handle both origin and referer
    origin = request.headers.get("origin") or request.headers.get("referer") or "http://localhost:3000"

    # Determine status code and message
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        detail = exc.detail
    else:
        status_code = 500
        detail = f"Internal server error: {str(exc)}"

    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# ==================== OTHER MIDDLEWARE ====================
setup_tracing(app)
init_rate_limiter(app)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(metrics_middleware)

# ==================== ROUTERS ====================
# Auth router
app.include_router(auth_router.router, prefix=settings.API_V1_PREFIX)

# ✅ NEW: Tasks routers - /users/me/tasks (primary) and /users/{user_id}/tasks (legacy)
app.include_router(tasks.me_router, prefix=settings.API_V1_PREFIX)  # /api/v1/users/me/tasks
app.include_router(tasks.router, prefix=settings.API_V1_PREFIX)     # /api/v1/users/{user_id}/tasks

# Other task-related routers
app.include_router(stats_router, prefix=f"{settings.API_V1_PREFIX}/tasks")
app.include_router(filtered_tasks_router, prefix=settings.API_V1_PREFIX)

# Feature routers
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(bulk_operations_router, prefix=settings.API_V1_PREFIX)
app.include_router(import_export_router, prefix=settings.API_V1_PREFIX)
app.include_router(user_preferences_router, prefix=settings.API_V1_PREFIX)
app.include_router(user_settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(profile_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(tags_router, prefix=settings.API_V1_PREFIX)

# ✅ WebSocket router - WITHOUT /api/v1 prefix (WebSocket needs clean path)
app.include_router(websocket_router)

# ✅ CHAT ROUTER - Separate prefix to match frontend expectations
app.include_router(chat_router, prefix="/api")

# ==================== BASIC ENDPOINTS ====================
@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

@app.get("/health")
def health_check():
    db_status = test_connection()
    return {"status": "healthy" if db_status else "unhealthy"}

# ✅ CORS Preflight handler for all OPTIONS requests
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    # Get origin from request
    origin = request.headers.get("origin", "http://localhost:3000")

    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.get("/metrics")
def metrics():
    from utils.metrics import get_metrics
    return Response(content=get_metrics(), media_type="text/plain")

# ==================== STARTUP MESSAGE ====================
@app.on_event("startup")
async def startup_message():
    print("\n" + "="*80)
    print("🚀 TODO APP API STARTED")
    print("="*80)
    print(f"📍 API URL: http://localhost:8000")
    print(f"📖 Docs: http://localhost:8000/docs")
    print(f"🔐 Auth endpoints:")
    print(f"   - POST /api/v1/auth/register")
    print(f"   - POST /api/v1/auth/login")
    print(f"   - GET  /api/v1/auth/me")
    print(f"📋 Task endpoints:")
    print(f"   - POST /api/v1/users/me/tasks")
    print(f"   - GET  /api/v1/users/me/tasks")
    print(f"   - GET  /api/v1/users/me/tasks/sync")
    print(f"   - PUT  /api/v1/users/me/tasks/{{task_id}}")
    print(f"   - DELETE /api/v1/users/me/tasks/{{task_id}}")
    print(f"🔌 WebSocket: ws://localhost:8000/ws/notifications")
    print(f"💬 Chat: http://localhost:8000/api/chat")
    print("="*80 + "\n")