import os

from fastapi import FastAPI
from app.routes import auth, quiz, dashboard

from fastapi.middleware.cors import CORSMiddleware

# Comma-separated origins, e.g. "http://localhost:3000,https://your-app.vercel.app"
# Any request with Authorization triggers a CORS preflight; the origin must be allowed.
_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
_cors_raw = os.getenv("CORS_ORIGINS", _default_origins)
allow_origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]
# Match all Vercel deployments (production + preview) unless CORS_ORIGIN_REGEX is set to empty
_cors_regex = os.getenv("CORS_ORIGIN_REGEX")
if _cors_regex is None:
    allow_origin_regex = r"https://.*\.vercel\.app"
elif _cors_regex.strip() == "":
    allow_origin_regex = None
else:
    allow_origin_regex = _cors_regex.strip()

app = FastAPI()

_cors_kw = dict(
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if allow_origin_regex:
    _cors_kw["allow_origin_regex"] = allow_origin_regex

app.add_middleware(CORSMiddleware, **_cors_kw)

app.include_router(auth.router, prefix="/auth")
app.include_router(quiz.router, prefix="/quiz")
app.include_router(dashboard.router, prefix="/dashboard")

@app.get("/")
def root():
    return {"message": "API running"}