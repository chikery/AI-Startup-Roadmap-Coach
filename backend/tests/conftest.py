import os

# app.config.Settings() reads these at import time. Force (not setdefault) so a
# real backend/.env with live API keys never leaks into tests — pydantic-settings
# precedence is env var > .env file, so this guarantees hermetic, network-free
# tests regardless of what a developer's local .env happens to contain.
os.environ["DATABASE_URL"] = "sqlite:///./test_hub.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["OPENAI_API_KEY"] = "test-openai-key"
os.environ["SOLAR_API_KEY"] = ""
os.environ["HUB_COLLECTOR_KEY"] = ""
os.environ["KSTARTUP_API_KEY"] = ""
os.environ["BIZINFO_API_KEY"] = ""
os.environ["KOCCA_API_KEY"] = ""

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
