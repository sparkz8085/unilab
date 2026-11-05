from pathlib import Path
from typing import List, Optional
from uuid import uuid4
import mimetypes

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse

from app.api.deps import get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.submission import SubmissionCreateOrUpdateRequest, SubmissionResponse
from app.schemas.user import UserResponse
from app.services.submission_service import submission_service
from app.core.config import settings
from app.repositories.submission_repo import submission_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.course_repo import course_repo
from app.models.user import UserRole
from app.models.submission import SubmissionFile

router = APIRouter(prefix="/submissions", tags=["Submissions"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".txt", ".md", ".py", ".js", ".ts", ".java", ".c", ".cpp"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "text/plain",
    "text/markdown",
    "text/x-python",
    "text/javascript",
    "application/javascript",
    "text/x-c",
    "text/x-c++",
    "text/x-java-source",
}


@router.post("", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_practical_work(
    req: SubmissionCreateOrUpdateRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Submit code or save draft for a practical (Student)."""
    return await submission_service.create_or_update_submission(
        student_id=current_user.id,
        req=req,
        role=current_user.role,
    )


@router.get("/my-history", response_model=List[SubmissionResponse])
async def get_my_submission_history(
    current_user: UserResponse = Depends(get_current_user)
):
    """List all submissions by the logged-in student."""
    return await submission_service.list_submissions_for_student(current_user.id)


@router.get("/for-practical/{practical_id}", response_model=Optional[SubmissionResponse])
async def get_my_submission_for_practical(
    practical_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get the current student's submission for a practical (or None if not started)."""
    return await submission_service.get_student_submission_for_practical(
        practical_id=practical_id,
        student_id=current_user.id
    )


@router.get("", response_model=List[SubmissionResponse])
async def list_submissions_for_review(
    practical_id: Optional[str] = Query(None),
    current_user: UserResponse = Depends(require_roles([
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        UserRole.TEACHER,
    ]))
):
    """List submissions for a practical (Teacher/Admin view)."""
    if practical_id:
        return await submission_service.list_submissions_for_practical(
            practical_id, current_user.id, current_user.role
        )
    return []


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Fetch single submission by ID with RBAC ownership check."""
    return await submission_service.get_submission_by_id(
        submission_id=submission_id,
        current_user_id=current_user.id,
        role=current_user.role
    )


@router.post("/{submission_id}/files", response_model=SubmissionFile, status_code=status.HTTP_201_CREATED)
async def upload_submission_file(
    submission_id: str,
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user),
):
    submission = await submission_repo.get_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
    practical = await practical_repo.get_by_id(submission["practical_id"])
    course = await course_repo.get_by_id(submission["course_id"])
    allowed = (
        current_user.role in {UserRole.ADMIN, UserRole.SUPER_ADMIN}
        or submission["student_id"] == current_user.id
        or (
            current_user.role == UserRole.TEACHER
            and course is not None
            and current_user.id in course.get("teacher_ids", [])
        )
    )
    if not allowed or not practical:
        raise HTTPException(status_code=403, detail="Access denied.")

    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()
    if not original_name or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type.")
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported content type.")

    root = Path(settings.UPLOAD_DIR).resolve()
    destination_dir = root / "submissions" / submission_id
    destination_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4().hex}{extension}"
    destination = destination_dir / stored_name
    size = 0
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                destination.unlink(missing_ok=True)
                raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit.")
            output.write(chunk)

    metadata = SubmissionFile(
        name=original_name,
        url=f"/api/v1/submissions/{submission_id}/files/{stored_name}",
        size_bytes=size,
        file_type=file.content_type,
    )
    files = [SubmissionFile(**entry).model_dump() for entry in submission.get("files", [])]
    files.append(metadata.model_dump())
    await submission_repo.update(submission_id, {"files": files})
    return metadata


@router.get("/{submission_id}/files/{stored_name}")
async def download_submission_file(
    submission_id: str,
    stored_name: str,
    current_user: UserResponse = Depends(get_current_user),
):
    if Path(stored_name).name != stored_name:
        raise HTTPException(status_code=400, detail="Invalid file name.")
    submission = await submission_repo.get_by_id(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
    course = await course_repo.get_by_id(submission["course_id"])
    allowed = (
        current_user.role in {UserRole.ADMIN, UserRole.SUPER_ADMIN}
        or submission["student_id"] == current_user.id
        or (
            current_user.role == UserRole.TEACHER
            and course is not None
            and current_user.id in course.get("teacher_ids", [])
        )
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Access denied.")
    if not any((entry.get("url") or "").endswith(f"/{stored_name}") for entry in submission.get("files", [])):
        raise HTTPException(status_code=404, detail="File not found.")
    path = (Path(settings.UPLOAD_DIR) / "submissions" / submission_id / stored_name).resolve()
    root = Path(settings.UPLOAD_DIR).resolve()
    if root not in path.parents or not path.is_file():
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(path, filename=next(
        (entry.get("name") for entry in submission.get("files", []) if (entry.get("url") or "").endswith(f"/{stored_name}")),
        stored_name,
    ), media_type=mimetypes.guess_type(path.name)[0] or "application/octet-stream")
