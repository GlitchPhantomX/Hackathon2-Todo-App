import asyncio
import logging
import random
from datetime import datetime, timedelta
from typing import Callable, Any, Optional
from functools import wraps
from .dapr_client import DaprClientWrapper
from .logging_config import setup_logging


logger = setup_logging("reliability")


class CircuitBreaker:
    """
    Circuit breaker pattern implementation to prevent cascading failures
    """
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    def call(self, func: Callable, *args, **kwargs):
        """
        Call a function with circuit breaker protection
        """
        if self.state == "OPEN":
            if self._is_timeout_expired():
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit breaker is OPEN")

        if self.state == "HALF_OPEN":
            try:
                result = func(*args, **kwargs)
                self._on_success()
                return result
            except Exception as e:
                self._on_failure()
                raise e

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e

    def _on_success(self):
        """
        Called when a function call succeeds
        """
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"

    def _on_failure(self):
        """
        Called when a function call fails
        """
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()

        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

    def _is_timeout_expired(self) -> bool:
        """
        Check if the timeout has expired
        """
        if not self.last_failure_time:
            return True

        elapsed = (datetime.utcnow() - self.last_failure_time).seconds
        return elapsed >= self.timeout


def retry_with_backoff(max_attempts: int = 3, base_delay: float = 1.0, max_delay: float = 60.0, jitter: bool = True):
    """
    Decorator for retrying functions with exponential backoff
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e

                    if attempt == max_attempts - 1:
                        # Last attempt, raise the exception
                        break

                    # Calculate delay with exponential backoff
                    delay = min(base_delay * (2 ** attempt), max_delay)

                    if jitter:
                        # Add jitter to prevent thundering herd
                        delay *= (0.5 + random.random() * 0.5)

                    logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)

            # If we get here, all attempts failed
            raise last_exception
        return wrapper
    return decorator


class EventProcessorReliability:
    """
    Class to handle reliability aspects of event processing
    """

    def __init__(self):
        self.circuit_breaker = CircuitBreaker()
        self.logger = logger

    async def process_event_with_idempotency(self, event_id: str, service_name: str, processor_func: Callable):
        """
        Process an event with idempotency check
        """
        # Check if event has already been processed
        async with DaprClientWrapper() as client:
            key = f"processed:{event_id}:{service_name}"
            existing_state = await client.get_state("statestore", key)

            if existing_state:
                self.logger.info(f"Event {event_id} already processed by {service_name}, skipping")
                return {"status": "skipped", "reason": "duplicate_event"}

        # Process the event
        try:
            result = await processor_func()

            # Mark event as processed
            async with DaprClientWrapper() as client:
                value = {
                    "event_id": event_id,
                    "service_name": service_name,
                    "processed_at": datetime.utcnow().isoformat(),
                    "result": "success"
                }

                await client.save_state("statestore", key, value)

            return {"status": "processed", "result": result}
        except Exception as e:
            # Mark event as failed
            async with DaprClientWrapper() as client:
                value = {
                    "event_id": event_id,
                    "service_name": service_name,
                    "processed_at": datetime.utcnow().isoformat(),
                    "result": "failure",
                    "error": str(e)
                }

                await client.save_state("statestore", key, value)

            self.logger.error(f"Failed to process event {event_id}: {str(e)}")
            raise e

    async def call_with_circuit_breaker(self, func: Callable, *args, **kwargs):
        """
        Call a function with circuit breaker protection
        """
        try:
            return self.circuit_breaker.call(func, *args, **kwargs)
        except Exception as e:
            self.logger.error(f"Circuit breaker prevented call: {str(e)}")
            raise e

    async def replay_missed_events(self, service_name: str, event_processor: Callable):
        """
        Replay events that were missed due to service downtime
        """
        # In a real implementation, this would query for events that were
        # supposed to be processed but weren't
        # For now, we'll just log that this functionality exists
        self.logger.info(f"Replay missed events for {service_name} - not implemented in this version")