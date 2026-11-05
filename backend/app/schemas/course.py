from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse


class CourseCreateRequest(BaseModel):
    code: str
    title: str
    description: str
    department: str = "Computer Science & Engineering"
    academic_session_id: Optional[str] = None
    teacher_ids: List[str] = []
    student_ids: List[str] = []


class CourseUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    academic_session_id: Optional[str] = None
    teacher_ids: Optional[List[str]] = None
    student_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    title: str
    description: str
    department: str
    academic_session_id: Optional[str] = None
    teacher_ids: List[str] = []
    student_ids: List[str] = []
    is_active: bool
    created_at: datetime
    updated_at: datetime
    # Enriched fields
    teachers: Optional[List[UserResponse]] = None
    student_count: Optional[int] = None
    practical_count: Optional[int] = None


class EnrollStudentsRequest(BaseModel):
    student_ids: List[str]
