"""
User Settings Router

This router handles endpoints related to user settings including
reminder preferences, notification settings, and other user preferences.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional

from dependencies import get_current_user
from db import get_session
from models import User, UserSettings
from schemas import UserSettingsUpdate, UserSettingsResponse


router = APIRouter(prefix="/users/me/settings", tags=["user-settings"])


@router.get("", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the current user's settings including reminder preferences.
    """
    try:
        # Get or create user settings
        statement = select(UserSettings).where(UserSettings.user_id == current_user.id)
        user_settings = session.exec(statement).first()

        if not user_settings:
            # Create default settings if they don't exist
            user_settings = UserSettings(user_id=current_user.id)
            session.add(user_settings)
            session.commit()
            session.refresh(user_settings)

        return user_settings

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user settings: {str(e)}"
        )


@router.put("", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update the current user's settings including reminder preferences.
    """
    try:
        # Get or create user settings
        statement = select(UserSettings).where(UserSettings.user_id == current_user.id)
        user_settings = session.exec(statement).first()

        if not user_settings:
            # Create settings if they don't exist
            user_settings = UserSettings(user_id=current_user.id)

        # Update settings based on provided data
        update_data = settings_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(user_settings, field):
                setattr(user_settings, field, value)

        session.add(user_settings)
        session.commit()
        session.refresh(user_settings)

        return user_settings

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user settings: {str(e)}"
        )


@router.get("/reminders", response_model=UserSettingsResponse)
async def get_reminder_settings(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get the current user's reminder-specific settings.
    """
    try:
        # Get or create user settings
        statement = select(UserSettings).where(UserSettings.user_id == current_user.id)
        user_settings = session.exec(statement).first()

        if not user_settings:
            # Create default settings if they don't exist
            user_settings = UserSettings(user_id=current_user.id)
            session.add(user_settings)
            session.commit()
            session.refresh(user_settings)

        return user_settings

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving reminder settings: {str(e)}"
        )


@router.put("/reminders", response_model=UserSettingsResponse)
async def update_reminder_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update the current user's reminder-specific settings.
    """
    try:
        # Get or create user settings
        statement = select(UserSettings).where(UserSettings.user_id == current_user.id)
        user_settings = session.exec(statement).first()

        if not user_settings:
            # Create settings if they don't exist
            user_settings = UserSettings(user_id=current_user.id)

        # Only update reminder-related fields
        update_data = settings_update.model_dump(exclude_unset=True)
        reminder_fields = {
            'reminder_default_timing', 'reminder_allow_overdue',
            'reminder_allow_15min', 'reminder_allow_1hr', 'reminder_allow_1day'
        }

        for field, value in update_data.items():
            if field in reminder_fields and hasattr(user_settings, field):
                setattr(user_settings, field, value)

        session.add(user_settings)
        session.commit()
        session.refresh(user_settings)

        return user_settings

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating reminder settings: {str(e)}"
        )