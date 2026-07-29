import numpy as np
import torch

from app.speech.model_loader import SpeechEmotionModel


class SpeechInference:
    """Runs inference using the loaded Speech Emotion Recognition model."""

    @staticmethod
    def predict(waveform: np.ndarray):

        feature_extractor, model = SpeechEmotionModel.load()

        inputs = feature_extractor(
            waveform,
            sampling_rate=16000,
            return_tensors="pt",
            padding=True,
        )

        with torch.no_grad():
            outputs = model(**inputs)

        return outputs.logits.squeeze(0)