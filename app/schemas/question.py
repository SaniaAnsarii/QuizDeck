from pydantic import BaseModel
from typing import List

class QuestionResponse(BaseModel):
    id:int
    question:str
    options:List[str]

class SubmitQuiz(BaseModel):
    answers: List[int]

class QuestionCreate(BaseModel):
    question: str
    options: List[str]
    correct_answers: List[int]

class ShortQuestionCreate(BaseModel):
    question: str
    sample_answer: str

class CodingQuestionCreate(BaseModel):
    title: str
    description: str
    test_input: str
    expected_output: str