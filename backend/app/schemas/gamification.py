"""Gamification schemas: leaderboard (frontend contract)."""

from __future__ import annotations

from pydantic import BaseModel


class LeaderboardUser(BaseModel):
    rank: int
    id: str
    username: str
    avatar_url: str = ""
    weekly_xp: int
    is_current_user: bool


class LeaderboardResponse(BaseModel):
    """Envelope kept for documentation; the endpoint returns the array form
    the frontend expects (list[LeaderboardUser])."""

    league: str
    entries: list[LeaderboardUser]
