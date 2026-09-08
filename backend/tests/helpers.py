"""Shared test helpers: fetching seeded content and exercising lesson flows."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import Course, Exercise, Lesson, Skill


def get_course(db: Session) -> Course:
    course = db.scalar(select(Course))
    assert course is not None
    return course


def get_skill_by_title(db: Session, title: str) -> Skill:
    skill = db.scalar(select(Skill).where(Skill.title == title))
    assert skill is not None
    return skill


def get_lesson_by_title(db: Session, title: str) -> Lesson:
    lesson = db.scalar(select(Lesson).where(Lesson.title == title))
    assert lesson is not None
    return lesson


def get_lesson_exercises(db: Session, lesson: Lesson) -> list[Exercise]:
    return list(
        db.scalars(
            select(Exercise).where(Exercise.lesson_id == lesson.id).order_by(Exercise.order_index)
        )
    )


def correct_answer_for(exercise: Exercise) -> dict[str, object]:
    """Derive a correct submission from validation data (mirrors a learner)."""
    validation = exercise.validation_data or {}
    etype = exercise.type

    if etype == "MULTIPLE_CHOICE":
        return {"selected_option": str(validation["correct_option_ids"][0])}
    if etype == "WORD_BANK":
        return {"selected_words": validation["accepted_answers"][0]}
    if etype == "MATCH":
        return {
            "pairs": [
                {"left": left, "right": right}
                for left, right in validation["correct_pairs"].items()
            ]
        }
    if etype == "FILL_BLANK":
        return {"selected_option": validation["accepted_answers"][0]}
    if etype == "TYPE_ANSWER":
        return {"answer": validation["accepted_answers"][0]}
    raise AssertionError(f"unknown type {etype}")


def wrong_answer_for(exercise: Exercise) -> dict[str, object]:
    """A well-shaped but definitely incorrect submission for the exercise type."""
    etype = exercise.type
    if etype in ("MULTIPLE_CHOICE", "FILL_BLANK"):
        return {"selected_option": "__wrong__"}
    if etype == "WORD_BANK":
        return {"selected_words": ["__wrong__"]}
    if etype == "TYPE_ANSWER":
        return {"answer": "__wrong__"}
    if etype == "MATCH":
        pairs = (exercise.validation_data or {}).get("correct_pairs", {})
        return {"pairs": [{"left": left, "right": "__wrong__"} for left in pairs]}
    raise AssertionError(f"unknown type {etype}")
