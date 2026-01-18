"""
Dapr Service Wrapper

This service provides a wrapper around Dapr (Distributed Application Runtime)
functionality for the todo app, including state management, pub/sub, and service invocation.
"""

import json
import logging
from typing import Any, Dict, Optional, List
from datetime import datetime
from contextlib import contextmanager

logger = logging.getLogger(__name__)

# ✅ Try to import Dapr, fallback to mock if not available
try:
    from dapr.clients import DaprClient
    DAPR_AVAILABLE = True
    logger.info("✅ Dapr client library found")
except ImportError:
    logger.warning("⚠️  Dapr library not found. Running in MOCK MODE.")
    DAPR_AVAILABLE = False
    DaprClient = None


class MockDaprClient:
    """Mock Dapr client for development without Dapr runtime"""
    
    def __init__(self, address: str = None):
        self.address = address
        self._state_store = {}  # In-memory state store for testing
    
    def close(self):
        """Mock close method"""
        pass
    
    def save_state(self, store_name: str, states: List[Dict], **kwargs):
        """Mock save state"""
        for state in states:
            key = state.get('key')
            value = state.get('value')
            self._state_store[f"{store_name}:{key}"] = value
            logger.debug(f"📦 [MOCK] Saved state to {store_name}/{key}")
    
    def get_state(self, store_name: str, key: str, **kwargs):
        """Mock get state"""
        class MockStateResponse:
            def __init__(self, data):
                self.data = data
        
        store_key = f"{store_name}:{key}"
        value = self._state_store.get(store_key)
        logger.debug(f"📦 [MOCK] Getting state from {store_name}/{key}")
        
        if value:
            return MockStateResponse(value.encode('utf-8') if isinstance(value, str) else value)
        return MockStateResponse(None)
    
    def delete_state(self, store_name: str, key: str, **kwargs):
        """Mock delete state"""
        store_key = f"{store_name}:{key}"
        if store_key in self._state_store:
            del self._state_store[store_key]
        logger.debug(f"📦 [MOCK] Deleted state from {store_name}/{key}")
    
    def publish_event(self, pubsub_name: str, topic_name: str, data: Any, **kwargs):
        """Mock publish event"""
        logger.debug(f"📡 [MOCK] Publishing event to {pubsub_name}/{topic_name}")
    
    def invoke_service(self, app_id: str, method: str, data: Any = None, **kwargs):
        """Mock invoke service"""
        logger.debug(f"📡 [MOCK] Invoking service {app_id}/{method}")
        class MockResponse:
            data = b'{"success": true}'
        return MockResponse()
    
    def get_secret(self, store_name: str, key: str, metadata: Dict = None):
        """Mock get secret"""
        logger.debug(f"🔐 [MOCK] Getting secret from {store_name}/{key}")
        class MockSecretResponse:
            data = {}
        return MockSecretResponse()
    
    def get_bulk_state(self, store_name: str, keys: List[str], **kwargs):
        """Mock bulk get state"""
        class MockBulkStateItem:
            def __init__(self, key, data):
                self.key = key
                self.data = data
        
        class MockBulkStateResponse:
            def __init__(self, items):
                self.items = items
        
        items = []
        for key in keys:
            store_key = f"{store_name}:{key}"
            value = self._state_store.get(store_key)
            if value:
                data = value.encode('utf-8') if isinstance(value, str) else value
                items.append(MockBulkStateItem(key, data))
            else:
                items.append(MockBulkStateItem(key, None))
        
        logger.debug(f"📦 [MOCK] Bulk getting {len(keys)} states from {store_name}")
        return MockBulkStateResponse(items)


