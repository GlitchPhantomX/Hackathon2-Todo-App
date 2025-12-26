import json
import logging
import sys
import time
from datetime import datetime
from typing import Any, Dict, Optional
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class StructuredLogger:
    """
    A structured logger that outputs JSON formatted logs with consistent fields.
    """

    def __init__(self, name: str = "todo_api"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)

        # Prevent adding multiple handlers if already configured
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            formatter = logging.Formatter('%(message)s')  # JSON logs will be formatted manually
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)

    def _log(self, level: str, message: str, **kwargs):
        """
        Internal logging method that formats logs as JSON.
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level.upper(),
            "service": "todo_api",
            "operation": kwargs.pop("operation", ""),
            "user_id": kwargs.pop("user_id", None),
            "task_id": kwargs.pop("task_id", None),
            "correlation_id": kwargs.pop("correlation_id", None),
            "message": message,
            **kwargs
        }

        # Remove None values to keep logs clean
        log_entry = {k: v for k, v in log_entry.items() if v is not None}

        self.logger.log(
            getattr(logging, level.upper()),
            json.dumps(log_entry, ensure_ascii=False)
        )

    def info(self, message: str, **kwargs):
        self._log("INFO", message, **kwargs)

    def warn(self, message: str, **kwargs):
        self._log("WARN", message, **kwargs)

    def error(self, message: str, **kwargs):
        self._log("ERROR", message, **kwargs)

    def debug(self, message: str, **kwargs):
        self._log("DEBUG", message, **kwargs)


# Global logger instance
logger = StructuredLogger()


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add correlation ID to requests for distributed tracing.
    Also logs all incoming requests and outgoing responses.
    """

    async def dispatch(self, request: Request, call_next):
        # Generate or propagate correlation ID
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        
        # Start timing
        start_time = time.time()
        
        # Log incoming request (INFO level)
        logger.info(
            f"Incoming request: {request.method} {request.url.path}",
            operation="http.request.start",
            correlation_id=correlation_id,
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params) if request.query_params else None,
        )

        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log successful response (INFO level)
            logger.info(
                f"Request completed: {request.method} {request.url.path} - {response.status_code}",
                operation="http.request.complete",
                correlation_id=correlation_id,
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
            )
            
            # Add correlation ID to response headers
            response.headers["X-Correlation-ID"] = correlation_id
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log error (ERROR level)
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                operation="http.request.error",
                correlation_id=correlation_id,
                method=request.method,
                path=request.url.path,
                duration_ms=round(duration_ms, 2),
                error=str(e),
                error_type=type(e).__name__,
            )
            
            # Re-raise the exception
            raise


def get_log_context(request: Request) -> Dict[str, Any]:
    """
    Extract relevant context from the request for logging.
    """
    return {
        "correlation_id": getattr(request.state, 'correlation_id', None),
        "method": request.method,
        "path": request.url.path,
        "user_id": getattr(request.state, 'current_user_id', None) if hasattr(request.state, 'current_user_id') else None
    }


def setup_logging():
    """
    Setup logging configuration for the application.
    Call this at application startup.
    """
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    
    # Disable unnecessary loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    
    logger.info(
        "Logging configured",
        operation="app.startup",
        log_format="json",
        log_level="INFO",
    )