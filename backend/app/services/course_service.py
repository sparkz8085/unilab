from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.user import UserRole
from app.repositories.course_repo import course_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.user_repo import user_repo
from app.schemas.course import CourseCreateRequest, CourseResponse, CourseUpdateRequest
from app.schemas.user import UserResponse


class CourseService:
    async def enrich_course(self, course: dict) -> CourseResponse:
        teachers = []
        for tid in course.get("teacher_ids", []):
            u = await user_repo.get_by_id(tid)
            if u:
                teachers.append(UserResponse(**u))

        practical_count = await practical_repo.count({"course_id": course["id"]})
        student_count = len(course.get("student_ids", []))

        return CourseResponse(
            **course,
            teachers=teachers,
            student_count=student_count,
            practical_count=practical_count
        )

    async def get_course_by_id(self, course_id: str) -> CourseResponse:
        course = await course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
        return await self.enrich_course(course)

    async def list_courses_for_user(
        self,
        user_id: str,
        role: UserRole,
        skip: int = 0,
        limit: int = 50
    ) -> List[CourseResponse]:
        if role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            courses = await course_repo.list(skip=skip, limit=limit)
        elif role == UserRole.TEACHER:
            courses = await course_repo.get_courses_for_teacher(user_id)
        else:  # Student
            courses = await course_repo.get_courses_for_student(user_id)

        return [await self.enrich_course(c) for c in courses]

    async def create_course(self, req: CourseCreateRequest) -> CourseResponse:
        existing = await course_repo.get_by_code(req.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course with code {req.code} already exists."
            )

        now = datetime.now(timezone.utc)
        course_data = {
            "code": req.code.upper(),
            "title": req.title,
            "description": req.description,
            "department": req.department,
            "academic_session_id": req.academic_session_id,
            "teacher_ids": req.teacher_ids,
            "student_ids": req.student_ids,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        created = await course_repo.create(course_data)
        return await self.enrich_course(created)

    async def update_course(self, course_id: str, req: CourseUpdateRequest) -> CourseResponse:
        course = await course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        update_data = {k: v for k, v in req.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc)

        updated = await course_repo.update(course_id, update_data)
        return await self.enrich_course(updated)

    async def enroll_students(self, course_id: str, student_ids: List[str]) -> CourseResponse:
        course = await course_repo.get_by_id(course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        await course_repo.enroll_students(course_id, student_ids)
        for sid in student_ids:
            await user_repo.add_enrolled_course(sid, course_id)

        updated = await course_repo.get_by_id(course_id)
        return await self.enrich_course(updated)


course_service = CourseService()
