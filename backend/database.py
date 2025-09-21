from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import create_engine

from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE")
if not DATABASE_URL:
    raise RuntimeError("DATABASE environment variable is required")

# Use psycopg (v3) driver for Postgres
if DATABASE_URL.startswith("postgresql+psycopg://"):
    pass  # Already correct
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
