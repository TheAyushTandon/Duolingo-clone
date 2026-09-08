"""Weekly leaderboard.

Bot entries are seeded and static. The current user's weekly XP is
calculated live from ``xp_transactions`` for the current week — it is never
duplicated into ``leaderboard_entries``.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy.orm import Session

from app.models.leaderboard import LeaderboardEntry
from app.models.user import User
from app.repositories.leaderboard_repository import LeaderboardRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.gamification import LeaderboardUser
from app.utils.dates import today_utc
from app.utils.dates import week_start as compute_week_start

LEAGUE = "Bronze"


class LeaderboardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.leaderboard_repo = LeaderboardRepository()
        self.progress_repo = ProgressRepository()

    def get_weekly_leaderboard(self, user: User) -> list[LeaderboardUser]:
        """Weekly league leaderboard as a flat ranked array.

        Includes all registered learners who have logged in/created accounts,
        live XP, and seeded bot competitors, sorted descending by XP.
        """
        current_week_start = compute_week_start(today_utc())

        bots = self.leaderboard_repo.get_bot_entries_for_week(self.db, current_week_start)

        week_start_dt = dt.datetime(
            current_week_start.year,
            current_week_start.month,
            current_week_start.day,
            tzinfo=dt.UTC,
        )

        all_users = self.db.query(User).all()
        real_usernames = {u.username.strip().lower() for u in all_users if u.username}

        # Include all real users in the system
        real_user_entries: list[LeaderboardUser] = []
        for u in all_users:
            u_weekly_xp = self.progress_repo.sum_xp_since(self.db, u.id, week_start_dt)
            real_user_entries.append(
                LeaderboardUser(
                    rank=0,
                    id=u.id,
                    username=u.username,
                    avatar_url=u.avatar_url or "",
                    weekly_xp=u_weekly_xp,
                    is_current_user=(u.id == user.id),
                )
            )

        # Include bots that do not conflict with real usernames
        bot_entries: list[LeaderboardUser] = [
            LeaderboardUser(
                rank=0,
                id=bot.id,
                username=bot.display_name,
                avatar_url=bot.avatar_url or "",
                weekly_xp=bot.weekly_xp,
                is_current_user=False,
            )
            for bot in bots
            if bot.display_name.strip().lower() not in real_usernames
        ]

        combined: list[LeaderboardUser] = real_user_entries + bot_entries

        # Sort by XP descending, then by username for a stable order at ties.
        combined.sort(key=lambda entry: (-entry.weekly_xp, entry.username.lower()))

        for index, entry in enumerate(combined, start=1):
            entry.rank = index

        return combined

    def seed_bot_entries_if_missing(
        self, week: dt.date, bots: list[dict[str, object]]
    ) -> list[LeaderboardEntry]:
        """Used by the seed system; kept here so bot/week logic stays together."""
        existing = self.leaderboard_repo.get_bot_entries_for_week(self.db, week)
        if existing:
            return existing
        entries = [
            LeaderboardEntry(
                display_name=str(bot["display_name"]),
                avatar_url=bot.get("avatar_url"),
                league=str(bot.get("league", LEAGUE)),
                weekly_xp=int(str(bot.get("weekly_xp", 0))),
                week_start=week,
                is_bot=True,
            )
            for bot in bots
        ]
        for entry in entries:
            self.db.add(entry)
        return entries
