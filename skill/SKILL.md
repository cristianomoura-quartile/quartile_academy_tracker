---
name: "dev-academy-tracker"
description: >
  Full development context for the Quartile Academy Tracker. Use this skill for ANY
  code change, bug fix, feature addition, UI update, or deployment task on the academy
  tracker. Triggers: "update the tracker", "fix the tracker", "add feature to academy",
  "deploy", "push changes", "edit modules page", or any reference to the academy app.
---

# Quartile Academy Tracker — Dev Skill

## Stack at a Glance
- **Frontend**: React 18 + Tailwind CSS + Recharts + Phosphor Icons
- **Backend**: FastAPI (Python 3.11) + MongoDB (Motor async driver)
- **Auth**: JWT with 3 roles (admin / instructor / student)
- **Frontend Host**: GitHub Pages → `https://cristianomoura-quartile.github.io/quartile_academy_tracker/`
- **Backend Host**: Render Free → `https://quartile-academy-tracker.onrender.com`
- **Database**: MongoDB Atlas Free (M0) → cluster `quartile-academy` / db `quartile_academy`
- **Repo**: `https://github.com/cristianomoura-quartile/quartile_academy_tracker`

---

## Credentials & Config

### Login Accounts (app)
| Role | Email | Password |
|------|-------|----------|
| Admin | cristiano.moura@quartile.com | admin123 |
| Instructor | instructor@quartile.com | instructor123 |
| Student | student@quartile.com | student123 |

### MongoDB Atlas
- **Cluster**: quartile-academy.supzlvn.mongodb.net
- **DB User**: cris_db_user / Q7XHUX8l1bIcHsoX
- **Connection**: `mongodb+srv://cris_db_user:Q7XHUX8l1bIcHsoX@quartile-academy.supzlvn.mongodb.net/?appName=quartile-academy`

### Render Backend
- **Service ID**: srv-d74lope3jp1c7395t360
- **URL**: https://quartile-academy-tracker.onrender.com
- **Dashboard**: https://dashboard.render.com/web/srv-d74lope3jp1c7395t360
- **Note**: Free tier spins down after inactivity — first request takes ~50s cold start

### Render Environment Variables (current)
| Key | Value |
|-----|-------|
| MONGO_URL | mongodb+srv://cris_db_user:Q7XHUX8l1bIcHsoX@quartile-academy.supzlvn.mongodb.net/?appName=quartile-academy |
| DB_NAME | quartile_academy |
| JWT_SECRET | q8f3k2p9m1n7x4t6v0r5w2y8b3j1l6h4 |
| CORS_ORIGINS | https://cristianomoura-quartile.github.io |
| ADMIN_EMAIL | cristiano.moura@quartile.com |
| ADMIN_PASSWORD | admin123 |
| ANTHROPIC_API_KEY | [STORED IN RENDER ENV — see Render dashboard] |

### GitHub
- **Repo**: cristianomoura-quartile/quartile_academy_tracker
- **Main branch**: source code + compiled frontend at root (GitHub Pages serves from main /)
- **Pages URL**: https://cristianomoura-quartile.github.io/quartile_academy_tracker/

### AI Analysis — Claude Sonnet 4.5
- **Model**: `claude-sonnet-4-5`
- **SDK**: `anthropic==0.29.0` (in backend/requirements.txt)
- **Key env var**: `ANTHROPIC_API_KEY` on Render
- **3 endpoints using Claude**:
  - `POST /api/modules/:id/ingest` — full transcript analysis (topics, Q&A, student perf, terminology)
  - `POST /api/modules/:id/assessment` — assessment grading (9 skills with feedback + radar chart)
  - `POST /api/modules/:id/roleplay` — role play review (14 dimensions with feedback + radar chart)
- **Client pattern**:
  ```python
  import anthropic as _anthropic
  api_key = os.environ.get("ANTHROPIC_API_KEY")
  _client = _anthropic.AsyncAnthropic(api_key=api_key)
  _completion = await _client.messages.create(
      model="claude-sonnet-4-5",
      max_tokens=2000,
      system=system_prompt,
      messages=[{"role": "user", "content": user_text}]
  )
  resp = _completion.content[0].text  # extract text
  ```
- **Response parsing**: strip to `{...}` → `json.loads()`

---

