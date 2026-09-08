"""Domain enums shared across layers.

All enums subclass ``str`` so they serialize naturally to and from JSON, and
every member's name equals its value, which keeps the SQLAlchemy
non-native-enum storage unambiguous.
"""

from __future__ import annotations

from enum import StrEnum


class ExerciseType(StrEnum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    WORD_BANK = "WORD_BANK"
    MATCH = "MATCH"
    FILL_BLANK = "FILL_BLANK"
    TYPE_ANSWER = "TYPE_ANSWER"


class AttemptStatus(StrEnum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ABANDONED = "ABANDONED"


class XPReason(StrEnum):
    LESSON_COMPLETION = "LESSON_COMPLETION"
    ACHIEVEMENT = "ACHIEVEMENT"
    DAILY_GOAL = "DAILY_GOAL"
    PRACTICE = "PRACTICE"
    ADMIN = "ADMIN"


class SkillState(StrEnum):
    LOCKED = "LOCKED"
    AVAILABLE = "AVAILABLE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class AchievementCriteriaType(StrEnum):
    FIRST_LESSON = "FIRST_LESSON"
    TOTAL_XP = "TOTAL_XP"
    STREAK_THRESHOLD = "STREAK_THRESHOLD"
    SKILLS_COMPLETED = "SKILLS_COMPLETED"
    LESSONS_COMPLETED = "LESSONS_COMPLETED"
