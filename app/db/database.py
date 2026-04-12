from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
from app.models.user import User
from app.models.question import Question
from app.models.short_question import ShortQuestion      
from app.models.coding_question import CodingQuestion 
Base.metadata.create_all(bind=engine)