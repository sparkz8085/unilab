from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.practical import PracticalStatus
from app.models.submission import SubmissionStatus
from app.models.user import UserRole
from app.repositories.course_repo import course_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.submission_repo import submission_repo
from app.repositories.user_repo import user_repo
from app.schemas.practical import PracticalCreateRequest, PracticalResponse, PracticalUpdateRequest


class PracticalService:
    async def enrich_practical(self, practical: dict, user_id: Optional[str] = None, role: Optional[UserRole] = None) -> PracticalResponse:
        course = await course_repo.get_by_id(practical["course_id"])
        course_code = course["code"] if course else None
        course_title = course["title"] if course else None

        submission_count = await submission_repo.count({"practical_id": practical["id"], "status": {"$ne": SubmissionStatus.DRAFT}})
        reviewed_count = await submission_repo.count({"practical_id": practical["id"], "status": SubmissionStatus.REVIEWED})

        student_sub_status = None
        student_sub_id = None
        student_marks = None

        if user_id and role == UserRole.STUDENT:
            sub = await submission_repo.get_by_practical_and_student(practical["id"], user_id)
            if sub:
                student_sub_status = sub["status"]
                student_sub_id = sub["id"]
                student_marks = sub.get("marks_obtained")

        return PracticalResponse(
            **practical,
            course_code=course_code,
            course_title=course_title,
            submission_count=submission_count,
            reviewed_count=reviewed_count,
            student_submission_status=student_sub_status,
            student_submission_id=student_sub_id,
            student_marks_obtained=student_marks,
        )

    async def get_practical_by_id(
        self,
        practical_id: str,
        user_id: Optional[str] = None,
        role: Optional[UserRole] = None
    ) -> PracticalResponse:
        practical = await practical_repo.get_by_id(practical_id)
        if not practical:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practical not found.")
        course = await course_repo.get_by_id(practical["course_id"])
        if role == UserRole.STUDENT and (
            not course or user_id not in course.get("student_ids", [])
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        if role == UserRole.TEACHER and (
            not course or user_id not in course.get("teacher_ids", [])
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        return await self.enrich_practical(practical, user_id, role)

    async def list_practicals_for_course(
        self,
        course_id: str,
        user_id: Optional[str] = None,
        role: Optional[UserRole] = None
    ) -> List[PracticalResponse]:
        status_filter = None
        if role == UserRole.STUDENT:
            status_filter = PracticalStatus.PUBLISHED
        course = await course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
        if role == UserRole.STUDENT and user_id not in course.get("student_ids", []):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        if role == UserRole.TEACHER and user_id not in course.get("teacher_ids", []):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        practicals = await practical_repo.get_by_course(course_id, status=status_filter)
        return [await self.enrich_practical(p, user_id, role) for p in practicals]

    async def get_upcoming_for_student(self, student_id: str) -> List[PracticalResponse]:
        courses = await course_repo.get_courses_for_student(student_id)
        course_ids = [c["id"] for c in courses]
        practicals = await practical_repo.get_published_by_courses(course_ids)
        return [await self.enrich_practical(p, student_id, UserRole.STUDENT) for p in practicals]

    async def list_practicals_for_user(
        self,
        user_id: str,
        role: UserRole,
    ) -> List[PracticalResponse]:
        if role == UserRole.STUDENT:
            return await self.get_upcoming_for_student(user_id)
        if role == UserRole.TEACHER:
            courses = await course_repo.get_courses_for_teacher(user_id)
        else:
            courses = await course_repo.list(query={"is_active": True})
        practicals = []
        for course in courses:
            practicals.extend(await practical_repo.get_by_course(course["id"]))
        return [await self.enrich_practical(p, user_id, role) for p in practicals]

    async def create_practical(self, teacher_id: str, req: PracticalCreateRequest) -> PracticalResponse:
        course = await course_repo.get_by_id(req.course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
        if teacher_id not in course.get("teacher_ids", []) and teacher_id != course.get("created_by"):
            # Admins may create for any course; teachers may only create in assigned courses.
            user = await user_repo.get_by_id(teacher_id)
            if not user or user.get("role") not in {UserRole.ADMIN, UserRole.SUPER_ADMIN}:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        now = datetime.now(timezone.utc)
        data = req.model_dump()
        data["created_by"] = teacher_id
        data["created_at"] = now
        data["updated_at"] = now

        created = await practical_repo.create(data)
        return await self.enrich_practical(created)

    async def update_practical(
        self,
        practical_id: str,
        req: PracticalUpdateRequest,
        user_id: str,
        role: UserRole,
    ) -> PracticalResponse:
        practical = await practical_repo.get_by_id(practical_id)
        if not practical:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practical not found.")
        course = await course_repo.get_by_id(practical["course_id"])
        if role == UserRole.TEACHER and (
            not course or user_id not in course.get("teacher_ids", [])
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        update_data = {k: v for k, v in req.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc)

        updated = await practical_repo.update(practical_id, update_data)
        return await self.enrich_practical(updated)

    async def delete_practical(self, practical_id: str, user_id: str, role: UserRole) -> dict:
        practical = await practical_repo.get_by_id(practical_id)
        if not practical:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practical not found.")
        course = await course_repo.get_by_id(practical["course_id"])
        if role == UserRole.TEACHER and (
            not course or user_id not in course.get("teacher_ids", [])
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        await practical_repo.delete(practical_id)
        return {"message": "Practical deleted successfully."}


practical_service = PracticalService()
