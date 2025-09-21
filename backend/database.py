from sqlalchemy.orm import sessionmaker, DeclarativeBase

from urllib.parse import quote_plus
from sqlalchemy import create_engine

from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE")

odbc_str = DATABASE_URL

sqlalchemy_url = "mssql+pyodbc:///?odbc_connect=" + quote_plus(odbc_str)

engine = create_engine(sqlalchemy_url, pool_pre_ping=True, fast_executemany=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
