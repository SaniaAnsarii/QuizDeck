from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.question import Question
from app.utils.ai import generate_feedback
from app.routes.dashboard import save_result
from app.models.short_question import ShortQuestion
from app.models.coding_question import CodingQuestion
from app.schemas.question import QuestionCreate, SubmitQuiz, ShortQuestionCreate, CodingQuestionCreate


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.delete("/questions/{id}")
def delete_mcq(id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == id).first()
    if q: db.delete(q); db.commit()
    return {"message": "Deleted"}

@router.delete("/short-questions/{id}")
def delete_short(id: int, db: Session = Depends(get_db)):
    q = db.query(ShortQuestion).filter(ShortQuestion.id == id).first()
    if q: db.delete(q); db.commit()
    return {"message": "Deleted"}

@router.delete("/coding-questions/{id}")
def delete_coding(id: int, db: Session = Depends(get_db)):
    q = db.query(CodingQuestion).filter(CodingQuestion.id == id).first()
    if q: db.delete(q); db.commit()
    return {"message": "Deleted"}

@router.post("/grade-short")
def grade_short_answer(data: dict):
    from app.utils.ai import grade_answer
    return grade_answer(
        question=data["question"],
        sample_answer=data["sample_answer"],
        user_answer=data["user_answer"],
    )
@router.post("/short-questions")
def create_short_question(data: ShortQuestionCreate, db: Session = Depends(get_db)):
    q = ShortQuestion(question=data.question, sample_answer=data.sample_answer)
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"message": "Short question added"}

@router.get("/short-questions")
def get_short_questions(db: Session = Depends(get_db)):
    return db.query(ShortQuestion).all()

@router.post("/coding-questions")
def create_coding_question(data: CodingQuestionCreate, db: Session = Depends(get_db)):
    q = CodingQuestion(
        title=data.title,
        description=data.description,
        test_input=data.test_input,
        expected_output=data.expected_output,
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"message": "Coding problem added"}

@router.get("/coding-questions")
def get_coding_questions(db: Session = Depends(get_db)):
    return db.query(CodingQuestion).all()

@router.get("/questions")
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return questions

@router.post("/questions")
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    question = Question(
        question=data.question,
        options=data.options,
        answers=data.correct_answers
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return {"message": "Question added"}

@router.post("/submit")
def submit_quiz(data: SubmitQuiz, db: Session = Depends(get_db)):
    questions = db.query(Question).all()

    if not questions:
        return {"score": 0, "feedback": "No questions found."}

    correct_count = 0
    results = []
    weak_topics = []

    for i, question in enumerate(questions):
        if i >= len(data.answers):
            break

        user_answer = data.answers[i]
        correct_answers = question.answers or []
        is_correct = user_answer in correct_answers

        if is_correct:
            correct_count += 1
        else:
            weak_topics.append(question.question[:30])

        results.append({
            "question": question.question,
            "your_answer": question.options[user_answer] if user_answer < len(question.options) else "N/A",
            "correct": is_correct,
        })

    score = round((correct_count / len(questions)) * 100)
    feedback = generate_feedback(str(score))

  
    save_result(score, weak_topics)

    return {
        "score": score,
        "correct": correct_count,
        "total": len(questions),
        "feedback": feedback,
        "results": results,
    }