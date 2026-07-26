from datetime import datetime

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def communication_health():
    """
    Communication module health endpoint.
    """

    return {
        "service": "Communication Module",
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }