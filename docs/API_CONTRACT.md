# Luna Emotion Companion

# Communication API Contract

**Version:** 1.0.0

---

## WebSocket Endpoint

```
/ws/{user_id}
```

---

# Data Format

All communication messages use **JSON**.

---

# Supported Events

## 1. Connect

```json
{
    "type": "connect"
}
```

Description:
Registers a client with the communication server.

---

## 2. Disconnect

```json
{
    "type": "disconnect"
}
```

Description:
Sent when a client disconnects.

---

## 3. Broadcast

```json
{
    "type": "broadcast",
    "sender": "user123",
    "data": {}
}
```

Description:
Broadcasts a message to all connected clients.

---

## 4. Notification

```json
{
    "type": "notification",
    "title": "",
    "message": ""
}
```

Description:
Sends a notification to a specific user.

---

## 5. Presence Status

```json
{
    "type": "status",
    "user_id": "",
    "status": "online"
}
```

Description:
Updates a user's online/offline status.

---

# WebRTC Signaling

## Offer

```json
{
    "type": "offer",
    "room_id": "",
    "sender": "",
    "receiver": "",
    "sdp": {}
}
```

---

## Answer

```json
{
    "type": "answer",
    "room_id": "",
    "sender": "",
    "receiver": "",
    "sdp": {}
}
```

---

## ICE Candidate

```json
{
    "type": "ice_candidate",
    "room_id": "",
    "sender": "",
    "receiver": "",
    "candidate": {}
}
```

---

# Error Format

```json
{
    "type": "error",
    "message": ""
}
```