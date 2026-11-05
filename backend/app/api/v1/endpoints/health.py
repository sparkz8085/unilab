from fastapi import APIRouter
from app.core.config import settings
from app.core.database import db_manager

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Health check endpoint for Render / load balancers."""
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database_connected": db_manager.is_connected
    }
