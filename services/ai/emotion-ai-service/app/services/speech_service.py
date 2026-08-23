from fastapi import UploadFile

from app.speech.validator import AudioValidator
from app.speech.preprocess import AudioPreprocessor
from app.speech.inference import SpeechInference
from app.speech.predictor import SpeechPredictor


class SpeechService:
    """Service layer for Speech Emotion Recognition."""

    @staticmethod
    async def analyze(file: UploadFile) -> dict:
        # Validate uploaded audio
        await AudioValidator.validate(file)

        # Preprocess audio
        waveform = await AudioPreprocessor.process(file)

        # Run inference
        logits = SpeechInference.predict(waveform)

        # Convert logits to prediction
        result = SpeechPredictor.predict(logits)

        return result