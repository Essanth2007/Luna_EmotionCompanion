from typing import Dict, Set, List


class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, Set[str]] = {}

    def create_room(self, room_id: str):
        """Create a new room if it does not exist."""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()

    def join_room(self, room_id: str, user_id: str):
        """Add a user to a room."""
        self.create_room(room_id)
        self.rooms[room_id].add(user_id)

    def leave_room(self, room_id: str, user_id: str):
        """Remove a user from a room."""
        if room_id not in self.rooms:
            return

        self.rooms[room_id].discard(user_id)

        if len(self.rooms[room_id]) == 0:
            del self.rooms[room_id]

    def room_exists(self, room_id: str) -> bool:
        """Check if a room exists."""
        return room_id in self.rooms

    def get_room_members(self, room_id: str) -> List[str]:
        """Return all users in a room."""
        if room_id not in self.rooms:
            return []

        return list(self.rooms[room_id])

    def get_room_count(self) -> int:
        """Return total number of active rooms."""
        return len(self.rooms)

    def get_all_rooms(self) -> Dict[str, List[str]]:
        """Return all rooms and their members."""
        return {
            room_id: list(users)
            for room_id, users in self.rooms.items()
        }