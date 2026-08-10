from typing import Any, Dict

import numpy as np
from deepface import DeepFace


class EmotionInference:
    """Runs facial emotion recognition using DeepFace."""

    @staticmethod
    def analyze(face: np.ndarray) -> Dict[str, Any]:
        """
        Analyze a cropped face and return normalized emotion results.
        """

        result = DeepFace.analyze(
            img_path=face,
            actions=["emotion"],
            enforce_detection=False,
        )

        # DeepFace returns a list of analysis results.
        if isinstance(result, list):
            result = result[0]

        emotion_scores = result.get("emotion", {})
        dominant_emotion = result.get("dominant_emotion")

        # Convert NumPy values to normal Python floats.
        emotion_distribution = {
            emotion: round(float(score) / 100.0, 4)
            for emotion, score in emotion_scores.items()
        }

        confidence = emotion_distribution.get(
            dominant_emotion,
            0.0,
        )

        return {
            "primary_emotion": dominant_emotion,
            "confidence": confidence,
            "emotion_distribution": emotion_distribution,
        }