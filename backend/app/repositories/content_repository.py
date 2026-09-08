"""Course content data access: courses, units, skills, lessons, exercises."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Course, Exercise, Lesson, Skill, Unit


class ContentRepository:
    # ------------------------------------------------------------- courses ---

    def get_active_courses(self, db: Session) -> list[Course]:
        stmt = select(Course).where(Course.is_active.is_(True)).order_by(Course.title)
        return list(db.scalars(stmt))

    def get_course(self, db: Session, course_id: str) -> Course | None:
        course = db.get(Course, course_id)
        if course is not None and not course.is_active:
            return None
        return course

    def get_default_course(self, db: Session) -> Course | None:
        """First active course by title; the seed provides exactly one."""
        courses = self.get_active_courses(db)
        return courses[0] if courses else None

    # --------------------------------------------------------------- units ---

    def get_units_for_course(self, db: Session, course_id: str) -> list[Unit]:
        stmt = (
            select(Unit)
            .where(Unit.course_id == course_id, Unit.is_active.is_(True))
            .order_by(Unit.order_index)
        )
        return list(db.scalars(stmt))

    # -------------------------------------------------------------- skills ---

    def get_skills_for_unit(self, db: Session, unit_id: str) -> list[Skill]:
        stmt = (
            select(Skill)
            .where(Skill.unit_id == unit_id, Skill.is_active.is_(True))
            .order_by(Skill.order_index)
        )
        return list(db.scalars(stmt))

    def get_skill(self, db: Session, skill_id: str) -> Skill | None:
        skill = db.get(Skill, skill_id)
        if skill is not None and not skill.is_active:
            return None
        return skill

    def get_skills_for_course(self, db: Session, course_id: str) -> list[Skill]:
        """All active skills of a course in path order (unit order, then skill order)."""
        stmt = (
            select(Skill)
            .join(Unit, Skill.unit_id == Unit.id)
            .where(Unit.course_id == course_id, Skill.is_active.is_(True), Unit.is_active.is_(True))
            .order_by(Unit.order_index, Skill.order_index)
        )
        return list(db.scalars(stmt))

    # ------------------------------------------------------------- lessons ---

    def get_lesson(self, db: Session, lesson_id: str) -> Lesson | None:
        lesson = db.get(Lesson, lesson_id)
        if lesson is not None and not lesson.is_active:
            return None
        return lesson

    def get_lessons_for_skill(self, db: Session, skill_id: str) -> list[Lesson]:
        stmt = (
            select(Lesson)
            .where(Lesson.skill_id == skill_id, Lesson.is_active.is_(True))
            .order_by(Lesson.order_index)
        )
        return list(db.scalars(stmt))

    # ---------------------------------------------------------- exercises ---

    def get_exercises_for_lesson(self, db: Session, lesson_id: str) -> list[Exercise]:
        stmt = (
            select(Exercise).where(Exercise.lesson_id == lesson_id).order_by(Exercise.order_index)
        )
        return list(db.scalars(stmt))

    def get_exercise(self, db: Session, exercise_id: str) -> Exercise | None:
        return db.get(Exercise, exercise_id)
