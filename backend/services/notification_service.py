"""
Notification Service

This service handles the creation, management, and delivery of notifications
for the todo app, including task reminders, completion notifications, and
other user alerts. It integrates with Kafka for event-driven notifications
and WebSocket for real-time delivery.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlmodel import Session, select
from sqlalchemy.orm import joinedload
from fastapi import WebSocket, WebSocketDisconnect
from contextlib import suppress

from models import Notification, Task, User
from schemas import NotificationCreate, NotificationUpdate
from services.event_producer import event_producer
from services.dapr_service import dapr_service
from utils.timezone_utils import convert_to_user_timezone, get_current_time_in_timezone

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications"""

    def __init__(self, db_session: Session):
        """
        Initialize the notification service.

        Args:
            db_session: Database session for operations
        """
        self.db = db_session

    def create_notification(self, notification_data: NotificationCreate) -> Notification:
        """
        Create a new notification.

        Args:
            notification_data: Data for the new notification

        Returns:
            Notification: The created notification
        """
        try:
            notification = Notification(
                user_id=notification_data.user_id,
                type=notification_data.type,
                title=notification_data.title,
                message=notification_data.message,
                task_id=notification_data.task_id,
                task_title=notification_data.task_title,
                icon=notification_data.icon,
                color=notification_data.color
            )

            self.db.add(notification)
            self.db.commit()
            self.db.refresh(notification)

            logger.info(f"Notification created: {notification.id} for user {notification.user_id}")
            return notification

        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create notification: {e}")
            raise

    def get_user_notifications(self, user_id: int, limit: int = 50, offset: int = 0,
                             unread_only: bool = False) -> List[Notification]:
        """
        Get notifications for a specific user.

        Args:
            user_id: ID of the user
            limit: Maximum number of notifications to return
            offset: Number of notifications to skip
            unread_only: Whether to return only unread notifications

        Returns:
            List[Notification]: List of user's notifications
        """
        try:
            query = select(Notification).where(Notification.user_id == user_id)

            if unread_only:
                query = query.where(Notification.read == False)

            query = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
            notifications = self.db.exec(query).all()

            logger.info(f"Retrieved {len(notifications)} notifications for user {user_id}")
            return notifications

        except Exception as e:
            logger.error(f"Failed to get user notifications: {e}")
            raise

    def mark_notification_as_read(self, notification_id: int, user_id: int) -> bool:
        """
        Mark a notification as read.

        Args:
            notification_id: ID of the notification
            user_id: ID of the user (for validation)

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            notification = self.db.get(Notification, notification_id)

            if not notification:
                logger.warning(f"Notification {notification_id} not found")
                return False

            if notification.user_id != user_id:
                logger.warning(f"User {user_id} tried to access notification {notification_id} belonging to another user")
                return False

            notification.read = True
            self.db.add(notification)
            self.db.commit()

            logger.info(f"Notification {notification_id} marked as read for user {user_id}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to mark notification as read: {e}")
            return False

    def mark_all_notifications_as_read(self, user_id: int) -> bool:
        """
        Mark all notifications for a user as read.

        Args:
            user_id: ID of the user

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            query = select(Notification).where(
                Notification.user_id == user_id,
                Notification.read == False
            )
            notifications = self.db.exec(query).all()

            for notification in notifications:
                notification.read = True
                self.db.add(notification)

            self.db.commit()
            logger.info(f"All notifications marked as read for user {user_id}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to mark all notifications as read: {e}")
            return False

    def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """
        Delete a notification.

        Args:
            notification_id: ID of the notification
            user_id: ID of the user (for validation)

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            notification = self.db.get(Notification, notification_id)

            if not notification:
                logger.warning(f"Notification {notification_id} not found")
                return False

            if notification.user_id != user_id:
                logger.warning(f"User {user_id} tried to delete notification {notification_id} belonging to another user")
                return False

            self.db.delete(notification)
            self.db.commit()

            logger.info(f"Notification {notification_id} deleted for user {user_id}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to delete notification: {e}")
            return False

    def send_task_reminder(self, task_id: int, user_id: int, reminder_type: str) -> bool:
        """
        Send a task reminder notification.

        Args:
            task_id: ID of the task
            user_id: ID of the user
            reminder_type: Type of reminder ('15min', '1hr', '1day', 'overdue')

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get task details
            task = self.db.get(Task, task_id)
            if not task:
                logger.warning(f"Task {task_id} not found for reminder")
                return False

            # Create appropriate message based on reminder type
            reminder_messages = {
                "15min": f"Reminder: Your task '{task.title}' is due in 15 minutes!",
                "1hr": f"Reminder: Your task '{task.title}' is due in 1 hour!",
                "1day": f"Reminder: Your task '{task.title}' is due tomorrow!",
                "overdue": f"Overdue: Your task '{task.title}' is past due!"
            }

            reminder_titles = {
                "15min": "Task Due Soon",
                "1hr": "Task Due Soon",
                "1day": "Task Due Tomorrow",
                "overdue": "Overdue Task"
            }

            message = reminder_messages.get(reminder_type, f"Reminder: Your task '{task.title}' needs attention!")
            title = reminder_titles.get(reminder_type, "Task Reminder")

            # Create notification
            notification_data = NotificationCreate(
                type="reminder",
                title=title,
                message=message,
                user_id=user_id,
                task_id=task_id,
                task_title=task.title,
                icon="clock",
                color="#ef4444"
            )

            notification = self.create_notification(notification_data)

            # Update task to mark reminder as sent
            task.reminder_sent = True
            self.db.add(task)
            self.db.commit()

            logger.info(f"Reminder sent for task {task_id}, type {reminder_type}")
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to send task reminder: {e}")
            return False

    def send_task_completion_notification(self, task_id: int, user_id: int) -> bool:
        """
        Send a notification when a task is completed.

        Args:
            task_id: ID of the completed task
            user_id: ID of the user

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            task = self.db.get(Task, task_id)
            if not task:
                logger.warning(f"Task {task_id} not found for completion notification")
                return False

            notification_data = NotificationCreate(
                type="success",
                title="Task Completed!",
                message=f"You've completed the task: '{task.title}'",
                user_id=user_id,
                task_id=task_id,
                task_title=task.title,
                icon="check-circle",
                color="#22c55e"
            )

            self.create_notification(notification_data)
            logger.info(f"Completion notification sent for task {task_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to send completion notification: {e}")
            return False

    def send_recurring_task_created_notification(self, task_id: int, user_id: int, original_task_id: int) -> bool:
        """
        Send a notification when a recurring task instance is created.

        Args:
            task_id: ID of the new recurring task instance
            user_id: ID of the user
            original_task_id: ID of the original recurring task

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            task = self.db.get(Task, task_id)
            if not task:
                logger.warning(f"Task {task_id} not found for recurring notification")
                return False

            notification_data = NotificationCreate(
                type="info",
                title="Recurring Task Created",
                message=f"New instance of recurring task '{task.title}' has been created",
                user_id=user_id,
                task_id=task_id,
                task_title=task.title,
                icon="repeat",
                color="#3b82f6"
            )

            self.create_notification(notification_data)
            logger.info(f"Recurring task notification sent for task {task_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to send recurring task notification: {e}")
            return False

    def get_unread_count(self, user_id: int) -> int:
        """
        Get the count of unread notifications for a user.

        Args:
            user_id: ID of the user

        Returns:
            int: Count of unread notifications
        """
        try:
            query = select(Notification).where(
                Notification.user_id == user_id,
                Notification.read == False
            )
            count = self.db.exec(query).count()
            return count

        except Exception as e:
            logger.error(f"Failed to get unread notification count: {e}")
            return 0

    def create_notification_from_dict(self, notification_data: Dict[str, Any]) -> Notification:
        """
        Create a notification from a dictionary of data.

        Args:
            notification_data: Dictionary containing notification data

        Returns:
            Notification: The created notification
        """
        try:
            from schemas import NotificationCreate

            notification_create = NotificationCreate(
                type=notification_data.get("type", "info"),
                title=notification_data.get("title", ""),
                message=notification_data.get("message", ""),
                user_id=notification_data.get("user_id"),
                task_id=notification_data.get("task_id"),
                task_title=notification_data.get("task_title", ""),
                icon=notification_data.get("icon", "bell"),
                color=notification_data.get("color", "#3b82f6")
            )

            return self.create_notification(notification_create)

        except Exception as e:
            logger.error(f"Failed to create notification from dict: {e}")
            raise




