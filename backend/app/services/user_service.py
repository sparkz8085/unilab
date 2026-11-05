from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status

from app.core.security import get_password_hash, verify_password
from app.models.user import UserRole
from app.repositories.user_repo import user_repo
from app.schemas.user import UserPasswordChangeRequest, UserResponse, UserUpdateRequest


class UserService:
    async def get_user_by_id(self, user_id: str) -> UserResponse:
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return UserResponse(**user)

    async def update_profile(self, user_id: str, req: UserUpdateRequest) -> UserResponse:
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        update_data = {k: v for k, v in req.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.now(timezone.utc)

        updated = await user_repo.update(user_id, update_data)
        return UserResponse(**updated)

    async def change_password(self, user_id: str, req: UserPasswordChangeRequest) -> dict:
        user = await user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        if not verify_password(req.current_password, user["password_hash"]):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect.")

        new_hash = get_password_hash(req.new_password)
        await user_repo.update(user_id, {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc)})
        return {"message": "Password updated successfully."}

    async def list_users(
        self,
        role: Optional[UserRole] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[UserResponse]:
        query = {}
        if role:
            query["role"] = role

        users = await user_repo.list(query=query, skip=skip, limit=limit)
        if search:
            s = search.lower()
            users = [
                u for u in users
                if s in u.get("full_name", "").lower()
                or s in u.get("email", "").lower()
                or s in (u.get("student_id") or "").lower()
            ]

        return [UserResponse(**u) for u in users]


user_service = UserService()
