from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.database import engine, Base
from app.api import auth, programs, roadmap, ai, hub
from app.api.ai import limiter
import app.models  # noqa: ensure models are registered
import app.models.business_plan  # noqa

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Startup Roadmap Coach", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.0.100:3000",
        "http://192.168.0.29:3000",
        "https://chikery.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(programs.router)
app.include_router(roadmap.router)
app.include_router(ai.router)
app.include_router(hub.router)


@app.get("/health")
def health():
    return {"status": "ok"}
