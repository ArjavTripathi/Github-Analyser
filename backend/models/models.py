from sqlalchemy import create_engine, Column, String, Boolean, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    github_username   = Column(String, primary_key=True)
    github_token      = Column(String, nullable=False)
    created_at        = Column(DateTime, default=datetime.now())

class Settings(Base):
    __tablename__ = "settings"

    github_username   = Column(String, primary_key=True)
    custom_name       = Column(String, nullable=True)
    accent_color      = Column(String, default="#534AB7")
    background        = Column(String, default="#ffffff")
    font              = Column(String, default="sans")
    show_language_bar = Column(Boolean, default=True)
    show_heatmap      = Column(Boolean, default=True)
    custom_bio        = Column(String, nullable=True)
    pinned_repos      = Column(JSON, default=list)


class RepoCache(Base):
    __tablename__ = "repo_cache"

    github_username   = Column(String, primary_key=True)
    data              = Column(JSON, nullable=False)
    cached_at         = Column(DateTime, default=datetime.now())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)