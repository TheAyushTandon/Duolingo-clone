"""Integration: edge cases — locked lessons, foreign exercises, validation, hearts."""

from __future__ import annotations

import datetime as dt

from sqlalchemy import func, select

from app.models.content import Lesson, Skill
from app.models.gamification import XPTransaction
from app.models.user import User
from app.utils.dates import week_start
from tests.helpers import correct_answer_for, get_lesson_by_title, get_lesson_exercises


class TestLockedLessons:
    def test_locked_skill_lesson_rejected(self, client, db, demo_headers) -> None:
        # "Questions" is the last skill of Unit 2; with only Greetings
        # completed it is locked.
        skill = db.scalar(select(Skill).where(Skill.title == "Questions"))
        assert skill is not None
        lesson = db.scalar(select(Lesson).where(Lesson.skill_id == skill.id))
        assert lesson is not None

        response = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers)
        assert response.status_code == 403
        assert response.json()["detail"]["code"] == "LESSON_LOCKED"


class TestCrossLessonExercise:
    def test_exercise_from_other_lesson_rejected(self, client, db, demo_headers) -> None:
        target_lesson = get_lesson_by_title(db, "Hello!")
        foreign_lesson = get_lesson_by_title(db, "At the table")

        attempt_id = client.post(
            f"/api/v1/lessons/{target_lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        foreign_exercise = get_lesson_exercises(db, foreign_lesson)[0]

        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{foreign_exercise.id}/submit",
            json={"submitted_answer": correct_answer_for(foreign_exercise)},
            headers=demo_headers,
        )
        assert response.status_code == 422
        assert response.json()["detail"]["code"] == "INVALID_EXERCISE_SUBMISSION"


