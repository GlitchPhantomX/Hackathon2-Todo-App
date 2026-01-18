"""
Notification Consumer Service

This microservice consumes events from Kafka and processes them to deliver
notifications to users. It handles task events, reminder events, and recurring
task events, and delivers them via WebSocket or other delivery mechanisms.
"""

import asyncio
import json
import logging
import signal
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from kafka import KafkaConsumer
from sqlmodel import create_engine, Session
from contextlib import contextmanager

from models import User, Task, Notification
from services.notification_service import NotificationService, websocket_manager
from services.event_producer import event_producer
from services.dapr_service import dapr_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class NotificationConsumer:
    """Consumes events from Kafka and processes notifications"""

    def __init__(self, bootstrap_servers: str = "localhost:9092", group_id: str = "notification-group"):
        """
        Initialize the notification consumer.

        Args:
            bootstrap_servers: Kafka bootstrap server addresses
            group_id: Consumer group ID
        """
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.consumer = None
        self.running = False
        self.db_engine = None

        # Initialize database connection (you'll need to set the correct database URL)
        # In a real application, this would come from config
        try:
            from config import settings
            database_url = settings.database_url
        except ImportError:
            # Fallback to environment or default
            import os
            database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

        self.db_engine = create_engine(database_url)

    def _initialize_consumer(self):
        """Initialize the Kafka consumer."""
        try:
            self.consumer = KafkaConsumer(
                'task-events',
                'reminders',
                'recurring-tasks',
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda x: json.loads(x.decode('utf-8')) if x else None,
                key_deserializer=lambda x: x.decode('utf-8') if x else None,
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                heartbeat_interval_ms=3000,
                session_timeout_ms=30000
            )
            logger.info(f"Kafka consumer initialized with servers: {self.bootstrap_servers}")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka consumer: {e}")
            raise

    @contextmanager
    def get_db_session(self):
        """Context manager for database sessions."""
        session = Session(self.db_engine)
        try:
            yield session
        finally:
            session.close()

    def start_consuming(self):
        """Start consuming messages from Kafka."""
        if not self.consumer:
            self._initialize_consumer()

        self.running = True
        logger.info("Starting notification consumer...")

        try:
            for message in self.consumer:
                if not self.running:
                    break

                topic = message.topic
                key = message.key
                event_data = message.value

                logger.info(f"Received message from topic {topic}, key: {key}")

                # Process the event based on topic
                if topic == 'task-events':
                    self.process_task_event(event_data)
                elif topic == 'reminders':
                    self.process_reminder_event(event_data)
                elif topic == 'recurring-tasks':
                    self.process_recurring_task_event(event_data)
                else:
                    logger.warning(f"Unknown topic: {topic}")

        except KeyboardInterrupt:
            logger.info("Received interrupt signal")
        except Exception as e:
            logger.error(f"Error in consumer loop: {e}")
        finally:
            self.stop_consuming()

    def process_task_event(self, event_data: Dict[str, Any]):
        """Process a task-related event."""
        try:
            event_type = event_data.get('event_type', '')
            task_id = event_data.get('task_id', 0)
            user_id = event_data.get('user_id', 0)
            payload = event_data.get('payload', {})

            logger.info(f"Processing task event: {event_type} for task {task_id}, user {user_id}")

            with self.get_db_session() as session:
                notification_service = NotificationService(session)

                if event_type == 'TASK_CREATED':
                    # Send notification about new task
                    notification_data = {
                        "type": "info",
                        "title": "Task Created",
                        "message": f"A new task '{payload.get('task_title', 'Untitled')}' has been created",
                        "user_id": user_id,
                        "task_id": task_id,
                        "task_title": payload.get('task_title', 'Untitled'),
                        "icon": "plus-circle",
                        "color": "#3b82f6"
                    }

                    # Create notification in database
                    from schemas import NotificationCreate
                    notification_create = NotificationCreate(**{
                        k: v for k, v in notification_data.items()
                        if k in ['type', 'title', 'message', 'user_id', 'task_id', 'task_title', 'icon', 'color']
                    })

                    notification_service.create_notification(notification_create)

                elif event_type == 'TASK_COMPLETED':
                    # Send notification about completed task
                    notification_data = {
                        "type": "success",
                        "title": "Task Completed",
                        "message": "A task has been completed",
                        "user_id": user_id,
                        "task_id": task_id,
                        "icon": "check-circle",
                        "color": "#22c55e"
                    }

                    from schemas import NotificationCreate
                    notification_create = NotificationCreate(**{
                        k: v for k, v in notification_data.items()
                        if k in ['type', 'title', 'message', 'user_id', 'task_id', 'task_title', 'icon', 'color']
                    })

                    notification_service.create_notification(notification_create)

                elif event_type == 'TASK_UPDATED':
                    # Send notification about updated task
                    updated_fields = payload.get('updated_fields', {})
                    field_list = ', '.join(list(updated_fields.keys())[:3])  # Show first 3 fields
                    notification_data = {
                        "type": "info",
                        "title": "Task Updated",
                        "message": f"Task updated: {field_list} changed",
                        "user_id": user_id,
                        "task_id": task_id,
                        "icon": "edit",
                        "color": "#f59e0b"
                    }

                    from schemas import NotificationCreate
                    notification_create = NotificationCreate(**{
                        k: v for k, v in notification_data.items()
                        if k in ['type', 'title', 'message', 'user_id', 'task_id', 'task_title', 'icon', 'color']
                    })

                    notification_service.create_notification(notification_create)

                # Broadcast the notification via WebSocket
                asyncio.run(websocket_manager.broadcast_to_user({
                    "type": "notification",
                    "event_type": event_type,
                    "user_id": user_id,
                    "task_id": task_id,
                    "payload": payload,
                    "timestamp": datetime.utcnow().isoformat()
                }, user_id))

        except Exception as e:
            logger.error(f"Failed to process task event: {e}")

    def process_reminder_event(self, event_data: Dict[str, Any]):
        """Process a reminder-related event."""
        try:
            event_type = event_data.get('event_type', '')
            task_id = event_data.get('task_id', 0)
            user_id = event_data.get('user_id', 0)
            payload = event_data.get('payload', {})

            logger.info(f"Processing reminder event: {event_type} for task {task_id}, user {user_id}")

            with self.get_db_session() as session:
                notification_service = NotificationService(session)

                # Create reminder notification
                reminder_types = {
                    'REMINDER_DUE_15MIN': {'title': '15 Min Reminder', 'color': '#ef4444'},
                    'REMINDER_DUE_1HR': {'title': '1 Hour Reminder', 'color': '#f97316'},
                    'REMINDER_DUE_1DAY': {'title': '1 Day Reminder', 'color': '#eab308'},
                    'REMINDER_OVERDUE': {'title': 'Overdue Task', 'color': '#dc2626'}
                }

                type_info = reminder_types.get(event_type, {'title': 'Reminder', 'color': '#6b7280'})

                notification_data = {
                    "type": "reminder",
                    "title": type_info['title'],
                    "message": payload.get('message', f"Reminder for task {task_id}"),
                    "user_id": user_id,
                    "task_id": task_id,
                    "task_title": payload.get('task_title'),
                    "icon": "bell",
                    "color": type_info['color']
                }

                from schemas import NotificationCreate
                notification_create = NotificationCreate(**{
                    k: v for k, v in notification_data.items()
                    if k in ['type', 'title', 'message', 'user_id', 'task_id', 'task_title', 'icon', 'color']
                })

                notification_service.create_notification(notification_create)

                # Broadcast the notification via WebSocket
                asyncio.run(websocket_manager.broadcast_to_user({
                    "type": "reminder",
                    "event_type": event_type,
                    "user_id": user_id,
                    "task_id": task_id,
                    "payload": payload,
                    "timestamp": datetime.utcnow().isoformat()
                }, user_id))

        except Exception as e:
            logger.error(f"Failed to process reminder event: {e}")

    def process_recurring_task_event(self, event_data: Dict[str, Any]):
        """Process a recurring task-related event."""
        try:
            event_type = event_data.get('event_type', '')
            task_id = event_data.get('task_id', 0)
            user_id = event_data.get('user_id', 0)
            payload = event_data.get('payload', {})

            logger.info(f"Processing recurring task event: {event_type} for task {task_id}, user {user_id}")

            with self.get_db_session() as session:
                notification_service = NotificationService(session)

                if event_type == 'TASK_RECURRING_CREATED':
                    notification_data = {
                        "type": "info",
                        "title": "Recurring Task Created",
                        "message": "A new instance of your recurring task has been created",
                        "user_id": user_id,
                        "task_id": task_id,
                        "icon": "repeat",
                        "color": "#8b5cf6"
                    }

                    from schemas import NotificationCreate
                    notification_create = NotificationCreate(**{
                        k: v for k, v in notification_data.items()
                        if k in ['type', 'title', 'message', 'user_id', 'task_id', 'task_title', 'icon', 'color']
                    })

                    notification_service.create_notification(notification_create)

                # Broadcast the notification via WebSocket
                asyncio.run(websocket_manager.broadcast_to_user({
                    "type": "recurring_task",
                    "event_type": event_type,
                    "user_id": user_id,
                    "task_id": task_id,
                    "payload": payload,
                    "timestamp": datetime.utcnow().isoformat()
                }, user_id))

        except Exception as e:
            logger.error(f"Failed to process recurring task event: {e}")

    def stop_consuming(self):
        """Stop consuming messages."""
        self.running = False
        if self.consumer:
            self.consumer.close()
        logger.info("Notification consumer stopped")


