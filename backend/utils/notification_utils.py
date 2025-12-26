"""
Notification utilities for the Todo App.
Contains functions for sending real-time notifications via WebSocket.
"""
import json
from datetime import datetime
from typing import Optional

from models import Notification
from routers.websocket import manager


async def send_notification_to_user(notification: Notification):
    """
    Send a notification to a user via WebSocket if they have an active connection.

    Args:
        notification: The notification object to send
    """
    try:
        # Prepare notification data to send
        notification_data = {
            "type": "new_notification",
            "notification": {
                "id": notification.id,
                "user_id": notification.user_id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "task_id": notification.task_id,
                "task_title": notification.task_title,
                "read": notification.read,
                "created_at": notification.created_at.isoformat() if notification.created_at else None,
                "icon": notification.icon,
                "color": notification.color
            },
            "timestamp": datetime.utcnow().isoformat()
        }

        # Send the notification to the user via WebSocket
        message = json.dumps(notification_data)
        await manager.send_notification_to_user(message, notification.user_id)

    except Exception as e:
        # Log the error but don't fail the notification creation
        print(f"Error sending WebSocket notification: {str(e)}")


def format_notification_for_websocket(notification: Notification) -> dict:
    """
    Format a notification object for WebSocket transmission.

    Args:
        notification: The notification object to format

    Returns:
        Dictionary representation of the notification
    """
    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "type": notification.type,
        "title": notification.title,
        "message": notification.message,
        "task_id": notification.task_id,
        "task_title": notification.task_title,
        "read": notification.read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
        "icon": notification.icon,
        "color": notification.color
    }