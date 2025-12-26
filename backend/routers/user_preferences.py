from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import User, UserPreference
from schemas import UserPreferenceResponse, UserPreferenceUpdate
from db import get_session
from dependencies import get_current_user

router = APIRouter(tags=["User Preferences"])


@router.get("/users/{user_id}/preferences", response_model=UserPreferenceResponse)
def get_user_preferences_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get user preferences for a specific user (must be current user).
    """
    # Ensure the user is requesting their own preferences
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own preferences"
        )

    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == current_user.id
    ).first()

    if not preferences:
        # Create default preferences if they don't exist
        preferences = UserPreference(
            user_id=current_user.id,
            theme="system",
            accent_color="#3b82f6",
            font_size="M",
            notifications_enabled=True,
            email_notifications=True,
            default_priority="medium",
            default_view="list",
            items_per_page=10
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return preferences


@router.put("/users/{user_id}/preferences", response_model=UserPreferenceResponse)
def update_user_preferences_by_id(
    user_id: int,
    preferences_update: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update user preferences for a specific user (must be current user).
    """
    # Ensure the user is updating their own preferences
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own preferences"
        )

    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == current_user.id
    ).first()

    if not preferences:
        # Create preferences if they don't exist
        preferences = UserPreference(user_id=current_user.id)
        db.add(preferences)

    # Update preferences with provided values
    update_data = preferences_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preferences, field, value)

    preferences.updated_at = preferences.__class__.updated_at.default.arg()
    db.commit()
    db.refresh(preferences)

    return preferences


@router.get("/user/preferences", response_model=UserPreferenceResponse)
def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get user preferences.
    """
    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == current_user.id
    ).first()

    if not preferences:
        # Create default preferences if they don't exist
        preferences = UserPreference(
            user_id=current_user.id,
            theme="system",
            accent_color="#3b82f6",
            font_size="M",
            notifications_enabled=True,
            email_notifications=True,
            default_priority="medium",
            default_view="list",
            items_per_page=10
        )
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return preferences


@router.put("/preferences", response_model=UserPreferenceResponse)
def update_user_preferences(
    preferences_update: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update user preferences.
    """
    preferences = db.query(UserPreference).filter(
        UserPreference.user_id == current_user.id
    ).first()

    if not preferences:
        # Create preferences if they don't exist
        preferences = UserPreference(user_id=current_user.id)
        db.add(preferences)

    # Update preferences with provided values
    update_data = preferences_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(preferences, field, value)

    preferences.updated_at = preferences.__class__.updated_at.default.arg()
    db.commit()
    db.refresh(preferences)

    return preferences