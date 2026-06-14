from sqlalchemy import create_engine, Column, String, Boolean, DateTime, JSON, Integer, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,    # verifies connection is alive before using it
    pool_recycle=300,      # recycles connections every 5 minutes
)
print(f"Connecting to: {DATABASE_URL[:30]}...")
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    github_username = Column(String, primary_key=True)
    github_token    = Column(String, nullable=False)
    created_at      = Column(DateTime, default=datetime.now)

class Settings(Base):
    __tablename__ = "settings"

    github_username      = Column(String, primary_key=True)
    custom_name          = Column(String, nullable=True)
    accent_color         = Column(String, default="#534AB7")
    background           = Column(String, default="#0d1117")
    font                 = Column(String, default="sans")
    font_color           = Column(String, default="#c9d1d9")
    show_language_bar    = Column(Boolean, default=True)
    show_heatmap         = Column(Boolean, default=True)
    show_scores          = Column(Boolean, default=True)
    max_repos            = Column(Integer, nullable=True)
    custom_bio           = Column(String, nullable=True)
    profile_description  = Column(String, nullable=True)
    featured_repo        = Column(String, nullable=True)
    repo_order           = Column(JSON, default=list)
    hidden_repos         = Column(JSON, default=list)
    repo_descriptions    = Column(JSON, default=dict)
    repo_skills          = Column(JSON, default=dict)

class RepoCache(Base):
    __tablename__ = "repo_cache"

    github_username = Column(String, primary_key=True)
    data            = Column(JSON, nullable=False)
    cached_at       = Column(DateTime, default=datetime.now)


def _migrate(eng):
    """Add new Settings columns to an existing DB without data loss."""
    insp = inspect(eng)
    if "settings" not in insp.get_table_names():
        return
    existing = {col["name"] for col in insp.get_columns("settings")}
    stmts = []
    if "font_color" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN font_color TEXT DEFAULT '#c9d1d9'")
    if "show_scores" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN show_scores BOOLEAN DEFAULT 1")
    if "max_repos" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN max_repos INTEGER")
    if "repo_order" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN repo_order TEXT DEFAULT '[]'")
    if "profile_description" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN profile_description TEXT")
    if "hidden_repos" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN hidden_repos TEXT DEFAULT '[]'")
    if "repo_descriptions" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN repo_descriptions TEXT DEFAULT '{}'")
    if "repo_skills" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN repo_skills TEXT DEFAULT '{}'")
    if "featured_repo" not in existing:
        stmts.append("ALTER TABLE settings ADD COLUMN featured_repo TEXT")
    if stmts:
        with eng.connect() as conn:
            for stmt in stmts:
                conn.execute(text(stmt))
            conn.commit()




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)