## Repo Structure
```
quartile_academy_tracker/
├── index.html                  ← compiled React app (served by GitHub Pages)
├── static/js/main.*.js         ← compiled JS bundle
├── static/css/main.*.css       ← compiled CSS
├── .nojekyll                   ← prevents Jekyll processing
├── backend/
│   ├── server.py               ← FastAPI app (all routes + seed data + Claude AI calls)
│   ├── auth.py                 ← JWT helpers + seed_users()
│   ├── requirements.txt        ← Python deps (pydantic v1, Python 3.11, anthropic)
│   ├── runtime.txt             ← pins Python 3.11.9 for Render
│   └── .python-version         ← also pins Python 3.11.9
└── frontend/
    ├── src/
    │   ├── App.js              ← router + layout
    │   ├── contexts/AuthContext.js
    │   ├── lib/api.js          ← all API calls
    │   ├── components/
    │   │   ├── Sidebar.js
    │   │   ├── ModuleDetailModal.js  ← 8-tab modal (biggest component)
    │   │   └── StudentDetailModal.js
    │   └── pages/
    │       ├── Dashboard.js    ← KPIs + area chart + upcoming modules
    │       ├── Modules.js      ← table with week filters + modal trigger
    │       ├── Instructors.js  ← card grid with channel filters
    │       ├── Students.js     ← cards with skill bars + modal trigger
    │       ├── Calendar.js     ← weekly day-grid view
    │       ├── AdminPage.js    ← CRUD for modules/students/instructors/users
    │       └── LoginPage.js    ← JWT login + Quick Access (Admin=cristiano.moura@quartile.com)
    ├── .env                    ← REACT_APP_BACKEND_URL=https://quartile-academy-tracker.onrender.com
    ├── package.json            ← homepage set to GitHub Pages URL
    ├── tailwind.config.js
    └── craco.config.js         ← @ path aliases
```

---

## Development Workflow

### ⚡ RULE 1 — Always Preview Before Deploying

For ANY frontend change, show the user a live visual preview BEFORE building and pushing.
- Render the changed component/page as an HTML artifact in Claude
- Or open a local preview in the browser
- Only proceed to deploy when the user explicitly approves:
  "looks good", "deploy it", "ship it", "go ahead", or similar

### ⚡ RULE 2 — "Deploy" Triggers Full Stack Update

When user says **"deploy"**, **"push it"**, **"ship it"**, or approves changes:
1. Build frontend: `cd frontend && npm run build`
2. Copy to root: `cp -r frontend/build/. ..`  
3. Commit + push → triggers:
   - **GitHub Pages** auto-updates in ~60s
   - **Render** auto-redeploys backend in ~3 min (if backend files changed)
4. Confirm both are live by checking the URLs

### ⚡ RULE 3 — Update This Skill on Major Changes

When credentials, architecture, or major features change:
1. Update this SKILL.md file
2. Push to GitHub: `git add skill/SKILL.md && git commit -m "docs: update dev skill"`
3. Save updated copy to user's skills directory

---

## Deploy Commands

```bash
# ── Frontend only ──────────────────────────────────────────
cd frontend && npm run build && cp -r build/. ..
git add index.html asset-manifest.json static/ .nojekyll favicon.ico logo*.png manifest.json robots.txt
git commit -m "feat: description"
git push origin main
# → GitHub Pages live in ~60s

# ── Backend only ───────────────────────────────────────────
git add backend/
git commit -m "fix: description"
git push origin main
# → Render redeploys in ~3 min

# ── Both at once ───────────────────────────────────────────
cd frontend && npm run build && cp -r build/. .. && cd ..
git add -A
git commit -m "feat: description"
git push origin main

# ── Force Render redeploy (no code change needed) ──────────
# Manual Deploy button in Render dashboard, or:
curl -X POST https://api.render.com/v1/services/srv-d74lope3jp1c7395t360/deploys \
  -H "Authorization: Bearer YOUR_RENDER_API_KEY"
```

---

## Key API Endpoints
```
POST /api/auth/login                     email + password → JWT token
GET  /api/auth/me                        current user info
GET  /api/dashboard                      KPIs + weekly progress + upcoming
GET  /api/modules?week=&search=&channel= list modules
GET  /api/modules/:id                    module + analysis + assessment + roleplay
POST /api/modules/:id/ingest             upload .docx → Claude transcript analysis
POST /api/modules/:id/content            upload .docx module content (source of truth)
POST /api/modules/:id/assessment         upload .docx → Claude assessment grading (9 skills)
POST /api/modules/:id/roleplay           upload .docx → Claude roleplay scoring (14 dims)
GET  /api/instructors                    list instructors
GET  /api/students                       list students
GET  /api/students/:id                   student detail + KPIs + Q&A history
GET  /api/calendar                       calendar events
GET  /api/filters                        available weeks + channels
POST/PUT/DELETE /api/admin/modules/:id   CRUD (admin only)
POST/PUT/DELETE /api/admin/students/:id  CRUD (admin only)
GET  /api/admin/users                    list users (admin only)
POST /api/admin/users                    create user (admin only)
POST /api/admin/users/reset-password     reset password (admin only)
```

---

## Data Models (MongoDB)

### modules
```json
{ "id": "QA117", "week": "Week 1", "date": "22-Apr", "day": "Wednesday",
  "start_time": "12:20 PM", "shift": "PM", "length_hrs": 3.0,
  "format": "Live", "channel": "AMZ", "module": "Sponsored Products - Advanced",
  "instructor": "Felipe Tahara", "status": "Presented", "analyzed": true }
```

### students
```json
{ "name": "Ana Reyes", "role": "Advanced Analytics Lead", "country": "Brazil",
  "student_id": "ARCH-9234", "academic_progress": 0, "sessions": 0,
  "total_hours": 0.0, "overall_score": 0.0, "modules_attended": [],
  "channel_hours": {}, "skills": {
    "objection_handling": 0, "negotiation": 0, "data_analysis": 0,
    "communication": 0, "presentation": 0, "analytical_thinking": 0,
    "campaign_management": 0, "client_management": 0 } }
```

