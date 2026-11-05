from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.api.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.practical import PracticalCreateRequest, PracticalResponse, PracticalUpdateRequest
from app.schemas.user import UserResponse
from app.services.practical_service import practical_service

router = APIRouter(prefix="/practicals", tags=["Practicals"])


@router.get("", response_model=List[PracticalResponse])
async def list_practicals(
    course_id: Optional[str] = Query(None),
    upcoming: Optional[bool] = Query(False),
    current_user: UserResponse = Depends(get_current_user)
):
    """List practicals for a given course or upcoming practicals for student."""
    if upcoming and current_user.role == UserRole.STUDENT:
        return await practical_service.get_upcoming_for_student(current_user.id)

    if not course_id:
        return await practical_service.list_practicals_for_user(
            current_user.id, current_user.role
        )

    return await practical_service.list_practicals_for_course(
        course_id=course_id,
        user_id=current_user.id,
        role=current_user.role
    )


@router.post("", response_model=PracticalResponse, status_code=status.HTTP_201_CREATED)
async def create_practical(
    req: PracticalCreateRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Create a practical assignment (Teacher/Admin only)."""
    return await practical_service.create_practical(teacher_id=current_user.id, req=req)


@router.get("/{practical_id}", response_model=PracticalResponse)
async def get_practical(
    practical_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get practical details with instructions, starter code, and rubric."""
    return await practical_service.get_practical_by_id(
        practical_id=practical_id,
        user_id=current_user.id,
        role=current_user.role
    )


@router.put("/{practical_id}", response_model=PracticalResponse)
async def update_practical(
    practical_id: str,
    req: PracticalUpdateRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Update practical assignment."""
    return await practical_service.update_practical(
        practical_id, req, current_user.id, current_user.role
    )


@router.delete("/{practical_id}")
async def delete_practical(
    practical_id: str,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Delete or archive a practical."""
    return await practical_service.delete_practical(
        practical_id, current_user.id, current_user.role
    )
