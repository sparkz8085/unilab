from typing import List, Optional
from app.models.submission import SubmissionModel, SubmissionStatus
from app.repositories.base import BaseRepository


class SubmissionRepository(BaseRepository[SubmissionModel]):
    def __init__(self):
        super().__init__("submissions", SubmissionModel)

    async def get_by_practical_and_student(self, practical_id: str, student_id: str) -> Optional[dict]:
        return await self.find_one({"practical_id": practical_id, "student_id": student_id})

    async def get_by_practical(self, practical_id: str) -> List[dict]:
        return await self.list(query={"practical_id": practical_id}, sort_by="submitted_at", sort_order=-1)

    async def get_by_student(self, student_id: str) -> List[dict]:
        return await self.list(query={"student_id": student_id}, sort_by="updated_at", sort_order=-1)

    async def get_by_course(self, course_id: str) -> List[dict]:
        return await self.list(query={"course_id": course_id}, sort_by="submitted_at", sort_order=-1)


submission_repo = SubmissionRepository()
