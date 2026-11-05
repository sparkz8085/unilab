from typing import List, Optional
from bson import ObjectId
from app.models.course import CourseModel
from app.repositories.base import BaseRepository, format_doc


class CourseRepository(BaseRepository[CourseModel]):
    def __init__(self):
        super().__init__("courses", CourseModel)

    async def get_by_code(self, code: str) -> Optional[dict]:
        return await self.find_one({"code": code.upper()})

    async def get_courses_for_teacher(self, teacher_id: str) -> List[dict]:
        return await self.list(query={"teacher_ids": teacher_id, "is_active": True})

    async def get_courses_for_student(self, student_id: str) -> List[dict]:
        return await self.list(query={"student_ids": student_id, "is_active": True})

    async def enroll_students(self, course_id: str, student_ids: List[str]):
        col = self.collection
        if col is not None:
            oid = ObjectId(course_id) if ObjectId.is_valid(course_id) else course_id
            await col.update_one({"_id": oid}, {"$addToSet": {"student_ids": {"$each": student_ids}}})
            return
        if course_id in self._mock_data:
            curr_students = set(self._mock_data[course_id].setdefault("student_ids", []))
            curr_students.update(student_ids)
            self._mock_data[course_id]["student_ids"] = list(curr_students)


course_repo = CourseRepository()
