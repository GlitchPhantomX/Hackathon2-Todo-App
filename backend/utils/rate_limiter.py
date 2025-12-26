"""
Rate Limiting utilities for the Todo App API.

This module implements rate limiting to prevent abuse of API endpoints.
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from config import settings


# Initialize the rate limiter
limiter = Limiter(
    key_func=get_remote_address,  # Use the client's IP address as the key
    default_limits=["200 per hour"]  # Default rate limit
)


def init_rate_limiter(app: FastAPI):
    """
    Initialize rate limiting for the FastAPI application.

    Args:
        app: The FastAPI application instance
    """
    # Register the rate limit exceeded handler
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def get_rate_limit_for_endpoint(endpoint_name: str) -> str:
    """
    Get the appropriate rate limit for a specific endpoint.

    Args:
        endpoint_name: Name of the endpoint

    Returns:
        Rate limit string in the format "X per Y" (e.g., "10 per minute")
    """
    # Define specific rate limits for different endpoints
    rate_limits = {
        # Authentication endpoints (lower limits to prevent brute force)
        "login": "5 per minute",
        "register": "3 per minute",
        "refresh": "10 per minute",
        "logout": "20 per minute",

        # Task endpoints (higher limits for normal usage)
        "get_tasks": "100 per minute",
        "create_task": "30 per minute",
        "update_task": "50 per minute",
        "delete_task": "20 per minute",

        # Stats endpoints
        "get_stats": "50 per minute",

        # General endpoints
        "get_me": "100 per minute",
    }

    return rate_limits.get(endpoint_name, "50 per minute")


def limit_endpoint(endpoint_name: str):
    """
    Decorator to apply rate limiting to a specific endpoint.

    Args:
        endpoint_name: Name of the endpoint to apply rate limiting to
    """
    rate_limit = get_rate_limit_for_endpoint(endpoint_name)
    return limiter.limit(rate_limit)


# Specific rate limit decorators for common patterns
def limit_auth():
    """Rate limit for authentication endpoints."""
    return limiter.limit("5 per minute")


def limit_task_operations():
    """Rate limit for task operations."""
    return limiter.limit("30 per minute")


def limit_api_requests():
    """Default rate limit for API requests."""
    return limiter.limit("100 per hour")


def get_client_rate_info(request: Request) -> dict:
    """
    Get rate limit information for the current request.

    Args:
        request: The FastAPI request object

    Returns:
        Dictionary containing rate limit information
    """
    # Get rate limit headers if they exist
    headers = {}
    for header in [
        "X-RateLimit-Remaining",
        "X-RateLimit-Limit",
        "X-RateLimit-Reset"
    ]:
        if header in request.headers:
            headers[header] = request.headers[header]

    return headers