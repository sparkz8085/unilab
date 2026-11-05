from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SubmissionStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    REVIEWED = "reviewed"
    RETURNED = "returned"


class SubmissionFile(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    url: Optional[str] = None
    size_bytes: Optional[int] = Field(default=None, ge=0, le=10 * 1024 * 1024)
    content: Optional[str] = Field(default=None, max_length=10 * 1024 * 1024)
    file_type: Optional[str] = Field(default=None, max_length=100)


class SubmissionModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    practical_id: str
    course_id: str
    student_id: str
    language: str = "python"
    code_content: str = ""
    files: List[SubmissionFile] = Field(default_factory=list)
    output_text: Optional[str] = None
    output_images: List[str] = Field(default_factory=list)
    student_notes: Optional[str] = None
    status: SubmissionStatus = SubmissionStatus.DRAFT
    version: int = 1
    submitted_at: Optional[datetime] = None
    marks_obtained: Optional[float] = None
    feedback_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
