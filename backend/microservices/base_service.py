import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

import sys
import os
import inspect

# Get the parent directory (backend) and add it to sys.path
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
backenddir = os.path.dirname(parentdir)  # Go up to backend directory

# Insert the backend directory at the beginning of sys.path to ensure correct imports
if backenddir not in sys.path:
    sys.path.insert(0, backenddir)

# Also ensure that the microservices directory is in the path for relative imports within microservices
if parentdir not in sys.path:
    sys.path.append(parentdir)

# Import with fallback for both module and script execution
try:
    # Try relative import (when run as a module)
    from .logging_config import setup_logging
    from .dapr_client import DaprClientWrapper
except ImportError:
    # Fall back to absolute import (when run as a script)
    from microservices.logging_config import setup_logging
    from microservices.dapr_client import DaprClientWrapper


class BaseService(ABC):
    """
    Base service class with common functionality for all microservices
    """

    def __init__(self, service_name: str, dapr_http_port: int = 3500, dapr_grpc_port: int = 50001):
        self.service_name = service_name
        self.logger = setup_logging(service_name)
        self.dapr_client_wrapper = DaprClientWrapper(dapr_http_port, dapr_grpc_port)

        # Service state
        self.running = False
        self.health_status = "unknown"

    async def initialize(self):
        """
        Initialize the service
        """
        self.logger.info(f"Initializing {self.service_name}")

        # Skip Dapr health checks - running in standalone mode
        print("Dapr health check skipped - running in Standalone Mode")
        self.health_status = "healthy"
        self.logger.info(f"{self.service_name} initialized successfully (Standalone Mode)")
        return True

    @abstractmethod
    async def start_processing(self):
        """
        Abstract method to start processing - must be implemented by subclasses
        """
        pass

    async def stop(self):
        """
        Stop the service gracefully
        """
        self.logger.info(f"Stopping {self.service_name}")
        self.running = False

        # Perform cleanup
        await self.cleanup()

        self.logger.info(f"{self.service_name} stopped")

    async def cleanup(self):
        """
        Perform cleanup operations
        """
        self.logger.info(f"Cleaning up {self.service_name}")

    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check
        """
        return {
            "status": self.health_status,
            "timestamp": self._get_current_timestamp(),
            "service": self.service_name,
            "version": "1.0.0"
        }

    def _get_current_timestamp(self) -> str:
        """
        Get current timestamp in ISO format
        """
        from datetime import datetime
        return datetime.utcnow().isoformat()

    async def is_healthy(self) -> bool:
        """
        Check if service is healthy
        """
        return self.health_status == "healthy"

    async def mark_processed_event(self, event_id: str, result: str = "success"):
        """
        Mark an event as processed to ensure idempotency
        """
        try:
            key = f"processed:{event_id}:{self.service_name}"
            value = {
                "event_id": event_id,
                "service_name": self.service_name,
                "processed_at": self._get_current_timestamp(),
                "result": result
            }

            async with self.dapr_client_wrapper as client:
                await client.save_state("statestore", key, value)

        except Exception as e:
            self.logger.error(f"Failed to mark event as processed: {e}")

    async def is_event_processed(self, event_id: str) -> bool:
        """
        Check if an event has already been processed
        """
        try:
            key = f"processed:{event_id}:{self.service_name}"

            async with self.dapr_client_wrapper as client:
                state = await client.get_state("statestore", key)
                return state is not None

        except Exception as e:
            self.logger.error(f"Failed to check if event was processed: {e}")
            return False  # Assume not processed if we can't check