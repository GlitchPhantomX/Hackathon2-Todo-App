"""
Event Producer Service

This service handles publishing events to Kafka for the event-driven architecture.
Events include task creation, updates, completion, deletion, and reminder triggers.
"""

import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from sqlmodel import Session
import logging

logger = logging.getLogger(__name__)

# ✅ Try to import Kafka, fallback to mock mode if not available
try:
    from kafka import KafkaProducer
    KAFKA_AVAILABLE = True
    logger.info("✅ Kafka library found")
except ImportError:
    logger.warning("⚠️  Kafka library not found. Running in MOCK MODE.")
    KAFKA_AVAILABLE = False
    KafkaProducer = None


class TaskEvent(BaseModel):
    """Base class for task-related events"""
    event_type: str
    task_id: int
    user_id: int
    timestamp: datetime
    payload: Dict[str, Any]


class MockKafkaProducer:
    """Mock Kafka producer for development without Kafka server"""
    
    def send(self, topic: str, key: str = None, value: dict = None):
        """Mock send method that just logs"""
        logger.debug(f"📤 [MOCK] Publishing to topic '{topic}': {value.get('event_type', 'UNKNOWN')}")
        
        # Return a mock future
        class MockFuture:
            def get(self, timeout=None):
                class MockMetadata:
                    partition = 0
                    offset = 0
                return MockMetadata()
        
        return MockFuture()
    
    def flush(self):
        """Mock flush method"""
        pass
    
    def close(self):
        """Mock close method"""
        logger.info("✅ [MOCK] Producer closed")


class EventProducer:
    """Service for producing and sending events to Kafka"""

    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        """
        Initialize the event producer with Kafka configuration.

        Args:
            bootstrap_servers: Kafka bootstrap server addresses
        """
        self.bootstrap_servers = bootstrap_servers
        self.producer = None
        self.mock_mode = True
        
        # ✅ Don't raise exception, just use mock mode
        try:
            self._initialize_producer()
        except Exception as e:
            logger.warning(f"⚠️  Could not initialize Kafka producer: {e}")
            logger.info("✅ Running in MOCK mode")
            self.producer = MockKafkaProducer()
            self.mock_mode = True

    def _initialize_producer(self):
        """Initialize the Kafka producer."""
        if not KAFKA_AVAILABLE:
            logger.warning("⚠️  Kafka library not installed. Using MOCK producer.")
            self.producer = MockKafkaProducer()
            self.mock_mode = True
            return
            
        try:
            # ✅ Set a short timeout to fail fast if Kafka isn't running
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                acks='all',
                retries=3,
                linger_ms=5,
                batch_size=16384,
                request_timeout_ms=5000,  # ✅ Fast timeout
                api_version_auto_timeout_ms=5000  # ✅ Fast version check
            )
            logger.info(f"✅ Kafka producer initialized with servers: {self.bootstrap_servers}")
            self.mock_mode = False
            
        except Exception as e:
            # ✅ Don't raise, just log and use mock
            logger.warning(f"⚠️  Kafka broker not available: {e}")
            logger.info("✅ Falling back to MOCK mode (events will be logged only)")
            self.producer = MockKafkaProducer()
            self.mock_mode = True

    def publish_task_event(
        self,
        event_type: str,
        task_id: int,
        user_id: int,
        payload: Dict[str, Any],
        topic: str = "task-events"
    ):
        """
        Publish a task-related event to Kafka.

        Args:
            event_type: Type of event (e.g., TASK_CREATED, TASK_COMPLETED)
            task_id: ID of the task
            user_id: ID of the user who owns the task
            payload: Additional event data
            topic: Kafka topic to publish to
        """
        if not self.producer:
            logger.warning("⚠️  No producer available, skipping event publish")
            return
            
        try:
            event = TaskEvent(
                event_type=event_type,
                task_id=task_id,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                payload=payload
            )

            # Serialize the event
            event_data = event.model_dump()

            # Send to Kafka (or mock)
            future = self.producer.send(
                topic,
                key=f"task-{task_id}",
                value=event_data
            )

            # Block until the message is sent (with timeout)
            record_metadata = future.get(timeout=10)
            
            if not self.mock_mode:
                logger.info(f"📤 Event {event_type} published to topic {topic} "
                           f"partition {record_metadata.partition} "
                           f"offset {record_metadata.offset}")

        except Exception as e:
            logger.error(f"❌ Failed to publish task event: {e}")

    def publish_reminder_event(
        self,
        task_id: int,
        user_id: int,
        reminder_type: str,
        due_date: datetime,
        time_until_due_minutes: int,
        priority: str,
        topic: str = "reminders"
    ):
        """Publish a reminder-related event to Kafka."""
        payload = {
            "task_id": task_id,
            "user_id": user_id,
            "due_date": due_date.isoformat() if due_date else None,
            "time_until_due_minutes": time_until_due_minutes,
            "priority": priority,
            "triggered_at": datetime.utcnow().isoformat()
        }

        try:
            event = TaskEvent(
                event_type=reminder_type,
                task_id=task_id,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                payload=payload
            )

            event_data = event.model_dump()
            future = self.producer.send(
                topic,
                key=f"reminder-{task_id}-{reminder_type}",
                value=event_data
            )

            record_metadata = future.get(timeout=10)
            
            if not self.mock_mode:
                logger.info(f"📤 Reminder event {reminder_type} published to topic {topic}")

        except Exception as e:
            logger.error(f"❌ Failed to publish reminder event: {e}")

    def publish_recurring_task_event(
        self,
        task_id: int,
        user_id: int,
        original_task_id: int,
        event_type: str,
        topic: str = "recurring-tasks"
    ):
        """Publish a recurring task-related event to Kafka."""
        payload = {
            "task_id": task_id,
            "user_id": user_id,
            "original_task_id": original_task_id,
            "timestamp": datetime.utcnow().isoformat()
        }

        try:
            event = TaskEvent(
                event_type=event_type,
                task_id=task_id,
                user_id=user_id,
                timestamp=datetime.utcnow(),
                payload=payload
            )

            event_data = event.model_dump()
            future = self.producer.send(
                topic,
                key=f"recurring-{task_id}",
                value=event_data
            )

            record_metadata = future.get(timeout=10)
            
            if not self.mock_mode:
                logger.info(f"📤 Recurring task event {event_type} published")

        except Exception as e:
            logger.error(f"❌ Failed to publish recurring task event: {e}")

    def close(self):
        """Close the Kafka producer connection."""
        if self.producer:
            try:
                self.producer.flush()
                self.producer.close()
                logger.info("✅ Kafka producer closed")
            except Exception as e:
                logger.warning(f"⚠️  Error closing producer: {e}")