class DaprService:
    """Service for interacting with Dapr runtime"""

    def __init__(self, dapr_grpc_port: int = 50001, dapr_http_port: int = 3500):
        """
        Initialize the Dapr service wrapper.

        Args:
            dapr_grpc_port: Dapr gRPC port (default 50001)
            dapr_http_port: Dapr HTTP port (default 3500)
        """
        self.dapr_grpc_port = dapr_grpc_port
        self.dapr_http_port = dapr_http_port
        self.client = None
        self.mock_mode = not DAPR_AVAILABLE
        
        if not DAPR_AVAILABLE:
            logger.info("✅ Dapr service running in MOCK mode")
            self._mock_client = MockDaprClient()

    @contextmanager
    def get_client(self):
        """
        Context manager to get and release Dapr client.
        Ensures the client is properly closed after use.
        """
        if not DAPR_AVAILABLE:
            # Use mock client
            yield self._mock_client
            return
        
        client = DaprClient(f"127.0.0.1:{self.dapr_grpc_port}")
        try:
            yield client
        finally:
            try:
                client.close()
            except Exception as e:
                logger.warning(f"⚠️  Error closing Dapr client: {e}")

    def save_state(self, store_name: str, key: str, value: Any, etag: Optional[str] = None):
        """
        Save state to a Dapr state store.

        Args:
            store_name: Name of the state store component
            key: Key for the state
            value: Value to store (will be JSON serialized)
            etag: Optional etag for conditional updates
        """
        try:
            with self.get_client() as client:
                # Serialize the value to JSON
                if isinstance(value, (dict, list)):
                    serialized_value = json.dumps(value)
                else:
                    serialized_value = json.dumps({"data": value})

                # Prepare the state item
                state_item = {
                    "key": key,
                    "value": serialized_value,
                    "metadata": {"contentType": "application/json"}
                }

                if etag:
                    state_item["etag"] = etag

                # Save the state
                client.save_state(store_name, [state_item])
                
                if not self.mock_mode:
                    logger.info(f"State saved to {store_name}/{key}")
                    
        except Exception as e:
            logger.error(f"Failed to save state {store_name}/{key}: {e}")
            # Don't raise in mock mode
            if not self.mock_mode:
                raise

    def get_state(self, store_name: str, key: str, state_type: str = "json") -> Optional[Any]:
        """
        Retrieve state from a Dapr state store.

        Args:
            store_name: Name of the state store component
            key: Key for the state
            state_type: Expected type of the state ('json', 'string', 'bytes')

        Returns:
            Retrieved state value or None if not found
        """
        try:
            with self.get_client() as client:
                response = client.get_state(store_name, key)

                if not response.data:
                    return None

                if state_type == "json":
                    return json.loads(response.data.decode('utf-8'))
                elif state_type == "string":
                    return response.data.decode('utf-8')
                elif state_type == "bytes":
                    return response.data
                else:
                    return response.data.decode('utf-8')

        except Exception as e:
            logger.error(f"Failed to get state {store_name}/{key}: {e}")
            return None

    def delete_state(self, store_name: str, key: str, etag: Optional[str] = None):
        """
        Delete state from a Dapr state store.

        Args:
            store_name: Name of the state store component
            key: Key for the state to delete
            etag: Optional etag for conditional deletion
        """
        try:
            with self.get_client() as client:
                options = {}
                if etag:
                    options["etag"] = etag

                client.delete_state(store_name, key, options=options)
                
                if not self.mock_mode:
                    logger.info(f"State deleted from {store_name}/{key}")
                    
        except Exception as e:
            logger.error(f"Failed to delete state {store_name}/{key}: {e}")
            if not self.mock_mode:
                raise

    def publish_event(self, pubsub_name: str, topic_name: str, data: Any):
        """
        Publish an event to a Dapr pub/sub component.

        Args:
            pubsub_name: Name of the pub/sub component
            topic_name: Topic to publish to
            data: Data to publish (will be JSON serialized)
        """
        try:
            with self.get_client() as client:
                # Serialize the data to JSON
                if isinstance(data, (dict, list)):
                    serialized_data = json.dumps(data)
                else:
                    serialized_data = json.dumps({"data": data})

                # Publish the event
                client.publish_event(
                    pubsub_name=pubsub_name,
                    topic_name=topic_name,
                    data=serialized_data,
                    data_content_type='application/json'
                )
                
                if not self.mock_mode:
                    logger.info(f"Event published to {pubsub_name}/{topic_name}")
                    
        except Exception as e:
            logger.error(f"Failed to publish event to {pubsub_name}/{topic_name}: {e}")
            if not self.mock_mode:
                raise

    def invoke_service(self, app_id: str, method: str, data: Optional[Any] = None, verb: str = "POST"):
        """
        Invoke a method on another Dapr-enabled service.

        Args:
            app_id: ID of the target Dapr application
            method: Method to invoke
            data: Data to send with the invocation
            verb: HTTP verb to use (GET, POST, PUT, DELETE)

        Returns:
            Response from the invoked service
        """
        try:
            with self.get_client() as client:
                if data is not None:
                    if isinstance(data, (dict, list)):
                        serialized_data = json.dumps(data)
                    else:
                        serialized_data = json.dumps({"data": data})

                    response = client.invoke_service(
                        app_id=app_id,
                        method=method,
                        data=serialized_data,
                        http_verb=verb,
                        content_type='application/json'
                    )
                else:
                    response = client.invoke_service(
                        app_id=app_id,
                        method=method,
                        http_verb=verb
                    )

                if not self.mock_mode:
                    logger.info(f"Service invocation {verb} {app_id}/{method} succeeded")
                return response
                
        except Exception as e:
            logger.error(f"Failed to invoke service {app_id}/{method}: {e}")
            if not self.mock_mode:
                raise
            return None

    def get_secret(self, store_name: str, key: str, metadata: Optional[Dict[str, str]] = None) -> Optional[str]:
        """
        Retrieve a secret from a Dapr secret store.

        Args:
            store_name: Name of the secret store component
            key: Key for the secret
            metadata: Optional metadata for the secret request

        Returns:
            Secret value or None if not found
        """
        try:
            with self.get_client() as client:
                response = client.get_secret(store_name, key, metadata or {})
                return response.data.get(key) if response.data else None
        except Exception as e:
            logger.error(f"Failed to get secret {store_name}/{key}: {e}")
            return None

    def bulk_get_state(self, store_name: str, keys: List[str], parallelism: int = 1) -> Dict[str, Any]:
        """
        Retrieve multiple state values from a Dapr state store.

        Args:
            store_name: Name of the state store component
            keys: List of keys to retrieve
            parallelism: Number of concurrent requests

        Returns:
            Dictionary mapping keys to their values
        """
        try:
            with self.get_client() as client:
                response = client.get_bulk_state(store_name, keys, parallelism=parallelism)

                result = {}
                for item in response.items:
                    if item.data:
                        try:
                            result[item.key] = json.loads(item.data.decode('utf-8'))
                        except json.JSONDecodeError:
                            result[item.key] = item.data.decode('utf-8')
                    else:
                        result[item.key] = None

                return result
        except Exception as e:
            logger.error(f"Failed to bulk get state from {store_name}: {e}")
            return {}

    def save_bulk_state(self, store_name: str, states: Dict[str, Any]):
        """
        Save multiple state values to a Dapr state store.

        Args:
            store_name: Name of the state store component
            states: Dictionary mapping keys to values to save
        """
        try:
            with self.get_client() as client:
                state_items = []
                for key, value in states.items():
                    if isinstance(value, (dict, list)):
                        serialized_value = json.dumps(value)
                    else:
                        serialized_value = json.dumps({"data": value})

                    state_item = {
                        "key": key,
                        "value": serialized_value,
                        "metadata": {"contentType": "application/json"}
                    }
                    state_items.append(state_item)

                client.save_state(store_name, state_items)
                
                if not self.mock_mode:
                    logger.info(f"Bulk state saved to {store_name} ({len(states)} items)")
                    
        except Exception as e:
            logger.error(f"Failed to bulk save state to {store_name}: {e}")
            if not self.mock_mode:
                raise


