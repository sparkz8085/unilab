from fastapi import APIRouter, Depends, Request, status

from app.api.deps import get_current_user
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest
from app.schemas.user import UserResponse
from app.services.auth_service import auth_service
from app.core.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, req: UserRegisterRequest):
    """Registers a new user (Student or Teacher) and returns a JWT access token."""
    return await auth_service.register(req)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, req: UserLoginRequest):
    """Authenticates credentials and returns a JWT access token."""
    return await auth_service.login(req)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return current_user
