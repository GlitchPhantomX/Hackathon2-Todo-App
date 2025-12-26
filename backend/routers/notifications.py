from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio

from models import Notification, User, Task
from schemas import NotificationResponse, NotificationCreate, NotificationUpdate
from db import get_session
from dependencies import get_current_user
from utils.notification_utils import send_notification_to_user

router = APIRouter(tags=["Notifications"])


@router.get("/users/{user_id}/notifications", response_model=List[NotificationResponse])
def get_user_notifications(
    user_id: int,
    unread_only: bool = Query(False, description="Return only unread notifications"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of notifications to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get notifications for a specific user (must be current user).
    """
    # Ensure the user is requesting their own notifications
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own notifications"
        )

    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.read == False)

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return notifications


@router.post("/users/{user_id}/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_user_notification_as_read(
    user_id: int,
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Mark a notification as read for a specific user (must be current user).
    """
    # Ensure the user is updating their own notifications
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own notifications"
        )

    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found or doesn't belong to user"
        )

    # Mark as read
    notification.read = True

    db.commit()
    db.refresh(notification)

    return notification


@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = Query(False, description="Return only unread notifications"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of notifications to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Get notifications for the current user.
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.read == False)

    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return notifications


@router.post("/notifications", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Create a new notification for the current user.
    """
    # If a task_id is provided, verify that it belongs to the user
    if notification_data.task_id:
        task = db.query(Task).filter(
            Task.id == notification_data.task_id,
            Task.user_id == current_user.id
        ).first()
        if not task:
            raise HTTPException(
                status_code=404,
                detail="Task not found or doesn't belong to user"
            )

    # Create notification
    notification = Notification(
        user_id=current_user.id,
        type=notification_data.type,
        title=notification_data.title,
        message=notification_data.message,
        task_id=notification_data.task_id,
        task_title=notification_data.task_title,
        icon=notification_data.icon,
        color=notification_data.color,
        read=False  # New notifications are unread by default
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Send notification via WebSocket
    try:
        await send_notification_to_user(notification)
    except Exception as e:
        # If WebSocket sending fails, log the error but continue
        print(f"Error sending WebSocket notification: {str(e)}")

    return notification


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    update_data: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Update a notification (typically to mark as read).
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found or doesn't belong to user"
        )

    # Update notification fields
    if update_data.read is not None:
        notification.read = update_data.read

    db.commit()
    db.refresh(notification)

    return notification


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Delete a notification.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found or doesn't belong to user"
        )

    db.delete(notification)
    db.commit()

    return {"message": "Notification deleted successfully"}