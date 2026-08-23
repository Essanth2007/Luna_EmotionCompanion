# Luna Emotion Companion

# Communication Module Environment Setup

## Python Version

Python 3.14.2

---

## Create Virtual Environment

```bash
python -m venv venv
```

---

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

---

## Install Dependencies

```bash
pip install fastapi
pip install "uvicorn[standard]"
pip install redis
pip install aiortc
```

---

## Verify Installation

```bash
pip list
```

---

## Current Folder Structure

```
communication/
│
├── websocket/
│   ├── connection_manager.py
│   └── websocket_router.py
│
├── webrtc/
├── notifications/
├── manager/
└── utils/
```

---

## Git Branch

feature/communication

---

## Notes

- Always activate the virtual environment before running the project.
- Pull the latest changes before starting new work.
- Commit changes with meaningful commit messages.