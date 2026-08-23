from fastapi import APIRouter, File, UploadFile

from app.services.video_service import VideoService


router = APIRouter(
    prefix="/video",
    tags=["Facial Emotion Recognition"],
)


@router.post("/analyze")
async def analyze_video_frame(
    file: UploadFile = File(...),
):
    """
    Analyze facial emotion from an uploaded image.
    """

    return await VideoService.analyze(file)