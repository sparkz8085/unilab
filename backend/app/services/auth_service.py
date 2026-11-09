from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import UserModel, UserRole
from app.repositories.user_repo import user_repo
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest
from app.schemas.user import UserResponse


class AuthService:
    async def register(self, req: UserRegisterRequest) -> TokenResponse:
        email = req.email.lower().strip()
        if not email.endswith('@stud.unilab.edu') or email.count('@') != 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Student registration requires a @stud.unilab.edu email address.')
        if not req.student_id or '.' not in email.split('@', 1)[0]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Use name.roll@stud.unilab.edu and provide your roll number.')
        existing = await user_repo.get_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )

        password_hash = get_password_hash(req.password)
        now = datetime.now(timezone.utc)
        user_dict = {
            "email": email,
            "password_hash": password_hash,
            "full_name": req.full_name,
            # Public registration must never be able to create privileged accounts.
            "role": UserRole.STUDENT,
            "student_id": req.student_id,
            "employee_id": None,
            "department": req.department,
            "avatar_url": None,
            "is_active": True,
            "enrolled_course_ids": [],
            "created_at": now,
            "updated_at": now,
        }

        created_user = await user_repo.create(user_dict)
        access_token = create_access_token(
            subject=created_user["id"],
            role=created_user["role"]
        )

        user_resp = UserResponse(**created_user)
        return TokenResponse(access_token=access_token, user=user_resp)

    async def login(self, req: UserLoginRequest) -> TokenResponse:
        user = await user_repo.get_by_email(req.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        email_domain = user["email"].lower().rsplit("@", 1)[-1]
        expected_domains = {"student": "stud.unilab.edu", "teacher": "faculty.unilab.edu", "admin": "admin.unilab.edu", "super_admin": "admin.unilab.edu"}
        expected_domain = expected_domains.get(str(user["role"]))
        if email_domain != "unilab.edu" and expected_domain and email_domain != expected_domain:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email domain does not match the account role.")

        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been deactivated."
            )

        access_token = create_access_token(
            subject=user["id"],
            role=user["role"]
        )

        user_resp = UserResponse(**user)
        return TokenResponse(access_token=access_token, user=user_resp)


auth_service = AuthService()
