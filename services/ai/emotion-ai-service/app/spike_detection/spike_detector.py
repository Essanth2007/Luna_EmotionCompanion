"""Emotion spike detection.

A spike is a sudden, high-confidence change in the dominant emotion
after a stable period. This is used to surface moments worth
highlighting in the live emotion timeline.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

# Minimum confidence a new dominant emotion must reach to be a spike.
_SPIKE_CONFIDENCE_THRESHOLD = 0.45
# Number of consecutive prior samples that must be stable before a
# change counts as a spike.
_STABLE_WINDOW = 3


@dataclass
class SpikeResult:
    is_spike: bool
    reason: Optional[str] = None
    previous_emotion: Optional[str] = None


class SpikeDetector:
    """Stateless helper that evaluates a candidate emotion against history."""

    def __init__(
        self,
        confidence_threshold: float = _SPIKE_CONFIDENCE_THRESHOLD,
        stable_window: int = _STABLE_WINDOW,
    ):
        self.confidence_threshold = confidence_threshold
        self.stable_window = stable_window

    def evaluate(
        self,
        current_emotion: str,
        current_confidence: float,
        history: List[str],
    ) -> SpikeResult:
        """Return whether `current_emotion` is a spike given `history`.

        `history` is the list of previously dominant emotions (oldest
        first), not including the current sample.
        """
        if not history:
            return SpikeResult(is_spike=False, previous_emotion=None)

        window = history[-self.stable_window:]
        stable_emotion = window[0]
        was_stable = all(emotion == stable_emotion for emotion in window)

        previous_emotion = history[-1]

        if (
            was_stable
            and current_emotion != stable_emotion
            and current_confidence >= self.confidence_threshold
        ):
            return SpikeResult(
                is_spike=True,
                reason=(
                    f"Emotion shifted from '{stable_emotion}' to "
                    f"'{current_emotion}' with high confidence."
                ),
                previous_emotion=stable_emotion,
            )

        return SpikeResult(is_spike=False, previous_emotion=previous_emotion)
