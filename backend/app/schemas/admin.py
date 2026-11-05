from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class SystemStatsResponse(BaseModel):
    total_students: int
    total_teachers: int
    total_admins: int
    total_courses: int
    total_practicals: int
    total_submissions: int
    total_reviewed: int
    submission_rate_percent: float
    grading_rate_percent: float


class AcademicSessionCreateRequest(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    is_current: bool = False


class AcademicSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    start_date: datetime
    end_date: datetime
    is_current: bool
    created_at: datetime
