"""Aggregates all ORM models so ``Base.metadata`` is complete.

Alembic and any schema-creation code must import this package.
"""

from __future__ import annotations

from app.models.achievement import Achievement, UserAchievement
from app.models.attempt import ExerciseAttempt, LessonAttempt
from app.models.content import Course, Exercise, Lesson, Skill, Unit
from app.models.gamification import UserActivity, XPTransaction
from app.models.leaderboard import LeaderboardEntry
from app.models.progress import UserSkillProgress
from app.models.user import User

__all__ = [
    "Achievement",
    "Course",
    "Exercise",
    "ExerciseAttempt",
    "LeaderboardEntry",
    "Lesson",
    "LessonAttempt",
    "Skill",
    "Unit",
    "User",
    "UserAchievement",
    "UserActivity",
    "UserSkillProgress",
    "XPTransaction",
]
