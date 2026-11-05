from typing import Optional
from pydantic import BaseModel, EmailStr
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    student_id: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# Forward reference will be resolved
from app.schemas.user import UserResponse
TokenResponse.model_rebuild()
