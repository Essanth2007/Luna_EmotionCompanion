"""Centralised service configuration.

Reads integration URLs and secrets from the environment so the backend
can reach the Emotion AI Service and the Communication Service without
hard-coded hosts.
"""
from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

# Emotion AI Service (speech / video / live endpoints)
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8001").rstrip("/")

# Communication Service (WebSocket + internal emotion bus)
COMMUNICATION_SERVICE_URL = os.getenv(
    "COMMUNICATION_SERVICE_URL", "http://localhost:8002"
).rstrip("/")

SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# How long the backend will wait on the AI service before failing.
AI_TIMEOUT_SECONDS = float(os.getenv("AI_TIMEOUT", "30"))
