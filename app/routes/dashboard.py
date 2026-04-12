from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.question import Question

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


quiz_results = []

def save_result(score: int, weak_topics: list):
    quiz_results.append({"score": score, "weakTopics": weak_topics})

@router.get("/")
def dashboard():
    if not quiz_results:
        return {
            "totalQuizzes": 0,
            "averageScore": 0,
            "weakTopics": [],
        }

    total = len(quiz_results)
    avg = round(sum(r["score"] for r in quiz_results) / total)
    all_weak = []
    for r in quiz_results:
        all_weak.extend(r["weakTopics"])
  
    weak = list(set(all_weak))

    return {
        "totalQuizzes": total,
        "averageScore": avg,
        "weakTopics": weak,
    }