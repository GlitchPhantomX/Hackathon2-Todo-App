from fastapi import APIRouter
from typing import Dict, Any
import time
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint that returns the status of the service
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": int(time.time()),
        "service": "microservices-infrastructure",
        "version": "1.0.0"
    }


@router.get("/ready")
async def readiness_check() -> Dict[str, Any]:
    """
    Readiness check endpoint to indicate if the service is ready to serve requests
    """
    # In a real implementation, this would check dependencies like database, caches, etc.
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "microservices-infrastructure"
    }