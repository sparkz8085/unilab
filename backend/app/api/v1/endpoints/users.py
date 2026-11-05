from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.user import UserPasswordChangeRequest, UserResponse, UserUpdateRequest
from app.services.user_service import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """List users by role or search query (Admin/Teacher only)."""
    return await user_service.list_users(role=role, search=search, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Fetch user by ID."""
    if user_id != current_user.id and current_user.role not in {
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.TEACHER,
    }:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return await user_service.get_user_by_id(user_id)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    req: UserUpdateRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Updates the logged-in user's profile."""
    return await user_service.update_profile(current_user.id, req)


@router.post("/change-password")
async def change_password(
    req: UserPasswordChangeRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Changes password for the current logged-in user."""
    return await user_service.change_password(current_user.id, req)
