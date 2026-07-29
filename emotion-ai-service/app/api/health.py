"""
Health API

Provides endpoints for checking the health of the AI service.
"""

from fastapi import APIRouter, HTTPException
import logging

from app.services.health_service import HealthService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    try:
        logger.info("Health check requested.")

        return HealthService.get_health_status()

    except Exception as exc:
        logger.exception("Health check failed.")

        raise HTTPException(
            status_code=500,
            detail="Health check failed."
        ) from exc