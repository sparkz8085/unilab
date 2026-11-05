from typing import List
from fastapi import APIRouter, Depends, status

from app.api.deps import require_roles
from app.models.user import UserRole
from app.repositories.session_repo import session_repo
from app.schemas.admin import AcademicSessionCreateRequest, AcademicSessionResponse, SystemStatsResponse
from app.schemas.user import UserResponse
from app.services.admin_service import admin_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=SystemStatsResponse)
async def get_system_statistics(
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Retrieve top-level platform statistics for the Admin dashboard."""
    return await admin_service.get_system_stats()


@router.get("/sessions", response_model=List[AcademicSessionResponse])
async def list_academic_sessions(
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """List academic sessions."""
    sessions = await session_repo.list(sort_by="start_date", sort_order=-1)
    return [AcademicSessionResponse(**s) for s in sessions]


@router.post("/sessions", response_model=AcademicSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_academic_session(
    req: AcademicSessionCreateRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """Create a new academic session."""
    data = req.model_dump()
    created = await session_repo.create(data)
    return AcademicSessionResponse(**created)
