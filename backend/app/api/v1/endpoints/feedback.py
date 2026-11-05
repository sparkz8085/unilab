from typing import Optional
from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.feedback import FeedbackCreateOrUpdateRequest, FeedbackResponse
from app.schemas.user import UserResponse
from app.services.feedback_service import feedback_service

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def grade_submission(
    req: FeedbackCreateOrUpdateRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Submit marks, rubric breakdown, and comments for a submission (Teacher/Admin only)."""
    return await feedback_service.create_or_update_feedback(
        teacher_id=current_user.id,
        req=req
    )


@router.get("/submission/{submission_id}", response_model=Optional[FeedbackResponse])
async def get_feedback_for_submission(
    submission_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Retrieve teacher grading and feedback for a submission."""
    return await feedback_service.get_feedback_for_submission(
        submission_id, current_user.id, current_user.role
    )
