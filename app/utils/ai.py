
from groq import Groq

import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
def grade_answer(question: str, sample_answer: str, user_answer: str) -> dict:
    prompt = f"""
You are a strict but fair interview coach grading a candidate's answer.

Question: {question}
Sample Answer: {sample_answer}
Candidate's Answer: {user_answer}

Grade the candidate's answer from 0 to 100 based on accuracy, completeness, and clarity.
Reply ONLY in this exact format:
SCORE: <number>
FEEDBACK: <2-3 sentences of constructive feedback>
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
    )

    text = response.choices[0].message.content
    lines = text.strip().split("\n")
    score = 50
    feedback = text

    for line in lines:
        if line.startswith("SCORE:"):
            try: score = int(line.replace("SCORE:", "").strip())
            except: pass
        if line.startswith("FEEDBACK:"):
            feedback = line.replace("FEEDBACK:", "").strip()

    return {"score": score, "feedback": feedback}
def generate_feedback(score: str) -> dict:
    prompt = f"""
You are an expert technical interview coach.
A candidate just completed a quiz and scored {score}%.

Give them:
1. A short motivating message based on their score
2. Two specific tips to improve their interview performance

Keep it concise, friendly, and actionable. Max 4 sentences total.
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
    )

    feedback_text = response.choices[0].message.content

    return {
        "score": int(score),
        "feedback": feedback_text,
    }

