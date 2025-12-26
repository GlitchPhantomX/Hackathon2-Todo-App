from prometheus_client import Counter, Histogram, Gauge, generate_latest, REGISTRY
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

# =============================
# Task operation counters
# =============================

task_create_counter = Counter(
    "task_create_total",
    "Total number of task creations",
    ["status"],
)

task_read_counter = Counter(
    "task_read_total",
    "Total number of task reads",
    ["status"],
)

task_update_counter = Counter(
    "task_update_total",
    "Total number of task updates",
    ["status"],
)

task_delete_counter = Counter(
    "task_delete_total",
    "Total number of task deletions",
    ["status"],
)

# =============================
# API response time histogram
# =============================

api_response_time = Histogram(
    "api_response_time_seconds",
    "API response time in seconds",
    ["method", "endpoint", "status_code"],
)

# =============================
# Database operation histogram
# =============================

db_operation_duration = Histogram(
    "db_operation_duration_seconds",
    "Database operation duration in seconds",
    ["operation", "table"],
)

# =============================
# Gauges
# =============================

active_users_gauge = Gauge("active_users", "Number of active users")
active_sessions_gauge = Gauge("active_sessions", "Number of active sessions")
total_tasks_gauge = Gauge("total_tasks", "Total number of tasks")
completed_tasks_gauge = Gauge("completed_tasks", "Completed tasks")
pending_tasks_gauge = Gauge("pending_tasks", "Pending tasks")
overdue_tasks_gauge = Gauge("overdue_tasks", "Overdue tasks")

# =============================
# Metrics Service
# =============================

class MetricsService:
    @staticmethod
    def increment_task_create(status="success"):
        task_create_counter.labels(status=status).inc()

    @staticmethod
    def increment_task_read(status="success"):
        task_read_counter.labels(status=status).inc()

    @staticmethod
    def increment_task_update(status="success"):
        task_update_counter.labels(status=status).inc()

    @staticmethod
    def increment_task_delete(status="success"):
        task_delete_counter.labels(status=status).inc()

    @staticmethod
    def observe_api_response_time(method, endpoint, status_code, duration):
        api_response_time.labels(
            method=method,
            endpoint=endpoint,
            status_code=str(status_code),
        ).observe(duration)

    @staticmethod
    def observe_db_operation_duration(operation, table, duration):
        db_operation_duration.labels(
            operation=operation,
            table=table,
        ).observe(duration)

    @staticmethod
    def set_active_users(count: int):
        active_users_gauge.set(count)

    @staticmethod
    def set_active_sessions(count: int):
        active_sessions_gauge.set(count)

    @staticmethod
    def set_total_tasks(count: int):
        total_tasks_gauge.set(count)

    @staticmethod
    def set_completed_tasks(count: int):
        completed_tasks_gauge.set(count)

    @staticmethod
    def set_pending_tasks(count: int):
        pending_tasks_gauge.set(count)

    @staticmethod
    def set_overdue_tasks(count: int):
        overdue_tasks_gauge.set(count)

# =============================
# Middleware
# =============================

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time

        MetricsService.observe_api_response_time(
            method=request.method,
            endpoint=request.url.path,
            status_code=response.status_code,
            duration=duration,
        )
        return response

# ✅ IMPORTANT: alias so main.py import works
metrics_middleware = PrometheusMiddleware

# =============================
# Metrics helpers
# =============================

def get_metrics():
    return generate_latest(REGISTRY)
