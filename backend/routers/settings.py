from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import User, UserSettings
from schemas import UserSettingsResponse, UserSettingsUpdate
from db import get_session
from dependencies import get_current_user

router = APIRouter(prefix="/usersettings", tags=["User Settings"])


@router.get("/", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get user settings.
    """
    try:
        settings = db.query(UserSettings).filter(
            UserSettings.user_id == current_user.id
        ).first()

        if not settings:
            # Create default settings - SIMPLIFIED
            settings = UserSettings(
                user_id=current_user.id,
                # Appearance
                appearance_theme="system",
                appearance_accent_color="#a855f7",
                appearance_font_size="M",
                appearance_language="en",
                appearance_date_format="MM/DD/YYYY",
                appearance_time_format="12h",
                
                # Notifications
                notifications_enabled=True,
                notifications_sound_enabled=True,
                notifications_email_notifications=True,
                notifications_push_notifications=False,
                notifications_task_reminders=True,
                notifications_daily_digest=False,
                
                # Task Defaults
                task_defaults_default_priority="medium",
                task_defaults_default_project_id=None,
                task_defaults_default_view="list",
                task_defaults_items_per_page=20,
                task_defaults_auto_assign_today=True,
                
                # Privacy
                privacy_data_retention_days=90,
                privacy_export_data_enabled=True,
                privacy_analytics_enabled=True,
                privacy_profile_visible=True,
                
                # Integrations
                integrations_calendar_connected=False,
                integrations_email_connected=False,
                integrations_webhooks_enabled=False,
                integrations_connected_services="[]"
            )
            
            db.add(settings)
            db.commit()
            db.refresh(settings)
            
            print(f"Created default settings for user {current_user.id}")

        return settings
        
    except Exception as e:
        print(f"Error getting user settings: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get user settings: {str(e)}"
        )


@router.put("/", response_model=UserSettingsResponse)
def update_user_settings(
    settings_update: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update user settings.
    """
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()

    if not settings:
        # Create settings if they don't exist
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    # Update settings with provided values
    update_data = settings_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    settings.updated_at = settings.__class__.updated_at.default.arg()
    db.commit()
    db.refresh(settings)

    return settings


@router.post("/export")
def export_user_settings(
    format: str = "json",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Export user settings in specified format.
    """
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user.id
    ).first()

    if not settings:
        raise HTTPException(status_code=404, detail="User settings not found")

    # Return settings data in the requested format
    if format.lower() == "json":
        from fastapi.responses import JSONResponse
        return JSONResponse(
            content=settings.model_dump(),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=settings_{current_user.id}.json"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Only JSON is supported.")