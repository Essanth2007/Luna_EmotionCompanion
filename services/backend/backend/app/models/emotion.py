from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text

from app.db.database import Base


class Emotion(Base):
    __tablename__ = "emotions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    emotion = Column(String(50), nullable=False)
    intensity = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (Index("ix_emotions_user_created_at", "user_id", "created_at"),)
