"""Leaderboard bot seed (idempotent per week)."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.leaderboard import LeaderboardEntry
from app.utils.dates import today_utc, week_start

BOTS: list[dict[str, object]] = [
    {"display_name": "Maria", "avatar_url": None, "weekly_xp": 520},
    {"display_name": "Alex", "avatar_url": None, "weekly_xp": 430},
    {"display_name": "Sofia", "avatar_url": None, "weekly_xp": 385},
    {"display_name": "Leo", "avatar_url": None, "weekly_xp": 340},
    {"display_name": "Emma", "avatar_url": None, "weekly_xp": 295},
    {"display_name": "Carlos", "avatar_url": None, "weekly_xp": 240},
    {"display_name": "Nina", "avatar_url": None, "weekly_xp": 190},
    {"display_name": "Lucas", "avatar_url": None, "weekly_xp": 140},
    {"display_name": "Mia", "avatar_url": None, "weekly_xp": 90},
    {"display_name": "Oliver", "avatar_url": None, "weekly_xp": 45},
]


def seed_leaderboard(db: Session) -> list[LeaderboardEntry]:
    """Seed bot entries for the current week if absent."""
    from app.repositories.leaderboard_repository import LeaderboardRepository

    current_week = week_start(today_utc())
    existing = LeaderboardRepository().get_bot_entries_for_week(db, current_week)
    if existing:
        return existing

    entries = [
        LeaderboardEntry(
            display_name=str(bot["display_name"]),
            avatar_url=bot.get("avatar_url"),
            league="Bronze",
            weekly_xp=int(str(bot["weekly_xp"])),
            week_start=current_week,
            is_bot=True,
        )
        for bot in BOTS
    ]
    for entry in entries:
        db.add(entry)
    db.commit()
    return entries
