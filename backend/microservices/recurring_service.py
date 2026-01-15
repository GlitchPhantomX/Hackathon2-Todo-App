import asyncio
import logging
import json
from typing import Dict, Any
from datetime import datetime
import sys
import os
import inspect

# Get the current directory and parent (backend) directory
current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)  # This is the backend directory

# Insert the backend directory at the beginning of sys.path to ensure correct imports
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Also ensure that the microservices directory is in the path for relative imports within microservices
microservices_dir = os.path.join(parent_dir, "microservices")
if microservices_dir not in sys.path:
    sys.path.append(microservices_dir)

from dapr.ext.grpc import App
from dapr.clients import DaprClient

# Import main backend models first
from models import Task

# Import microservices-specific modules using absolute imports
from microservices.base_service import BaseService
from microservices.models import RecurrencePattern
from microservices.recurrence_logic import RecurrenceProcessor
from microservices.db_utils import get_db_session
from microservices.logging_config import setup_logging
from microservices.dapr_client import DaprClientWrapper
from microservices.reliability import retry_with_backoff, EventProcessorReliability

# Import aiokafka for Kafka producer functionality
try:
    import json
    from aiokafka import AIOKafkaProducer
    from datetime import datetime
    KAFKA_AVAILABLE = True
    print("✅ Kafka support enabled for RecurringTaskService")
except ImportError:
    KAFKA_AVAILABLE = False
    print("⚠️ Kafka support disabled for RecurringTaskService (aiokafka not available)")

# Global Kafka producer instance for recurring service
kafka_producer = None

