import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt

from models import get_db, User, Settings, engine, Base

router = APIRouter()

CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
SECRET_KEY    = os.getenv("SECRET_KEY")
FRONTEND_URL  = "http://localhost:5173"

@router.get("/auth/login")
def login():
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize"
        f"?client_id={CLIENT_ID}&scope=read:user"
    )

@router.get("/auth/callback")
async def callback(code: str, db: Session = Depends(get_db)):

    # exchange code for access token
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

    # use token to get the user's github username
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    github_user = user_res.json()
    username = github_user["login"]

    # upsert user in DB
    user = db.query(User).filter_by(github_username=username).first()
    if not user:
        user = User(github_username=username, github_token=access_token)
        db.add(user)

        # create default settings for new users
        db.add(Settings(github_username=username))
    else:
        user.github_token = access_token  # refresh token on each login

    db.commit()

    # create a JWT so the frontend knows who's logged in
    jwt_token = jwt.encode(
        {
            "sub": username,
            "exp": datetime.utcnow() + timedelta(days=7),
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    # redirect to frontend with token in URL
    # frontend grabs it once and stores it in memory
    #return RedirectResponse(f"{FRONTEND_URL}/auth?token={jwt_token}")
    return {"token": jwt_token, "username": username}

def get_current_user(token: str, db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter_by(github_username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user