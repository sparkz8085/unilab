from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.course import CourseCreateRequest, CourseResponse, CourseUpdateRequest, EnrollStudentsRequest
from app.schemas.user import UserResponse
from app.services.course_service import course_service

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=List[CourseResponse])
async def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user)
):
    """List courses accessible to current user (Enrolled for students, Assigned for teachers, All for admins)."""
    return await course_service.list_courses_for_user(
        user_id=current_user.id,
        role=current_user.role,
        skip=skip,
        limit=limit
    )


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    req: CourseCreateRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Create a new course (Admin/Teacher only)."""
    # If teacher creates course, add themselves automatically
    if current_user.role == UserRole.TEACHER and current_user.id not in req.teacher_ids:
        req.teacher_ids.append(current_user.id)
    return await course_service.create_course(req)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Fetch course details."""
    if current_user.role == UserRole.STUDENT:
        course = await course_service.get_course_by_id(course_id)
        if current_user.id not in course.student_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        return course
    if current_user.role == UserRole.TEACHER:
        course = await course_service.get_course_by_id(course_id)
        if current_user.id not in course.teacher_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        return course
    return await course_service.get_course_by_id(course_id)


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    req: CourseUpdateRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Update course details."""
    if current_user.role == UserRole.TEACHER:
        course = await course_service.get_course_by_id(course_id)
        if current_user.id not in course.teacher_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return await course_service.update_course(course_id, req)


@router.post("/{course_id}/enroll", response_model=CourseResponse)
async def enroll_students(
    course_id: str,
    req: EnrollStudentsRequest,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER]))
):
    """Enroll a list of students into a course."""
    if current_user.role == UserRole.TEACHER:
        course = await course_service.get_course_by_id(course_id)
        if current_user.id not in course.teacher_ids:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return await course_service.enroll_students(course_id, req.student_ids)
