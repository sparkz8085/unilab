from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status

from app.models.feedback import FeedbackModel
from app.models.submission import SubmissionStatus
from app.models.user import UserRole
from app.repositories.course_repo import course_repo
from app.repositories.feedback_repo import feedback_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.submission_repo import submission_repo
from app.repositories.user_repo import user_repo
from app.schemas.feedback import FeedbackCreateOrUpdateRequest, FeedbackResponse
from app.schemas.user import UserResponse


class FeedbackService:
    async def enrich_feedback(self, feedback: dict) -> FeedbackResponse:
        teacher = None
        if "teacher_id" in feedback:
            u = await user_repo.get_by_id(feedback["teacher_id"])
            if u:
                teacher = UserResponse(**u)

        return FeedbackResponse(**feedback, teacher=teacher)

    async def get_feedback_for_submission(
        self,
        submission_id: str,
        current_user_id: str,
        role: UserRole,
    ) -> Optional[FeedbackResponse]:
        fb = await feedback_repo.get_by_submission(submission_id)
        if not fb:
            return None
        sub = await submission_repo.get_by_id(submission_id)
        if not sub:
            return None
        course = await course_repo.get_by_id(sub["course_id"])
        allowed = role in {UserRole.ADMIN, UserRole.SUPER_ADMIN}
        allowed = allowed or (
            role == UserRole.STUDENT and sub["student_id"] == current_user_id
        )
        allowed = allowed or (
            role == UserRole.TEACHER
            and course is not None
            and current_user_id in course.get("teacher_ids", [])
        )
        if not allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        return await self.enrich_feedback(fb)

    async def create_or_update_feedback(
        self,
        teacher_id: str,
        req: FeedbackCreateOrUpdateRequest
    ) -> FeedbackResponse:
        sub = await submission_repo.get_by_id(req.submission_id)
        if not sub:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

        practical = await practical_repo.get_by_id(sub["practical_id"])
        max_marks = practical.get("max_marks", 100.0) if practical else 100.0
        course = await course_repo.get_by_id(sub["course_id"])
        teacher = await user_repo.get_by_id(teacher_id)
        if (
            teacher
            and teacher.get("role") == UserRole.TEACHER
            and (not course or teacher_id not in course.get("teacher_ids", []))
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        if req.marks < 0 or req.marks > max_marks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Marks must be between 0 and {max_marks}."
            )

        existing = await feedback_repo.get_by_submission(req.submission_id)
        now = datetime.now(timezone.utc)

        if existing:
            update_data = {
                "teacher_id": teacher_id,
                "marks": req.marks,
                "rubric_scores": [r.model_dump() for r in req.rubric_scores],
                "comments": req.comments,
                "line_comments": [l.model_dump() for l in req.line_comments],
                "reviewed_at": now,
                "updated_at": now,
            }
            updated = await feedback_repo.update(existing["id"], update_data)
            
            # Update submission record
            await submission_repo.update(sub["id"], {
                "marks_obtained": req.marks,
                "status": SubmissionStatus.REVIEWED,
                "feedback_id": existing["id"],
                "updated_at": now
            })

            return await self.enrich_feedback(updated)

        fb_dict = {
            "submission_id": req.submission_id,
            "practical_id": sub["practical_id"],
            "teacher_id": teacher_id,
            "marks": req.marks,
            "rubric_scores": [r.model_dump() for r in req.rubric_scores],
            "comments": req.comments,
            "line_comments": [l.model_dump() for l in req.line_comments],
            "reviewed_at": now,
            "created_at": now,
            "updated_at": now,
        }

        created = await feedback_repo.create(fb_dict)

        # Update submission status to REVIEWED
        await submission_repo.update(sub["id"], {
            "marks_obtained": req.marks,
            "status": SubmissionStatus.REVIEWED,
            "feedback_id": created["id"],
            "updated_at": now
        })

        return await self.enrich_feedback(created)


feedback_service = FeedbackService()
