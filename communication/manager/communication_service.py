from typing import Dict, Any

from communication.websocket.connection_manager import ConnectionManager
from communication.manager.presence_manager import PresenceManager
from communication.webrtc.room_manager import RoomManager
from communication.notifications.notification_service import NotificationService


class CommunicationService:
    """
    Central service for managing all communication components.
    """

    def __init__(self):
        self.connection_manager = ConnectionManager()
        self.presence_manager = PresenceManager()
        self.room_manager = RoomManager()
        self.notification_service = NotificationService()

    # -------------------------------------------------
    # User Connection Management
    # -------------------------------------------------

    def user_connected(self, user_id: str):
        """
        Handle a new user connection.
        """
        self.presence_manager.user_connected(user_id)

        return self.notification_service.user_online(user_id)

    def user_disconnected(self, user_id: str):
        """
        Handle user disconnection.
        """
        self.presence_manager.user_disconnected(user_id)

        return self.notification_service.user_offline(user_id)

    # -------------------------------------------------
    # Room Management
    # -------------------------------------------------

    def create_room(self, room_id: str):
        self.room_manager.create_room(room_id)

    def join_room(self, room_id: str, user_id: str):
        self.room_manager.join_room(room_id, user_id)

    def leave_room(self, room_id: str, user_id: str):
        self.room_manager.leave_room(room_id, user_id)

    def get_room_members(self, room_id: str):
        return self.room_manager.get_room_members(room_id)

    def get_all_rooms(self):
        return self.room_manager.get_all_rooms()

    # -------------------------------------------------
    # Notifications
    # -------------------------------------------------

    def send_personal_notification(
        self,
        user_id: str,
        title: str,
        message: str,
    ):
        return self.notification_service.send_personal_notification(
            user_id,
            title,
            message,
        )

    def send_broadcast_notification(
        self,
        title: str,
        message: str,
    ):
        return self.notification_service.send_broadcast_notification(
            title,
            message,
        )

    def send_system_notification(
        self,
        title: str,
        message: str,
    ):
        return self.notification_service.send_system_notification(
            title,
            message,
        )

    # -------------------------------------------------
    # WebSocket Messaging
    # -------------------------------------------------

    async def send_personal_message(
        self,
        user_id: str,
        message: Dict[str, Any],
    ):
        """
        Send a message to a specific connected user.
        """
        await self.connection_manager.send_personal_message(
            user_id,
            message,
        )

    async def broadcast_message(
        self,
        message: Dict[str, Any],
    ):
        """
        Broadcast a message to all connected users.
        """
        await self.connection_manager.broadcast(message)

    # -------------------------------------------------
    # Module Status
    # -------------------------------------------------

    def get_status(self):
        """
        Return current communication module status.
        """
        return {
            "online_users": self.presence_manager.get_online_count(),
            "active_rooms": self.room_manager.get_room_count(),
            "active_connections": self.connection_manager.get_connection_count(),
            "connected_users": self.connection_manager.get_connected_users(),
        }