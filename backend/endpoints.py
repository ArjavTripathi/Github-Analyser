import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

import github
import Logic.processor as processor
import Logic.scorer as scorer
from auth import router as auth_router, get_current_user
from schemas.models import get_db, User
from schemas import crud

load_dotenv()

app = FastAPI(title="GitHub Profile Analyser")

# Allow comma-separated list of origins via FRONTEND_URL env var.
# Falls back to localhost for local dev when the var is blank/missing.
_raw_origin = os.getenv("FRONTEND_URL", "").strip()
ALLOWED_ORIGINS = [o.strip() for o in _raw_origin.split(",") if o.strip()] or ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

CACHE_TTL = timedelta(hours=1)


class SettingsUpdate(BaseModel):
    custom_name: Optional[str] = None
    accent_color: Optional[str] = None
    background: Optional[str] = None
    font: Optional[str] = None
    font_color: Optional[str] = None
    show_language_bar: Optional[bool] = None
    show_heatmap: Optional[bool] = None
    show_scores: Optional[bool] = None
    max_repos: Optional[int] = None
    custom_bio: Optional[str] = None
    profile_description: Optional[str] = None
    featured_repo: Optional[str] = None
    repo_order: Optional[list[str]] = None
    hidden_repos: Optional[list[str]] = None
    repo_descriptions: Optional[dict[str, str]] = None
    repo_skills: Optional[dict[str, list[str]]] = None


def _is_cache_valid(cache) -> bool:
    if cache is None:
        return False
    return (datetime.now() - cache.cached_at) < CACHE_TTL


async def _get_ranked_repos(username: str, db: Session) -> list[dict]:
    cache = crud.get_cache(db, username)
    if _is_cache_valid(cache):
        return cache.data["repos"]

    raw_repos = await github.get_repos(username)
    cleaned = [processor.clean_repo_json(r) for r in raw_repos]
    ranked = scorer.rank(cleaned)
    crud.set_cache(db, username, {"repos": ranked})
    return ranked


# ── Profile ───────────────────────────────────────────────────────────────────

@app.get("/profile/{username}")
async def get_profile(username: str):
    return await github.get_user(username)


@app.get("/profile/{username}/rankrepos")
async def get_ranked_repos(username: str, db: Session = Depends(get_db)):
    return await _get_ranked_repos(username, db)


@app.get("/profile/{username}/languages")
async def get_languages(username: str, db: Session = Depends(get_db)):
    ranked = await _get_ranked_repos(username, db)
    top_repo_names = [r["name"] for r in ranked[:30]]
    return await github.get_languages_for_repos(username, top_repo_names)


@app.get("/profile/{username}/settings")
async def get_settings(username: str, db: Session = Depends(get_db)):
    settings = crud.get_settings(db, username)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings


@app.post("/profile/{username}/refresh")
async def refresh_profile(username: str, db: Session = Depends(get_db)):
    raw_repos = await github.get_repos(username)
    cleaned = [processor.clean_repo_json(r) for r in raw_repos]
    ranked = scorer.rank(cleaned)
    crud.set_cache(db, username, {"repos": ranked})
    return {"refreshed": True, "repo_count": len(ranked)}


# ── Settings ──────────────────────────────────────────────────────────────────

@app.put("/settings")
async def update_settings(
    payload: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings = crud.get_settings(db, current_user.github_username)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return crud.update_settings(db, current_user.github_username, payload.model_dump(exclude_unset=True))


@app.post("/settings/reset")
async def reset_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    username = current_user.github_username
    settings = crud.get_settings(db, username)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    db.delete(settings)
    db.commit()
    return crud.create_default_settings(db, username)


# ── Nice to have ──────────────────────────────────────────────────────────────

@app.get("/profile/{username}/heatmap")
async def get_heatmap(username: str):
    events = await github.get_events(username)
    counts: dict[str, int] = {}
    for event in events:
        date = event["created_at"][:10]  # YYYY-MM-DD
        counts[date] = counts.get(date, 0) + 1
    return {"heatmap": counts}


@app.get("/profile/{username}/stats")
async def get_stats(username: str, db: Session = Depends(get_db)):
    user, ranked = await _gather_user_and_repos(username, db)
    top_repo_names = [r["name"] for r in ranked[:30]]
    languages = await github.get_languages_for_repos(username, top_repo_names)

    total_stars = sum(r["stars"] for r in ranked)
    total_forks = sum(r["forks"] for r in ranked)
    most_used_language = max(languages, key=languages.get) if languages else None

    created_at = user.get("created_at", "")
    account_age_days = None
    if created_at:
        created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        account_age_days = (datetime.now(created.tzinfo) - created).days

    return {
        "total_stars": total_stars,
        "total_forks": total_forks,
        "most_used_language": most_used_language,
        "account_age_days": account_age_days,
        "public_repos": user.get("public_repos"),
        "followers": user.get("followers"),
    }


async def _gather_user_and_repos(username: str, db: Session):
    import asyncio
    user, ranked = await asyncio.gather(
        github.get_user(username),
        _get_ranked_repos(username, db),
    )
    return user, ranked


@app.get("/health")
def health():
    return {"status": "ok"}
