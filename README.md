# Folio

A customizable public portfolio page for your GitHub profile. Point anyone at `getfolio.page/your-username` and they get a beautifully rendered breakdown of your repos, languages, activity, and stats — all scored and ranked by a custom algorithm, not just follower count.

![Folio Profile Preview](https://github.com/ArjavTripathi/get-folio/raw/main/preview.png)

---

## Features

- **Repo Ranking Algorithm** — repos are scored by a weighted formula across stars, forks, recency, and polish (description, topics, license). Normalized per user so the scores are always relative and fair.
- **Language Breakdown** — aggregated byte counts across all repos, rendered as a proportional bar with percentage labels.
- **Activity Heatmap** — last 90 days of public GitHub events visualized as a contribution grid.
- **Stats Summary** — total stars, total forks, top language, and account age at a glance.
- **Profile Customization** — logged-in users can override their name, bio, accent color, background, font, and more. Changes apply only to their own profile page.
- **Repo Customization** — pin a featured repo, hide repos, reorder via drag-and-drop, and add custom descriptions and skill tags per repo.
- **GitHub OAuth** — login with GitHub in one click, no passwords.
- **Shareable URLs** — every profile lives at a clean `/:username` path.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL (Supabase) |
| Auth | GitHub OAuth 2.0 + JWT |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
get-folio/
├── backend/
│   ├── endpoints.py       # FastAPI app + all route definitions
│   ├── auth.py            # GitHub OAuth flow + JWT helpers
│   ├── github.py          # GitHub REST API calls
│   ├── schemas/
│   │   ├── models.py      # SQLAlchemy models + get_db
│   │   └── crud.py        # Database helper functions
│   ├── Logic/
│   │   ├── scorer.py      # Repo ranking algorithm
│   │   └── processor.py   # Raw API response cleaning
│   ├── migrations/        # Alembic migration files
│   ├── requirements.txt
│   └── main.py            # Uvicorn entry point
├── frontend/
│   ├── src/
│   │   ├── pages/         # Landing, Profile, Settings, AuthCallback
│   │   ├── components/    # RepoCard, StatsBar, Heatmap, LanguageBar, etc.
│   │   ├── hooks/         # useAuth
│   │   └── lib/           # API client, utils, type definitions
│   ├── public/
│   ├── vercel.json
│   └── vite.config.ts
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/profile/{username}` | Public | GitHub user info |
| `GET` | `/profile/{username}/rankrepos` | Public | Scored + ranked repos (cached) |
| `GET` | `/profile/{username}/languages` | Public | Aggregated language percentages |
| `GET` | `/profile/{username}/stats` | Public | Stars, forks, top language, account age |
| `GET` | `/profile/{username}/heatmap` | Public | 90-day activity data |
| `GET` | `/profile/{username}/settings` | Public | User's customization preferences |
| `PUT` | `/settings` | JWT | Save customization settings |
| `POST` | `/settings/reset` | JWT | Reset settings to defaults |
| `POST` | `/profile/{username}/refresh` | JWT | Bypass cache, re-fetch from GitHub |
| `GET` | `/auth/login` | — | Redirect to GitHub OAuth |
| `GET` | `/auth/callback` | — | Handle OAuth callback, issue JWT |
| `GET` | `/health` | — | Health check |

---

## Scoring Algorithm

Each repo gets a score between 0 and 1 based on four signals, normalized across the user's own repos so the formula works equally well for someone with 2 stars and someone with 20,000.

```
score = stars_norm  * 0.4
      + forks_norm  * 0.3
      + recency     * 0.2
      + polish      * 0.1
```

**Recency** decays linearly from 1.0 (pushed today) to 0.0 (not pushed in 2 years).

**Polish** checks for a description (`+0.33`), topics (`+0.33`), and a license (`+0.33`).

Forked repos are excluded from scoring entirely — only original work counts.

---

## Running Locally

### Prerequisites

- Python 3.11+
- Node.js 20+
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))
- A Supabase project (or any PostgreSQL database)

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Fill in: DATABASE_URL, GITHUB_TOKEN, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SECRET_KEY, FRONTEND_URL

# Run
python main.py
# or: uvicorn endpoints:app --reload
```

Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend

npm install

# .env.development is already configured for localhost:8000
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Environment Variables

**Backend `.env`:**

```
DATABASE_URL=postgresql://...
GITHUB_TOKEN=ghp_...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SECRET_KEY=any_long_random_string
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env.development`** (already in repo):

```
VITE_API_URL=http://localhost:8000
```

---

## Deployment

The project is deployed as two separate services from the same monorepo.

**Frontend → Vercel**
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-render-url.onrender.com`

**Backend → Render**
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn endpoints:app --host 0.0.0.0 --port 8000`
- Environment variables: all vars from the `.env` section above

**Database → Supabase**

Create a project, copy the connection pooler URI from `Settings → Database → Connection String`, and set it as `DATABASE_URL` on Render. Tables are created automatically on startup via `Base.metadata.create_all`.

**Custom Domain**

Point your domain's DNS to Vercel by adding an A record (`@`) and a CNAME (`www`) per the instructions in your Vercel dashboard. The backend can optionally be routed through a subdomain (e.g. `api.yourdomain.dev`) via a CNAME pointing at your Render service URL.

---

## License

MIT
