from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv


_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_ROOT / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is missing. Add it to a `.env` file at: "
        f"{_ROOT / '.env'} (same level as the `app` folder), then restart the server."
    )

engine = create_engine(DATABASE_URL,poolclass=NullPool)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
from app.models.user import User
from app.models.question import Question
from app.models.short_question import ShortQuestion      
from app.models.coding_question import CodingQuestion 
Base.metadata.create_all(bind=engine)