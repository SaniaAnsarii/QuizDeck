from sqlalchemy import Column,String,Integer
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id=Column(Integer,primary_key=True,index=True)
    email=Column(String,unique=True)
    password=Column(String)