from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr
from app.models.user import UserRole


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    full_name: str
    role: UserRole
    student_id: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    enrolled_course_ids: List[str] = []
    created_at: datetime


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class UserPasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
