"""Idempotent orchestrator: content -> achievements -> users -> leaderboard.

Run as:  python -m app.seed.seed_database
"""

from __future__ import annotations

from app.core.database import SessionLocal
from app.seed.seed_achievements import seed_achievements
from app.seed.seed_content import seed_content
from app.seed.seed_leaderboard import seed_leaderboard
from app.seed.seed_users import seed_users


def seed_database() -> None:
    """Seed all demo data. Safe to run repeatedly."""
    db = SessionLocal()
    try:
        courses = seed_content(db)
        print("Courses ready: " + ", ".join(f"{c.title} ({c.code})" for c in courses))

        achievements = seed_achievements(db)
        print(f"Achievements ready: {len(achievements)}")

        user = seed_users(db)
        print(
            f"Demo user ready: {user.username} "
            f"(xp={user.xp}, gems={user.gems}, streak={user.streak})"
        )

        bots = seed_leaderboard(db)
        print(f"Leaderboard bots ready: {len(bots)}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
