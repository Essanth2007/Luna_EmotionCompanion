from app.speech.model_loader import SpeechEmotionModel

print("Starting model test...")

processor, model = SpeechEmotionModel.load()

print("Model loaded successfully!")
print(model.config.id2label)