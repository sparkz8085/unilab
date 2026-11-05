import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "UniLab"


@pytest.mark.asyncio
async def test_auth_login_and_me():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "alex@unilab.edu",
            "password": "password123"
        })
        assert login_res.status_code == 200, login_res.text
        login_data = login_res.json()
        assert "access_token" in login_data
        assert login_data["user"]["email"] == "alex@unilab.edu"
        assert login_data["user"]["role"] == "student"

        token = login_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Check /auth/me
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "alex@unilab.edu"


@pytest.mark.asyncio
async def test_student_flow_courses_and_practicals():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "alex@unilab.edu",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List enrolled courses
        courses_res = await client.get("/api/v1/courses", headers=headers)
        assert courses_res.status_code == 200
        courses = courses_res.json()
        assert len(courses) >= 1
        course_id = courses[0]["id"]

        # List practicals for course
        pracs_res = await client.get(f"/api/v1/practicals?course_id={course_id}", headers=headers)
        assert pracs_res.status_code == 200
        pracs = pracs_res.json()
        assert len(pracs) >= 1
        practical_id = pracs[0]["id"]

        # Get practical detail
        prac_detail_res = await client.get(f"/api/v1/practicals/{practical_id}", headers=headers)
        assert prac_detail_res.status_code == 200
        prac_data = prac_detail_res.json()
        assert prac_data["title"] is not None


@pytest.mark.asyncio
async def test_student_submission_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as Maya
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "maya@unilab.edu",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get practicals
        courses = (await client.get("/api/v1/courses", headers=headers)).json()
        pracs = (await client.get(f"/api/v1/practicals?course_id={courses[0]['id']}", headers=headers)).json()
        prac_id = pracs[0]["id"]

        # Submit practical work
        sub_payload = {
            "practical_id": prac_id,
            "language": "python",
            "code_content": "def solution():\n    return 'Hello Lab'\n",
            "files": [{"name": "sol.py", "size_bytes": 120}],
            "output_text": "Hello Lab",
            "output_images": [],
            "student_notes": "Implemented initial baseline test.",
            "is_draft": False
        }
        sub_res = await client.post("/api/v1/submissions", json=sub_payload, headers=headers)
        assert sub_res.status_code == 201, sub_res.text
        sub_data = sub_res.json()
        assert sub_data["status"] == "submitted"
        assert sub_data["student_id"] is not None


@pytest.mark.asyncio
async def test_teacher_grading_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as teacher
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "teacher@unilab.edu",
            "password": "password123"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List practical submissions
        courses = (await client.get("/api/v1/courses", headers=headers)).json()
        pracs = (await client.get(f"/api/v1/practicals?course_id={courses[0]['id']}", headers=headers)).json()
        prac_id = pracs[0]["id"]

        subs = (await client.get(f"/api/v1/submissions?practical_id={prac_id}", headers=headers)).json()
        assert len(subs) >= 1
        sub_to_grade = subs[0]

        # Submit Feedback
        fb_payload = {
            "submission_id": sub_to_grade["id"],
            "marks": 98.0,
            "rubric_scores": [
                {"criteria": "Correct Balance Factor Calculation", "score": 30.0, "max_points": 30.0, "feedback": "Great"},
                {"criteria": "Single & Double Rotation Logic", "score": 49.0, "max_points": 50.0, "feedback": "Accurate"},
                {"criteria": "Code Readability & Test Coverage", "score": 19.0, "max_points": 20.0, "feedback": "Very clean"}
            ],
            "comments": "Outstanding submission with verified edge cases.",
            "line_comments": [
                {"line": 15, "comment": "Excellent logic handling."}
            ]
        }
        fb_res = await client.post("/api/v1/feedback", json=fb_payload, headers=headers)
        assert fb_res.status_code == 201
        fb_data = fb_res.json()
        assert fb_data["marks"] == 98.0


