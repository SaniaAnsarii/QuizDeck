from sqlalchemy import String,Integer,JSON,Column
from app.db.database import Base

class Question(Base):
    __tablename__ = "questions"
    id=Column(Integer,primary_key=True,index=True)
    question=Column(String)
    options=Column(JSON)
    correct_answers=Column(JSON)