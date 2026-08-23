from datetime import datetime
from typing import Dict, List


class PresenceManager:
    """
    Manages user presence information.
    Tracks online/offline status and last seen timestamps.
    """

    def __init__(self):
        self.online_users: Dict[str, datetime] = {}
        self.last_seen: Dict[str, datetime] = {}

    def user_connected(self, user_id: str):
        """Mark a user as online."""
        now = datetime.utcnow()
        self.online_users[user_id] = now
        self.last_seen[user_id] = now

    def user_disconnected(self, user_id: str):
        """Mark a user as offline."""
        now = datetime.utcnow()

        if user_id in self.online_users:
            del self.online_users[user_id]

        self.last_seen[user_id] = now

    def is_online(self, user_id: str) -> bool:
        """Check if a user is currently online."""
        return user_id in self.online_users

    def get_online_users(self) -> List[str]:
        """Return a list of online users."""
        return list(self.online_users.keys())

    def get_online_count(self) -> int:
        """Return total number of online users."""
        return len(self.online_users)

    def get_last_seen(self, user_id: str):
        """Return the last seen timestamp of a user."""
        return self.last_seen.get(user_id)

    def get_presence(self, user_id: str):
        """Return complete presence information."""
        return {
            "user_id": user_id,
            "online": self.is_online(user_id),
            "last_seen": self.last_seen.get(user_id)
        }