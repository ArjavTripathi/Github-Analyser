from sqlalchemy.orm import Session
from schemas.models import User, Settings, RepoCache
from datetime import datetime

def get_user(db: Session, username: str) -> User | None:
    return db.query(User).filter_by(github_username=username).first()

def create_user(db: Session, username: str, token: str) -> User:
    user = User(github_username=username, github_token=token)
    db.add(user)
    db.commit()
    db.refresh(user) 
    return user

def upsert_user(db: Session, username: str, token: str) -> User:
    user = get_user(db, username)
    if not user:
        return create_user(db, username, token)
    user.github_token = token
    db.commit()
    return user

def get_settings(db: Session, username: str) -> Settings | None:
    return db.query(Settings).filter_by(github_username=username).first()

def create_default_settings(db: Session, username: str) -> Settings:
    settings = Settings(github_username=username)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings

def update_settings(db: Session, username: str, payload: dict) -> Settings:
    settings = get_settings(db, username)
    for key, value in payload.items():
        if hasattr(settings, key):   # only update columns that exist
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

def get_cache(db: Session, username: str) -> RepoCache | None:
    return db.query(RepoCache).filter_by(github_username=username).first()

def set_cache(db: Session, username: str, data: dict) -> RepoCache:
    cache = get_cache(db, username)
    if not cache:
        cache = RepoCache(github_username=username, data=data)
        db.add(cache)
    else:
        cache.data = data
        cache.cached_at = datetime.now()
    db.commit()
    return cache
