from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.emotion import Emotion
from app.models.user import User
from app.schemas.emotion import EmotionCreate, EmotionResponse

router = APIRouter()


@router.post(
    "",
    response_model=EmotionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log an emotion",
    description=(
        "Record a new emotion entry for the authenticated user. "
        "Intensity must be between 1 (lowest) and 10 (highest)."
    ),
)
def create_emotion(
    emotion_data: EmotionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new emotion record. Returns 201 with the created record."""
    emotion = Emotion(
        user_id=current_user.id,
        emotion=emotion_data.emotion,
        intensity=emotion_data.intensity,
        note=emotion_data.note,
    )
    db.add(emotion)
    db.commit()
    db.refresh(emotion)
    return emotion


@router.get(
    "",
    response_model=list[EmotionResponse],
    summary="List emotion records",
    description="Return all emotion records for the authenticated user, newest first.",
)
def list_emotions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all emotion entries for the current user, ordered by most recent first."""
    return (
        db.query(Emotion)
        .filter(Emotion.user_id == current_user.id)
        .order_by(Emotion.created_at.desc(), Emotion.id.desc())
        .all()
    )


@router.get(
    "/{emotion_id}",
    response_model=EmotionResponse,
    summary="Get a single emotion record",
    description="Retrieve a specific emotion record by ID. Only the owning user may access it.",
)
def get_emotion(
    emotion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a single emotion record by ID, scoped to the current user."""
    emotion = (
        db.query(Emotion)
        .filter(Emotion.id == emotion_id, Emotion.user_id == current_user.id)
        .first()
    )
    if not emotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emotion record not found",
        )
    return emotion


@router.delete(
    "/{emotion_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an emotion record",
    description="Delete a specific emotion record. Only the owning user may delete it.",
)
def delete_emotion(
    emotion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an emotion record by ID. Returns 204 on success, 404 if not found."""
    emotion = (
        db.query(Emotion)
        .filter(Emotion.id == emotion_id, Emotion.user_id == current_user.id)
        .first()
    )
    if not emotion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emotion record not found",
        )
    db.delete(emotion)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
