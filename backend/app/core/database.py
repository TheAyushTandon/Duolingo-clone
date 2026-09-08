"""Database engine and session management.

SQLite is used for development. The engine is configured so a later switch to
PostgreSQL only requires changing ``DATABASE_URL``:

* ``check_same_thread=False`` is needed because FastAPI serves requests on a
  thread pool while sessions are short-lived and never shared across threads.
* Foreign keys are enforced via a PRAGMA on every new SQLite connection.
"""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def _ensure_sqlite_dir(database_url: str) -> None:
    """Create the parent directory of a SQLite file database if missing."""
    if not database_url.startswith("sqlite:///"):
        return
    # Strip the dialect prefix and any leading slashes from the path.
    raw_path = database_url[len("sqlite:///") :]
    if not raw_path or raw_path == ":memory:":
        return
    db_path = Path(raw_path).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    # Keep an empty .gitignore so the runtime data directory is never committed.
    gitignore = db_path.parent / ".gitignore"
    if not gitignore.exists():
        gitignore.write_text("*\n", encoding="utf-8")


_database_url = get_settings().database_url
_ensure_sqlite_dir(_database_url)

engine = create_engine(
    _database_url,
    connect_args={"check_same_thread": False} if _database_url.startswith("sqlite") else {},
    echo=False,
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_connection: object, _connection_record: object) -> None:
    """Enforce foreign keys on SQLite (off by default per connection)."""
    from sqlite3 import Connection as SQLiteConnection

    if isinstance(dbapi_connection, SQLiteConnection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a request-scoped session.

    Services own their commits; this dependency only guarantees rollback of
    uncommitted work if a request dies mid-transaction.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


__all__ = ["Base", "engine", "SessionLocal", "get_db", "_ensure_sqlite_dir"]
