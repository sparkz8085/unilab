from typing import Optional
from app.models.academic_session import AcademicSessionModel
from app.repositories.base import BaseRepository


class AcademicSessionRepository(BaseRepository[AcademicSessionModel]):
    def __init__(self):
        super().__init__("academic_sessions", AcademicSessionModel)

    async def get_current_session(self) -> Optional[dict]:
        return await self.find_one({"is_current": True})


session_repo = AcademicSessionRepository()
