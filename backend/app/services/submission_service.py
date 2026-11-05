from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.submission import SubmissionModel, SubmissionStatus
from app.models.user import UserRole
from app.repositories.course_repo import course_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.submission_repo import submission_repo
from app.repositories.user_repo import user_repo
from app.schemas.submission import SubmissionCreateOrUpdateRequest, SubmissionResponse
from app.schemas.user import UserResponse


class SubmissionService:
    async def enrich_submission(self, submission: dict) -> SubmissionResponse:
        student = None
        if "student_id" in submission:
            u = await user_repo.get_by_id(submission["student_id"])
            if u:
                student = UserResponse(**u)

        practical = await practical_repo.get_by_id(submission["practical_id"])
        practical_title = practical["title"] if practical else None
        max_marks = practical.get("max_marks", 100.0) if practical else None

        course_code = None
        if practical:
            course = await course_repo.get_by_id(practical["course_id"])
            course_code = course["code"] if course else None

        return SubmissionResponse(
            **submission,
            student=student,
            practical_title=practical_title,
            course_code=course_code,
            max_marks=max_marks
        )

    async def get_submission_by_id(self, submission_id: str, current_user_id: str, role: UserRole) -> SubmissionResponse:
        sub = await submission_repo.get_by_id(submission_id)
        if not sub:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

        # RBAC ownership check
        if role == UserRole.STUDENT and sub["student_id"] != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        return await self.enrich_submission(sub)

    async def get_student_submission_for_practical(self, practical_id: str, student_id: str) -> Optional[SubmissionResponse]:
        sub = await submission_repo.get_by_practical_and_student(practical_id, student_id)
        if not sub:
            return None
        return await self.enrich_submission(sub)

    async def list_submissions_for_practical(
        self,
        practical_id: str,
        current_user_id: Optional[str] = None,
        role: Optional[UserRole] = None,
    ) -> List[SubmissionResponse]:
        practical = await practical_repo.get_by_id(practical_id)
        if not practical:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practical not found.")
        course = await course_repo.get_by_id(practical["course_id"])
        if role == UserRole.TEACHER and (
            not course or current_user_id not in course.get("teacher_ids", [])
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        subs = await submission_repo.get_by_practical(practical_id)
        return [await self.enrich_submission(s) for s in subs]

    async def list_submissions_for_student(self, student_id: str) -> List[SubmissionResponse]:
        subs = await submission_repo.get_by_student(student_id)
        return [await self.enrich_submission(s) for s in subs]

    async def create_or_update_submission(
        self,
        student_id: str,
        req: SubmissionCreateOrUpdateRequest,
        role: UserRole,
    ) -> SubmissionResponse:
        if role != UserRole.STUDENT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can submit practical work.",
            )
        practical = await practical_repo.get_by_id(req.practical_id)
        if not practical:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practical not found.")

        # Check enrollment
        course = await course_repo.get_by_id(practical["course_id"])
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
        if student_id not in course.get("student_ids", []):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        existing = await submission_repo.get_by_practical_and_student(req.practical_id, student_id)
        now = datetime.now(timezone.utc)
        new_status = SubmissionStatus.DRAFT if req.is_draft else SubmissionStatus.SUBMITTED

        if existing:
            # If already reviewed, do not allow arbitrary overwrite unless returned
            if existing["status"] == SubmissionStatus.REVIEWED and not req.is_draft:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This practical has already been graded and cannot be resubmitted."
                )

            update_data = {
                "language": req.language,
                "code_content": req.code_content,
                "files": [f.model_dump() for f in req.files],
                "output_text": req.output_text,
                "output_images": req.output_images,
                "student_notes": req.student_notes,
                "status": new_status,
                "version": existing.get("version", 1) + (1 if not req.is_draft else 0),
                "updated_at": now,
            }
            if not req.is_draft:
                update_data["submitted_at"] = now

            updated = await submission_repo.update(existing["id"], update_data)
            return await self.enrich_submission(updated)

        # Create new submission
        sub_dict = {
            "practical_id": req.practical_id,
            "course_id": practical["course_id"],
            "student_id": student_id,
            "language": req.language,
            "code_content": req.code_content,
            "files": [f.model_dump() for f in req.files],
            "output_text": req.output_text,
            "output_images": req.output_images,
            "student_notes": req.student_notes,
            "status": new_status,
            "version": 1,
            "submitted_at": now if not req.is_draft else None,
            "marks_obtained": None,
            "feedback_id": None,
            "created_at": now,
            "updated_at": now,
        }

        created = await submission_repo.create(sub_dict)
        return await self.enrich_submission(created)


submission_service = SubmissionService()
