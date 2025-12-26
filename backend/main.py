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

from utils.logging import CorrelationIdMiddleware
from utils.metrics import metrics_middleware
from utils.tracing import setup_tracing
from utils.rate_limiter import init_rate_limiter

from db import create_tables, test_connection

create_tables()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Todo API...")
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

# ==================== CORS CONFIGURATION ====================
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

print(f"CORS enabled for origins: {origins}")

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
    
    # Get the origin from request
    origin = request.headers.get("origin", "http://localhost:3000")
    
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
app.include_router(auth_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(tasks.router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router, prefix=f"{settings.API_V1_PREFIX}/tasks")
app.include_router(filtered_tasks_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(bulk_operations_router, prefix=settings.API_V1_PREFIX)
app.include_router(import_export_router, prefix=settings.API_V1_PREFIX)
app.include_router(user_preferences_router, prefix=settings.API_V1_PREFIX)
app.include_router(projects_router, prefix=settings.API_V1_PREFIX)
app.include_router(websocket_router, prefix=settings.API_V1_PREFIX)
app.include_router(profile_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(tags_router, prefix=settings.API_V1_PREFIX)

# ==================== BASIC ENDPOINTS ====================
@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

@app.get("/health")
def health_check():
    db_status = test_connection()
    return {"status": "healthy" if db_status else "unhealthy"}

@app.get("/metrics")
def metrics():
    from utils.metrics import get_metrics
    return Response(content=get_metrics(), media_type="text/plain")