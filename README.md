# UniLab — AI-Assisted University Practical & Laboratory Management System

UniLab is a production-grade full-stack platform engineered to digitize university practical education, replace fragmented paper-based laboratory manuals, and streamline the end-to-end coursework cycle: from interactive coding and test verification to rubric-based faculty evaluation and university administration.

---

## 1. Architecture Overview

UniLab is structured as a scalable, modern monorepo:

* **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React, and pnpm workspace.
* **Backend**: FastAPI (Python 3.11+), Pydantic v2, Motor (Async MongoDB driver), PyJWT / python-jose, and Bcrypt.
* **Database**: MongoDB (Atlas-ready) with clean repository abstractions.
* **Deployment**:
  * **Frontend**: Render (Next.js Web Service)
  * **Backend**: Render (FastAPI Web Service)
  * **Database**: MongoDB Atlas Cluster

```text
unilab/
│
├── frontend/                     # Next.js 15 App Router Frontend
│   ├── app/                      # Routes (Dashboard, Courses, Practicals, History, Admin)
│   ├── components/               # UI Primitives, Layouts, Student/Teacher/Admin Studios
│   ├── context/                  # AuthContext, ThemeContext, ToastContext
│   ├── lib/                      # Axios API Client & Utility helpers
│   ├── types/                    # TypeScript interfaces
│   ├── package.json
│   └── ...
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                  # REST API v1 Routers (Auth, Courses, Practicals, etc.)
│   │   ├── core/                 # Config (Pydantic Settings), Security, DB Manager
│   │   ├── models/               # MongoDB Document Models
│   │   ├── schemas/              # Pydantic v2 Request/Response Schemas
│   │   ├── repositories/         # Abstracted Data Access Layer (Motor / Atlas)
│   │   ├── services/             # Business Logic & Validation Engine
│   │   └── utils/                # Database Seeder & Mock Initializer
│   ├── tests/                    # Pytest Automated Test Suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
│
├── render.yaml                   # Render Blueprint Specification
├── package.json                  # Root Monorepo configuration
└── README.md
```

---

## 2. Key Features

### For Students:
* **Interactive Code & Lab Workspace**: Markdown instructions, multi-language starter templates (Python, C++, Java, JS), and real-time execution console.
* **Smart Submissions**: Save drafts, attach outputs, submit final work with instant versioning.
* **Grade Reports & Feedback**: View instructor rubric scores, comments, and marks breakdown.

### For Faculty / Teachers:
* **Curriculum Practical Builder**: Create labs with objectives, markdown guides, starter templates, rubrics, and deadlines.
* **Grading Studio Modal**: Side-by-side student code inspection, test output review, rubric sliders with dynamic point calculation, and instant grade publishing.
* **Submissions Queue**: Real-time status tracking for pending student submissions across courses.

### For University Administrators:
* **User Directory**: Search and filter students and faculty members.
* **Course Allocations**: Assign faculty to laboratory courses and monitor student enrollments.
* **Academic Sessions & Stats**: High-level platform metrics (submission rates, grading completion %).

---

## 3. Development Demo Accounts

When running in a non-production environment, startup may seed demonstration accounts with full test data:

| Persona | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Student** | `alex@unilab.edu` | `password123` | CS301 Student (AVL Tree, Dijkstra Labs) |
| **Faculty** | `teacher@unilab.edu` | `password123` | Dr. Eleanor Sterling (Course Instructor) |
| **Admin** | `admin@unilab.edu` | `password123` | Prof. Arthur Vance (Dean / Admin) |

These credentials are for local development only. Production startup does not seed demo accounts, and `JWT_SECRET` must be configured explicitly.

---

## 4. Local Setup & Development

### Prerequisites
* Node.js 18+ (Node 20+ recommended)
* `pnpm` (`npm install -g pnpm`)
* Python 3.10+
* MongoDB (Optional for local development; the backend uses temporary in-memory fallback data when MongoDB is offline)

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/sparkz8085/unilab.git
cd unilab

# Install frontend dependencies
pnpm install

# Setup backend Python virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### Step 2: Environment Configuration
* **Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

* **Backend** (`backend/.env`):
```env
PROJECT_NAME=UniLab
API_V1_STR=/api/v1
ENVIRONMENT=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=unilab_db
JWT_SECRET=unilab_development_super_secret_jwt_key_2026_x89f
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Step 3: Run the Application
In separate terminal windows:

* **Start Backend**:
```bash
cd backend
venv/bin/uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

* **Start Frontend**:
```bash
pnpm --filter frontend dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Running Automated Tests

Run the full backend test suite:
```bash
PYTHONPATH=backend backend/venv/bin/pytest backend/tests/test_api.py -v
```

Verify frontend build:
```bash
pnpm --filter frontend build
```

---

## 6. Production Deployment (Render)

UniLab uses two Render Web Services and one MongoDB Atlas database.

### Backend (FastAPI)
1. Create a Render Blueprint from this repository, or create a Python Web Service manually.
2. For a manual service, set **Root Directory** to `backend`.
3. Set **Build Command** to `pip install -r requirements.txt`.
4. Set **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set these environment variables:
   * `ENVIRONMENT=production`
   * `MONGODB_URI`: your rotated MongoDB Atlas connection string
   * `MONGODB_DB_NAME=unilab_db`
   * `JWT_SECRET`: a unique random secret (at least 32 characters)
   * `CORS_ORIGINS`: the exact public frontend origin, for example `https://your-frontend.onrender.com`

The backend health check is `/health`. It returns HTTP 503 until MongoDB is connected. Production startup intentionally fails if MongoDB is unavailable; this prevents authentication from silently using temporary in-memory data.

### Frontend (Next.js)
1. Create a Node.js Web Service from the same repository (or use the included `render.yaml` Blueprint).
2. Keep the repository root as the service root directory.
3. Build with `corepack enable && corepack prepare pnpm@9.15.4 --activate && pnpm install --frozen-lockfile && pnpm --filter frontend build`.
4. Start with `pnpm --filter frontend start`.
5. Set `NEXT_PUBLIC_API_URL` to the backend's public base URL, for example `https://your-backend.onrender.com`. Do not append `/api/v1`; the frontend adds that path itself.

Because `NEXT_PUBLIC_API_URL` is embedded during the Next.js build, redeploy the frontend after changing it. Keep the frontend origin in the backend's `CORS_ORIGINS` value.

### Security and account setup
* Never commit `.env` files, database connection strings, or JWT secrets.
* Rotate any MongoDB password that has been exposed and update the Render environment variable.
* Production does not create demo accounts. Register a student account through the app; privileged accounts must be provisioned through a trusted administrative process.
* Demo credentials listed above are for local development only.

---
 
## 7. Future Architecture & Extensions

UniLab is architected with clear service boundaries to support future capabilities without redesign:
* **Offline-First Sync Engine**: PouchDB / SQLite sync layer with vector clocks for intermittent connectivity.
* **AI Evaluation Engine**: Automated syntax, logic, and complexity checks via Gemini API.
* **UniLab Vision OS & Dedicated Device**: Hardware telemetry hooks and zero-distraction student devices.
