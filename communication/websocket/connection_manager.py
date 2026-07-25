from fastapi import WebSocket
from typing import Dict
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    async def connect(self, user_id: str, websocket: WebSocket):
    await websocket.accept()
    self.active_connections[user_id] = websocket