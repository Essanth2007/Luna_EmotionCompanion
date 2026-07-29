from transformers import (
    AutoFeatureExtractor,
    AutoModelForAudioClassification,
)

from app.core.settings import MODEL_NAME, MODEL_CACHE_DIR


class SpeechEmotionModel:

    _feature_extractor = None
    _model = None

    @classmethod
    def load(cls):
        """Load the Hugging Face model only once."""

        if cls._model is None:

            print("Loading Speech Emotion Recognition model...")

            cls._feature_extractor = AutoFeatureExtractor.from_pretrained(
                MODEL_NAME,
                cache_dir=MODEL_CACHE_DIR,
            )

            cls._model = AutoModelForAudioClassification.from_pretrained(
                MODEL_NAME,
                cache_dir=MODEL_CACHE_DIR,
            )

            print("Speech Emotion Recognition model loaded successfully.")

        return cls._feature_extractor, cls._model