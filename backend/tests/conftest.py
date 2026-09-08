"""Pytest fixtures.

Every test gets its own fresh in-memory SQLite database (schema + seed).
This is deliberately chosen over transaction/savepoint rollback: the stock
pysqlite driver does not implement SAVEPOINT semantics correctly, so
"commit inside an outer transaction" leaks between tests. A disposable
database per test cannot leak by construction.

Authentication is real (register/login under test) — the client fixture
does NOT override get_current_user; tests use bearer tokens or the
demo-seeded credentials via `demo_headers`.
"""

from __future__ import annotations

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Must be set before any app import so the app-level engine binds somewhere
# harmless. Tests never use that engine — requests are served through a
# per-test session via dependency override.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["DEMO_USERNAME"] = "demo_learner"
os.environ["ENABLE_DEV_TOOLS"] = "true"
os.environ["ENVIRONMENT"] = "testing"
os.environ["RATE_LIMIT_ENABLED"] = "false"

from app.core.database import Base, get_db  # noqa: E402
from app.seed.seed_achievements import seed_achievements  # noqa: E402
from app.seed.seed_content import seed_content  # noqa: E402
from app.seed.seed_leaderboard import seed_leaderboard  # noqa: E402
from app.seed.seed_users import seed_users  # noqa: E402

DEMO_USERNAME = "demo_learner"
DEMO_PASSWORD = "duolingo123"


def _make_test_engine():
    """Single-connection in-memory engine with FK enforcement.

    ``StaticPool`` keeps one shared connection so every session (including
    requests dispatched by TestClient's worker thread) sees the same data.
    """
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(test_engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, _record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return test_engine


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    """Fresh session on a fresh seeded in-memory database."""
    test_engine = _make_test_engine()
    Base.metadata.create_all(test_engine)

    factory = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)
    session = factory()
    seed_content(session)
    seed_achievements(session)
    seed_users(session)
    seed_leaderboard(session)

    yield session

    session.close()
    test_engine.dispose()


@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    """TestClient whose get_db dependency resolves to the per-test session.

    Authentication is NOT overridden: tests authenticate as the seeded demo
    user (helper below) or register fresh users.
    """
    from app.main import app

    def _override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def client_no_raise(db: Session) -> Generator[TestClient, None, None]:
    """Like ``client`` but server exceptions return a 500 response instead
    of being re-raised — for testing the error path/rollback behavior."""
    from app.main import app

    def _override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def demo_headers(client) -> dict[str, str]:
    """Bearer headers for the seeded demo learner."""
    response = client.post(
        "/api/v1/login",
        json={"username": DEMO_USERNAME, "password": DEMO_PASSWORD},
    )
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
