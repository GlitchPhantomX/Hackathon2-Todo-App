from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import re
from utils.auth_utils import verify_access_token, get_user_id_from_token, get_refresh_token, create_access_token
from models import User
from db import get_session
from sqlmodel import select
from datetime import datetime, timedelta


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: Optional[HTTPAuthorizationCredentials] = await super(JWTBearer, self).__call__(request)

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme."
                )
            token = credentials.credentials
            if not self.verify_jwt(token):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid token or expired token."
                )
            return token
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code."
            )

    def verify_jwt(self, token: str) -> bool:
        payload = verify_access_token(token)
        return payload is not None


class JWTMiddleware:
    def __init__(self):
        self.security = JWTBearer()

    async def get_current_user(self, token: str) -> User:
        """Get the current user from the JWT token."""
        from sqlmodel import select

        payload = verify_access_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = get_user_id_from_token(token)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        from sqlmodel import select
        with next(get_session()) as session:
            user = session.exec(select(User).where(User.id == user_id)).first()
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return user


# Function to handle token refresh
async def handle_token_refresh(request: Request):
    """Handle refresh token to get new access token."""
    from fastapi import Form
    from utils.auth_utils import get_refresh_token, create_access_token
    import json
    from sqlmodel import select

    # Try to get refresh token from request body
    try:
        body_bytes = await request.body()
        body = json.loads(body_bytes.decode())
        refresh_token = body.get('refresh_token')
    except:
        # If not in JSON body, try form data
        try:
            form_data = await request.form()
            refresh_token = form_data.get('refresh_token')
        except:
            refresh_token = None

    if not refresh_token:
        # Try to get from header
        auth_header = request.headers.get('authorization')
        if auth_header and auth_header.startswith('Bearer '):
            refresh_token = auth_header[7:]  # Remove 'Bearer ' prefix

    if refresh_token:
        db_refresh_token = get_refresh_token(refresh_token)
        if db_refresh_token:
            # Create new access token for the user
            new_access_token = create_access_token(
                data={"sub": str(db_refresh_token.user_id)},
                expires_delta=timedelta(minutes=1440)  # 24 hours
            )
            return new_access_token

    return None