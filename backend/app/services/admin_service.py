from app.models.submission import SubmissionStatus
from app.models.user import UserRole
from app.repositories.course_repo import course_repo
from app.repositories.practical_repo import practical_repo
from app.repositories.submission_repo import submission_repo
from app.repositories.user_repo import user_repo
from app.schemas.admin import SystemStatsResponse


class AdminService:
    async def get_system_stats(self) -> SystemStatsResponse:
        total_students = await user_repo.count({"role": UserRole.STUDENT})
        total_teachers = await user_repo.count({"role": UserRole.TEACHER})
        total_admins = await user_repo.count({"role": {"$in": [UserRole.ADMIN, UserRole.SUPER_ADMIN]}})

        total_courses = await course_repo.count({"is_active": True})
        total_practicals = await practical_repo.count()

        total_submissions = await submission_repo.count({"status": {"$ne": SubmissionStatus.DRAFT}})
        total_reviewed = await submission_repo.count({"status": SubmissionStatus.REVIEWED})

        submission_rate = 0.0
        if total_students > 0 and total_practicals > 0:
            potential = total_students * total_practicals
            submission_rate = round((total_submissions / potential) * 100, 1) if potential > 0 else 0.0

        grading_rate = 0.0
        if total_submissions > 0:
            grading_rate = round((total_reviewed / total_submissions) * 100, 1)

        return SystemStatsResponse(
            total_students=total_students,
            total_teachers=total_teachers,
            total_admins=total_admins,
            total_courses=total_courses,
            total_practicals=total_practicals,
            total_submissions=total_submissions,
            total_reviewed=total_reviewed,
            submission_rate_percent=submission_rate,
            grading_rate_percent=grading_rate
        )


admin_service = AdminService()
