from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.api import auth, programs, roadmap, ai
import app.models  # noqa: ensure models are registered

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Startup Roadmap Coach", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(programs.router)
app.include_router(roadmap.router)
app.include_router(ai.router)


@app.get("/health")
def health():
    return {"status": "ok"}
