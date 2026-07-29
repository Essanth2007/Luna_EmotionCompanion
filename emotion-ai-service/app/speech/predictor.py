import torch

from app.speech.model_loader import SpeechEmotionModel


class SpeechPredictor:
    """Converts model logits into emotion predictions."""

    @staticmethod
    def predict(logits: torch.Tensor) -> dict:
        _, model = SpeechEmotionModel.load()

        probabilities = torch.softmax(logits, dim=-1)

        confidence, index = torch.max(probabilities, dim=-1)

        emotion = model.config.id2label[index.item()]

        distribution = {
            model.config.id2label[i]: round(probabilities[i].item(), 4)
            for i in range(len(probabilities))
        }

        return {
            "primary_emotion": emotion,
            "confidence": round(confidence.item(), 4),
            "emotion_distribution": distribution,
        }