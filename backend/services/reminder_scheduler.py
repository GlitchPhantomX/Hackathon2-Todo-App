"""
Reminder Scheduler Service

This service handles the scheduling and triggering of reminders for tasks.
It monitors tasks for upcoming due dates and sends appropriate notifications.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from sqlmodel import Session, select
from sqlalchemy import and_, or_
from contextlib import contextmanager

from models import Task, User
from services.event_producer import async_publish_reminder_due_15min, async_publish_reminder_due_1hr, async_publish_reminder_due_1day, async_publish_reminder_overdue
from services.notification_service import NotificationService
from utils.timezone_utils import convert_to_user_timezone, get_current_time_in_timezone


class ReminderScheduler:
    """Handles scheduling and triggering of task reminders"""

    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.logger = logging.getLogger(__name__)

    async def check_and_send_reminders(self):
        """Check for tasks that need reminders and send them"""
        try:
            current_time = datetime.utcnow()
            self.logger.debug(f"Checking for reminders at {current_time.isoformat()}")

            # Query for tasks that need reminders
            # We'll check for 15min, 1hr, 1day before due and overdue tasks

            # Tasks due in 15 minutes
            fifteen_min_before = current_time + timedelta(minutes=15)
            tasks_due_15min = self.get_tasks_needing_reminder(
                reminder_timing="15min",
                check_time=fifteen_min_before
            )
            self.logger.debug(f"Found {len(tasks_due_15min)} tasks due in 15 minutes")

            # Tasks due in 1 hour
            one_hr_before = current_time + timedelta(hours=1)
            tasks_due_1hr = self.get_tasks_needing_reminder(
                reminder_timing="1hr",
                check_time=one_hr_before
            )
            self.logger.debug(f"Found {len(tasks_due_1hr)} tasks due in 1 hour")

            # Tasks due in 1 day
            one_day_before = current_time + timedelta(days=1)
            tasks_due_1day = self.get_tasks_needing_reminder(
                reminder_timing="1day",
                check_time=one_day_before
            )
            self.logger.debug(f"Found {len(tasks_due_1day)} tasks due in 1 day")

            # Overdue tasks
            overdue_tasks = self.get_overdue_tasks()
            self.logger.debug(f"Found {len(overdue_tasks)} overdue tasks")

            # Process all reminder types
            total_reminders = len(tasks_due_15min) + len(tasks_due_1hr) + len(tasks_due_1day) + len(overdue_tasks)
            if total_reminders > 0:
                self.logger.info(f"Processing {total_reminders} reminders ({len(tasks_due_15min)} 15min, {len(tasks_due_1hr)} 1hr, {len(tasks_due_1day)} 1day, {len(overdue_tasks)} overdue)")

            await self.process_task_reminders(tasks_due_15min, "REMINDER_DUE_15MIN")
            await self.process_task_reminders(tasks_due_1hr, "REMINDER_DUE_1HR")
            await self.process_task_reminders(tasks_due_1day, "REMINDER_DUE_1DAY")
            await self.process_task_reminders(overdue_tasks, "REMINDER_OVERDUE")

            self.logger.debug("Completed reminder check cycle")

        except Exception as e:
            self.logger.error(f"Critical error in reminder scheduler: {str(e)}", exc_info=True)
            # Don't let errors in one cycle break the entire scheduler
            raise

    def get_tasks_needing_reminder(self, reminder_timing: str, check_time: datetime) -> List[Task]:
        """Get tasks that need a reminder at the specified timing"""
        try:
            # Validate inputs
            if not isinstance(check_time, datetime):
                self.logger.error(f"Invalid check_time provided: {check_time}")
                return []

            # Calculate the window around the check time (e.g., ±5 minutes)
            window_start = check_time - timedelta(minutes=5)
            window_end = check_time + timedelta(minutes=5)

            # Query for tasks that are not completed, have reminders enabled,
            # and are due within the time window
            statement = select(Task).where(
                and_(
                    Task.completed == False,
                    Task.reminder_enabled == True,
                    Task.reminder_sent == False,  # Only send if not already sent
                    Task.due_date >= window_start,
                    Task.due_date <= window_end,
                    Task.reminder_timing == reminder_timing
                )
            ).join(User, Task.user_id == User.id)

            tasks = self.db_session.exec(statement).all()
            self.logger.debug(f"Found {len(tasks)} tasks needing {reminder_timing} reminder (window: {window_start} to {window_end})")
            return tasks

        except Exception as e:
            self.logger.error(f"Error getting tasks needing {reminder_timing} reminder: {str(e)}", exc_info=True)
            return []

    def get_overdue_tasks(self) -> List[Task]:
        """Get tasks that are overdue"""
        try:
            current_time = datetime.utcnow()
            self.logger.debug(f"Checking for overdue tasks as of {current_time.isoformat()}")

            # Query for tasks that are not completed, have reminders enabled,
            # and are past their due date
            statement = select(Task).where(
                and_(
                    Task.completed == False,
                    Task.reminder_enabled == True,
                    Task.reminder_sent == False,  # Only send if not already sent
                    Task.due_date < current_time
                )
            ).join(User, Task.user_id == User.id)

            tasks = self.db_session.exec(statement).all()
            self.logger.debug(f"Found {len(tasks)} overdue tasks")
            return tasks

        except Exception as e:
            self.logger.error(f"Error getting overdue tasks: {str(e)}", exc_info=True)
            return []

    async def process_task_reminders(self, tasks: List[Task], reminder_type: str):
        """Process and send reminders for a list of tasks"""
        processed_count = 0
        error_count = 0

        for task in tasks:
            try:
                # Check if reminder has already been sent to avoid duplicates
                if task.reminder_sent:
                    self.logger.debug(f"Reminder already sent for task {task.id}, skipping")
                    continue

                # Get the user for this task
                user = self.db_session.get(User, task.user_id)
                if not user:
                    self.logger.error(f"User not found for task {task.id}")
                    continue

                # Send appropriate reminder based on type
                await self.send_reminder(task, user, reminder_type)

                # Mark reminder as sent
                task.reminder_sent = True
                self.db_session.add(task)
                self.db_session.commit()

                self.logger.info(f"Reminder sent for task {task.id}, type: {reminder_type}")
                processed_count += 1

            except Exception as e:
                error_count += 1
                self.logger.error(f"Error processing reminder for task {task.id}: {str(e)}", exc_info=True)
                # Rollback the transaction for this task only if needed
                try:
                    self.db_session.rollback()
                except Exception as rollback_error:
                    self.logger.error(f"Error rolling back transaction for task {task.id}: {rollback_error}")

        if processed_count > 0 or error_count > 0:
            self.logger.info(f"Completed processing {reminder_type}: {processed_count} successful, {error_count} errors")

    async def send_reminder(self, task: Task, user: User, reminder_type: str):
        """Send a specific type of reminder for a task"""
        try:
            # Validate inputs
            if not task or not user:
                self.logger.error(f"Invalid task or user for reminder: task={task}, user={user}")
                return

            # Prepare reminder payload
            reminder_payload = {
                "task_id": task.id,
                "task_title": task.title,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "priority": task.priority,
                "user_id": user.id,
                "reminder_type": reminder_type
            }

            # Convert due date to user's timezone for display
            if task.due_date:
                user_timezone = user.timezone or "UTC"
                localized_due_date = convert_to_user_timezone(task.due_date, user_timezone)
                reminder_payload["localized_due_date"] = localized_due_date.isoformat()

            # Create notification for the reminder
            notification_service = NotificationService(self.db_session)

            # Determine notification type and message based on reminder type
            if reminder_type == "REMINDER_DUE_15MIN":
                notification_type = "reminder"
                title = "Reminder: Task Due Soon"
                message = f"Reminder: Your task '{task.title}' is due in 15 minutes!"
                icon = "clock"
                color = "#f59e0b"
                await async_publish_reminder_due_15min(task.id, user.id, task.due_date, task.priority)
            elif reminder_type == "REMINDER_DUE_1HR":
                notification_type = "reminder"
                title = "Reminder: Task Due Soon"
                message = f"Reminder: Your task '{task.title}' is due in 1 hour!"
                icon = "clock"
                color = "#f59e0b"
                await async_publish_reminder_due_1hr(task.id, user.id, task.due_date, task.priority)
            elif reminder_type == "REMINDER_DUE_1DAY":
                notification_type = "reminder"
                title = "Reminder: Task Due Tomorrow"
                message = f"Reminder: Your task '{task.title}' is due tomorrow!"
                icon = "clock"
                color = "#f59e0b"
                await async_publish_reminder_due_1day(task.id, user.id, task.due_date, task.priority)
            elif reminder_type == "REMINDER_OVERDUE":
                notification_type = "overdue"
                title = "Overdue Task"
                message = f"Overdue: Your task '{task.title}' is past due!"
                icon = "alert-circle"
                color = "#ef4444"
                await async_publish_reminder_overdue(task.id, user.id, task.due_date, task.priority)
            else:
                # Default case for unknown reminder types
                notification_type = "reminder"
                title = "Reminder"
                message = f"Reminder: Your task '{task.title}' needs attention!"
                icon = "bell"
                color = "#3b82f6"

            # Create the notification
            from schemas import NotificationCreate
            notification_data = NotificationCreate(
                type=notification_type,
                title=title,
                message=message,
                user_id=user.id,
                task_id=task.id,
                task_title=task.title,
                icon=icon,
                color=color
            )
            notification = notification_service.create_notification(notification_data)

            # Prepare the message for event publishing
            reminder_payload["message"] = message

            self.logger.info(f"Published {reminder_type} event and created notification for task {task.id}")

        except Exception as e:
            self.logger.error(f"Critical error sending reminder for task {task.id}: {str(e)}", exc_info=True)
            raise

    async def schedule_continuous_reminders(self, interval_minutes: int = 1):
        """Continuously run the reminder scheduler at specified intervals"""
        self.logger.info(f"Starting continuous reminder scheduler, checking every {interval_minutes} minute(s)")

        check_count = 0

        while True:
            try:
                check_count += 1
                self.logger.debug(f"Starting reminder check #{check_count}")
                await self.check_and_send_reminders()
                self.logger.debug(f"Completed reminder check #{check_count}")
                await asyncio.sleep(interval_minutes * 60)  # Convert minutes to seconds
            except asyncio.CancelledError:
                self.logger.info("Reminder scheduler cancelled")
                break
            except Exception as e:
                self.logger.error(f"Error in continuous reminder scheduler: {str(e)}", exc_info=True)
                # Wait 1 minute before retrying if there's an error
                await asyncio.sleep(60)

    def get_user_reminder_settings(self, user_id: int) -> dict:
        """Get user's preferred reminder settings"""
        try:
            # Validate input
            if not isinstance(user_id, int) or user_id <= 0:
                self.logger.error(f"Invalid user_id provided: {user_id}")
                return {}

            # For now, we'll use default settings
            # In a full implementation, this would query user preferences
            settings = {
                "default_reminder_timing": "1hr",
                "allow_overdue_reminders": True,
                "time_zone": "UTC"
            }

            self.logger.debug(f"Retrieved reminder settings for user {user_id}: {settings}")
            return settings
        except Exception as e:
            self.logger.error(f"Error getting user reminder settings for user {user_id}: {str(e)}", exc_info=True)
            return {}

    def update_task_reminder_status(self, task_id: int, sent: bool = True):
        """Update the reminder sent status for a task"""
        try:
            # Validate input
            if not isinstance(task_id, int) or task_id <= 0:
                self.logger.error(f"Invalid task_id provided: {task_id}")
                return

            if not isinstance(sent, bool):
                self.logger.error(f"Invalid sent value provided: {sent}")
                return

            task = self.db_session.get(Task, task_id)
            if not task:
                self.logger.warning(f"Task {task_id} not found when updating reminder status")
                return

            # Only update if the status is changing
            if task.reminder_sent != sent:
                task.reminder_sent = sent
                self.db_session.add(task)
                self.db_session.commit()
                self.logger.info(f"Updated reminder status for task {task_id} to {'sent' if sent else 'not sent'}")
            else:
                self.logger.debug(f"Reminder status for task {task_id} already {'sent' if sent else 'not sent'}, no update needed")

        except Exception as e:
            self.logger.error(f"Error updating reminder status for task {task_id}: {str(e)}", exc_info=True)
            try:
                self.db_session.rollback()
            except Exception as rollback_error:
                self.logger.error(f"Error rolling back transaction for task {task_id}: {rollback_error}")


# Global scheduler instance
scheduler_instance = None


def get_scheduler(db_session: Session) -> ReminderScheduler:
    """Get or create the global reminder scheduler instance"""
    global scheduler_instance
    if scheduler_instance is None:
        scheduler_instance = ReminderScheduler(db_session)
    else:
        # Update the session if needed
        scheduler_instance.db_session = db_session
    return scheduler_instance


# Example usage function
async def run_example():
    """Example of how to use the reminder scheduler"""
    # This would be called from your main application
    # scheduler = get_scheduler(your_db_session)
    # await scheduler.schedule_continuous_reminders()
    pass