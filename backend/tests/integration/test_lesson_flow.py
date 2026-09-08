"""Integration: full lesson completion flow through the HTTP API.

Start -> correct submissions -> complete -> verify XP, progress, activity, streak.
"""

from __future__ import annotations

import datetime as dt

from sqlalchemy import select

from app.models.gamification import UserActivity, XPTransaction
from app.models.user import User
from tests.helpers import (
    correct_answer_for,
    get_lesson_by_title,
    get_lesson_exercises,
    wrong_answer_for,
)


def _get_demo(db) -> User:
    return db.query(User).filter_by(username="demo_learner").one()


class TestLessonCompletionFlow:
    def test_full_flow_awards_everything_once(self, client, db, demo_headers) -> None:
        user = _get_demo(db)
        xp_before = user.xp
        gems_before = user.gems
        streak_before = user.streak

        # "Hello!" is the first lesson of the (already-completed) Greetings
        # skill; completing it again via a fresh attempt is allowed.
        lesson = get_lesson_by_title(db, "Hello!")
        response = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers)
        assert response.status_code == 201, response.text
        attempt_id = response.json()["attempt_id"]

        exercises = get_lesson_exercises(db, lesson)
        for exercise in exercises:
            payload = correct_answer_for(exercise)
            result = client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": payload},
                headers=demo_headers,
            )
            assert result.status_code == 200, result.text
            body = result.json()
            assert body["is_correct"] is True
            assert body["hearts_remaining"] == 5

        completion = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers
        )
        assert completion.status_code == 200, completion.text
        result = completion.json()
        assert result["xp_awarded"] == lesson.xp_reward
        assert result["gems_awarded"] >= 5  # lesson gem reward
        # Seed marks the user active yesterday, so today's lesson increments.
        assert result["streak"] == streak_before + 1

        # XP ledger has exactly one transaction for this attempt.
        transactions = list(
            db.scalars(
                select(XPTransaction).where(
                    XPTransaction.user_id == user.id,
                    XPTransaction.reference_id == attempt_id,
                )
            )
        )
        assert len(transactions) == 1
        assert user.xp == xp_before + lesson.xp_reward + sum(
            a["xp_reward"] for a in result.get("new_achievements", [])
        )
        assert user.gems == gems_before + result["gems_awarded"]

        # Activity row updated for today.
        activity = db.scalar(
            select(UserActivity).where(
                UserActivity.user_id == user.id,
                UserActivity.activity_date == dt.date.today(),
            )
        )
        assert activity is not None
        assert activity.lessons_completed >= 1

    def test_attempt_resume_returns_existing(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Hello!")
        first = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers).json()
        second = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers).json()
        assert second["attempt_id"] == first["attempt_id"]

    def test_fresh_user_lesson_completion_has_valid_boolean_is_skill_completed(
        self, client, db
    ) -> None:
        reg = client.post(
            "/api/v1/register",
            json={"username": "brand_new_learner", "password": "password123"},
        )
        assert reg.status_code == 201
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        lesson = get_lesson_by_title(db, "Hello!")
        response = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=headers)
        assert response.status_code == 201
        attempt_id = response.json()["attempt_id"]

        for exercise in get_lesson_exercises(db, lesson):
            client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": correct_answer_for(exercise)},
                headers=headers,
            )

        completion = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=headers
        )
        assert completion.status_code == 200
        data = completion.json()
        assert isinstance(data["is_skill_completed"], bool)
        assert data["is_skill_completed"] is False or data["is_skill_completed"] is True


class TestWrongAnswersFlow:
    def test_wrong_answers_lose_hearts_then_fail(self, client, db, demo_headers) -> None:
        user = _get_demo(db)
        xp_before = user.xp

        lesson = get_lesson_by_title(db, "Hello!")
        response = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers)
        assert response.status_code == 201
        attempt_id = response.json()["attempt_id"]

        # Submit wrong answers until hearts run out.
        hearts = user.hearts
        statuses = []
        for _ in range(hearts):
            result = client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/"
                f"{get_lesson_exercises(db, lesson)[0].id}/submit",
                json={
                    "submitted_answer": wrong_answer_for(
                        get_lesson_exercises(db, lesson)[0]
                    )
                },
                headers=demo_headers,
            )
            assert result.status_code == 200
            body = result.json()
            assert body["is_correct"] is False
            assert body["solution_text"] != ""
            statuses.append(body["attempt_status"])

        assert statuses[-1] == "FAILED"
        assert body["hearts_remaining"] == 0

        # No XP for failed attempts.
        completion = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers
        )
        assert completion.status_code == 409
        assert user.xp == xp_before
