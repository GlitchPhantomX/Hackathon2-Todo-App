import asyncio
import json
import logging
import sys
import os
import inspect
from datetime import datetime
import threading
from typing import Dict, Set

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaConsumer

# Get the current directory and parent (backend) directory
current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parent_dir = os.path.dirname(current_dir)  # This is the backend directory

# Insert the backend directory at the beginning of sys.path to ensure correct imports
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for WebSocket connections
connected_clients: Dict[str, Set[WebSocket]] = {}  # user_id -> set of websockets
global_connections: Set[WebSocket] = set()  # All connections (for broadcasting to everyone)

app = FastAPI(title="Notification Consumer Service")

# Add CORS middleware to allow all origins (critical for frontend on port 3000 and consumer on 8001)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for clients to connect and receive notifications."""
    await websocket.accept()

    # Add to user-specific connections
    if user_id not in connected_clients:
        connected_clients[user_id] = set()
    connected_clients[user_id].add(websocket)

    # Add to global connections
    global_connections.add(websocket)

    logger.info(f"✅ [WEBSOCKET] User {user_id} connected. Total connections: {len(global_connections)}")
    print(f"✅ User {user_id} connected via WebSocket")

    try:
        # Keep the connection alive and listen for pings
        while True:
            # Wait for messages from client (like ping)
            data = await websocket.receive_text()
            
            # Optionally handle ping/pong
            try:
                msg = json.loads(data)
                if msg.get('type') == 'ping':
                    await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
            except:
                pass
                
    except WebSocketDisconnect:
        # Remove from user-specific connections
        if user_id in connected_clients:
            connected_clients[user_id].discard(websocket)
            if not connected_clients[user_id]:
                del connected_clients[user_id]

        # Remove from global connections
        global_connections.discard(websocket)

        logger.info(f"❌ [WEBSOCKET] User {user_id} disconnected. Total connections: {len(global_connections)}")
        print(f"❌ User {user_id} disconnected from WebSocket")