# Singleton instance for the application
dapr_service = DaprService()


# Specialized functions for the todo app
def save_user_preferences(user_id: str, preferences: Dict[str, Any]):
    """Save user preferences to Dapr state store."""
    dapr_service.save_state("statestore", f"user-preferences:{user_id}", preferences)


def get_user_preferences(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user preferences from Dapr state store."""
    return dapr_service.get_state("statestore", f"user-preferences:{user_id}")


def save_task_reminder(task_id: str, reminder_data: Dict[str, Any]):
    """Save task reminder data to Dapr state store."""
    dapr_service.save_state("statestore", f"task-reminder:{task_id}", reminder_data)


def get_task_reminder(task_id: str) -> Optional[Dict[str, Any]]:
    """Get task reminder data from Dapr state store."""
    return dapr_service.get_state("statestore", f"task-reminder:{task_id}")


def delete_task_reminder(task_id: str):
    """Delete task reminder data from Dapr state store."""
    dapr_service.delete_state("statestore", f"task-reminder:{task_id}")


def save_recurring_task_schedule(user_id: str, schedule_data: Dict[str, Any]):
    """Save recurring task schedule data to Dapr state store."""
    dapr_service.save_state("statestore", f"recurring-schedule:{user_id}", schedule_data)


def get_recurring_task_schedule(user_id: str) -> Optional[Dict[str, Any]]:
    """Get recurring task schedule data from Dapr state store."""
    return dapr_service.get_state("statestore", f"recurring-schedule:{user_id}")


def publish_task_event(event_type: str, task_id: int, user_id: int, payload: Dict[str, Any]):
    """Publish a task-related event via Dapr pub/sub."""
    event_data = {
        "event_type": event_type,
        "task_id": task_id,
        "user_id": user_id,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    dapr_service.publish_event("kafka-pubsub", "task-events", event_data)


def publish_reminder_event(event_type: str, task_id: int, user_id: int, payload: Dict[str, Any]):
    """Publish a reminder-related event via Dapr pub/sub."""
    event_data = {
        "event_type": event_type,
        "task_id": task_id,
        "user_id": user_id,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    dapr_service.publish_event("kafka-pubsub", "reminders", event_data)


def publish_recurring_task_event(event_type: str, task_id: int, user_id: int, payload: Dict[str, Any]):
    """Publish a recurring task event via Dapr pub/sub."""
    event_data = {
        "event_type": event_type,
        "task_id": task_id,
        "user_id": user_id,
        "payload": payload,
        "timestamp": datetime.utcnow().isoformat()
    }
    dapr_service.publish_event("kafka-pubsub", "recurring-tasks", event_data)


def invoke_notification_service(notification_data: Dict[str, Any]) -> Any:
    """Invoke the notification service via Dapr service invocation."""
    try:
        return dapr_service.invoke_service("notification-service", "send-notification", notification_data)
    except Exception as e:
        logger.error(f"Failed to invoke notification service: {e}")
        return {"success": False, "error": str(e)}


def invoke_scheduler_service(schedule_data: Dict[str, Any]) -> Any:
    """Invoke the scheduler service via Dapr service invocation."""
    try:
        return dapr_service.invoke_service("scheduler-service", "schedule-task", schedule_data)
    except Exception as e:
        logger.error(f"Failed to invoke scheduler service: {e}")
        return {"success": False, "error": str(e)}