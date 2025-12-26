"""
Simplified tracing implementation without OpenTelemetry dependencies
This can be used temporarily until full OpenTelemetry setup is ready
"""
from contextlib import contextmanager
from typing import Optional, Dict, Any
import time
import random
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


# -----------------------------
# Simple Span Implementation
# -----------------------------

class SimpleSpan:
    """Lightweight span for tracing without OpenTelemetry"""
    
    def __init__(self, operation_name: str, attributes: Optional[Dict[str, Any]] = None):
        self.operation_name = operation_name
        self.span_id = str(uuid.uuid4())
        self.start_time = time.time()
        self.attributes = attributes or {}
        self.end_time = None
        
    def set_attribute(self, key: str, value: Any):
        """Add attribute to span"""
        self.attributes[key] = value
        
    def finish(self):
        """Mark span as finished"""
        self.end_time = time.time()
        duration_ms = (self.end_time - self.start_time) * 1000
        
        # Log span information
        logger.info(
            f"TRACE | {self.operation_name} | "
            f"span_id={self.span_id} | "
            f"duration={duration_ms:.2f}ms | "
            f"attributes={self.attributes}"
        )


# -----------------------------
# Tracer setup (simplified)
# -----------------------------

class SimpleTracer:
    """Simplified tracer without OpenTelemetry"""
    
    def __init__(self, service_name: str = "todo-api"):
        self.service_name = service_name
        
    def start_span(self, operation_name: str, attributes: Optional[Dict[str, Any]] = None):
        """Start a new span"""
        return SimpleSpan(operation_name, attributes)


tracer = SimpleTracer()


def setup_tracing(app):
    """
    Setup simplified tracing for FastAPI application
    Note: This is a temporary solution without OpenTelemetry
    """
    logger.info("Using simplified tracing (OpenTelemetry disabled)")
    
    # Add middleware for request tracing
    @app.middleware("http")
    async def trace_requests(request, call_next):
        start_time = time.time()
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        
        # Add correlation ID to request state
        request.state.correlation_id = correlation_id
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000
        
        # Log request trace
        logger.info(
            f"TRACE | http.request | "
            f"method={request.method} | "
            f"path={request.url.path} | "
            f"status={response.status_code} | "
            f"duration={duration_ms:.2f}ms | "
            f"correlation_id={correlation_id}"
        )
        
        # Add correlation ID to response headers
        response.headers["X-Correlation-ID"] = correlation_id
        
        return response
    
    return app


# -----------------------------
# Helpers
# -----------------------------

@contextmanager
def trace_operation(
    operation_name: str,
    attributes: Optional[Dict[str, Any]] = None,
):
    """Context manager for tracing operations"""
    span = tracer.start_span(operation_name, attributes)
    try:
        yield span
    finally:
        span.finish()


def get_current_span():
    """Get current span (simplified - returns None)"""
    return None


def add_span_attributes(span, **attributes):
    """Add attributes to span"""
    if span and hasattr(span, 'set_attribute'):
        for key, value in attributes.items():
            span.set_attribute(key, value)


def sample_request(is_error: bool = False) -> bool:
    """
    Sampling strategy:
    - 100% for errors
    - 10% for successful requests
    """
    if is_error:
        return True
    return random.random() < 0.10


# -----------------------------
# App-specific tracing
# -----------------------------

def trace_dashboard_load(user_id: str):
    """Trace dashboard load operation"""
    if sample_request():
        with trace_operation("dashboard.load", {"user.id": user_id}) as span:
            start_time = time.time()
            # Simulate operation
            duration = time.time() - start_time
            span.set_attribute("duration.ms", duration * 1000)


def trace_task_operation(
    operation: str,
    user_id: str,
    task_id: Optional[str] = None,
):
    """Trace task CRUD operations"""
    attributes = {
        "user.id": user_id,
        "operation": operation,
    }

    if task_id:
        attributes["task.id"] = task_id

    # Sample critical operations more frequently
    should_sample = sample_request(
        operation in ["create", "update", "delete", "error"]
    )

    if should_sample:
        with trace_operation(f"task.{operation}", attributes):
            pass


def trace_notification_delivery(
    notification_id: str,
    user_id: str,
    recipient: str,
):
    """Trace notification delivery"""
    attributes = {
        "notification.id": notification_id,
        "user.id": user_id,
        "recipient": recipient,
    }

    with trace_operation("notification.delivery", attributes):
        pass


# -----------------------------
# Full OpenTelemetry Setup Instructions
# -----------------------------

"""
To enable full OpenTelemetry tracing, install these packages:

pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-instrumentation-fastapi
pip install opentelemetry-exporter-otlp-proto-http

Then replace this file with the original OpenTelemetry implementation.

For local development, you can run Jaeger for trace visualization:

docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

Then access Jaeger UI at: http://localhost:16686
"""