async def send_task_event_to_kafka(event_type: str, task_data: dict):
    """
    Send a task event to the 'task-events' Kafka topic from recurring service
    """
    global kafka_producer

    if not KAFKA_AVAILABLE:
        print(f" Kafka producer not available in recurring service, skipping event: {event_type}")
        return False

    try:
        if kafka_producer is None:
            # Initialize the Kafka producer with Redpanda Cloud configuration
            kafka_producer = AIOKafkaProducer(
                bootstrap_servers=['d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
                security_protocol='SASL_SSL',
                sasl_mechanism='SCRAM-SHA-256',
                ssl_context=True,  # Required for SSL connections
                sasl_plain_username='default',
                sasl_plain_password='kIS8f_fahf0zJznEbN8e-y19',
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            await kafka_producer.start()
            print(" Kafka producer started for recurring service with Redpanda Cloud")

        # Create the event message based on event type
        if event_type == "task_created":
            # For task creation events, send appropriate message
            event_message = {
                "task_id": task_data.get('id'),
                "title": task_data.get('title'),
                "message": f"New recurring task '{task_data.get('title', '')}' created!",
                "user_id": task_data.get('user_id')
            }
            topic = 'task-events'  # Could also use 'reminders' or specific topic for new tasks
        else:
            # For other events, send to 'task-events' topic
            event_message = {
                "event_type": event_type,
                "task_data": task_data,
                "timestamp": datetime.utcnow().isoformat()
            }
            topic = 'task-events'

        # Send the message to the appropriate topic
        await kafka_producer.send_and_wait(topic, event_message)
        print(f"✅ Kafka event sent from recurring service to {topic}: {event_type} for task {task_data.get('id', 'unknown')}")
        return True

    except Exception as e:
        print(f"❌ Error sending Kafka event from recurring service: {str(e)}")
        # Don't crash the service if Kafka is unreachable
        return False


class RecurringTaskService(BaseService):
    """
    Service that listens to task completion events and automatically generates
    new recurring tasks based on recurrence patterns (daily, weekly, monthly).
    """

    def __init__(self):
        super().__init__("recurring-task-service")
        self.app = App()

    async def initialize(self):
        """
        Initialize the recurring task service
        """
        # Bypass Dapr health checks - running in standalone mode
        success = True
        if success:
            self.logger.info("RecurringTaskService initialized successfully (Standalone Mode)")
        return success

    async def handle_task_completed(self, data: dict, topic: str, pubsub_name: str, trace_context: dict):
        """
        Handle task-completed events from the pubsub
        """
        try:
            self.logger.info(f"Received task-completed event: {data}")

            # Extract event details
            task_id = data.get('task_id')
            user_id = data.get('user_id')
            recurrence_pattern = data.get('payload', {}).get('recurrence_pattern')

            if not recurrence_pattern:
                self.logger.info(f"Task {task_id} is not recurring, skipping")
                return {"status": "skipped", "reason": "no_recurrence_pattern"}

            # Validate recurrence pattern
            if not RecurrenceProcessor.validate_recurrence_pattern(recurrence_pattern):
                self.logger.warning(f"Invalid recurrence pattern for task {task_id}: {recurrence_pattern}")
                return {"status": "error", "reason": "invalid_recurrence_pattern"}

            # Check if we've already processed this event (idempotency)
            event_id = data.get('event_id', f"task_{task_id}_{datetime.utcnow().isoformat()}")
            if await self.is_event_processed(event_id):
                self.logger.info(f"Event {event_id} already processed, skipping")
                return {"status": "skipped", "reason": "duplicate_event"}

            # Process the recurring task creation
            result = await self.create_recurring_task(task_id, user_id, recurrence_pattern)

            # Mark event as processed
            await self.mark_processed_event(event_id, "success" if result else "failure")

            return {"status": "processed", "result": result}

        except Exception as e:
            self.logger.error(f"Error handling task-completed event: {e}")
            return {"status": "error", "error": str(e)}

    @retry_with_backoff(max_attempts=3, base_delay=1.0, max_delay=10.0)
    async def create_recurring_task(self, original_task_id: int, user_id: int, pattern: str):
        """
        Create a new task based on the recurrence pattern of the original task
        """
        try:
            # Get the original task from the database
            with get_db_session() as db:
                original_task = db.query(Task).filter(Task.id == original_task_id).first()

                if not original_task:
                    self.logger.error(f"Original task not found: {original_task_id}")
                    return False

                # Calculate next due date
                if original_task.due_date:
                    next_due_date = RecurrenceProcessor.get_next_occurrence(
                        original_task.due_date,
                        pattern
                    )
                else:
                    # If no due date, use current time plus recurrence interval
                    from datetime import datetime
                    current_time = datetime.utcnow()
                    next_due_date = RecurrenceProcessor.get_next_occurrence(
                        current_time,
                        pattern
                    )

                if not next_due_date:
                    self.logger.error(f"Could not calculate next due date for pattern: {pattern}")
                    return False

                # Create new task with the same properties as the original
                new_task_data = {
                    "title": original_task.title,
                    "description": original_task.description,
                    "due_date": next_due_date,
                    "status": "pending",  # New recurring tasks start as pending
                    "recurrence_pattern": original_task.recurrence_pattern,  # Preserve recurrence
                    "user_id": user_id
                }

                # Create the new task in the database
                new_task = Task(**new_task_data)
                db.add(new_task)
                db.commit()
                db.refresh(new_task)

                self.logger.info(f"Created new recurring task: {new_task.id} for user {user_id}")

                # Publish an event to notify that a new task was created
                async with DaprClientWrapper() as client:
                    task_created_event = {
                        "event_id": f"task_created_{new_task.id}_{datetime.utcnow().isoformat()}",
                        "event_type": "task-created",
                        "task_id": new_task.id,
                        "user_id": user_id,
                        "timestamp": datetime.utcnow().isoformat(),
                        "payload": {
                            "original_task_id": original_task_id,
                            "recurrence_pattern": pattern,
                            "new_due_date": next_due_date.isoformat()
                        }
                    }

                    await client.publish_event("pubsub", "task-events", task_created_event)

                # Also send event to Kafka
                kafka_task_data = {
                    "id": new_task.id,
                    "title": new_task.title,
                    "description": new_task.description,
                    "due_date": new_task.due_date.isoformat() if new_task.due_date else None,
                    "completed": new_task.completed,
                    "priority": new_task.priority,
                    "user_id": new_task.user_id,
                    "project_id": new_task.project_id,
                    "is_recurring": new_task.is_recurring,
                    "frequency": new_task.frequency,
                    "created_at": new_task.created_at.isoformat(),
                    "updated_at": new_task.updated_at.isoformat()
                }

                await send_task_event_to_kafka("task_created", kafka_task_data)

                return {"new_task_id": new_task.id, "next_due_date": next_due_date.isoformat()}

        except Exception as e:
            self.logger.error(f"Error creating recurring task: {e}")
            raise  # Re-raise to allow retry

    async def start_processing(self):
        """
        Start the recurring task service
        """
        self.logger.info("Starting RecurringTaskService...")
        self.running = True

        # Initialize the service
        if not await self.initialize():
            self.logger.error("Failed to initialize RecurringTaskService")
            return

        # Subscribe to the task-completed topic
        try:
            # Register the event handler
            self.app.subscribe_topic(
                pubsub_name='pubsub',
                topic='task-events',
                route='/task-completed',
                callback=self.handle_task_completed
            )

            # Start the Dapr gRPC server
            self.app.run()
        except KeyboardInterrupt:
            self.logger.info("RecurringTaskService shutting down...")
            await self.stop()

    async def health_check(self):
        """
        Perform health check for the recurring task service
        """
        # Bypass Dapr health checks - running in standalone mode
        base_health = {
            "status": self.health_status,
            "timestamp": datetime.utcnow().isoformat(),
            "service": "recurring-task-service",
            "version": "1.0.0"
        }
        base_health["service"] = "recurring-task-service"
        return base_health


# For running the service directly
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Recurring Task Service')
    parser.add_argument('--port', type=int, default=50001, help='Port for Dapr sidecar gRPC')
    args = parser.parse_args()

    service = RecurringTaskService()

    try:
        asyncio.run(service.start_processing())
    except KeyboardInterrupt:
        print("Service interrupted by user")