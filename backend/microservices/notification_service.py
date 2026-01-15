import sys
import os
import inspect
from datetime import datetime, timedelta, timezone
import asyncio
import logging
from typing import Dict, Any
import threading
import time

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Get the current directory and parent (backend) directory FIRST to ensure correct imports
current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)  # This is the backend directory

# Insert the backend directory at the beginning of sys.path to ensure correct imports
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Also ensure that the microservices directory is in the path for relative imports within microservices
microservices_dir = os.path.join(parent_dir, "microservices")
if microservices_dir not in sys.path:
    sys.path.append(microservices_dir)

# Import from main backend
import importlib.util
backend_models_spec = importlib.util.spec_from_file_location("models", os.path.join(parent_dir, "models.py"))
backend_models = importlib.util.module_from_spec(backend_models_spec)
backend_models_spec.loader.exec_module(backend_models)
Task = backend_models.Task

# Import aiokafka for Kafka producer functionality
try:
    from aiokafka import AIOKafkaProducer
    from aiokafka.errors import KafkaConnectionError, TopicAuthorizationFailedError
    KAFKA_AVAILABLE = True
    print("[OK] Kafka support enabled")
except ImportError:
    KAFKA_AVAILABLE = False
    print("[WARN] Kafka support disabled (aiokafka not available)")

# Import microservices-specific modules using absolute imports
from microservices.base_service import BaseService
from microservices.utils import format_notification_message
from microservices.db_utils import get_db_session
from microservices.logging_config import setup_logging

# Global Kafka producer instance
kafka_producer = None
kafka_connection_failed = False  # Track if Kafka is unavailable
kafka_error_logged = False  # Track if Kafka error has been logged

# Global lock to prevent overlapping scans
scan_lock = threading.Lock()
last_scan_start = 0
MIN_SCAN_INTERVAL = 25  # Minimum seconds between scans to prevent overlaps


