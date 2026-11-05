# UniLab Project Audit

## Scope

This audit covers the Next.js frontend, FastAPI backend, REST APIs, MongoDB repositories and fallback store, authentication, authorization, uploads, rate limiting, configuration, and automated tests.

## Findings and remediation

| Area | Finding | Severity | Status |
| --- | --- | --- | --- |
| Registration | Public registration accepted caller-supplied privileged roles. | Critical | Fixed: public registration always creates students. |
| Frontend authentication | Login previously used local mock users and could fall back to a fabricated user. | Critical | Fixed: login, registration, and session hydration use backend JWT endpoints. |
| Demo seeding | Demo administrator accounts could be seeded in production. | Critical | Fixed: startup seeding is skipped in production. |
| JWT configuration | Deployments could use a built-in secret. | Critical | Fixed: a configured secret of at least 32 characters is required. |
| CORS | Empty configuration could allow wildcard origins with credentials. | High | Fixed: empty configuration allows no origins. |
| Course/practical access | Resource operations did not consistently enforce enrollment, assignment, or role checks. | High | Fixed in course and practical services. |
| Submission/feedback access | Students and teachers could access records outside their authorized scope. | High | Fixed with ownership, enrollment, assignment, and role checks. |
| Frontend domain APIs | Courses, practicals, submissions, feedback, administration, health, and upload calls now use authenticated REST requests. | Major | Fixed; local mock domain storage was removed. |
| File uploads | Uploads lacked a safe storage and authorization pipeline. | Major | Fixed: allowlists, MIME checks, size limits, UUID paths, traversal protection, and authorized download/upload endpoints. |
| Rate limiting | Authentication endpoints lacked throttling. | Major | Fixed with SlowAPI limits on login and registration. |
| Browser coverage | Authentication and protected-route behavior needed regression coverage. | Medium | Fixed for core flows: Playwright now covers successful login, invalid login, unauthenticated route access, logout, and token cleanup. |
| Role workflows | External examiner and parent workflows remain only partially modeled. | Medium | Open product gap; no fabricated workflow was added. |

## Remaining risks

- The in-memory repository fallback is suitable for development/tests but must not be used as a production persistence substitute.
- Upload malware scanning is not included; content type, extension, size, path safety, and authorization checks are enforced.
- Academic session management and external examiner/parent workflows are not complete end-to-end.
- Frontend lint reports existing warnings (unused imports/variables, hook dependency notices, and image optimization suggestions).
- The previous `/login` exception was caused by a stale Next.js process serving removed demo UI. A fresh server run no longer reproduces it.

## Validation evidence

- Frontend production build: passed.
- Frontend TypeScript check: passed.
- Frontend lint: passed with existing warnings and no lint errors.
- Backend pytest: `PYTHONPATH=. venv/bin/pytest tests -q` from `backend`; **11 passed** with two third-party deprecation warnings.
- Playwright E2E: **4 passed**, using configured local backend/frontend web servers.
- Direct shell execution remains unavailable because the sandbox cannot start Bubblewrap without `slirp4netns`; supported VS Code tasks were used for all commands.

No GitHub push was performed.
