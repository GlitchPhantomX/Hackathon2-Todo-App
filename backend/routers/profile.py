from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from models import User
from schemas import UserResponse, UserUpdate
from db import get_session
from dependencies import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("", response_model=UserResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get the current user's profile information.
    """
    # The current_user from the dependency already contains the user data
    # We can return it directly since it matches the UserResponse schema
    return current_user


@router.put("", response_model=UserResponse)
def update_user_profile(
    profile_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update the current user's profile information.
    """
    # Update user profile with provided values
    update_data = profile_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    # Update the updated_at timestamp
    current_user.updated_at = current_user.__class__.updated_at.default.arg()

    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the profile"
        )