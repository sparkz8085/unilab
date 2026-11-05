from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.submission import SubmissionFile, SubmissionStatus
from app.schemas.user import UserResponse


class SubmissionCreateOrUpdateRequest(BaseModel):
    practical_id: str
    language: str = Field(default="python", min_length=1, max_length=32)
    code_content: str = Field(default="", max_length=1_000_000)
    files: List[SubmissionFile] = []
    output_text: Optional[str] = Field(default=None, max_length=100_000)
    output_images: List[str] = Field(default_factory=list, max_length=10)
    student_notes: Optional[str] = Field(default=None, max_length=10_000)
    is_draft: bool = False


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    practical_id: str
    course_id: str
    student_id: str
    language: str
    code_content: str
    files: List[SubmissionFile] = []
    output_text: Optional[str] = None
    output_images: List[str] = []
    student_notes: Optional[str] = None
    status: SubmissionStatus
    version: int
    submitted_at: Optional[datetime] = None
    marks_obtained: Optional[float] = None
    feedback_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Enriched fields
    student: Optional[UserResponse] = None
    practical_title: Optional[str] = None
    course_code: Optional[str] = None
    max_marks: Optional[float] = None
