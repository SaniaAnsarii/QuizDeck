import os

from fastapi import FastAPI
from app.routes import auth, quiz, dashboard

from fastapi.middleware.cors import CORSMiddleware


_default_origins = "http://localhost:3000,http://127.0.0.1:3000,https://quiz-deck-liard.vercel.app"
_cors_raw = os.getenv("CORS_ORIGINS", _default_origins)
allow_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]

app = FastAPI()

_cors_kw = dict(
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CORSMiddleware, **_cors_kw)

app.include_router(auth.router, prefix="/auth")
app.include_router(quiz.router, prefix="/quiz")
app.include_router(dashboard.router, prefix="/dashboard")

@app.get("/")
def root():
    return {"message": "API running"}