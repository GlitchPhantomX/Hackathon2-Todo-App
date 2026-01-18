"""
WebSocket authentication utilities for the Todo App.
"""
import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from config import settings
from utils.auth_utils import verify_access_token, get_user_id_from_token
from models import User
from db import get_session
from sqlmodel import select


class WebSocketAuthenticator:
    """
    Handles WebSocket authentication using JWT tokens passed in the query parameters
    or through an initial authentication message.
    """

    def __init__(self):
        self.security = HTTPBearer(auto_error=False)

    async def authenticate_websocket(self, websocket: WebSocket) -> Optional[User]:
        """
        Authenticate a WebSocket connection using JWT token.

        Args:
            websocket: The WebSocket connection to authenticate

        Returns:
            Authenticated User object if successful, None otherwise
        """
        # Track if we've already accepted the websocket connection
        websocket._accepted = False

        async def safe_accept():
            """Safely accept the WebSocket connection only once"""
            if not hasattr(websocket, '_accepted') or not websocket._accepted:
                try:
                    await websocket.accept()
                    websocket._accepted = True
                except Exception:
                    # Connection might already be accepted
                    websocket._accepted = True

        try:
            # Try to get token from query parameters first
            query_params = dict(websocket.query_params)
            token = query_params.get("token")

            if not token:
                # Accept the websocket first before sending messages
                await safe_accept()

                # If not in query params, wait for an auth message
                await websocket.send_text(json.dumps({
                    "type": "auth_required",
                    "message": "Authentication token required"
                }))

                # Wait for authentication message
                auth_message = await websocket.receive_text()
                auth_data = json.loads(auth_message)

                if auth_data.get("type") == "auth":
                    token = auth_data.get("token")
                else:
                    await websocket.close(code=1008, reason="Authentication required")
                    return None

            # Verify the JWT token
            payload = verify_access_token(token)
            if payload is None:
                await safe_accept()
                await websocket.send_text(json.dumps({
                    "type": "auth_error",
                    "message": "Invalid token"
                }))
                await websocket.close(code=1008, reason="Invalid token")
                return None

            # Get user ID from token
            user_id = get_user_id_from_token(token)
            if user_id is None:
                await safe_accept()
                await websocket.send_text(json.dumps({
                    "type": "auth_error",
                    "message": "Invalid token"
                }))
                await websocket.close(code=1008, reason="Invalid token")
                return None

            # Get user from database
            with next(get_session()) as session:
                user = session.exec(select(User).where(User.id == user_id)).first()
                if user is None:
                    await safe_accept()
                    await websocket.send_text(json.dumps({
                        "type": "auth_error",
                        "message": "User not found"
                    }))
                    await websocket.close(code=1008, reason="User not found")
                    return None

                # Successfully authenticated
                await safe_accept()
                await websocket.send_text(json.dumps({
                    "type": "auth_success",
                    "message": "Authentication successful"
                }))

                return user

        except json.JSONDecodeError:
            if not websocket._accepted:
                try:
                    await websocket.accept()
                except:
                    pass  # Might already be accepted
            await websocket.close(code=1007, reason="Invalid JSON in message")
            return None
        except JWTError:
            if not websocket._accepted:
                try:
                    await websocket.accept()
                except:
                    pass  # Might already be accepted
            await websocket.close(code=1008, reason="JWT Error")
            return None
        except WebSocketDisconnect:
            return None
        except Exception as e:
            logging.error(f"WebSocket authentication error: {str(e)}")
            if not websocket._accepted:
                try:
                    await websocket.accept()
                except:
                    pass  # Might already be accepted
            await websocket.close(code=1011, reason="Internal server error")
            return None


# Global instance
websocket_auth = WebSocketAuthenticator()


async def websocket_auth_middleware(websocket: WebSocket, user: User) -> bool:
    """
    Middleware function to handle authenticated WebSocket connections.

    Args:
        websocket: The WebSocket connection
        user: The authenticated user

    Returns:
        True if connection should continue, False otherwise
    """
    # You can add additional checks here (e.g., user permissions, rate limiting, etc.)

    # Add user info to websocket state for later use
    websocket.state.user = user
    websocket.state.user_id = user.id
    websocket.state.authenticated_at = datetime.utcnow()

    return True