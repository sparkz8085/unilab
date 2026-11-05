from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RubricScore(BaseModel):
    criteria: str
    score: float
    max_points: float
    feedback: Optional[str] = None


class LineComment(BaseModel):
    line: int
    comment: str
    file_name: Optional[str] = None


class FeedbackModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    submission_id: str
    practical_id: str
    teacher_id: str
    marks: float
    rubric_scores: List[RubricScore] = Field(default_factory=list)
    comments: str
    line_comments: List[LineComment] = Field(default_factory=list)
    reviewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