### analyses (populated by Claude after transcript ingestion)
```json
{ "module_id": "QA117", "learning_objective": "...",
  "content_match_score": 9, "content_match_summary": "...",
  "topics_covered": [...], "topics_missed": [...],
  "terminology_drifts": [{"id": "Correction #01", "severity": "CRITICAL", "issue": "...", "recommendation": "..."}],
  "tips_shared": [...], "follow_up_items": [...],
  "qa_log": [{"student": "...", "question": "...", "answer": "...", "section": "..."}],
  "student_performance": [{"name": "...", "interactions": 10, "score": 8,
    "strengths": "...", "areas_for_improvement": "...",
    "skills": {"objection_handling": 7, "negotiation": 6, ...}}],
  "overall_score": 9, "avg_satisfaction": 4.5,
  "session_sections": [{"title": "...", "start_time": "09:00", "summary": "..."}],
  "instructor_name": "Felipe Tahara", "actual_duration": "2h 05m",
  "participants": ["Ana Reyes", ...], "ingested_at": "2026-03-29T..." }
```

---

## Design System
- **Primary**: `#FF6E13` (Quartile orange) | **Primary hover**: `#E65C0A`
- **Background**: `#FDFBF7` | **Surface**: `#F5F2EB` | **Border**: `#EBE5DB`
- **Text main**: `#2D241E` | **Text muted**: `#7A6F69`
- **Success**: `#2E7D32` | **Warning**: `#B34700` | **Danger**: `#C62828`
- **Fonts**: Cabinet Grotesk (headings, `font-cabinet`) + Work Sans (body)
- **Icons**: `@phosphor-icons/react` (weight="duotone" for filled icons)
- **Charts**: Recharts (`AreaChart` on dashboard, `RadarChart` for skills/assessment)
- **Animations**: `animate-fade-in` (0.3s), `animate-slide-up` (0.4s), `stagger-children`
- **Tailwind classes**: use inline hex colors (`text-[#FF6E13]`) not custom tokens

---

## Common Tasks

### Add a new page
1. Create `frontend/src/pages/NewPage.js`
2. Add route in `frontend/src/App.js`
3. Add nav item in `frontend/src/components/Sidebar.js`
4. Show HTML preview → get approval → build → deploy

### Add a new backend endpoint
1. Add route function to `backend/server.py`
2. Add `api.newEndpoint = () => axios.get(...)` to `frontend/src/lib/api.js`
3. Push → Render auto-deploys

### Add a new Claude AI endpoint
Use the pattern in the AI Analysis section above. Add to `backend/server.py`,
add `ANTHROPIC_API_KEY` is already set in Render env vars.

### Add env var to Render
Dashboard → srv-d74lope3jp1c7395t360 → Environment → Edit → Add variable → Save, rebuild, and deploy

---

## Known Gotchas

1. **Render cold start**: Free tier sleeps after 15min inactivity. First request ~50s.
   Wake up: `curl https://quartile-academy-tracker.onrender.com/api/`

2. **pydantic v1 only**: `pydantic==1.10.13`. Do NOT upgrade to v2 — requires Rust-compiled
   pydantic-core which fails on Render.

3. **Python 3.11 pinned**: Both `backend/runtime.txt` and `backend/.python-version` = `3.11.9`.
   Render defaults to 3.14 which breaks pydantic-core. Keep the pin.

4. **Frontend build at repo root**: GitHub Pages serves from `main /`.
   Always `cp -r frontend/build/. .` after building.

5. **Anthropic SDK response**: `.content[0].text` (not `.choices[0].message.content` like OpenAI).

6. **EMERGENT_LLM_KEY on Render**: Still present as env var but unused. All AI now uses
   `ANTHROPIC_API_KEY`. Safe to delete EMERGENT_LLM_KEY if desired.

7. **Quick Access Admin button**: LoginPage.js — hardcoded to `cristiano.moura@quartile.com`.

8. **Preview before deploy**: Non-negotiable for frontend changes. Always show artifact/preview first.

---

## Prioritized Backlog

### P0 — Verify Now
- [ ] Test Claude AI analysis end-to-end (upload W1_17_Sponsored_Products_Advanced_V3.docx as content, then call-transcript--Mock_call_-_Hugo.txt as transcript to QA117)
- [ ] Confirm all 3 Claude endpoints respond correctly

### P1 — High Value
- [ ] Bulk transcript upload (process multiple modules at once)
- [ ] Export analytics to PDF/CSV
- [ ] Email notifications for upcoming sessions
- [ ] Full-text search across modules + transcripts + students

### P2 — Medium
- [ ] Instructor detail page (click card → full profile)
- [ ] Student comparison view (side-by-side skill radars)
- [ ] Module completion certificates
- [ ] Dark mode toggle

### P3 — Nice to Have
- [ ] Calendar drag-and-drop rescheduling
- [ ] Slack/Teams webhook notifications
- [ ] Custom branding per cohort
- [ ] Upgrade Render to Starter ($7/mo) to eliminate cold start
