import mediapipe as mp
import numpy as np
from fastapi import HTTPException

from app.video.model_loader import FaceDetectionModelLoader


class FaceDetector:
    """Detects and extracts the largest face using MediaPipe."""

    def __init__(self):
        self.face_detector = FaceDetectionModelLoader.load()

    def detect(self, image: np.ndarray) -> np.ndarray:
        """Detect and crop the largest face."""

        if image is None or image.size == 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid image provided.",
            )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=image,
        )

        result = self.face_detector.detect(mp_image)

        if not result.detections:
            raise HTTPException(
                status_code=400,
                detail="No face detected in the image.",
            )

        h, w, _ = image.shape

        # Select the largest detected face.
        detection = max(
            result.detections,
            key=lambda d: (
                d.bounding_box.width * d.bounding_box.height
            ),
        )

        bbox = detection.bounding_box

        x = max(int(bbox.origin_x), 0)
        y = max(int(bbox.origin_y), 0)

        x2 = min(x + int(bbox.width), w)
        y2 = min(y + int(bbox.height), h)

        if x >= x2 or y >= y2:
            raise HTTPException(
                status_code=400,
                detail="Failed to crop detected face.",
            )

        face = image[y:y2, x:x2]

        if face.size == 0:
            raise HTTPException(
                status_code=400,
                detail="Failed to crop detected face.",
            )

        return face