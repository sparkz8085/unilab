from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AcademicSessionModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    start_date: datetime
    end_date: datetime
    is_current: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
