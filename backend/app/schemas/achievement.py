"""Achievement schemas."""

from __future__ import annotations

import datetime as dt

from pydantic import BaseModel


class AchievementOut(BaseModel):
    id: str
    name: str
    description: str
    icon: str | None
    xp_reward: int
    is_unlocked: bool
    unlocked_at: dt.datetime | None = None


class AchievementsResponse(BaseModel):
    items: list[AchievementOut]
