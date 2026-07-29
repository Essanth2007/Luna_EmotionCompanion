import numpy as np

from app.speech.inference import SpeechInference

waveform = np.random.randn(16000).astype(np.float32)

logits = SpeechInference.predict(waveform)

print(logits)