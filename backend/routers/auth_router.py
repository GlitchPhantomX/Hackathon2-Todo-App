"""
Updated auth_router.py with DETAILED ERROR LOGGING

Replace your entire auth_router.py with this code.
This will show you the EXACT error in the terminal.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
import traceback
import sys

from models import User
from schemas import UserRegister, UserResponse, TokenResponse
from utils.auth_utils import get_password_hash, authenticate_user, create_access_token, create_tokens
from db import get_session
from utils.auth_utils import get_refresh_token
from config import settings
from dependencies import get_current_user
from utils.input_sanitizer import sanitize_user_input, validate_email, validate_username, validate_password_strength

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_session)):
    print("\n[AUTH] Registration endpoint hit")
    try:
        print(f"Received data: email={user_data.email}, name={user_data.name}, password length={len(user_data.password)}")

        # Sanitize input
        email = user_data.email.lower().strip()
        name = user_data.name.strip()
        password = user_data.password.strip()

        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Hash password
        hashed_password = get_password_hash(password)

        # Create user object
        user = User(email=email, name=name, hashed_password=hashed_password)
        db.add(user)
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print("[ERROR] DB Commit Error:", str(e))
            traceback.print_exc()
            raise HTTPException(status_code=500, detail="Database commit failed")
        db.refresh(user)

        print(f"[SUCCESS] User created with ID: {user.id}")
        return {"id": user.id, "email": user.email, "name": user.name, "message": "User registered successfully"}

    except HTTPException as he:
        print("[WARN] HTTP Exception:", he.detail)
        raise he
    except Exception as e:
        print("[ERROR] Critical Error:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Registration failed due to server error")


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    """
    Login a user with email (as username) and password.
    Returns both access and refresh tokens if credentials are valid.
    """
    try:
        print(f"[AUTH] Login attempt for: {form_data.username}")

        # Find user by email (username field in OAuth2PasswordRequestForm is used for email)
        user = db.query(User).filter(User.email == form_data.username).first()
        if not user or not authenticate_user(user, form_data.password):
            print(f"[ERROR] Invalid credentials for: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create both access and refresh tokens
        access_token, refresh_token = create_tokens(db, user.id)

        print(f"[SUCCESS] Login successful for user: {user.id}")

        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        print(f"[ERROR] Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/refresh")
def refresh_token_endpoint(refresh_token: str, db: Session = Depends(get_session)):
    """
    Refresh an access token using a refresh token.
    Uses the same DB session for all operations to avoid session conflicts.
    """
    # Retrieve the refresh token from the DB using the existing session
    db_refresh_token = get_refresh_token(db, refresh_token)
    
    if not db_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create a new access token
    new_access_token = create_access_token(
        data={"sub": str(db_refresh_token.user_id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout(refresh_token: str = None, current_user: User = Depends(get_current_user)):
    """
    Logout a user by revoking their refresh token.
    """
    from utils.auth_utils import revoke_refresh_token

    if refresh_token:
        success = revoke_refresh_token(refresh_token)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid refresh token"
            )

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return current_user


@router.post("/refresh")
def refresh_token_endpoint(refresh_token: str):
    """
    Refresh an access token using a refresh token.
    """
    from utils.auth_utils import get_refresh_token as get_db_refresh_token
    from datetime import datetime

    # Get the refresh token from the database
    db_refresh_token = get_db_refresh_token(refresh_token)
    if not db_refresh_token or not db_refresh_token.is_active or db_refresh_token.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create a new access token
    from utils.auth_utils import create_access_token
    from datetime import timedelta
    new_access_token = create_access_token(
        data={"sub": str(db_refresh_token.user_id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(refresh_token: str = None, current_user: User = Depends(get_current_user)):
    """
    Logout a user by revoking their refresh token.
    """
    from utils.auth_utils import revoke_refresh_token

    if refresh_token:
        success = revoke_refresh_token(refresh_token)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid refresh token"
            )

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return current_user