"""Convenience entry points so `python scripts/seed.py` and
`python -m app.seed.seed_database` both work."""

from __future__ import annotations

from app.seed.seed_database import seed_database

if __name__ == "__main__":
    seed_database()
