from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class PracticalStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class RubricCriterion(BaseModel):
    id: Optional[str] = None
    criteria: str
    max_points: float
    description: Optional[str] = None


class Attachment(BaseModel):
    name: str
    url: str
    size_bytes: Optional[int] = None
    file_type: Optional[str] = None


class PracticalModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    course_id: str
    lab_number: int
    title: str
    objective: str
    instructions_md: str
    starter_code: Dict[str, str] = Field(default_factory=dict)
    supported_languages: List[str] = Field(default_factory=lambda: ["python", "cpp", "c", "java", "javascript"])
    rubric: List[RubricCriterion] = Field(default_factory=list)
    attachments: List[Attachment] = Field(default_factory=list)
    deadline: datetime
    max_marks: float = 100.0
    status: PracticalStatus = PracticalStatus.DRAFT
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
