"""Skill progress calculation and updates.

Progress rule: completed lessons / total lessons in the skill. A lesson
counts as completed for the user when at least one COMPLETED lesson attempt
exists for it.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.attempt import LessonAttempt
from app.models.base import utc_now
from app.models.content import Skill
from app.models.progress import UserSkillProgress
from app.models.user import User
from app.repositories.content_repository import ContentRepository
from app.repositories.progress_repository import ProgressRepository


class ProgressService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.progress_repo = ProgressRepository()
        self.content_repo = ContentRepository()

    def _completed_lesson_ids(self, user_id: str) -> set[str]:
        stmt = select(LessonAttempt.lesson_id).where(
            LessonAttempt.user_id == user_id,
            LessonAttempt.status == "COMPLETED",
        )
        return set(self.db.scalars(stmt))

    def update_skill_progress(self, user: User, skill: Skill) -> UserSkillProgress:
        """Recalculate and persist the user's progress for one skill."""
        lessons = self.content_repo.get_lessons_for_skill(self.db, skill.id)
        completed_ids = self._completed_lesson_ids(user.id)
        completed_in_skill = [lesson for lesson in lessons if lesson.id in completed_ids]

        progress = self.progress_repo.upsert_skill_progress(self.db, user.id, skill.id)
        if lessons:
            progress.progress_percentage = int(len(completed_in_skill) / len(lessons) * 100)
        else:
            progress.progress_percentage = 100 if progress.is_completed else 0

        if lessons and len(completed_in_skill) == len(lessons):
            progress.is_completed = True
            progress.completed_at = progress.completed_at or utc_now()
            progress.level = skill.total_levels
            progress.progress_percentage = 100
        else:
            progress.is_completed = bool(progress.is_completed)
            progress.level = min(len(completed_in_skill) + 1, max(skill.total_levels, 1))

        return progress

    def calculate_skill_completion(self, user: User, skill: Skill) -> tuple[int, int, int]:
        """Return (completed_lessons, total_lessons, percentage)."""
        lessons = self.content_repo.get_lessons_for_skill(self.db, skill.id)
        completed_ids = self._completed_lesson_ids(user.id)
        completed = sum(1 for lesson in lessons if lesson.id in completed_ids)
        percentage = int(completed / len(lessons) * 100) if lessons else 0
        return completed, len(lessons), percentage

    def get_user_progress(self, user: User) -> dict[str, UserSkillProgress]:
        """All skill progress rows for the user, keyed by skill_id."""
        return self.progress_repo.get_all_skill_progress(self.db, user.id)
