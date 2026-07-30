import os

# app.config.Settings() reads these at import time — set test values before any
# app.* module is imported so the whole app boots against a throwaway SQLite DB
# instead of trying to reach a real Postgres.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_hub.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine, SessionLocal
from app.main import app
from app.config import settings


@pytest.fixture(autouse=True)
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    settings.hub_collector_key = "test-collector-key"
    return TestClient(app)
