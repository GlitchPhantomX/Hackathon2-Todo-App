"""
CSRF Protection Middleware for the Todo App API.

This module implements Cross-Site Request Forgery (CSRF) protection for the application.
It generates and validates CSRF tokens to prevent unauthorized requests from malicious sites.
"""
from typing import Optional, Set
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response
import secrets
import hashlib
import time


class CSRFMiddleware(BaseHTTPMiddleware):
    """
    CSRF Protection Middleware

    This middleware implements CSRF protection by:
    1. Generating a unique token for each session
    2. Requiring the token to be sent with state-changing requests (POST, PUT, PATCH, DELETE)
    3. Validating the token against the stored session token
    """

    def __init__(
        self,
        app,
        exempt_paths: Optional[Set[str]] = None,
        csrf_header_name: str = "X-CSRF-Token",
        csrf_cookie_name: str = "csrf_token",
        csrf_cookie_secure: bool = True,
        csrf_cookie_httponly: bool = True,
        csrf_token_max_age: int = 3600  # 1 hour
    ):
        super().__init__(app)
        self.exempt_paths = exempt_paths or set()
        self.csrf_header_name = csrf_header_name
        self.csrf_cookie_name = csrf_cookie_name
        self.csrf_cookie_secure = csrf_cookie_secure
        self.csrf_cookie_httponly = csrf_cookie_httponly
        self.csrf_token_max_age = csrf_token_max_age

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint
    ) -> Response:
        # Get the current path
        current_path = request.url.path

        # Check if this path is exempt from CSRF protection
        if self._is_exempt_path(current_path):
            response = await call_next(request)
            return response

        # Only validate CSRF for state-changing methods
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            # Validate the CSRF token
            if not await self._validate_csrf_token(request):
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "CSRF token validation failed"}
                )

        # Generate and set CSRF token for all requests (if not present)
        response = await call_next(request)
        await self._set_csrf_token(request, response)

        return response

    def _is_exempt_path(self, path: str) -> bool:
        """Check if the current path is exempt from CSRF protection."""
        return path in self.exempt_paths

    async def _validate_csrf_token(self, request: Request) -> bool:
        """Validate the CSRF token from the request."""
        # Get the CSRF token from the header
        token_from_header = request.headers.get(self.csrf_header_name)
        if not token_from_header:
            return False

        # Get the CSRF token from the cookie
        token_from_cookie = request.cookies.get(self.csrf_cookie_name)
        if not token_from_cookie:
            return False

        # Verify the tokens match
        return secrets.compare_digest(token_from_header, token_from_cookie)

    async def _set_csrf_token(self, request: Request, response: Response) -> None:
        """Set the CSRF token in the response cookie."""
        # Get the existing CSRF token from the cookie
        existing_token = request.cookies.get(self.csrf_cookie_name)

        if existing_token:
            # Token exists, validate it hasn't expired
            if await self._is_token_valid(existing_token):
                # Token is valid, no need to set a new one
                return

        # Generate a new CSRF token
        new_token = self._generate_csrf_token()

        # Set the new token in the response cookie
        response.set_cookie(
            key=self.csrf_cookie_name,
            value=new_token,
            max_age=self.csrf_token_max_age,
            httponly=self.csrf_cookie_httponly,
            secure=self.csrf_cookie_secure,
            samesite="strict",  # Use strict same-site policy for better security
        )

    def _generate_csrf_token(self) -> str:
        """Generate a new CSRF token."""
        # Generate a random token
        token_bytes = secrets.token_bytes(32)
        # Hash it for consistency and security
        token_hash = hashlib.sha256(token_bytes).hexdigest()
        return token_hash

    async def _is_token_valid(self, token: str) -> bool:
        """Check if a token is valid (not expired)."""
        # In a real implementation, you might store token creation time
        # and validate against max_age. For now, we'll just return True
        # since we're regenerating tokens as needed.
        return True


def get_csrf_token_from_request(request: Request, csrf_header_name: str = "X-CSRF-Token") -> Optional[str]:
    """
    Helper function to get the CSRF token from a request.

    Args:
        request: The FastAPI request object
        csrf_header_name: The name of the CSRF header to check

    Returns:
        The CSRF token if found, None otherwise
    """
    return request.headers.get(csrf_header_name)