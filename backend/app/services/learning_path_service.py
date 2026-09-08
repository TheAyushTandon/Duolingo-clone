"""Learning path aggregation and skill unlock rules.

All unlock logic lives here — the frontend only renders the resolved
LOCKED / AVAILABLE / IN_PROGRESS / COMPLETED states.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.constants import SkillState
from app.core.exceptions import NotFoundError
from app.models.attempt import LessonAttempt
from app.models.content import Skill, Unit
from app.models.gamification import UserActivity
from app.models.user import User
from app.repositories.content_repository import ContentRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.content import LessonSummary
from app.schemas.learning_path import (
    CourseSummary,
    LearningPathResponse,
    SkillPathNode,
    UnitPathItem,
    UserStatsSummary,
)
from app.services.progress_service import ProgressService
from app.utils.dates import is_same_day, today_utc


class LearningPathService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.content_repo = ContentRepository()
        self.progress_repo = ProgressRepository()
        self.progress_service = ProgressService(db)

    # ------------------------------------------------------- unlock rules ---

    def get_skill_state(self, user: User, skill_id: str) -> SkillState:
        """Resolve one skill's state.

        * first skill in the course -> AVAILABLE
        * previous skill completed -> AVAILABLE
        * partial progress -> IN_PROGRESS
        * all lessons completed -> COMPLETED
        * otherwise -> LOCKED
        """
        skill = self.content_repo.get_skill(self.db, skill_id)
        if skill is None:
            return SkillState.LOCKED

        progress = self.progress_repo.get_skill_progress(self.db, user.id, skill.id)
        if progress is not None and progress.is_completed:
            return SkillState.COMPLETED

        # Lock rule: a skill is available only if it is the first skill in
        # its course path or the previous skill is completed.
        course_skills = self._ordered_course_skills(self.db, skill)
        index = next((i for i, s in enumerate(course_skills) if s.id == skill.id), None)
        if index is None:
            return SkillState.LOCKED

        if index == 0:
            unlocked = True
        else:
            previous = course_skills[index - 1]
            previous_progress = self.progress_repo.get_skill_progress(self.db, user.id, previous.id)
            unlocked = previous_progress is not None and previous_progress.is_completed

        if not unlocked:
            return SkillState.LOCKED

        if progress is not None and progress.progress_percentage > 0:
            return SkillState.IN_PROGRESS
        return SkillState.AVAILABLE

    def _ordered_course_skills(self, db: Session, skill: Skill) -> list[Skill]:
        """All skills of the skill's course in path order."""
        unit = db.get(Unit, skill.unit_id)
        if unit is None:
            return [skill]
        return self.content_repo.get_skills_for_course(db, unit.course_id)

    # ------------------------------------------------------ path assembly ---

    def get_learning_path(self, user: User, course_id: str | None = None) -> LearningPathResponse:
        """Resolve the course: explicit id > user's active course > first active."""
        course = None
        if course_id:
            course = self.content_repo.get_course(self.db, course_id)
        elif user.active_course_id:
            course = self.content_repo.get_course(self.db, user.active_course_id)
        course = course or self.content_repo.get_default_course(self.db)
        if course is None:
            raise NotFoundError("Course", course_id or "<default>")
        units_response: list[UnitPathItem] = []
        for unit in self.content_repo.get_units_for_course(self.db, course.id):
            units_response.append(
                UnitPathItem(
                    id=unit.id,
                    title=unit.title,
                    description=unit.description,
                    banner_color=unit.banner_color,
                    order_index=unit.order_index,
                    skills=[self._build_skill_summary(user, s) for s in self._unit_skills(unit.id)],
                )
            )

        # Calculate active days for the current week (Sunday through Saturday)
        today = today_utc()
        days_since_sunday = (today.weekday() + 1) % 7
        sunday = today - dt.timedelta(days=days_since_sunday)
        saturday = sunday + dt.timedelta(days=6)

        activities = self.db.scalars(
            select(UserActivity.activity_date).where(
                UserActivity.user_id == user.id,
                UserActivity.activity_date >= sunday,
                UserActivity.activity_date <= saturday,
            )
        ).all()
        active_days = [a.isoformat() for a in activities]
        streak_active_today = user.last_active_date is not None and is_same_day(
            user.last_active_date, today
        )

        return LearningPathResponse(
            course=CourseSummary(
                id=course.id,
                title=course.title,
                code=course.code,
                description=course.description,
                flag_icon=course.flag_icon,
                speech_locale=course.speech_locale,
            ),
            user_stats=UserStatsSummary(
                xp=user.xp,
                gems=user.gems,
                hearts=user.hearts,
                max_hearts=user.max_hearts,
                streak=user.streak,
                streak_active_today=streak_active_today,
                active_days=active_days,
            ),
            units=units_response,
        )

    def _unit_skills(self, unit_id: str) -> list[Skill]:
        return self.content_repo.get_skills_for_unit(self.db, unit_id)

    def _build_skill_summary(self, user: User, skill: Skill) -> SkillPathNode:
        state = self.get_skill_state(user, skill.id)
        progress = self.progress_repo.get_skill_progress(self.db, user.id, skill.id)

        lessons = self.content_repo.get_lessons_for_skill(self.db, skill.id)
        completed, _total, percentage = self.progress_service.calculate_skill_completion(
            user, skill
        )

        next_lesson_id: str | None = None
        if not (progress is not None and progress.is_completed):
            completed_ids = set(
                self.db.scalars(
                    select(LessonAttempt.lesson_id).where(
                        LessonAttempt.user_id == user.id,
                        LessonAttempt.status == "COMPLETED",
                    )
                )
            )
            next_lesson = next(
                (lesson for lesson in lessons if lesson.id not in completed_ids), None
            )
            next_lesson_id = next_lesson.id if next_lesson else None

        return SkillPathNode(
            id=skill.id,
            title=skill.title,
            description=skill.description,
            icon=skill.icon,
            order_index=skill.order_index,
            total_levels=skill.total_levels,
            state=state,
            level=progress.level if progress else 1,
            progress_percentage=percentage,
            total_lessons=len(lessons),
            completed_lessons=completed,
            next_lesson_id=next_lesson_id,
            lessons=[
                LessonSummary(
                    id=lesson.id,
                    title=lesson.title,
                    order_index=lesson.order_index,
                    xp_reward=lesson.xp_reward,
                    estimated_duration=lesson.estimated_duration,
                )
                for lesson in lessons
            ],
        )
