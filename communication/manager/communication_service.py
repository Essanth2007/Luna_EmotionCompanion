from typing import Any, Dict, List, Optional

from communication.websocket.connection_manager import ConnectionManager
from communication.manager.presence_manager import PresenceManager
from communication.webrtc.call_manager import CallManager, CallSession
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
        self.call_manager = CallManager()
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
    # Call Management
    # -------------------------------------------------

    def create_call(
        self,
        caller_id: str,
        receiver_id: str,
        media_type: str = "audio",
        call_id: Optional[str] = None,
    ) -> CallSession:
        """Create a voice or video call session."""
        session = self.call_manager.create_call(
            caller_id=caller_id,
            receiver_id=receiver_id,
            media_type=media_type,
            call_id=call_id,
        )
        self.notification_service.incoming_call(caller_id, receiver_id)
        return session

    def accept_call(self, call_id: str, user_id: str) -> CallSession:
        """Accept an active call."""
        session = self.call_manager.accept_call(call_id, user_id)
        self.notification_service.create_notification(
            title="Call Accepted",
            message=f"{user_id} accepted the call.",
            notification_type="call_accepted",
            user_id=user_id,
        )
        return session

    def reject_call(
        self,
        call_id: str,
        user_id: str,
        reason: Optional[str] = None,
    ) -> CallSession:
        """Reject an active call."""
        session = self.call_manager.reject_call(call_id, user_id, reason=reason)
        self.notification_service.create_notification(
            title="Call Rejected",
            message=f"{user_id} rejected the call.",
            notification_type="call_rejected",
            user_id=user_id,
        )
        return session

    def end_call(self, call_id: str, user_id: str) -> CallSession:
        """Terminate an active call."""
        session = self.call_manager.end_call(call_id, user_id)
        self.notification_service.create_notification(
            title="Call Ended",
            message=f"{user_id} ended the call.",
            notification_type="call_ended",
            user_id=user_id,
        )
        return session

    def get_call(self, call_id: str) -> Optional[CallSession]:
        """Return a call session by ID."""
        return self.call_manager.get_call(call_id)

    def get_active_calls(self) -> List[CallSession]:
        """Return all active calls."""
        return self.call_manager.get_active_calls()

    def remove_call(self, call_id: str) -> None:
        """Remove a call from the manager."""
        self.call_manager.remove_call(call_id)

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
            "active_calls": [call.call_id for call in self.get_active_calls()],
        }