@pytest.mark.asyncio
async def test_admin_stats_and_rbac_security():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Admin gets stats
        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@unilab.edu",
            "password": "password123"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        stats_res = await client.get("/api/v1/admin/stats", headers=admin_headers)
        assert stats_res.status_code == 200
        stats = stats_res.json()
        assert stats["total_students"] >= 1
        assert stats["total_teachers"] >= 1
        assert stats["total_courses"] >= 1

        # 2. Student trying to access admin stats -> 403 Forbidden
        student_login = await client.post("/api/v1/auth/login", json={
            "email": "alex@unilab.edu",
            "password": "password123"
        })
        student_token = student_login.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        rbac_fail_res = await client.get("/api/v1/admin/stats", headers=student_headers)
        assert rbac_fail_res.status_code == 403


@pytest.mark.asyncio
async def test_registration_cannot_create_privileged_user():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/auth/register", json={
            "email": "new-user@unilab.edu",
            "password": "safe-password-123",
            "full_name": "New Student",
            "role": "admin",
        })
        assert response.status_code == 201
        assert response.json()["user"]["role"] == "student"


@pytest.mark.asyncio
async def test_student_cannot_read_other_practical_submissions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/api/v1/auth/login", json={
            "email": "alex@unilab.edu", "password": "password123"
        })
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        practicals = (await client.get("/api/v1/practicals", headers=headers)).json()
        response = await client.get(
            f"/api/v1/submissions?practical_id={practicals[0]['id']}",
            headers=headers,
        )
        assert response.status_code == 403


@pytest.mark.asyncio
async def test_student_can_upload_valid_submission_file():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/api/v1/auth/login", json={
            "email": "maya@unilab.edu", "password": "password123"
        })
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        courses = (await client.get("/api/v1/courses", headers=headers)).json()
        practicals = (await client.get(
            f"/api/v1/practicals?course_id={courses[0]['id']}", headers=headers
        )).json()
        submission = await client.post(
            "/api/v1/submissions",
            json={
                "practical_id": practicals[0]["id"],
                "language": "python",
                "code_content": "print('upload')",
                "is_draft": True,
            },
            headers=headers,
        )
        assert submission.status_code == 201
        upload = await client.post(
            f"/api/v1/submissions/{submission.json()['id']}/files",
            files={"file": ("solution.py", b"print('upload')", "text/x-python")},
            headers=headers,
        )
        assert upload.status_code == 201
        assert upload.json()["size_bytes"] > 0


@pytest.mark.asyncio
async def test_upload_rejects_unsafe_type_and_oversized_file():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/api/v1/auth/login", json={
            "email": "maya@unilab.edu", "password": "password123"
        })
        headers = {"Authorization": "Bearer " + login.json()["access_token"]}
        courses = (await client.get("/api/v1/courses", headers=headers)).json()
        practicals = (await client.get(
            f"/api/v1/practicals?course_id={courses[0]['id']}", headers=headers
        )).json()
        submission = await client.post(
            "/api/v1/submissions",
            json={
                "practical_id": practicals[0]["id"],
                "language": "python",
                "code_content": "print('validation')",
                "is_draft": True,
            },
            headers=headers,
        )
        submission_id = submission.json()["id"]

        unsafe = await client.post(
            f"/api/v1/submissions/{submission_id}/files",
            files={"file": ("payload.exe", b"MZ", "application/octet-stream")},
            headers=headers,
        )
        assert unsafe.status_code == 400

        oversized = await client.post(
            f"/api/v1/submissions/{submission_id}/files",
            files={"file": ("large.txt", b"x" * (10 * 1024 * 1024 + 1), "text/plain")},
            headers=headers,
        )
        assert oversized.status_code == 413


@pytest.mark.asyncio
async def test_login_rate_limit_returns_too_many_requests():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://rate-limit-test") as client:
        responses = [
            await client.post("/api/v1/auth/login", json={
                "email": "unknown@unilab.edu", "password": "wrong-password"
            })
            for _ in range(11)
        ]
        assert any(response.status_code == 429 for response in responses)