class TestValidationDataLeak:
    def test_lesson_endpoint_has_no_validation_data(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Hello!")
        response = client.get(f"/api/v1/lessons/{lesson.id}", headers=demo_headers)
        assert response.status_code == 200
        raw = response.text
        assert "validation_data" not in raw
        assert "correct_pairs" not in raw
        assert "accepted_answers" not in raw
        assert "correct_option_ids" not in raw

    def test_exercise_submission_never_leaks_for_correct(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Hello!")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        exercise = get_lesson_exercises(db, lesson)[0]
        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
            json={"submitted_answer": correct_answer_for(exercise)},
            headers=demo_headers,
        )
        assert response.json()["solution_text"] == ""


class TestHeartsAPI:
    def test_heart_status(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        user.hearts = 2
        db.flush()

        status = client.get("/api/v1/hearts", headers=demo_headers).json()
        assert status["hearts"] == 2
        assert status["full"] is False
        assert status["missing_hearts"] == 3

    def test_refill_with_gems_costs_350(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        user.hearts = 0
        user.gems = 400
        db.flush()

        response = client.post("/api/v1/hearts/refill", headers=demo_headers).json()
        assert response["success"] is True
        assert response["hearts"] == 5
        assert response["gems"] == 400 - 350

    def test_refill_without_gems_rejected(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        user.hearts = 0
        user.gems = 100
        db.flush()

        response = client.post("/api/v1/hearts/refill", headers=demo_headers)
        assert response.status_code == 403
        assert response.json()["detail"]["code"] == "INSUFFICIENT_GEMS"

    def test_practice_refill_is_free(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        user.hearts = 0
        user.gems = 0
        db.flush()

        response = client.post(
            "/api/v1/hearts/refill?is_practice=true", headers=demo_headers
        ).json()
        assert response["success"] is True
        assert response["hearts"] == 5
        assert response["gems"] == 0

    def test_no_hearts_blocks_start(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        user.hearts = 0
        db.flush()

        lesson = get_lesson_by_title(db, "Hello!")
        response = client.post(f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers)
        assert response.status_code == 403
        assert response.json()["detail"]["code"] == "INSUFFICIENT_HEARTS"


class TestLearningPathAPI:
    def test_learning_path_states_and_stats(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/learning-path", headers=demo_headers)
        assert response.status_code == 200
        path = response.json()

        # Default course is the demo user's active course: French.
        assert path["course"]["code"] == "fr"
        assert path["course"]["speech_locale"] == "fr-FR"

        stats = path["user_stats"]
        assert stats["xp"] > 0
        assert stats["gems"] >= 100
        assert stats["hearts"] == 5
        assert stats["streak"] >= 1

        states = [s["state"] for u in path["units"] for s in u["skills"]]
        assert "COMPLETED" in states  # Greetings
        assert "IN_PROGRESS" in states  # Food
        assert "LOCKED" in states  # later skills

        # Every skill node lists its lessons for the path UI.
        for unit in path["units"]:
            for skill in unit["skills"]:
                assert isinstance(skill["lessons"], list)
                assert len(skill["lessons"]) >= 1

    def test_explicit_course_param(self, client, db, demo_headers) -> None:
        from app.models.content import Course

        english = db.scalar(select(Course).where(Course.code == "en"))
        response = client.get(
            f"/api/v1/learning-path?course_id={english.id}", headers=demo_headers
        )
        assert response.status_code == 200
        assert response.json()["course"]["code"] == "en"


class TestLeaderboardAPI:
    def test_leaderboard_contains_user_and_bots(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/leaderboard", headers=demo_headers)
        assert response.status_code == 200
        entries = response.json()  # flat array per the frontend contract
        assert len(entries) == 11  # 10 bots + demo user

        user_rows = [e for e in entries if e["is_current_user"]]
        assert len(user_rows) == 1
        assert user_rows[0]["username"] == "demo_learner"

        # Ranks are 1..N in XP order.
        ranks = [e["rank"] for e in entries]
        assert ranks == list(range(1, 12))
        xps = [e["weekly_xp"] for e in entries]
        assert xps == sorted(xps, reverse=True)

    def test_user_weekly_xp_live_updates(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        before = client.get("/api/v1/leaderboard", headers=demo_headers).json()
        before_xp = [e for e in before if e["is_current_user"]][0]["weekly_xp"]

        # The derived value must match the ledger for the current week.
        week = week_start(dt.date.today())
        week_start_dt = dt.datetime(
            week.year, week.month, week.day, tzinfo=dt.timezone.utc
        )
        expected = int(
            db.scalar(
                select(func.sum(XPTransaction.amount)).where(
                    XPTransaction.user_id == user.id,
                    XPTransaction.created_at >= week_start_dt,
                )
            )
            or 0
        )
        assert before_xp == expected


class TestProfileAndAchievements:
    def test_profile(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/profile", headers=demo_headers)
        assert response.status_code == 200
        profile = response.json()
        assert profile["username"] == "demo_learner"
        assert isinstance(profile["streak_active_today"], bool)
        assert isinstance(profile["achievements"], list)

    def test_stats(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/profile/stats", headers=demo_headers)
        assert response.status_code == 200
        stats = response.json()
        assert stats["total_lessons_completed"] >= 2
        assert stats["skills_completed"] == 1
        assert stats["achievements_count"] >= 1

    def test_activity_pagination(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/profile/activity?limit=1", headers=demo_headers)
        assert response.status_code == 200
        page = response.json()
        assert len(page["items"]) <= 1
        if page["items"]:
            assert "activity_date" in page["items"][0]
            assert page["next_cursor"] is not None
            second = client.get(
                f"/api/v1/profile/activity?limit=1&cursor={page['next_cursor']}",
                headers=demo_headers,
            )
            assert second.status_code == 200
            if second.json()["items"]:
                assert (
                    second.json()["items"][0]["activity_date"]
                    < page["items"][0]["activity_date"]
                )

    def test_achievements_listing(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/achievements", headers=demo_headers)
        assert response.status_code == 200
        items = response.json()
        assert len(items) >= 5
        # The seeded progress (2 lessons) unlocks "First Steps".
        names = {i["name"]: i for i in items}
        assert names["First Steps"]["is_unlocked"] is True
        assert names["Week Warrior"]["is_unlocked"] is False


class TestDevTools:
    def test_reset_progress(self, client, db, demo_headers) -> None:
        user = db.query(User).filter_by(username="demo_learner").one()
        assert user.xp > 0

        response = client.post("/api/v1/dev/reset-progress", headers=demo_headers)
        assert response.status_code == 200
        assert response.json()["success"] is True
        assert user.xp == 0
        assert user.streak == 0
        assert user.hearts == user.max_hearts

    def test_simulate_day(self, client, db, demo_headers) -> None:
        response = client.post("/api/v1/dev/simulate-day?days=2", headers=demo_headers)
        assert response.status_code == 200
        assert response.json()["success"] is True


class TestCoursesAPI:
    def test_list_courses(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/courses", headers=demo_headers)
        assert response.status_code == 200
        courses = {c["code"]: c for c in response.json()}
        assert set(courses) == {"fr", "en"}
        assert courses["fr"]["speech_locale"] == "fr-FR"

    def test_set_active_course(self, client, db, demo_headers) -> None:
        from app.models.content import Course

        english = db.scalar(select(Course).where(Course.code == "en"))
        response = client.post(
            "/api/v1/profile/course",
            json={"course_id": english.id},
            headers=demo_headers,
        )
        assert response.status_code == 200

        # The default learning path now shows the English course.
        path = client.get("/api/v1/learning-path", headers=demo_headers).json()
        assert path["course"]["code"] == "en"

    def test_set_active_course_not_found(self, client, db, demo_headers) -> None:
        response = client.post(
            "/api/v1/profile/course",
            json={"course_id": "nope"},
            headers=demo_headers,
        )
        assert response.status_code == 404


class TestTransactionAtomicity:
    """Audit §43: a mid-completion failure must leave no partial state."""

    def test_completion_rollback_on_failure(
        self, client_no_raise, db, demo_headers, monkeypatch
    ) -> None:
        from app.services import attempt_service

        lesson = get_lesson_by_title(db, "Introductions")
        attempt_id = client_no_raise.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        for exercise in get_lesson_exercises(db, lesson):
            client_no_raise.post(
                f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
                json={"submitted_answer": correct_answer_for(exercise)},
                headers=demo_headers,
            )

        user = db.query(User).filter_by(username="demo_learner").one()
        xp_before = user.xp

        # Sabotage progress updates AFTER the XP award: completion must
        # roll back the whole transaction (no XP, no COMPLETED status).
        def _boom(*args, **kwargs):
            raise RuntimeError("simulated progress failure")

        monkeypatch.setattr(attempt_service.ProgressService, "update_skill_progress", _boom)

        response = client_no_raise.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete", headers=demo_headers
        )
        assert response.status_code == 500
        assert response.json()["detail"]["code"] == "INTERNAL_ERROR"

        # The error path rolled the session back: refresh state.
        db.rollback()
        user = db.query(User).filter_by(username="demo_learner").one()
        assert user.xp == xp_before  # XP award rolled back

        from app.models.attempt import LessonAttempt

        attempt = db.get(LessonAttempt, attempt_id)
        db.refresh(attempt)
        status = attempt.status.value if hasattr(attempt.status, "value") else attempt.status
        assert status != "COMPLETED"

        # No XP transaction for this attempt survived.
        transactions = list(
            db.scalars(
                select(XPTransaction).where(XPTransaction.reference_id == attempt_id)
            )
        )
        assert transactions == []
