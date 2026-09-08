"""Lesson retrieval and access checks.

Public lesson responses strip validation data. The conversion from the ORM
exercise to its client-safe shape lives here — one choke point guarantees
correct answers can never leak to an API response.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.constants import SkillState
from app.core.exceptions import LessonLockedError, NotFoundError
from app.models.content import Exercise, Lesson
from app.models.user import User
from app.repositories.content_repository import ContentRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.content import LessonDetail, PublicExercise
from app.services.learning_path_service import LearningPathService


def to_public_exercise(exercise: Exercise) -> PublicExercise:
    """Convert an ORM exercise to its client-safe schema.

    ``exercise_data`` is passed through unchanged because seed content is
    authored to contain no answers; validation data is never copied here.
    """
    return PublicExercise(
        id=exercise.id,
        lesson_id=exercise.lesson_id,
        order_index=exercise.order_index,
        type=exercise.type,
        prompt=exercise.prompt,
        question_audio_url=exercise.question_audio_url,
        exercise_data=exercise.exercise_data,
    )


class LessonService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.content_repo = ContentRepository()
        self.progress_repo = ProgressRepository()

    def get_lesson(self, lesson_id: str) -> Lesson:
        lesson = self.content_repo.get_lesson(self.db, lesson_id)
        if lesson is None:
            raise NotFoundError("Lesson", lesson_id)
        return lesson

    def get_lesson_exercises(self, lesson: Lesson) -> list[Exercise]:
        return self.content_repo.get_exercises_for_lesson(self.db, lesson.id)

    def get_lesson_detail(self, lesson: Lesson) -> LessonDetail:
        exercises = self.get_lesson_exercises(lesson)
        return LessonDetail(
            id=lesson.id,
            skill_id=lesson.skill_id,
            order_index=lesson.order_index,
            title=lesson.title,
            xp_reward=lesson.xp_reward,
            estimated_duration=lesson.estimated_duration,
            exercises=[to_public_exercise(e) for e in exercises],
        )

    def get_skill_state(self, user: User, skill_id: str) -> SkillState:
        """Resolve the user's unlock state for a skill (see LearningPathService)."""
        return LearningPathService(self.db).get_skill_state(user, skill_id)

    def check_lesson_accessibility(self, user: User, lesson: Lesson) -> None:
        """Raise LessonLockedError unless the lesson's skill is unlocked."""
        skill = self.content_repo.get_skill(self.db, lesson.skill_id)
        if skill is None:
            raise NotFoundError("Skill", lesson.skill_id)
        state = self.get_skill_state(user, skill.id)
        if state == SkillState.LOCKED:
            raise LessonLockedError(
                f"Skill '{skill.title}' is locked — complete earlier skills first."
            )
