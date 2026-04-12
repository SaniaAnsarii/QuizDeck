from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base

class ShortQuestion(Base):
    __tablename__ = "short_questions"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text)
    sample_answer = Column(Text)