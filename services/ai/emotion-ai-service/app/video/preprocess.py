import cv2
import numpy as np
from fastapi import HTTPException, UploadFile


class ImagePreprocessor:
    """Preprocess uploaded image for facial emotion recognition."""

    @staticmethod
    async def process(file: UploadFile) -> np.ndarray:
        try:
            # Read uploaded image bytes
            image_bytes = await file.read()

            # Convert bytes to NumPy array
            image_array = np.frombuffer(image_bytes, dtype=np.uint8)

            # Decode image using OpenCV
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

            if image is None:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to decode image."
                )

            # Convert BGR → RGB
            image = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2RGB
            )

            # Reset stream for downstream modules
            await file.seek(0)

            return image

        except HTTPException:
            raise

        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Image preprocessing failed: {str(exc)}"
            )