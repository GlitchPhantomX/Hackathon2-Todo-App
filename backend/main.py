import os
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

# ❌ REMOVE THIS - Move to lifespan
# create_tables()

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
    print("Starting up Todo API...")
    
    # ✅ Move create_tables here
    try:
        print("Creating database tables...")
        create_tables()
        print("✅ Tables created successfully")
    except Exception as e:
        print(f"⚠️ Table creation error (may already exist): {e}")
    
    # Create demo user on startup
    try:
        create_demo_user()
    except Exception as e:
        print(f"⚠️ Demo user creation error: {e}")
    
    yield
    
    print("Shutting down Todo API...")

# Create app
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ... rest of your code remains the same ...

# Environment config
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

@app.middleware("http")
async def dev_mode_auth(request: Request, call_next):
    """Development mode: Extract user from JWT token"""
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response

    if DEV_MODE and request.url.path.startswith("/api/chat"):
        print("\n" + "🔐" * 30)
        print("🔐 DEV_MODE MIDDLEWARE: Processing /api/chat request")

        auth_header = request.headers.get("Authorization", "")

        if auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")

            try:
                from jose import jwt
                from config import settings

                payload = jwt.decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=[settings.ALGORITHM]
                )

                print(f"🔓 Token decoded: {payload}")

                user_id = payload.get("sub") or payload.get("user_id")

                if user_id:
                    from db import engine
                    with Session(engine) as session:
                        user = session.get(User, int(user_id))

                        if user:
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
        else:
            print(f"⚠️ DEV_MODE: No Authorization header found")

        print("🔐" * 30 + "\n")

    response = await call_next(request)
    return response

# CORS Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
if cors_origins_env == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

print(f"CORS enabled for origins: {origins}")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches ALL unhandled exceptions and ensures CORS headers are present"""
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
    
    origin = request.headers.get("origin", "http://localhost:3000")
    
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

# Other Middleware
setup_tracing(app)
init_rate_limiter(app)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(metrics_middleware)

# Routers
app.include_router(auth_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(tasks.me_router, prefix=settings.API_V1_PREFIX)
app.include_router(tasks.router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router, prefix=f"{settings.API_V1_PREFIX}/tasks")
app.include_router(filtered_tasks_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(bulk_operations_router, prefix=settings.API_V1_PREFIX)
app.include_router(import_export_router, prefix=settings.API_V1_PREFIX)
app.include_router(user_preferences_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(profile_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(tags_router, prefix=settings.API_V1_PREFIX)
app.include_router(websocket_router)
app.include_router(chat_router, prefix="/api")

# Basic Endpoints
@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

@app.get("/health")
def health_check():
    """Simple health check - returns immediately"""
    return {"status": "healthy"}

# ✅ Add database health check as separate endpoint
@app.get("/health/db")
def health_check_db():
    """Database health check"""
    db_status = test_connection()
    return {"status": "healthy" if db_status else "unhealthy", "database": db_status}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return Response(status_code=200)

@app.get("/metrics")
def metrics():
    from utils.metrics import get_metrics
    return Response(content=get_metrics(), media_type="text/plain")

# Remove @app.on_event("startup") - already using lifespan