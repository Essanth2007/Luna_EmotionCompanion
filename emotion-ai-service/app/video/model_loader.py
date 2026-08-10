from pathlib import Path

import mediapipe as mp


class FaceDetectionModelLoader:
    """Loads and manages the MediaPipe face detection model."""

    _detector = None

    MODEL_PATH = (
        Path(__file__).resolve().parents[1]
        / "models"
        / "face_detector"
        / "blaze_face_short_range.tflite"
    )

    @classmethod
    def load(cls):
        """Load the MediaPipe face detector only once."""

        if cls._detector is None:

            if not cls.MODEL_PATH.exists():
                raise FileNotFoundError(
                    f"Face detection model not found: {cls.MODEL_PATH}"
                )

            print("Loading MediaPipe Face Detection model...")

            base_options = mp.tasks.BaseOptions(
                model_asset_path=str(cls.MODEL_PATH)
            )

            options = mp.tasks.vision.FaceDetectorOptions(
                base_options=base_options,
                min_detection_confidence=0.5,
            )

            cls._detector = mp.tasks.vision.FaceDetector.create_from_options(
                options
            )

            print("MediaPipe Face Detection model loaded successfully.")

        return cls._detector