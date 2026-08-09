from typing import Dict, Any, List

from fastapi import WebSocket


class ConnectionManager:
    """
    Manages active WebSocket connections and authentication state.
    """

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.authenticated_users: Dict[str, str] = {}

    async def connect(
        self,
        user_id: str,
        websocket: WebSocket,
    ):
        """
        Accept and register a new WebSocket connection.
        """
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        """
        Remove a disconnected user and clean up authentication state.
        """
        self.active_connections.pop(user_id, None)
        self.authenticated_users.pop(user_id, None)

    def register_authenticated_user(self, user_id: str, token: str):
        """Register a user as authenticated for the supplied token."""
        if not user_id or not user_id.strip():
            raise ValueError("user_id must not be empty.")
        if not token or not token.strip():
            raise ValueError("token must not be empty.")

        self.authenticated_users[user_id] = token

    def is_authenticated(self, user_id: str) -> bool:
        """Return whether a user is currently authenticated."""
        return user_id in self.authenticated_users

    def get_user_token(self, user_id: str) -> str | None:
        """Return the token associated with an authenticated user."""
        return self.authenticated_users.get(user_id)

    async def send_personal_message(
        self,
        user_id: str,
        message: Any,
    ):
        """
        Send a message to one connected user.
        """
        websocket = self.active_connections.get(user_id)

        if websocket:
            await websocket.send_json(message)

    async def broadcast(self, message: Any):
        """
        Send a message to all connected users.
        """
        disconnected_users = []

        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected_users.append(user_id)

        for user_id in disconnected_users:
            self.disconnect(user_id)

    async def broadcast_except(
        self,
        excluded_user: str,
        message: Any,
    ):
        """
        Broadcast a message to everyone except one user.
        """
        for user_id, websocket in self.active_connections.items():
            if user_id == excluded_user:
                continue

            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect(user_id)

    def is_connected(self, user_id: str) -> bool:
        """
        Check whether a user is connected.
        """
        return user_id in self.active_connections

    def get_connected_users(self) -> List[str]:
        """
        Return all connected user IDs.
        """
        return list(self.active_connections.keys())

    def get_connection_count(self) -> int:
        """
        Return the total number of active connections.
        """
        return len(self.active_connections)

    def get_connection_statistics(self) -> Dict[str, Any]:
        """
        Return connection statistics.
        """
        return {
            "total_connections": self.get_connection_count(),
            "connected_users": self.get_connected_users(),
        }