# UniLab Implementation Status

## Current status

The application has a functioning authenticated FastAPI domain layer and a real REST-backed Next.js frontend. Core authentication, protected-route, upload-validation, and rate-limit verification now pass. Several academic workflows and malware scanning remain incomplete.

## Implemented

- JWT authentication, bcrypt password hashing, and protected role dependencies.
- Student-only public registration.
- Authorization checks for course, practical, submission, and feedback access.
- Authenticated frontend API integration with no local mock domain storage.
- Production seed protection, strong JWT secret validation, and strict CORS behavior.
- Secure submission upload/download endpoints with validation, safe UUID storage paths, and access control.
- SlowAPI rate limiting for login and registration.
- Submission metadata bounds and backend authorization regression tests.
- Dashboard error handling and keyboard-accessible practical cards.
- Playwright configuration that starts the backend and frontend for E2E runs.
- Protected-route redirect and invalid-session cleanup.
- E2E coverage for successful login, invalid login, unauthorized dashboard access, logout, and local token cleanup.
- Backend regression coverage for upload type/size restrictions and login throttling.

## Incomplete or blocked

- External examiner and parent workflows are only partially modeled.
- Academic session management is only partially exposed.
- Upload malware scanning is not implemented.
- Frontend lint warnings remain and should be reduced where practical.
- Broader E2E coverage for submission, grading, and admin workflows is still needed.

## Verification checklist

| Check | Result |
| --- | --- |
| Frontend lint | Passed; existing warnings remain |
| TypeScript check | Passed |
| Frontend production build | Passed |
| Backend pytest | Passed: 11 tests |
| Frontend Playwright E2E | Passed: 4 tests against local backend/frontend |
| Security review | Completed; findings and residual risks recorded in `PROJECT_AUDIT.md` |
| GitHub push | Not performed |

The project must not be presented as fully verified or pushed as a completed production release until the Playwright failure and remaining workflow gaps are resolved.
