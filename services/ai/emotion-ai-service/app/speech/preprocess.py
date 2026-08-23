import librosa
import numpy as np
from fastapi import HTTPException, UploadFile

from app.core.settings import (
    TARGET_SAMPLE_RATE,
    MAX_AUDIO_DURATION_SECONDS,
)


class AudioPreprocessor:
    """Preprocess uploaded audio for emotion recognition."""

    @staticmethod
    async def process(file: UploadFile) -> np.ndarray:
        try:
            # Load audio
            waveform, sample_rate = librosa.load(
                file.file,
                sr=TARGET_SAMPLE_RATE,
                mono=True,
            )

            # Validate duration
            duration = librosa.get_duration(y=waveform, sr=sample_rate)

            if duration > MAX_AUDIO_DURATION_SECONDS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Audio exceeds {MAX_AUDIO_DURATION_SECONDS} seconds."
                )

            # Normalize waveform
            max_value = np.max(np.abs(waveform))

            if max_value > 0:
                waveform = waveform / max_value

            return waveform.astype(np.float32)

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to process audio: {str(e)}"
            )