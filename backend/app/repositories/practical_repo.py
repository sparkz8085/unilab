from typing import List, Optional
from app.models.practical import PracticalModel, PracticalStatus
from app.repositories.base import BaseRepository


class PracticalRepository(BaseRepository[PracticalModel]):
    def __init__(self):
        super().__init__("practicals", PracticalModel)

    async def get_by_course(self, course_id: str, status: Optional[PracticalStatus] = None) -> List[dict]:
        query = {"course_id": course_id}
        if status:
            query["status"] = status
        return await self.list(query=query, sort_by="lab_number", sort_order=1)

    async def get_published_by_courses(self, course_ids: List[str]) -> List[dict]:
        if not course_ids:
            return []
        col = self.collection
        if col is not None:
            query = {"course_id": {"$in": course_ids}, "status": PracticalStatus.PUBLISHED}
            cursor = col.find(query).sort("deadline", 1)
            results = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                results.append(doc)
            return results
        # Mock fallback
        return [
            dict(d) for d in self._mock_data.values()
            if d.get("course_id") in course_ids and d.get("status") == PracticalStatus.PUBLISHED
        ]


practical_repo = PracticalRepository()
