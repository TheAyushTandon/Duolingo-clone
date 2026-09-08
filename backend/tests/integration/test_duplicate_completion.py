"""Integration: idempotent lesson completion (the critical duplicate test)."""

from __future__ import annotations

from sqlalchemy import select

from app.models.gamification import XPTransaction
from app.models.user import User
from tests.helpers import correct_answer_for, get_lesson_by_title, get_lesson_exercises


class TestDuplicateCompletion:
    def test_double_complete_awards_xp_once(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()

        lesson = get_lesson_by_title(db, "Introductions")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]

        for exercise in get_lesson_exercises(db, lesson):
            client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": correct_answer_for(exercise)},
                headers=demo_headers,
            )

        first = client.post(f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers)
        assert first.status_code == 200
        xp_after_first = user.xp

        second = client.post(f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers)
        assert second.status_code == 200

        # Identical result payloads.
        assert first.json() == second.json()
        assert second.json()["attempt_id"] == attempt_id

        # Exactly one XP transaction for this attempt.
        transactions = list(
            db.scalars(select(XPTransaction).where(XPTransaction.reference_id == attempt_id))
        )
        assert len(transactions) == 1
        assert user.xp == xp_after_first

    def test_submit_after_completion_rejected(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Introductions")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        exercises = get_lesson_exercises(db, lesson)

        for exercise in exercises:
            client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": correct_answer_for(exercise)},
                headers=demo_headers,
            )
        client.post(f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers)

        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercises[0].id}/submit",
            json={"submitted_answer": correct_answer_for(exercises[0])},
            headers=demo_headers,
        )
        assert response.status_code == 409
        body = response.json()["detail"]
        assert body["code"] == "ATTEMPT_NOT_IN_PROGRESS"
