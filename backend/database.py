from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import create_engine

from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE")
if not DATABASE_URL:
    raise RuntimeError("DATABASE environment variable is required")

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
