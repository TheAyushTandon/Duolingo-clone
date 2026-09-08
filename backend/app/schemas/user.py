"""User-facing schemas (profile, hearts, stats, activity)."""

from __future__ import annotations

import datetime as dt

from pydantic import BaseModel, Field

from app.schemas.achievement import AchievementOut


class UserProfile(BaseModel):
    id: str
    username: str
    email: str = ""
    avatar_url: str = ""
    xp: int
    gems: int
    hearts: int
    max_hearts: int
    streak: int
    streak_active_today: bool
    achievements: list[AchievementOut] = Field(default_factory=list)
    created_at: dt.datetime


class HeartStatus(BaseModel):
    hearts: int
    max_hearts: int
    missing_hearts: int
    next_heart_in_minutes: int | None = Field(
        description="Minutes until the next heart regenerates; null when full."
    )
    full: bool


class HeartsRefillResponse(BaseModel):
    success: bool
    hearts: int
    max_hearts: int
    gems: int
    message: str


class UserStats(BaseModel):
    xp: int
    gems: int
    streak: int
    hearts: int
    total_lessons_completed: int
    skills_completed: int
    achievements_count: int


class ActivityEntry(BaseModel):
    activity_date: dt.date
    xp_earned: int
    lessons_completed: int


class ActivityPage(BaseModel):
    items: list[ActivityEntry]
    next_cursor: str | None = None


class DevSimulateDayRequest(BaseModel):
    days: int = Field(default=1, ge=1, le=365)
