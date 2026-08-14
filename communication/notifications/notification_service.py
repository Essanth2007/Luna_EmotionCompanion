from datetime import datetime
from typing import Dict, Any, List


class NotificationService:
    """
    Manages notification creation and storage.

    Supports:
    - System notifications
    - User notifications
    - Broadcast notifications
    - Call notifications
    """

    def __init__(self):
        self.notification_history: List[Dict[str, Any]] = []

    def create_notification(
        self,
        title: str,
        message: str,
        notification_type: str = "system",
        user_id: str | None = None,
    ) -> Dict[str, Any]:
        """
        Create a notification object.
        """

        notification = {
            "type": notification_type,
            "title": title,
            "message": message,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.notification_history.append(notification)

        return notification

    def user_online(self, user_id: str) -> Dict[str, Any]:
        return self.create_notification(
            title="User Online",
            message=f"{user_id} is now online.",
            notification_type="presence",
            user_id=user_id,
        )

    def user_offline(self, user_id: str) -> Dict[str, Any]:
        return self.create_notification(
            title="User Offline",
            message=f"{user_id} went offline.",
            notification_type="presence",
            user_id=user_id,
        )

    def incoming_call(self, caller: str, receiver: str) -> Dict[str, Any]:
        return self.create_notification(
            title="Incoming Call",
            message=f"Incoming call from {caller}.",
            notification_type="incoming_call",
            user_id=receiver,
        )

    def call_accepted(self, caller: str, receiver: str) -> Dict[str, Any]:
        return self.create_notification(
            title="Call Accepted",
            message=f"{receiver} accepted the call from {caller}.",
            notification_type="call_accepted",
            user_id=caller,
        )

    def call_rejected(self, caller: str, receiver: str, reason: str | None = None) -> Dict[str, Any]:
        details = f" Reason: {reason}." if reason else ""
        return self.create_notification(
            title="Call Rejected",
            message=f"{receiver} rejected the call from {caller}.{details}",
            notification_type="call_rejected",
            user_id=caller,
        )

    def call_ended(self, caller: str, receiver: str, reason: str | None = None) -> Dict[str, Any]:
        details = f" Reason: {reason}." if reason else ""
        return self.create_notification(
            title="Call Ended",
            message=f"The call between {caller} and {receiver} has ended.{details}",
            notification_type="call_ended",
            user_id=caller,
        )

    def missed_call(self, caller: str, receiver: str) -> Dict[str, Any]:
        return self.create_notification(
            title="Missed Call",
            message=f"You missed a call from {caller}.",
            notification_type="call",
            user_id=receiver,
        )

    def send_system_notification(
        self,
        title: str,
        message: str,
    ) -> Dict[str, Any]:
        return self.create_notification(
            title=title,
            message=message,
            notification_type="system",
        )

    def send_personal_notification(
        self,
        user_id: str,
        title: str,
        message: str,
    ) -> Dict[str, Any]:
        return self.create_notification(
            title=title,
            message=message,
            notification_type="personal",
            user_id=user_id,
        )

    def send_broadcast_notification(
        self,
        title: str,
        message: str,
    ) -> Dict[str, Any]:
        return self.create_notification(
            title=title,
            message=message,
            notification_type="broadcast",
        )

    def get_notification_history(self) -> List[Dict[str, Any]]:
        """
        Return all stored notifications.
        """
        return self.notification_history

    def clear_notification_history(self):
        """
        Remove all stored notifications.
        """
        self.notification_history.clear()