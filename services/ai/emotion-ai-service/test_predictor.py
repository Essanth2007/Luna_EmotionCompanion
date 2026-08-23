import numpy as np

from app.speech.inference import SpeechInference
from app.speech.predictor import SpeechPredictor

waveform = np.random.randn(16000).astype(np.float32)

logits = SpeechInference.predict(waveform)

result = SpeechPredictor.predict(logits)

print(result)