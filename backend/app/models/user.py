from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    EXTERNAL_EXAMINER = "external_examiner"
    PARENT = "parent"


class UserModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    password_hash: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    student_id: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"
    avatar_url: Optional[str] = None
    is_active: bool = True
    enrolled_course_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
