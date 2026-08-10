from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.core.settings import (
    MAX_IMAGE_SIZE_MB,
    SUPPORTED_IMAGE_EXTENSIONS,
    SUPPORTED_IMAGE_CONTENT_TYPES,
)


class ImageValidator:
    """Handles validation of uploaded image files."""

    @staticmethod
    async def validate(file: UploadFile) -> None:
        # Check file exists
        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No image file provided.",
            )

        # Check filename
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing.",
            )

        # Validate extension
        extension = Path(file.filename).suffix.lower()

        if extension not in SUPPORTED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image format. "
                    f"Supported formats: {', '.join(sorted(SUPPORTED_IMAGE_EXTENSIONS))}"
                ),
            )

        # Validate MIME type
        if file.content_type not in SUPPORTED_IMAGE_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported content type: {file.content_type}",
            )

        # Read image bytes
        content = await file.read()

        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty.",
            )

        # Validate file size
        max_size = MAX_IMAGE_SIZE_MB * 1024 * 1024

        if len(content) > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"Image exceeds {MAX_IMAGE_SIZE_MB} MB limit.",
            )

        # Validate image integrity
        try:
            image = Image.open(BytesIO(content))
            image.verify()
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Invalid or corrupted image.",
            )

        # Reset pointer for downstream processing
        await file.seek(0)