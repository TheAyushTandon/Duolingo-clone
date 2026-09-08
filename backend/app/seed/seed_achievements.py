"""Achievement seed.

Idempotent: achievements are keyed by their unique ``name``.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.achievement import Achievement

ACHIEVEMENTS: list[dict] = [
    {
        "name": "First Steps",
        "description": "Complete your first lesson",
        "icon": "👣",
        "criteria": {"type": "FIRST_LESSON", "value": 1},
        "xp_reward": 5,
    },
    {
        "name": "XP Explorer",
        "description": "Earn 100 XP",
        "icon": "⚡",
        "criteria": {"type": "TOTAL_XP", "value": 100},
        "xp_reward": 10,
    },
    {
        "name": "Week Warrior",
        "description": "Reach a 7-day streak",
        "icon": "🔥",
        "criteria": {"type": "STREAK_THRESHOLD", "value": 7},
        "xp_reward": 15,
    },
    {
        "name": "Skill Master",
        "description": "Complete a skill",
        "icon": "🏆",
        "criteria": {"type": "SKILLS_COMPLETED", "value": 1},
        "xp_reward": 10,
    },
    {
        "name": "Dedicated Learner",
        "description": "Complete 5 lessons",
        "icon": "📚",
        "criteria": {"type": "LESSONS_COMPLETED", "value": 5},
        "xp_reward": 10,
    },
]


def seed_achievements(db: Session) -> list[Achievement]:
    existing = {a.name for a in db.scalars(select(Achievement))}
    created: list[Achievement] = []
    for spec in ACHIEVEMENTS:
        if spec["name"] in existing:
            continue
        achievement = Achievement(
            name=spec["name"],
            description=spec["description"],
            icon=spec["icon"],
            criteria=spec["criteria"],
            xp_reward=spec["xp_reward"],
        )
        db.add(achievement)
        created.append(achievement)
    db.commit()
    return list(db.scalars(select(Achievement)))
