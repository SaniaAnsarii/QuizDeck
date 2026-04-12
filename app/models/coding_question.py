from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base

class CodingQuestion(Base):
    __tablename__ = "coding_questions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    test_input = Column(Text)
    expected_output = Column(Text)