async def handle_notification_event(event_data: Dict[str, Any]):
    """
    Handle incoming notification events from Kafka.

    Args:
        event_data: Event data from Kafka
    """
    try:
        # Import WebSocket manager locally to avoid circular import
        from routers.websocket import manager as websocket_manager

        event_type = event_data.get("event_type", "")
        user_id = event_data.get("user_id", 0)
        task_id = event_data.get("task_id", 0)
        payload = event_data.get("payload", {})

        # Map event types to WebSocket event types
        if event_type == "task_completed":
            await websocket_manager.send_task_completed(payload, user_id)
            logger.info(f"Task completed event sent via WebSocket for user {user_id}")
        elif event_type == "recurring_task_created":
            await websocket_manager.send_recurring_task_created(payload, user_id)
            logger.info(f"Recurring task created event sent via WebSocket for user {user_id}")
        elif event_type == "reminder_sent":
            await websocket_manager.send_reminder_sent(payload, user_id)
            logger.info(f"Reminder sent event sent via WebSocket for user {user_id}")
        elif event_type == "notification_created":
            await websocket_manager.send_notification_created(payload, user_id)
            logger.info(f"Notification created event sent via WebSocket for user {user_id}")
        else:
            # Broadcast the notification to the user via WebSocket for other event types
            message = json.dumps({
                "type": "notification",
                "event_type": event_type,
                "user_id": user_id,
                "task_id": task_id,
                "payload": payload,
                "timestamp": datetime.utcnow().isoformat()
            })
            await websocket_manager.broadcast_to_user(message, user_id)
            logger.info(f"Generic notification event handled: {event_type} for user {user_id}")

    except Exception as e:
        logger.error(f"Failed to handle notification event: {e}")


