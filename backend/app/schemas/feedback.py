from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.feedback import LineComment, RubricScore
from app.schemas.user import UserResponse


class FeedbackCreateOrUpdateRequest(BaseModel):
    submission_id: str
    marks: float
    rubric_scores: List[RubricScore] = []
    comments: str
    line_comments: List[LineComment] = []


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    submission_id: str
    practical_id: str
    teacher_id: str
    marks: float
    rubric_scores: List[RubricScore] = []
    comments: str
    line_comments: List[LineComment] = []
    reviewed_at: datetime
    created_at: datetime
    updated_at: datetime
    # Enriched fields
    teacher: Optional[UserResponse] = None
