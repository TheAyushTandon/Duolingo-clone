"""Integration: resume-after-refresh and abandoned attempt behavior."""

from __future__ import annotations

from tests.helpers import (
    correct_answer_for,
    get_lesson_by_title,
    get_lesson_exercises,
    wrong_answer_for,
)


class TestResume:
    def test_reconstruction_data_after_answers(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "At the table")
        start = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers).json()
        attempt_id = start["attempt_id"]

        exercises = get_lesson_exercises(db, lesson)

        # Answer the first two correctly (simulating mid-lesson refresh).
        for exercise in exercises[:2]:
            client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": correct_answer_for(exercise)},
                headers=demo_headers,
            )

        detail = client.get(f"/api/v1/lesson-attempts/{attempt_id}", headers=demo_headers)
        assert detail.status_code == 200
        body = detail.json()

        assert body["status"] == "IN_PROGRESS"
        # Exercises have order_index 1..3; after correctly answering the
        # first two, the index points at the next exercise (order 3).
        assert body["current_exercise_index"] == 3
        assert len(body["submitted_exercises"]) == 2
        assert all(e["is_correct"] for e in body["submitted_exercises"])
        assert body["submitted_exercises"][0]["attempt_number"] == 1

        # The lesson can be finished from the resumed state.
        for exercise in exercises[2:]:
            client.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": correct_answer_for(exercise)},
                headers=demo_headers,
            )
        completion = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers
        )
        assert completion.status_code == 200
        assert completion.json()["xp_awarded"] == lesson.xp_reward

    def test_wrong_answer_does_not_advance_index(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "At the table")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        first_exercise = get_lesson_exercises(db, lesson)[0]

        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{first_exercise.id}/submit",
            json={"submitted_answer": wrong_answer_for(first_exercise)},
            headers=demo_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["is_correct"] is False
        # Index stays on the same exercise so the learner retries it.
        assert body["current_exercise_index"] == 0


class TestAbandon:
    def test_abandoned_cannot_resume_or_submit(self, client, db, demo_headers) -> None:
        # "I eat bread" is in the Food skill (IN_PROGRESS -> unlocked).
        lesson = get_lesson_by_title(db, "I eat bread")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]

        abandoned = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/abandon", headers=demo_headers
        )
        assert abandoned.status_code == 200
        assert abandoned.json()["status"] == "ABANDONED"

        # GET still returns state, but a NEW start is required to continue.
        detail = client.get(f"/api/v1/lesson-attempts/{attempt_id}", headers=demo_headers)
        assert detail.status_code == 200
        assert detail.json()["status"] == "ABANDONED"

        # Submitting to an abandoned attempt is rejected.
        exercise = get_lesson_exercises(db, lesson)[0]
        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
            json={"submitted_answer": correct_answer_for(exercise)},
            headers=demo_headers,
        )
        assert response.status_code == 409

        # Completing an abandoned attempt is rejected.
        completion = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers
        )
        assert completion.status_code == 409

        # A new attempt can be started for the same lesson.
        new_start = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers)
        assert new_start.status_code == 201
        assert new_start.json()["attempt_id"] != attempt_id