def schedule_reminders_for_task(db_session: Session, task: Task):
    """
    Schedule reminders for a task based on its due date and reminder settings.

    Args:
        db_session: Database session
        task: Task object with reminder settings
    """
    if not task.due_date or not task.reminder_enabled:
        return

    try:
        # Convert task due date to user's timezone
        user_tz = task.timezone or "UTC"
        due_date_local = convert_to_user_timezone(task.due_date, user_tz)

        # Calculate reminder times based on reminder_timing
        reminder_times = []
        if task.reminder_timing == "15min":
            reminder_times.append(due_date_local - timedelta(minutes=15))
        elif task.reminder_timing == "1hr":
            reminder_times.append(due_date_local - timedelta(hours=1))
        elif task.reminder_timing == "1day":
            reminder_times.append(due_date_local - timedelta(days=1))
        elif task.reminder_timing == "custom":
            # For custom timing, we'd need to parse custom settings
            # This is a simplified version
            pass

        # Schedule each reminder
        for reminder_time in reminder_times:
            if reminder_time > get_current_time_in_timezone(user_tz):
                # Use Dapr to schedule the reminder
                schedule_data = {
                    "task_id": task.id,
                    "user_id": task.user_id,
                    "reminder_type": f"REMINDER_DUE_{task.reminder_timing.upper()}",
                    "scheduled_time": reminder_time.isoformat(),
                    "timezone": user_tz
                }

                # Save the schedule to Dapr state
                dapr_service.save_task_reminder(str(task.id), schedule_data)

                logger.info(f"Scheduled {task.reminder_timing} reminder for task {task.id} at {reminder_time}")

    except Exception as e:
        logger.error(f"Failed to schedule reminders for task {task.id}: {e}")


def cancel_reminders_for_task(task_id: str):
    """
    Cancel scheduled reminders for a task.

    Args:
        task_id: ID of the task
    """
    try:
        # Delete the reminder schedule from Dapr state
        dapr_service.delete_task_reminder(task_id)
        logger.info(f"Cancelled reminders for task {task_id}")
    except Exception as e:
        logger.error(f"Failed to cancel reminders for task {task_id}: {e}")


# Example usage and testing
if __name__ == "__main__":
    import threading
    import time

    print("Testing notification service...")

    # Note: This is a simplified test that doesn't connect to a real database
    # In a real application, you would need to set up a proper database session

    # Test WebSocket manager
    print("Testing WebSocket manager...")
    # This would require actual WebSocket connections to test properly

    # Test notification creation (would need a real DB session)
    print("Notification service structure created successfully")

    print("Notification service testing completed")