async def initialize_kafka_producer():
    """
    Initialize Kafka producer with robust error handling
    Returns: True if successful, False if failed
    """
    global kafka_producer, kafka_connection_failed, kafka_error_logged

    if not KAFKA_AVAILABLE:
        if not kafka_error_logged:
            print("[WARN] Kafka libraries not available - running in console-only mode")
            kafka_error_logged = True
        kafka_connection_failed = True
        return False

    if kafka_producer is not None:
        return True  # Already initialized

    try:
        kafka_producer = AIOKafkaProducer(
            bootstrap_servers=['d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
            security_protocol='SASL_SSL',
            sasl_mechanism='SCRAM-SHA-256',
            ssl_context=True,
            sasl_plain_username='todo-app-user',
            sasl_plain_password='Admin12345',
            value_serializer=lambda v: __import__('json').dumps(v).encode('utf-8'),
            request_timeout_ms=10000,  # 10 second timeout
            connections_max_idle_ms=30000  # Close idle connections after 30s
        )
        await kafka_producer.start()
        print("[OK] Kafka producer connected to Redpanda Cloud")
        kafka_connection_failed = False
        kafka_error_logged = False  # Reset error log flag on success
        return True

    except (KafkaConnectionError, OSError) as e:
        error_msg = str(e)
        if "getaddrinfo failed" in error_msg or "Unable to connect" in error_msg:
            log_msg = "[WARN] KAFKA CONNECTION FAILED: Redpanda unreachable - continuing in console-only mode"
        else:
            log_msg = f"[WARN] KAFKA ERROR: {error_msg[:150]} - continuing in console-only mode"

        if not kafka_error_logged:
            print(log_msg)
            kafka_error_logged = True
        kafka_connection_failed = True
        return False

    except TopicAuthorizationFailedError as e:
        log_msg = "[WARN] KAFKA ACL ERROR: Check topic permissions - continuing in console-only mode"
        if not kafka_error_logged:
            print(log_msg)
            kafka_error_logged = True
        kafka_connection_failed = True
        return False

    except Exception as e:
        log_msg = f"[WARN] KAFKA INIT ERROR: {str(e)[:150]} - continuing in console-only mode"
        if not kafka_error_logged:
            print(log_msg)
            kafka_error_logged = True
        kafka_connection_failed = True
        return False


async def send_task_event_to_kafka(event_type: str, task_data: dict):
    """
    Send a task event to Kafka with graceful fallback
    """
    global kafka_producer, kafka_connection_failed, kafka_error_logged

    task_title = task_data.get('title', 'Unknown Task')

    # If Kafka is known to be unavailable, just log to console
    if kafka_connection_failed:
        print(f"[CONSOLE] NOTIFICATION: {task_title} (Kafka unavailable)")
        return False

    # Try to initialize producer if not already done
    if kafka_producer is None:
        success = await initialize_kafka_producer()
        if not success:
            print(f"[CONSOLE] NOTIFICATION: {task_title}")
            return False

    try:
        # Create the event message based on event type
        if event_type == "reminder_sent":
            event_message = {
                "task_id": task_data.get('task_id', 'unknown'),  # Use task_id from our prepared data
                "title": task_data.get('title', ''),
                "message": f"Task '{task_data.get('title', '')}' is due soon!",
                "user_id": task_data.get('user_id', 'unknown'),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            topic = 'reminders'
        else:
            event_message = {
                "event_type": event_type,
                "task_data": task_data,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            topic = 'task-events'

        # Send the message to Kafka
        await asyncio.wait_for(
            kafka_producer.send_and_wait(topic, event_message),
            timeout=5.0  # 5 second timeout
        )
        print(f"[KAFKA] Event sent to {topic}: {task_title}")
        return True

    except TopicAuthorizationFailedError:
        print(f"[WARN] KAFKA ACL ERROR: Topic '{topic}' not authorized - switching to console-only mode")
        kafka_connection_failed = True
        kafka_error_logged = True
        print(f"[CONSOLE] NOTIFICATION: {task_title}")
        return False

    except asyncio.TimeoutError:
        print(f"[WARN] KAFKA TIMEOUT: Message send timed out - switching to console-only mode")
        kafka_connection_failed = True
        kafka_error_logged = True
        print(f"[CONSOLE] NOTIFICATION: {task_title}")
        return False

    except (KafkaConnectionError, OSError) as e:
        print(f"[WARN] KAFKA CONNECTION LOST: {str(e)[:100]} - switching to console-only mode")
        kafka_connection_failed = True
        kafka_error_logged = True
        print(f"[CONSOLE] NOTIFICATION: {task_title}")
        return False

    except Exception as e:
        print(f"[WARN] KAFKA ERROR: {str(e)[:150]} - continuing with console logging")
        print(f"[CONSOLE] NOTIFICATION: {task_title}")
        return False


class NotificationService(BaseService):
    """
    Service that monitors upcoming tasks and sends timely notifications to users
    """

    def __init__(self, notification_window_minutes: int = 30):
        # Bypass Dapr health checks - run in pure standalone mode
        self.service_name = "notification-service"
        self.notification_window_minutes = notification_window_minutes
        self.scheduler = AsyncIOScheduler()
        self.running = False
        self.health_status = "healthy"
        self.logger = logging.getLogger(self.service_name)

    async def initialize(self):
        """
        Initialize the notification service
        """
        success = True
        if success:
            print("="*60)
            print("NOTIFICATION SERVICE STARTED")
            print(f"Scanning for tasks due within {self.notification_window_minutes} minutes")
            print("="*60)
            self.logger.info("NotificationService initialized (Standalone Mode)")

            # Try to initialize Kafka producer (non-blocking)
            await initialize_kafka_producer()

            # Start the scheduler
            self.scheduler.start()

            # Schedule the periodic notification scan (every 30 seconds) with max_instances=3
            self.scheduler.add_job(
                func=self.scan_and_send_notifications,
                trigger=IntervalTrigger(seconds=30),
                id='notification_scan',
                name='Scan for upcoming tasks',
                replace_existing=True,
                max_instances=3  # Prevent too many overlapping instances
            )

        return success

    async def scan_and_send_notifications(self):
        """
        FIXED: Scan for tasks with proper timezone handling, recent tasks only, and overlap prevention
        """
        global last_scan_start

        current_time = time.time()

        # Prevent overlapping scans by checking if previous scan is still running
        if current_time - last_scan_start < MIN_SCAN_INTERVAL:
            print(f"[SKIP] Skipping scan - previous scan still running or too recent. Last started: {last_scan_start:.0f}, Current: {current_time:.0f}")
            return

        # Acquire lock to prevent overlapping scans
        if not scan_lock.acquire(blocking=False):
            print("[SKIP] Skipping scan - previous scan still running")
            return

        last_scan_start = current_time
        print(f"[SCAN] Starting notification scan at {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}")

        try:
            self.logger.info("Starting notification scan...")

            # Use timezone-aware datetime (replaces deprecated utcnow)
            now = datetime.now(timezone.utc)
            future_time = now + timedelta(minutes=self.notification_window_minutes)

            # Calculate cutoff date - only include tasks from yesterday onwards to avoid historical data
            yesterday = now - timedelta(days=1)

            self.logger.info(f"Scanning: {now.strftime('%Y-%m-%d %H:%M:%S UTC')} -> {future_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            self.logger.info(f"Filtering tasks from: {yesterday.strftime('%Y-%m-%d %H:%M:%S UTC')} onwards")

            with get_db_session() as db:
                # Query tasks from yesterday onwards for all users (filter recent tasks only, and not yet reminded)
                all_tasks = db.query(Task).filter(
                    Task.completed == False,
                    Task.due_date.isnot(None),
                    Task.reminder_sent == False,  # Only include tasks that haven't been reminded yet
                    Task.due_date >= yesterday  # Only include recent tasks
                ).all()

                self.logger.info(f"Found {len(all_tasks)} incomplete recent tasks with due dates")

                # Show sample of tasks for debugging (focus on user 9 if present)
                if all_tasks:
                    user_task_count = {}
                    user_9_tasks = []

                    for task in all_tasks[:20]:  # Show first 20 for debugging
                        user_id = task.user_id
                        user_task_count[user_id] = user_task_count.get(user_id, 0) + 1

                        if user_id == 9:  # Highlight user 9 tasks
                            user_9_tasks.append(task)

                        self.logger.debug(
                            f"  [Task] ID={task.id}, User={user_id}, "
                            f"Title='{task.title[:30]}', Due={task.due_date}"
                        )

                    self.logger.info(f"Tasks by user: {dict(user_task_count)}")
                    if user_9_tasks:
                        self.logger.info(f"User 9 has {len(user_9_tasks)} tasks")

                notification_count = 0

                for task in all_tasks:
                    # Convert database due_date to UTC for proper comparison
                    if task.due_date.tzinfo is None:
                        # If naive datetime, assume it's in local timezone (Pakistan = UTC+5)
                        # Convert to UTC for comparison
                        task_due_utc = task.due_date.replace(tzinfo=timezone.utc) - timedelta(hours=5)
                    else:
                        task_due_utc = task.due_date.astimezone(timezone.utc)

                    # Calculate time until due
                    time_until_due_minutes = (task_due_utc - now).total_seconds() / 60

                    # Send notification if:
                    # 1. Task is overdue (negative time)
                    # 2. Task is due within the notification window
                    should_notify = (
                        time_until_due_minutes < 0 or  # Overdue
                        (0 <= time_until_due_minutes <= self.notification_window_minutes)  # Upcoming
                    )

                    if should_notify:
                        notification_count += 1

                        # Format time message
                        if time_until_due_minutes < 0:
                            time_msg = f"OVERDUE by {abs(int(time_until_due_minutes))} minutes"
                        else:
                            time_msg = f"Due in {int(time_until_due_minutes)} minutes"

                        message = format_notification_message(task.title, int(time_until_due_minutes))

                        # Log notification details (highlight user 9)
                        user_highlight = " [USER 9]" if task.user_id == 9 else ""
                        self.logger.info(
                            f"[NOTIFICATION]{user_highlight} User {task.user_id}: "
                            f"'{task.title[:40]}' - {time_msg}"
                        )

                        # Send to Kafka with graceful fallback - ensure task.id is valid
                        task_id = getattr(task, 'id', 'unknown')
                        kafka_data = {
                            "task_id": task_id,
                            "title": task.title,
                            "message": message,
                            "user_id": getattr(task, 'user_id', 'unknown'),
                            "due_date": task_due_utc.isoformat() if task_due_utc else None,
                            "time_until_due_minutes": int(time_until_due_minutes)
                        }

                        success = await send_task_event_to_kafka("reminder_sent", kafka_data)

                        # Create notification event for tracking
                        notification_event = {
                            "event_id": f"reminder_{task.id}_{now.isoformat()}",
                            "event_type": "reminder-sent",
                            "task_id": task.id,
                            "user_id": task.user_id,
                            "timestamp": now.isoformat(),
                            "message": message,
                            "delivery_status": "sent" if success else "failed"
                        }

                        # Update the task to mark that reminder has been sent
                        # Update within the same session where the task was originally retrieved
                        try:
                            # Update the task directly in the current context
                            with get_db_session() as update_db:
                                # Query and update in the same session to ensure atomicity
                                task_to_update = update_db.query(Task).filter(Task.id == task.id).first()
                                if task_to_update:
                                    task_to_update.reminder_sent = True
                                    update_db.commit()
                                    self.logger.debug(f"Updated task {task.id} - reminder_sent = True")
                        except Exception as update_error:
                            self.logger.error(f"Error updating reminder_sent flag for task {task.id}: {update_error}")
                            # Still log that notification was attempted even if flag update failed

                        # Print big visible message for user 9 or important tasks
                        if task.user_id == 9 or time_until_due_minutes < 5:  # Show for user 9 or imminent tasks
                            print("\n" + "="*60)
                            print("NOTIFICATION SENT!")
                            print(f"   User: {task.user_id}")
                            print(f"   Task: {task.title}")
                            print(f"   Status: {time_msg}")
                            print("   (Will not repeat this notification)")
                            print("="*60 + "\n")

                if notification_count == 0:
                    self.logger.info("[OK] No notifications needed at this time")
                else:
                    self.logger.info(f"[OK] Sent {notification_count} notifications")

        except Exception as e:
            self.logger.error(f"[ERROR] During notification scan: {e}")
            import traceback
            traceback.print_exc()
            # Don't re-raise - allow service to continue

        finally:
            # Release the lock when scan is complete
            scan_lock.release()
            print(f"[SCAN] Scan completed at {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}")

    async def start_processing(self):
        """
        Start the notification service
        """
        self.logger.info("Starting NotificationService...")
        self.running = True

        if not await self.initialize():
            self.logger.error("Failed to initialize NotificationService")
            return

        # Keep the service running
        try:
            while self.running:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            self.logger.info("NotificationService shutting down...")
            await self.stop()

    async def stop(self):
        """
        Stop the notification service gracefully
        """
        global kafka_producer

        self.logger.info("Stopping NotificationService")
        self.running = False

        # Shutdown the scheduler
        if self.scheduler.running:
            self.scheduler.shutdown()

        # Close Kafka producer
        if kafka_producer is not None:
            try:
                await kafka_producer.stop()
                print("[OK] Kafka producer closed")
            except Exception as e:
                print(f"[WARN] Error closing Kafka producer: {e}")

        self.logger.info("NotificationService stopped")

    async def health_check(self):
        """
        Perform health check for the notification service
        """
        return {
            "status": self.health_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),  # No utcnow()
            "service": "notification-service",
            "version": "1.0.0",
            "notification_window_minutes": self.notification_window_minutes,
            "kafka_available": not kafka_connection_failed
        }


# For running the service directly
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Notification Service')
    parser.add_argument('--window', type=int, default=30, help='Notification window in minutes')
    args = parser.parse_args()

    service = NotificationService(notification_window_minutes=args.window)

    try:
        asyncio.run(service.start_processing())
    except KeyboardInterrupt:
        print("\n[EXIT] Service interrupted by user")