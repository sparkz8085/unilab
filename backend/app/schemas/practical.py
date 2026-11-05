from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.practical import Attachment, PracticalStatus, RubricCriterion


class PracticalCreateRequest(BaseModel):
    course_id: str
    lab_number: int
    title: str
    objective: str
    instructions_md: str
    starter_code: Dict[str, str] = {}
    supported_languages: List[str] = ["python", "cpp", "c", "java", "javascript"]
    rubric: List[RubricCriterion] = []
    attachments: List[Attachment] = []
    deadline: datetime
    max_marks: float = 100.0
    status: PracticalStatus = PracticalStatus.DRAFT


class PracticalUpdateRequest(BaseModel):
    lab_number: Optional[int] = None
    title: Optional[str] = None
    objective: Optional[str] = None
    instructions_md: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    supported_languages: Optional[List[str]] = None
    rubric: Optional[List[RubricCriterion]] = None
    attachments: Optional[List[Attachment]] = None
    deadline: Optional[datetime] = None
    max_marks: Optional[float] = None
    status: Optional[PracticalStatus] = None


class PracticalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    course_id: str
    lab_number: int
    title: str
    objective: str
    instructions_md: str
    starter_code: Dict[str, str] = {}
    supported_languages: List[str] = []
    rubric: List[RubricCriterion] = []
    attachments: List[Attachment] = []
    deadline: datetime
    max_marks: float
    status: PracticalStatus
    created_by: str
    created_at: datetime
    updated_at: datetime
    # Enriched fields
    course_code: Optional[str] = None
    course_title: Optional[str] = None
    submission_count: Optional[int] = None
    reviewed_count: Optional[int] = None
    # For student context
    student_submission_status: Optional[str] = None
    student_submission_id: Optional[str] = None
    student_marks_obtained: Optional[float] = None
