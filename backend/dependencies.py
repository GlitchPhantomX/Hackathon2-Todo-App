from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Generator
from db import get_session
from models import User
from utils.auth_utils import verify_access_token, get_user_id_from_token

from config import settings


# Security scheme for bearer token authentication
security = HTTPBearer(
    scheme_name="JWT",
    description="JWT access token for authentication"
)


def get_db_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = next(get_session())
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db_session)
) -> User:
    """Dependency to get current authenticated user from JWT token"""
    token = credentials.credentials

    # Verify the token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID from token
    user_id = get_user_id_from_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to get current active user (additional check if needed)"""
    # Additional checks can be added here if needed (e.g., user is active, not suspended, etc.)
    return current_user