def signal_handler(signum, frame):
    """Handle shutdown signals."""
    logger.info(f"Received signal {signum}, shutting down...")
    sys.exit(0)


def main():
    """Main function to run the notification consumer."""
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Create and start the notification consumer
    consumer = NotificationConsumer()

    try:
        consumer.start_consuming()
    except Exception as e:
        logger.error(f"Unexpected error in notification consumer: {e}")
    finally:
        logger.info("Notification consumer terminated")


# Background task runner for periodic operations
async def run_periodic_tasks():
    """Run periodic tasks like checking for overdue tasks, etc."""
    while True:
        try:
            # Check for overdue tasks every 5 minutes
            await check_overdue_tasks()
            await asyncio.sleep(300)  # Sleep for 5 minutes
        except Exception as e:
            logger.error(f"Error in periodic tasks: {e}")
            await asyncio.sleep(60)  # Wait a minute before retrying


async def check_overdue_tasks():
    """Check for tasks that are overdue and send notifications."""
    try:
        with Session(create_engine(os.getenv("DATABASE_URL"))) as session:
            # Find tasks that are overdue (not completed and past due date)
            from sqlmodel import select
            from datetime import datetime

            stmt = select(Task).where(
                Task.completed == False,
                Task.due_date < datetime.utcnow()
            )
            overdue_tasks = session.exec(stmt).all()

            for task in overdue_tasks:
                # Send overdue reminder
                from services.event_producer import publish_reminder_overdue
                publish_reminder_overdue(task.id, task.user_id, task.due_date, task.priority)

                logger.info(f"Sent overdue reminder for task {task.id}")

    except Exception as e:
        logger.error(f"Error checking overdue tasks: {e}")


if __name__ == "__main__":
    main()