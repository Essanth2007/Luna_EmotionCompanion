from pathlib import Path
from fastapi import UploadFile, HTTPException

from app.core.settings import (
    SUPPORTED_AUDIO_EXTENSIONS,
    MAX_AUDIO_SIZE_MB,
)


class AudioValidator:
    """Handles validation of uploaded audio files."""

    @staticmethod
    async def validate(file: UploadFile) -> None:
        # Check file exists
        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No audio file provided."
            )

        # Check filename
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing."
            )

        # Validate extension
        extension = Path(file.filename).suffix.lower()

        if extension not in SUPPORTED_AUDIO_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported audio format. "
                    f"Supported formats: {', '.join(sorted(SUPPORTED_AUDIO_EXTENSIONS))}"
                )
            )

        # Read file once
        content = await file.read()

        # Empty file check
        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        # Size validation
        max_size = MAX_AUDIO_SIZE_MB * 1024 * 1024

        if len(content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"Audio exceeds {MAX_AUDIO_SIZE_MB} MB limit."
            )

        # Reset pointer so downstream code can read the file again
        await file.seek(0)