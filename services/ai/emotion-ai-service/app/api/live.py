"""Live emotion tracking endpoints.

These endpoints accept repeated samples (frames / audio chunks) from a
single session and return a fused, continuously-updated emotion state
along with a timeline and spike detection. This is the integration
layer that turns the file-based AI models into a real-time experience.
"""
from __future__ import annotations

import uuid
from typing import Dict, List, Optional

from fastapi import APIRouter, File, UploadFile

from app.fusion.fusion_engine import fuse
from app.spike_detection.spike_detector import SpikeDetector

router = APIRouter(prefix="/live", tags=["Live Emotion Tracking"])

_SESSIONS: Dict[str, "LiveSession"] = {}
_spike_detector = SpikeDetector()


class LiveSession:
    """In-memory state for one live emotion session."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.samples: List[Dict[str, object]] = []
        self.last_face: Optional[Dict[str, object]] = None
        self.last_speech: Optional[Dict[str, object]] = None

    def add_sample(
        self,
        face: Optional[Dict[str, object]],
        speech: Optional[Dict[str, object]],
    ) -> Dict[str, object]:
        if face is not None:
            self.last_face = face
        if speech is not None:
            self.last_speech = speech

        fused = fuse(
            face_distribution=_dist(self.last_face),
            speech_distribution=_dist(self.last_speech),
        )

        dominant_history = [s["primary_emotion"] for s in self.samples]
        spike = _spike_detector.evaluate(
            current_emotion=str(fused["primary_emotion"]),
            current_confidence=float(fused["confidence"]),
            history=dominant_history,
        )

        sample = {
            "index": len(self.samples) + 1,
            "primary_emotion": fused["primary_emotion"],
            "confidence": fused["confidence"],
            "emotion_distribution": fused["emotion_distribution"],
            "face": self.last_face,
            "speech": self.last_speech,
            "spike": spike.is_spike,
            "spike_reason": spike.reason,
        }
        self.samples.append(sample)
        return sample

    def state(self) -> Dict[str, object]:
        return {
            "session_id": self.session_id,
            "sample_count": len(self.samples),
            "live": True,
            "current": self.samples[-1] if self.samples else None,
            "timeline": [
                {
                    "index": s["index"],
                    "primary_emotion": s["primary_emotion"],
                    "confidence": s["confidence"],
                    "spike": s["spike"],
                }
                for s in self.samples
            ],
            "spikes": [
                {
                    "index": s["index"],
                    "primary_emotion": s["primary_emotion"],
                    "reason": s["spike_reason"],
                }
                for s in self.samples
                if s["spike"]
            ],
        }


def _dist(result: Optional[Dict[str, object]]) -> Optional[Dict[str, float]]:
    if not result:
        return None
    return result.get("emotion_distribution")  # type: ignore[return-value]


def _get_or_create(session_id: str) -> LiveSession:
    session = _SESSIONS.get(session_id)
    if session is None:
        session = LiveSession(session_id)
        _SESSIONS[session_id] = session
    return session


@router.post("/analyze")
async def live_analyze(
    session_id: str,
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
):
    """Analyse one or more samples for a live session.

    Send an `image` and/or `audio` file. The service keeps a rolling
    fused state per `session_id`. Returns the latest fused result and
    appends it to the session timeline.
    """
    from app.services.video_service import VideoService
    from app.services.speech_service import SpeechService

    face_result: Optional[Dict[str, object]] = None
    speech_result: Optional[Dict[str, object]] = None

    if image is not None and image.filename:
        face_result = await VideoService.analyze(image)

    if audio is not None and audio.filename:
        speech_result = await SpeechService.analyze(audio)

    session = _get_or_create(session_id)
    sample = session.add_sample(face_result, speech_result)

    return {
        "session_id": session_id,
        "live": True,
        "face": face_result,
        "speech": speech_result,
        "primary_emotion": sample["primary_emotion"],
        "confidence": sample["confidence"],
        "emotion_distribution": sample["emotion_distribution"],
        "spike": sample["spike"],
        "spike_reason": sample["spike_reason"],
        "sample_index": sample["index"],
    }


@router.get("/{session_id}")
async def live_state(session_id: str):
    """Return the current live state + timeline for a session."""
    session = _SESSIONS.get(session_id)
    if session is None:
        return {"session_id": session_id, "live": False, "current": None, "timeline": []}
    return session.state()


@router.delete("/{session_id}")
async def live_reset(session_id: str):
    """Clear a live session's state."""
    _SESSIONS.pop(session_id, None)
    return {"session_id": session_id, "cleared": True}


@router.get("/")
async def live_root():
    return {"active_sessions": len(_SESSIONS), "live": True}
