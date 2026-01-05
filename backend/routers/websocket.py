"""
WebSocket endpoints for real-time communication in the Todo App.
"""
from typing import List
import json
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.websocket_auth import websocket_auth, websocket_auth_middleware
from models import User, Notification


# ADD these event types (don't remove existing ones)
class WebSocketEventType:
    # Existing events...
    TASK_CREATED = "task_created"
    TASK_UPDATED = "task_updated"
    TASK_DELETED = "task_deleted"
    TASK_STATUS_CHANGED = "task_status_changed"
    SYNC_REQUEST = "sync_request"
    SYNC_RESPONSE = "sync_response"

router = APIRouter(prefix="/ws", tags=["WebSocket"])

# Store active connections
active_connections: List[WebSocket] = []


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, User] = {}  # websocket -> user
        self.user_connections: dict[int, List[WebSocket]] = {}  # user_id -> [websockets]
        self.notification_connections: dict[int, List[WebSocket]] = {}  # user_id -> [websockets]

    async def connect(self, websocket: WebSocket, user: User):
        await websocket.accept()
        self.active_connections[websocket] = user

        # Add to user-specific connections for task sync
        if user.id not in self.user_connections:
            self.user_connections[user.id] = []
        self.user_connections[user.id].append(websocket)

        active_connections.append(websocket)  # Keep backward compatibility

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            user = self.active_connections[websocket]
            del self.active_connections[websocket]

            # Remove from user-specific connections
            if user.id in self.user_connections:
                if websocket in self.user_connections[user.id]:
                    self.user_connections[user.id].remove(websocket)
                    if not self.user_connections[user.id]:  # Remove empty lists
                        del self.user_connections[user.id]

            # Remove from notification connections if present
            if user.id in self.notification_connections:
                if websocket in self.notification_connections[user.id]:
                    self.notification_connections[user.id].remove(websocket)
                    if not self.notification_connections[user.id]:  # Remove empty lists
                        del self.notification_connections[user.id]

        if websocket in active_connections:
            active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                # Handle disconnection during broadcast
                self.disconnect(connection)

    async def broadcast_to_user(self, message: str, user_id: int):
        """Send a message to all connections of a specific user"""
        if user_id in self.user_connections:
            disconnected_websockets = []
            for websocket in self.user_connections[user_id]:
                try:
                    await websocket.send_text(message)
                except WebSocketDisconnect:
                    disconnected_websockets.append(websocket)

            # Remove disconnected websockets
            for websocket in disconnected_websockets:
                self.disconnect(websocket)

    async def connect_notification(self, websocket: WebSocket, user: User):
        """Connect a WebSocket specifically for notifications"""
        # Check if websocket is already connected
        if websocket in self.active_connections:
            print(f"⚠️ WebSocket already connected for user {user.id}")
            # Just add to notification connections if not already there
            if user.id not in self.notification_connections:
                self.notification_connections[user.id] = []
            if websocket not in self.notification_connections[user.id]:
                self.notification_connections[user.id].append(websocket)
            return
        
        # Accept the connection only if not already accepted
        try:
            await websocket.accept()
            print(f"✅ WebSocket connection accepted for user {user.id}")
        except RuntimeError as e:
            print(f"⚠️ WebSocket accept error (might already be accepted): {e}")
            # Connection might already be accepted, continue anyway
        
        # Store the connection
        self.active_connections[websocket] = user
        
        # Add to user-specific connections for task sync
        if user.id not in self.user_connections:
            self.user_connections[user.id] = []
        if websocket not in self.user_connections[user.id]:
            self.user_connections[user.id].append(websocket)
        
        # Add to notification connections for this user
        if user.id not in self.notification_connections:
            self.notification_connections[user.id] = []
        if websocket not in self.notification_connections[user.id]:
            self.notification_connections[user.id].append(websocket)
        
        if websocket not in active_connections:
            active_connections.append(websocket)

    async def send_notification_to_user(self, message: str, user_id: int):
        """Send a notification to a specific user's notification connections"""
        if user_id in self.notification_connections:
            disconnected_websockets = []
            for websocket in self.notification_connections[user_id]:
                try:
                    await websocket.send_text(message)
                except WebSocketDisconnect:
                    disconnected_websockets.append(websocket)

            # Remove disconnected websockets
            for websocket in disconnected_websockets:
                self.disconnect(websocket)


manager = ConnectionManager()


@router.websocket("/tasks")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time task updates.
    Authenticates the user with JWT token passed in query parameters and allows real-time communication about tasks.
    """
    # Authenticate the WebSocket connection using JWT token from query parameters
    user = await websocket_auth.authenticate_websocket(websocket)

    if not user:
        # Authentication failed
        await websocket.close(code=1008, reason="Authentication failed")
        return

    # Run the authentication middleware
    if not await websocket_auth_middleware(websocket, user):
        await websocket.close(code=1008, reason="Access denied")
        return

    # Add to active connections
    await manager.connect(websocket, user)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()

            # Parse the received data
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")

                if message_type == "ping":
                    # Respond to ping messages
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )
                elif message_type == "subscribe":
                    # Handle subscription to specific task updates
                    task_id = message_data.get("task_id")
                    if task_id:
                        # In a real implementation, you would track which user is subscribed to which task
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "subscribed",
                                "message": f"Subscribed to updates for task {task_id}",
                                "task_id": task_id
                            }),
                            websocket
                        )
                elif message_type == "unsubscribe":
                    # Handle unsubscription
                    task_id = message_data.get("task_id")
                    if task_id:
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "unsubscribed",
                                "message": f"Unsubscribed from updates for task {task_id}",
                                "task_id": task_id
                            }),
                            websocket
                        )
                else:
                    # Echo back the message with an acknowledgment
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "ack",
                            "original_message": message_data,
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )

            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }),
                    websocket
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Log the disconnection if needed
        print(f"WebSocket disconnected for user {user.id}")


@router.websocket("/notifications")
async def websocket_notifications_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time notifications.
    Authenticates the user with JWT token passed in query parameters and allows real-time communication about notifications.
    """
    # Authenticate the WebSocket connection using JWT token from query parameters
    user = await websocket_auth.authenticate_websocket(websocket)

    if not user:
        # Authentication failed
        await websocket.close(code=1008, reason="Authentication failed")
        return

    # Run the authentication middleware
    if not await websocket_auth_middleware(websocket, user):
        await websocket.close(code=1008, reason="Access denied")
        return

    # Add to notification connections
    await manager.connect_notification(websocket, user)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()

            # Parse the received data
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type")

                if message_type == "ping":
                    # Respond to ping messages
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )
                elif message_type == "get_unread_count":
                    # Return count of unread notifications
                    from db import get_session
                    with next(get_session()) as session:
                        unread_count = session.query(Notification).filter(
                            Notification.user_id == user.id,
                            Notification.read == False
                        ).count()
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "unread_count",
                                "count": unread_count
                            }),
                            websocket
                        )
                elif message_type == "subscribe_to_notifications":
                    # Confirm subscription to notifications
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "subscribed",
                            "message": "Subscribed to notification updates"
                        }),
                        websocket
                    )
                else:
                    # Echo back the message with an acknowledgment
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "ack",
                            "original_message": message_data,
                            "timestamp": datetime.utcnow().isoformat()
                        }),
                        websocket
                    )

            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format"
                    }),
                    websocket
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Log the disconnection if needed
        print(f"WebSocket notification disconnected for user {user.id}")