async def consume_from_redpanda():
    """Consume messages from Redpanda and broadcast to WebSocket clients."""
    consumer = AIOKafkaConsumer(
        'reminders',  # Subscribe to reminders topic
        'task-events',  # Subscribe to task-events topic
        bootstrap_servers=['d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
        security_protocol='SASL_SSL',
        sasl_mechanism='SCRAM-SHA-256',
        ssl_context=True,
        sasl_plain_username='todo-app-user',
        sasl_plain_password='Admin12345',
        value_deserializer=lambda x: json.loads(x.decode('utf-8')),
        auto_offset_reset='latest'  # Start from latest messages to avoid old data
    )

    try:
        await consumer.start()
        print("✅ [CONSUMER] Connected to Redpanda Cloud")
        logger.info("[CONSUMER] Started consuming from Redpanda topics: reminders, task-events")

        async for msg in consumer:
            try:
                # Parse the message
                message_data = msg.value
                topic = msg.topic

                logger.info(f"📨 [CONSUMER] Received event from topic '{topic}': {message_data}")

                # Determine the target user(s) for this message
                user_id = None
                if 'user_id' in message_data:
                    user_id = str(message_data['user_id'])
                elif isinstance(message_data, dict) and 'task_data' in message_data and 'user_id' in message_data['task_data']:
                    user_id = str(message_data['task_data']['user_id'])

                # Extract task info for notification
                task_title = message_data.get('title', message_data.get('task_data', {}).get('title', 'Task'))
                event_type = message_data.get('event_type', 'UNKNOWN')
                
                # IMPORTANT: Only process events from correct topics
                # task-events topic -> task CRUD operations
                # reminders topic -> only actual reminders (with time_until_due_minutes)
                
                ws_message = None
                
                if topic == 'task-events':
                    # Handle task CRUD events
                    if event_type == 'TASK_CREATED':
                        ws_message = {
                            "type": "task_created",
                            "title": "✨ New Task Created",
                            "message": f"Task '{task_title}' has been created successfully!",
                            "taskId": message_data.get('task_id'),
                            "taskTitle": task_title,
                            "priority": message_data.get('priority', 'medium'),
                            "timestamp": datetime.utcnow().isoformat(),
                            "icon": "✨",
                            "color": "#10B981"
                        }
                    elif event_type == 'TASK_UPDATED':
                        ws_message = {
                            "type": "task_updated",
                            "title": "📝 Task Updated",
                            "message": f"Task '{task_title}' has been updated",
                            "taskId": message_data.get('task_id'),
                            "taskTitle": task_title,
                            "timestamp": datetime.utcnow().isoformat(),
                            "icon": "📝",
                            "color": "#3B82F6"
                        }
                    elif event_type == 'TASK_COMPLETED':
                        ws_message = {
                            "type": "task_completed",
                            "title": "✅ Task Completed",
                            "message": f"Great job! '{task_title}' is complete",
                            "taskId": message_data.get('task_id'),
                            "taskTitle": task_title,
                            "timestamp": datetime.utcnow().isoformat(),
                            "icon": "✅",
                            "color": "#10B981"
                        }
                    elif event_type == 'TASK_DELETED':
                        ws_message = {
                            "type": "task_deleted",
                            "title": "🗑️ Task Deleted",
                            "message": f"Task '{task_title}' was deleted",
                            "taskId": message_data.get('task_id'),
                            "taskTitle": task_title,
                            "timestamp": datetime.utcnow().isoformat(),
                            "icon": "🗑️",
                            "color": "#EF4444"
                        }
                
                elif topic == 'reminders':
                    # Only process actual reminders (not task creation events)
                    # Reminders have 'time_until_due_minutes' or 'message' field
                    if 'time_until_due_minutes' in message_data or event_type == 'REMINDER':
                        ws_message = {
                            "type": "reminder-sent",
                            "title": "⏰ Task Reminder",
                            "message": message_data.get('message', f"Time for: {task_title}"),
                            "taskId": message_data.get('task_id'),
                            "taskTitle": task_title,
                            "due_date": message_data.get('due_date'),
                            "timestamp": datetime.utcnow().isoformat(),
                            "icon": "⏰",
                            "color": "#7C3AED"
                        }
                    else:
                        # This is probably a task creation event in wrong topic - ignore it
                        logger.warning(f"[CONSUMER] Ignoring non-reminder event in reminders topic: {event_type}")
                        ws_message = None
                
                # Only send notification if we created a valid message
                if not ws_message:
                    logger.info(f"[CONSUMER] Skipping event - no valid notification created")
                    continue

                # Send to appropriate WebSocket clients
                if user_id and user_id in connected_clients:
                    # Send to specific user
                    print(f"\n{'='*60}")
                    print(f"🔔 SENDING NOTIFICATION TO USER {user_id}")
                    print(f"   Title: {ws_message.get('title')}")
                    print(f"   Message: {ws_message.get('message')}")
                    print(f"{'='*60}\n")
                    
                    dead_websockets = set()
                    for websocket in connected_clients[user_id]:
                        try:
                            await websocket.send_json(ws_message)
                            logger.info(f"✅ [WEBSOCKET] Sent notification to user {user_id}")
                        except Exception as e:
                            logger.error(f"❌ [WEBSOCKET] Error sending to user {user_id}: {e}")
                            dead_websockets.add(websocket)

                    # Clean up dead connections
                    for websocket in dead_websockets:
                        connected_clients[user_id].discard(websocket)
                        global_connections.discard(websocket)

                else:
                    # No specific user or user not connected
                    print(f"⚠️ User {user_id} not connected via WebSocket")
                    logger.warning(f"[WEBSOCKET] User {user_id} not connected")

            except json.JSONDecodeError as e:
                logger.error(f"❌ [CONSUMER] Failed to decode JSON message: {e}")
            except Exception as e:
                logger.error(f"❌ [CONSUMER] Error processing message: {e}")

    except Exception as e:
        logger.error(f"❌ [CONSUMER] Error connecting to Redpanda: {e}")
    finally:
        await consumer.stop()


async def start_consumer_and_server():
    """Start both the Kafka consumer and the WebSocket server."""
    # Run the consumer in the background
    consumer_task = asyncio.create_task(consume_from_redpanda())

    # Start the FastAPI server
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8001,  # Different port to avoid conflict with main backend
        log_level="info"
    )
    server = uvicorn.Server(config)

    print("="*60)
    print("🚀 NOTIFICATION CONSUMER SERVICE STARTED")
    print("   Port: 8001")
    print("   WebSocket: ws://localhost:8001/ws/{user_id}")
    print("="*60)
    logger.info("[SERVICE] Starting Notification Consumer Service on port 8001")

    try:
        await server.serve()
    except KeyboardInterrupt:
        logger.info("[SERVICE] Shutting down...")
    finally:
        consumer_task.cancel()
        try:
            await consumer_task
        except asyncio.CancelledError:
            pass


if __name__ == "__main__":
    # Run the combined consumer and server
    asyncio.run(start_consumer_and_server())