"""
Reminder Notification Service

This service handles the delivery of reminder notifications to users
via various channels (WebSocket, email, push notifications, etc.).
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlmodel import Session

from models import User, Task
from services.notification_service import NotificationService, websocket_manager
from services.event_producer import async_publish_notification_created


class ReminderNotificationService:
    """Handles delivery of reminder notifications to users"""

    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.logger = logging.getLogger(__name__)
        self.notification_service = NotificationService(db_session)

    async def send_task_reminder(
        self,
        task_id: int,
        user_id: int,
        reminder_type: str,
        message: str,
        priority: str = "medium"
    ):
        """
        Send a task reminder notification to a user.

        Args:
            task_id: ID of the task being reminded about
            user_id: ID of the user receiving the reminder
            reminder_type: Type of reminder ('REMINDER_DUE_15MIN', 'REMINDER_DUE_1HR', etc.)
            message: Reminder message to send
            priority: Priority level of the reminder ('low', 'medium', 'high')
        """
        try:
            # Get the task and user
            task = self.db_session.get(Task, task_id)
            user = self.db_session.get(User, user_id)

            if not task or not user:
                self.logger.error(f"Task {task_id} or User {user_id} not found")
                return

            # Create notification record in database
            notification_data = {
                "type": "reminder",
                "title": self.get_reminder_title(reminder_type),
                "message": message,
                "user_id": user_id,
                "task_id": task_id,
                "task_title": task.title,
                "priority": priority,
                "icon": self.get_reminder_icon(reminder_type),
                "color": self.get_reminder_color(reminder_type)
            }

            # Create notification using the notification service
            notification = self.notification_service.create_notification_from_dict(notification_data)

            # Publish notification created event
            await async_publish_notification_created(notification.id, user_id, notification_data)

            # Send WebSocket notification
            await self.send_websocket_reminder(
                user_id=user_id,
                task_id=task_id,
                reminder_type=reminder_type,
                message=message,
                task_title=task.title
            )

            # In a full implementation, you might also send email or push notifications here
            # await self.send_email_reminder(user, task, message)
            # await self.send_push_reminder(user, task, message)

            self.logger.info(f"Reminder sent for task {task_id} to user {user_id}, type: {reminder_type}")

        except Exception as e:
            self.logger.error(f"Error sending reminder for task {task_id}: {str(e)}")
            raise

    def get_reminder_title(self, reminder_type: str) -> str:
        """Get appropriate title for reminder type"""
        titles = {
            "REMINDER_DUE_15MIN": "15 Minutes Left!",
            "REMINDER_DUE_1HR": "1 Hour Left!",
            "REMINDER_DUE_1DAY": "1 Day Left!",
            "REMINDER_OVERDUE": "Task Overdue!"
        }
        return titles.get(reminder_type, "Task Reminder")

    def get_reminder_icon(self, reminder_type: str) -> str:
        """Get appropriate icon for reminder type"""
        icons = {
            "REMINDER_DUE_15MIN": "clock",
            "REMINDER_DUE_1HR": "clock",
            "REMINDER_DUE_1DAY": "calendar",
            "REMINDER_OVERDUE": "alert-circle"
        }
        return icons.get(reminder_type, "bell")

    def get_reminder_color(self, reminder_type: str) -> str:
        """Get appropriate color for reminder type"""
        colors = {
            "REMINDER_DUE_15MIN": "#ef4444",  # red
            "REMINDER_DUE_1HR": "#f97316",    # orange
            "REMINDER_DUE_1DAY": "#eab308",   # yellow
            "REMINDER_OVERDUE": "#dc2626"     # dark red
        }
        return colors.get(reminder_type, "#6b7280")  # gray

    async def send_websocket_reminder(
        self,
        user_id: int,
        task_id: int,
        reminder_type: str,
        message: str,
        task_title: str
    ):
        """Send reminder via WebSocket to the user"""
        try:
            # Prepare WebSocket message
            websocket_message = {
                "type": "reminder",
                "event_type": reminder_type,
                "user_id": user_id,
                "task_id": task_id,
                "task_title": task_title,
                "message": message,
                "timestamp": datetime.utcnow().isoformat()
            }

            # Send to user via WebSocket
            await websocket_manager.broadcast_to_user(websocket_message, user_id)

            self.logger.debug(f"WebSocket reminder sent to user {user_id}")

        except Exception as e:
            self.logger.error(f"Error sending WebSocket reminder to user {user_id}: {str(e)}")
            raise

    async def send_email_reminder(self, user: User, task: Task, message: str):
        """Send reminder via email (placeholder implementation)"""
        # This would integrate with an email service in a real implementation
        self.logger.info(f"Email reminder would be sent to {user.email} for task {task.id}")

    async def send_push_reminder(self, user: User, task: Task, message: str):
        """Send reminder via push notification (placeholder implementation)"""
        # This would integrate with a push notification service in a real implementation
        self.logger.info(f"Push reminder would be sent to user {user.id} for task {task.id}")

    async def send_batch_reminders(self, reminders_data: list):
        """Send multiple reminders in batch"""
        for reminder_data in reminders_data:
            try:
                await self.send_task_reminder(**reminder_data)
            except Exception as e:
                self.logger.error(f"Error sending batch reminder: {str(e)}")
                # Continue with other reminders even if one fails

    def create_reminder_notification_record(
        self,
        user_id: int,
        task_id: int,
        reminder_type: str,
        message: str,
        priority: str = "medium"
    ):
        """
        Create a notification record in the database for the reminder.
        This serves as an audit trail and allows users to view past reminders.
        """
        try:
            notification_data = {
                "type": "reminder",
                "title": self.get_reminder_title(reminder_type),
                "message": message,
                "user_id": user_id,
                "task_id": task_id,
                "priority": priority,
                "icon": self.get_reminder_icon(reminder_type),
                "color": self.get_reminder_color(reminder_type)
            }

            notification = self.notification_service.create_notification_from_dict(notification_data)
            return notification

        except Exception as e:
            self.logger.error(f"Error creating reminder notification record: {str(e)}")
            raise

    async def schedule_reminder(
        self,
        task_id: int,
        user_id: int,
        reminder_datetime: datetime,
        reminder_type: str,
        message: str
    ):
        """
        Schedule a reminder to be sent at a specific time.
        This is a simplified version - in a full implementation you'd use
        a proper job scheduler like Celery or APScheduler.
        """
        try:
            # Calculate delay until reminder time
            current_time = datetime.utcnow()
            delay_seconds = max(0, (reminder_datetime - current_time).total_seconds())

            # Wait until the reminder time
            if delay_seconds > 0:
                await asyncio.sleep(delay_seconds)

            # Send the reminder
            await self.send_task_reminder(
                task_id=task_id,
                user_id=user_id,
                reminder_type=reminder_type,
                message=message
            )

        except Exception as e:
            self.logger.error(f"Error scheduling reminder for task {task_id}: {str(e)}")
            raise

    def get_upcoming_reminders(self, user_id: int, limit: int = 10) -> list:
        """Get upcoming reminders for a user"""
        try:
            # This would query for scheduled but not yet sent reminders
            # For now, returning an empty list as a placeholder
            return []
        except Exception as e:
            self.logger.error(f"Error getting upcoming reminders for user {user_id}: {str(e)}")
            return []

    def cancel_reminder(self, task_id: int, user_id: int):
        """Cancel a scheduled reminder"""
        # In a full implementation, this would cancel a scheduled job
        self.logger.info(f"Reminder cancelled for task {task_id}, user {user_id}")


# Example usage
async def example_usage():
    """Example of how to use the reminder notification service"""
    # This would be called from your main application
    # reminder_service = ReminderNotificationService(your_db_session)
    # await reminder_service.send_task_reminder(
    #     task_id=1,
    #     user_id=1,
    #     reminder_type="REMINDER_DUE_1HR",
    #     message="Your task is due in 1 hour!"
    # )
    pass