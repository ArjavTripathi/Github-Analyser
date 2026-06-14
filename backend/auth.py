import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv

from schemas.models import get_db, User
from schemas import crud

load_dotenv()

router = APIRouter()
security = HTTPBearer()

CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
SECRET_KEY    = os.getenv("SECRET_KEY")
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/auth/login")
def login():
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize"
        f"?client_id={CLIENT_ID}&scope=read:user"
    )


@router.get("/auth/callback")
async def callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
    token_data = token_res.json()
    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="GitHub auth failed")

    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    github_user = user_res.json()
    username = github_user["login"]

    crud.upsert_user(db, username, access_token)
    if not crud.get_settings(db, username):
        crud.create_default_settings(db, username)

    jwt_token = jwt.encode(
        {"sub": username, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY,
        algorithm="HS256",
    )

    return RedirectResponse(f"{FRONTEND_URL}/auth/callback?token={jwt_token}&username={username}")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        username = payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter_by(github_username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
