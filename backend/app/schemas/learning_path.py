"""Learning path schemas with server-resolved unlock states."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.constants import SkillState
from app.schemas.content import LessonSummary


class SkillPathNode(BaseModel):
    id: str
    title: str
    description: str | None
    icon: str | None
    order_index: int
    total_levels: int

    state: SkillState
    level: int
    progress_percentage: int

    total_lessons: int
    completed_lessons: int
    next_lesson_id: str | None = Field(
        description="First uncompleted lesson in this skill, if any."
    )
    lessons: list[LessonSummary] = Field(default_factory=list)


class UnitPathItem(BaseModel):
    id: str
    title: str
    description: str | None
    banner_color: str | None
    order_index: int
    skills: list[SkillPathNode]


class CourseSummary(BaseModel):
    id: str
    title: str
    code: str
    description: str | None
    flag_icon: str | None
    speech_locale: str | None = Field(
        default=None,
        description="BCP-47 locale for native-tongue narration (e.g. fr-FR).",
    )


class UserStatsSummary(BaseModel):
    xp: int
    gems: int
    hearts: int
    max_hearts: int
    streak: int
    streak_active_today: bool = False
    active_days: list[str] = Field(
        default_factory=list,
        description="ISO date strings for active days in the current week",
    )


class LearningPathResponse(BaseModel):
    course: CourseSummary
    user_stats: UserStatsSummary
    units: list[UnitPathItem]
