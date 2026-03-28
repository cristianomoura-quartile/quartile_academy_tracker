# Quartile Academy Tracker

A full-stack web application for tracking the Quartile Academy training program. It provides real-time visibility into module delivery, AI-powered transcript analysis, student performance tracking, and an admin panel for managing users and content.

## Stack

**Frontend:** React 18, Tailwind CSS, React Router v6, Chart.js, Phosphor Icons  
**Backend:** FastAPI, MongoDB (Motor), Python 3.10+

---

## Features

- **Dashboard** — Program overview with weekly progress charts and upcoming sessions
- **Modules** — Full module list with filtering by week/channel, status badges
- **Module Detail** — Upload transcripts for AI analysis: topics covered/missed, Q&A logs, student performance scores, terminology corrections
- **Instructors** — Instructor directory with channel specialties and module counts
- **Students** — Student profiles with skill radar data, attendance tracking, and assessment scores
- **Calendar** — Weekly schedule view grouped by day with channel color coding
- **Admin Panel** — CRUD for modules, students, and users (admin role only)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB instance

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env to point REACT_APP_BACKEND_URL to your backend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
# Edit .env with your MONGO_URL, DB_NAME, JWT_SECRET, EMERGENT_LLM_KEY
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Backend `.env` variables

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=quartile_academy
JWT_SECRET=your-secret-key
EMERGENT_LLM_KEY=your-openai-key
CORS_ORIGINS=http://localhost:3000
```

---

## Project Structure

```
quartile_academy_tracker/
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, shadcn/ui components
│   │   ├── contexts/        # AuthContext
│   │   ├── lib/             # API client, utils
│   │   └── pages/           # Dashboard, Modules, Students, etc.
│   ├── tailwind.config.js
│   └── craco.config.js
└── backend/
    ├── server.py            # FastAPI routes + seed data
    ├── auth.py              # JWT auth helpers
    └── requirements.txt
```

---

## Default Credentials

On first startup the backend seeds default users. Check `backend/auth.py` for the `seed_users` function to see or change the defaults.
