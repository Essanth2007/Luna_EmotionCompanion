"""Emotion fusion engine.

Combines facial and speech emotion distributions into a single,
normalised emotion state. The module is intentionally dependency-free
so it can be unit tested without the heavy ML stack.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

# Canonical emotion vocabulary shared by face + speech models.
LIVE_EMOTIONS: List[str] = [
    "happy",
    "sad",
    "angry",
    "fearful",
    "surprised",
    "disgusted",
    "calm",
    "neutral",
]

# Map the raw labels produced by DeepFace / wav2vec2 onto the canonical set.
_LABEL_MAP = {
    "neutral": "neutral",
    "happy": "happy",
    "happiness": "happy",
    "sad": "sad",
    "sadness": "sad",
    "angry": "angry",
    "anger": "angry",
    "fear": "fearful",
    "fearful": "fearful",
    "scared": "fearful",
    "surprise": "surprised",
    "surprised": "surprised",
    "disgust": "disgusted",
    "disgusted": "disgusted",
    "calm": "calm",
    "relaxed": "calm",
    "contempt": "neutral",
}

_FACE_WEIGHT = 0.6
_SPEECH_WEIGHT = 0.4


def normalize_label(raw: str) -> str:
    """Return the canonical label for a raw model label."""
    if not raw:
        return "neutral"
    return _LABEL_MAP.get(str(raw).strip().lower(), "neutral")


def _normalize_distribution(distribution: Dict[str, float]) -> Dict[str, float]:
    """Remap an arbitrary distribution onto the canonical emotion set."""
    if not distribution:
        return {emotion: 0.0 for emotion in LIVE_EMOTIONS}

    merged: Dict[str, float] = {emotion: 0.0 for emotion in LIVE_EMOTIONS}
    for label, value in distribution.items():
        canonical = normalize_label(label)
        try:
            merged[canonical] += float(value)
        except (TypeError, ValueError):
            continue

    total = sum(merged.values())
    if total <= 0:
        return {emotion: 0.0 for emotion in LIVE_EMOTIONS}

    return {emotion: round(score / total, 4) for emotion, score in merged.items()}


def fuse(
    face_distribution: Optional[Dict[str, float]],
    speech_distribution: Optional[Dict[str, float]],
    face_weight: float = _FACE_WEIGHT,
) -> Dict[str, object]:
    """Fuse face and speech emotion distributions.

    Returns a dictionary with the merged distribution, the dominant
    emotion, and its confidence score.
    """
    face_present = bool(face_distribution)
    speech_present = bool(speech_distribution)

    if face_present and speech_present:
        weight_face = face_weight
        weight_speech = 1.0 - face_weight
    elif face_present:
        weight_face, weight_speech = 1.0, 0.0
    elif speech_present:
        weight_face, weight_speech = 0.0, 1.0
    else:
        return {
            "primary_emotion": "neutral",
            "confidence": 0.0,
            "emotion_distribution": {emotion: 0.0 for emotion in LIVE_EMOTIONS},
        }

    face_norm = _normalize_distribution(face_distribution or {})
    speech_norm = _normalize_distribution(speech_distribution or {})

    merged: Dict[str, float] = {emotion: 0.0 for emotion in LIVE_EMOTIONS}
    for emotion in LIVE_EMOTIONS:
        merged[emotion] = round(
            face_norm[emotion] * weight_face + speech_norm[emotion] * weight_speech,
            4,
        )

    total = sum(merged.values())
    if total <= 0:
        return {
            "primary_emotion": "neutral",
            "confidence": 0.0,
            "emotion_distribution": merged,
        }

    merged = {emotion: round(score / total, 4) for emotion, score in merged.items()}

    primary_emotion = max(merged, key=merged.get)
    confidence = float(merged[primary_emotion])

    return {
        "primary_emotion": primary_emotion,
        "confidence": round(confidence, 4),
        "emotion_distribution": merged,
    }