# ✅ Global event producer instance - won't crash on import anymore
event_producer = EventProducer()


# Helper functions for common events
def publish_task_created(task_id: int, user_id: int, task_data: Dict[str, Any]):
    """Publish event when a task is created."""
    payload = {
        "task_id": task_id,
        "user_id": user_id,
        "task_data": task_data,
        "action": "task_created"
    }
    event_producer.publish_task_event("TASK_CREATED", task_id, user_id, payload)


def publish_task_updated(task_id: int, user_id: int, updated_fields: Dict[str, Any]):
    """Publish event when a task is updated."""
    payload = {
        "task_id": task_id,
        "user_id": user_id,
        "updated_fields": updated_fields,
        "action": "task_updated"
    }
    event_producer.publish_task_event("TASK_UPDATED", task_id, user_id, payload)


def publish_task_completed(task_id: int, user_id: int):
    """Publish event when a task is completed."""
    payload = {
        "task_id": task_id,
        "user_id": user_id,
        "action": "task_completed"
    }
    event_producer.publish_task_event("TASK_COMPLETED", task_id, user_id, payload)


def publish_task_deleted(task_id: int, user_id: int):
    """Publish event when a task is deleted."""
    payload = {
        "task_id": task_id,
        "user_id": user_id,
        "action": "task_deleted"
    }
    event_producer.publish_task_event("TASK_DELETED", task_id, user_id, payload)


def publish_reminder_due_15min(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Publish event for 15-minute reminder."""
    event_producer.publish_reminder_event(
        task_id, user_id, "REMINDER_DUE_15MIN", due_date, 15, priority
    )


def publish_reminder_due_1hr(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Publish event for 1-hour reminder."""
    event_producer.publish_reminder_event(
        task_id, user_id, "REMINDER_DUE_1HR", due_date, 60, priority
    )


def publish_reminder_due_1day(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Publish event for 1-day reminder."""
    event_producer.publish_reminder_event(
        task_id, user_id, "REMINDER_DUE_1DAY", due_date, 24*60, priority
    )


def publish_reminder_overdue(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Publish event for overdue reminder."""
    event_producer.publish_reminder_event(
        task_id, user_id, "REMINDER_OVERDUE", due_date, 0, priority
    )


def publish_recurring_task_created(task_id: int, user_id: int, original_task_id: int):
    """Publish event when a recurring task instance is created."""
    event_producer.publish_recurring_task_event(
        task_id, user_id, original_task_id, "TASK_RECURRING_CREATED"
    )


def publish_recurring_task_series_completed(original_task_id: int, user_id: int):
    """Publish event when a recurring task series is completed."""
    event_producer.publish_recurring_task_event(
        original_task_id, user_id, original_task_id, "TASK_RECURRING_SERIES_COMPLETED"
    )


def publish_notification_created(notification_id: int, user_id: int, notification_data: Dict[str, Any]):
    """Publish event when a notification is created."""
    payload = {
        "notification_id": notification_id,
        "user_id": user_id,
        "notification_data": notification_data,
        "action": "notification_created"
    }
    event_producer.publish_task_event("NOTIFICATION_CREATED", notification_id, user_id, payload)


# Async wrapper functions
async def async_publish_task_created(task_id: int, user_id: int, task_data: Dict[str, Any]):
    """Async wrapper for publishing task created event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_task_created, task_id, user_id, task_data)


async def async_publish_task_completed(task_id: int, user_id: int):
    """Async wrapper for publishing task completed event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_task_completed, task_id, user_id)


async def async_publish_reminder_due_15min(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Async wrapper for publishing 15-min reminder event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_reminder_due_15min, task_id, user_id, due_date, priority)


async def async_publish_reminder_due_1hr(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Async wrapper for publishing 1-hr reminder event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_reminder_due_1hr, task_id, user_id, due_date, priority)


async def async_publish_reminder_due_1day(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Async wrapper for publishing 1-day reminder event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_reminder_due_1day, task_id, user_id, due_date, priority)


async def async_publish_reminder_overdue(task_id: int, user_id: int, due_date: datetime, priority: str):
    """Async wrapper for publishing overdue reminder event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_reminder_overdue, task_id, user_id, due_date, priority)


async def async_publish_recurring_task_created(task_id: int, user_id: int, original_task_id: int):
    """Async wrapper for publishing recurring task created event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_recurring_task_created, task_id, user_id, original_task_id)


async def async_publish_notification_created(notification_id: int, user_id: int, notification_data: Dict[str, Any]):
    """Async wrapper for publishing notification created event."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, publish_notification_created, notification_id, user_id, notification_data)