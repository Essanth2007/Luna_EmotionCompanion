"""Analysis proxy routers.

These endpoints expose the Emotion AI Service to the authenticated
frontend. The backend forwards audio / image samples to the AI service,
persists the resulting emotion to the database, and (for live tracking)
pushes real-time updates onto the Communication Service bus.

The backend remains the single integration layer the frontend talks to:
it owns authentication, storage, and cross-service orchestration.
"""
from __future__ import annotations

import logging
import uuid
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.config import (
    AI_SERVICE_URL,
    AI_TIMEOUT_SECONDS,
    COMMUNICATION_SERVICE_URL,
)
from app.db.session import get_db
from app.models.emotion import Emotion
from app.models.user import User
from app.schemas.emotion import EmotionResponse

logger = logging.getLogger("luna.analysis")

router = APIRouter(prefix="", tags=["Emotion Analysis (AI)"])


async def _call_ai(path: str, files: dict) -> dict:
    """Forward multipart files to the AI service and return JSON."""
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT_SECONDS) as client:
            response = await client.post(
                f"{AI_SERVICE_URL}{path}", files=files
            )
    except httpx.HTTPError as exc:
        logger.exception("ai.service_unreachable")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Emotion AI service is unreachable",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Emotion AI service error: {response.text}",
        )
    return response.json()


def _log_emotion(
    db: Session,
    user: User,
    emotion: str,
    confidence: float,
    note: Optional[str] = None,
) -> Emotion:
    """Persist a single emotion record derived from AI output."""
    intensity = max(1, min(10, round(float(confidence) * 10)))
    record = Emotion(
        user_id=user.id,
        emotion=str(emotion).lower(),
        intensity=intensity,
        note=note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/voice")
async def analyze_voice(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyse an audio sample for speech emotion and store the result."""
    result = await _call_ai("/speech/analyze", {"file": (file.filename, file.file, file.content_type)})
    primary = result.get("primary_emotion", "neutral")
    confidence = float(result.get("confidence", 0.0))
    record = _log_emotion(
        db, current_user, primary, confidence, note="voice"
    )
    return {
        "id": record.id,
        "stored": True,
        "primary_emotion": primary,
        "confidence": confidence,
        "emotion_distribution": result.get("emotion_distribution", {}),
        "face_detected": None,
    }


@router.post("/video")
async def analyze_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyse an image/frame for facial emotion and store the result."""
    result = await _call_ai("/video/analyze", {"file": (file.filename, file.file, file.content_type)})
    primary = result.get("primary_emotion", "neutral")
    confidence = float(result.get("confidence", 0.0))
    record = _log_emotion(
        db, current_user, primary, confidence, note="video"
    )
    return {
        "id": record.id,
        "stored": True,
        "primary_emotion": primary,
        "confidence": confidence,
        "emotion_distribution": result.get("emotion_distribution", {}),
        "face_detected": result.get("face_detected"),
    }


@router.post("/live")
async def analyze_live(
    session_id: str,
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Live emotion tracking sample.

    Forwards the supplied image/audio samples to the AI service's live
    session endpoint, persists the fused emotion, and pushes the update
    onto the Communication Service bus for real-time delivery.
    """
    if (image is None or not image.filename) and (audio is None or not audio.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one of 'image' or 'audio'.",
        )

    files: dict = {}
    if image is not None and image.filename:
        files["image"] = (image.filename, image.file, image.content_type)
    if audio is not None and audio.filename:
        files["audio"] = (audio.filename, audio.file, audio.content_type)

    result = await _call_ai(f"/live/analyze?session_id={session_id}", files)
    result.setdefault("session_id", session_id)
    if not result.get("session_id"):
        result["session_id"] = session_id

    primary = result.get("primary_emotion", "neutral")
    confidence = float(result.get("confidence", 0.0))

    # Persist a fused emotion record for history / insights.
    _log_emotion(db, current_user, primary, confidence, note=f"live:{session_id}")

    # Real-time push onto the Communication Service bus.
    # Identity must match how the Communication Service keys WS connections
    # (the JWT subject / user email), not the numeric database id.
    await _push_live_emotion(current_user.email, result)

    return result


@router.get("/live/{session_id}")
async def live_state(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Return the live emotion state for a session from the AI service."""
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT_SECONDS) as client:
            response = await client.get(f"{AI_SERVICE_URL}/live/{session_id}")
    except httpx.HTTPError as exc:
        logger.exception("ai.service_unreachable")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Emotion AI service is unreachable",
        ) from exc
    return response.json()


@router.delete("/live/{session_id}")
async def live_reset(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """Reset a live session on the AI service."""
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT_SECONDS) as client:
            response = await client.delete(f"{AI_SERVICE_URL}/live/{session_id}")
    except httpx.HTTPError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Emotion AI service is unreachable",
        )
    return response.json()


async def _push_live_emotion(user_id, result: dict) -> None:
    """Best-effort push of a live emotion update to connected clients."""
    payload = {
        "user_id": str(user_id),
        "session_id": result.get("session_id"),
        "primary_emotion": result.get("primary_emotion"),
        "confidence": result.get("confidence"),
        "emotion_distribution": result.get("emotion_distribution"),
        "spike": result.get("spike", False),
        "spike_reason": result.get("spike_reason"),
        "timestamp": None,
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                f"{COMMUNICATION_SERVICE_URL}/internal/emotion", json=payload
            )
    except httpx.HTTPError:
        # Communication service is optional for the live UI; ignore failures.
        logger.warning("communication.bus_unreachable")
