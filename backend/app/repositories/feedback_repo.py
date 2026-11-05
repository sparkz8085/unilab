from typing import Optional
from app.models.feedback import FeedbackModel
from app.repositories.base import BaseRepository


class FeedbackRepository(BaseRepository[FeedbackModel]):
    def __init__(self):
        super().__init__("feedback", FeedbackModel)

    async def get_by_submission(self, submission_id: str) -> Optional[dict]:
        return await self.find_one({"submission_id": submission_id})


feedback_repo = FeedbackRepository()
