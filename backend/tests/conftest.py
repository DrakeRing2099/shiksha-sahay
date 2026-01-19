import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.db.base import Base
from app.db.session import get_db


@pytest.fixture(scope="session")
def engine():
    # Must be Postgres (UUID/Enum/JSONB types)
    url = os.environ.get("TEST_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("Set TEST_DATABASE_URL (recommended) or DATABASE_URL for tests.")

    eng = create_engine(url, future=True)
    return eng


@pytest.fixture(scope="session", autouse=True)
def create_test_schema(engine):
    # Create tables once per session (assumes empty test DB)
    Base.metadata.create_all(bind=engine)
    yield
    # Optional cleanup:
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(engine):
    connection = engine.connect()
    transaction = connection.begin()
    TestingSessionLocal = sessionmaker(bind=connection, autoflush=False, autocommit=False, future=True)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db_session, monkeypatch):
    # Force deterministic env for tests
    monkeypatch.setenv("OTP_PEPPER", "test-pepper")
    monkeypatch.setenv("AUTH_JWT_SECRET", "test-secret")
    monkeypatch.setenv("AUTH_JWT_ALG", "HS256")
    monkeypatch.setenv("AUTH_ACCESS_MIN", "30")
    monkeypatch.setenv("AUTH_REFRESH_DAYS", "14")
    monkeypatch.setenv("OTP_TTL_MIN", "5")
    monkeypatch.setenv("OTP_MAX_ATTEMPTS", "5")
    monkeypatch.setenv("OTP_DEV_RETURN", "1")  # so request-otp returns dev_otp

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
