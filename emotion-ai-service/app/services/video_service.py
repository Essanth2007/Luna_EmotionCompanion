from typing import Any, Dict

from fastapi import UploadFile

from app.video.validator import ImageValidator
from app.video.preprocess import ImagePreprocessor
from app.video.detector import FaceDetector
from app.video.inference import EmotionInference


class VideoService:
    """Coordinates facial emotion analysis."""

    _face_detector = None

    @classmethod
    def _get_face_detector(cls) -> FaceDetector:
        """Create the face detector once and reuse it."""
        if cls._face_detector is None:
            cls._face_detector = FaceDetector()

        return cls._face_detector

    @classmethod
    async def analyze(cls, file: UploadFile) -> Dict[str, Any]:
        """
        Validate, preprocess, detect a face,
        and analyze facial emotion.
        """

        # 1. Validate uploaded image
        await ImageValidator.validate(file)

        # 2. Preprocess image
        image = await ImagePreprocessor.process(file)

        # 3. Detect and crop the largest face
        detector = cls._get_face_detector()
        face = detector.detect(image)

        # 4. Analyze facial emotion
        emotion_result = EmotionInference.analyze(face)

        return {
            "success": True,
            "face_detected": True,
            "emotion": emotion_result,
        }