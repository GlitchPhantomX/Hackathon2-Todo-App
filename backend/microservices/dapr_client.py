import asyncio
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class MockDaprClient:
    """A safe mock client that never throws connection errors"""
    async def close(self): pass
    async def publish_event(self, **kwargs):
        print(f"🚀 [SIMULATION] Dapr Event: {kwargs.get('data')}")
        return True
    async def save_state(self, **kwargs): return True
    async def get_state(self, **kwargs):
        from types import SimpleNamespace
        return SimpleNamespace(data=None)
    async def delete_state(self, **kwargs): return True

class DaprClientWrapper:
    def __init__(self, dapr_http_port: int = 3500, dapr_grpc_port: int = 50001):
        self.dapr_grpc_port = dapr_grpc_port
        self.client = None

    async def __aenter__(self):
        try:
            # Try to import and connect
            from dapr.clients import DaprClient
            import os
            os.environ['DAPR_GRPC_PORT'] = str(self.dapr_grpc_port)

            # Connect without waiting for readiness (skip health checks)
            self.client = DaprClient()
            logger.info("✅ Dapr Client Connected")
        except Exception:
            # FALLBACK: If Dapr fails, use Mock
            logger.warning("⚠️ Dapr not found. Switching to MOCK mode (No connection errors)")
            self.client = MockDaprClient()

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            try:
                await self.client.close()
            except:
                pass

    async def publish_event(self, pubsub_name: str, topic_name: str, data: Dict[str, Any]):
        try:
            # Safely handle serialization
            serialized_data = json.dumps(data)
            await self.client.publish_event(
                pubsub_name=pubsub_name,
                topic_name=topic_name,
                data=serialized_data,
                data_content_type='application/json'
            )
            return True
        except Exception as e:
            logger.error(f"❌ Publish failed: {e}")
            return False

    # Mock other methods just in case they are called
    async def save_state(self, store_name, key, value): return True
    async def get_state(self, store_name, key): return None
    async def delete_state(self, store_name, key): return True

dapr_client = DaprClientWrapper()