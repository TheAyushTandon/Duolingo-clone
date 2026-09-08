"""Security tests (audit §42).

Covers: ownership enforcement, cross-lesson submissions, malformed and
oversized input, auth flow, dev tools gating, error envelope shape, and
security headers.
"""

from __future__ import annotations

from tests.helpers import get_lesson_by_title, get_lesson_exercises


def _register_and_login(client, username: str, password: str = "secret-pass-1") -> str:
    response = client.post("/api/v1/register", json={"username": username, "password": password})
    assert response.status_code == 201, response.text
    return response.json()["access_token"]


def _auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


class TestAuthentication:
    def test_register_login_flow(self, client, db) -> None:
        token = _register_and_login(client, "security_user")
        assert token

        me = client.get("/api/v1/me", headers=_auth(token))
        assert me.status_code == 200
        assert me.json()["username"] == "security_user"

    def test_login_wrong_password_generic_401(self, client, db) -> None:
        _register_and_login(client, "wrong_pw_user", "correct-password")
        response = client.post(
            "/api/v1/login", json={"username": "wrong_pw_user", "password": "nope"}
        )
        assert response.status_code == 401
        # Generic message: no oracle distinguishing unknown user vs bad password.
        assert "Invalid username or password" in response.json()["detail"]["message"]

    def test_login_unknown_user_same_401(self, client, db) -> None:
        response = client.post(
            "/api/v1/login", json={"username": "ghost_user", "password": "whatever"}
        )
        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]["message"]

    def test_protected_endpoint_requires_auth(self, client, db) -> None:
        response = client.get("/api/v1/profile")
        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "UNAUTHORIZED"

    def test_invalid_token_rejected(self, client, db) -> None:
        response = client.get("/api/v1/profile", headers=_auth("bogus:token:here"))
        assert response.status_code == 401

    def test_duplicate_username_rejected(self, client, db) -> None:
        _register_and_login(client, "dup_user")
        response = client.post(
            "/api/v1/register", json={"username": "dup_user", "password": "another-pass"}
        )
        assert response.status_code == 409

    def test_password_never_in_responses(self, client, db) -> None:
        token = _register_and_login(client, "leak_check_user")
        me = client.get("/api/v1/me", headers=_auth(token))
        assert "password" not in me.text
        assert "hash" not in me.text


class TestOwnership:
    """One user must not read or mutate another user's attempts (§16)."""

    def _demo_attempt(self, client, db, demo_headers) -> tuple[str, str]:
        lesson = get_lesson_by_title(db, "Hello!")
        return (
            client.post(
                f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
            ).json()["attempt_id"],
            get_lesson_exercises(db, lesson)[0].id,
        )

    def test_cannot_access_other_users_attempt(self, client, db, demo_headers) -> None:
        attempt_id, _ = self._demo_attempt(client, db, demo_headers)
        attacker_token = _register_and_login(client, "attacker_user")

        # GET: 404, not 403 — do not reveal that the attempt exists.
        response = client.get(
            f"/api/v1/lesson-attempts/{attempt_id}", headers=_auth(attacker_token)
        )
        assert response.status_code == 404

    def test_cannot_submit_to_other_users_attempt(self, client, db, demo_headers) -> None:
        attempt_id, exercise_id = self._demo_attempt(client, db, demo_headers)
        attacker_token = _register_and_login(client, "attacker2_user")

        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise_id}/submit",
            json={"submitted_answer": {"answer": "anything"}},
            headers=_auth(attacker_token),
        )
        assert response.status_code == 404

    def test_cannot_complete_other_users_attempt(self, client, db, demo_headers) -> None:
        attempt_id, _ = self._demo_attempt(client, db, demo_headers)
        attacker_token = _register_and_login(client, "attacker3_user")

        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/complete",
            headers=_auth(attacker_token),
        )
        assert response.status_code == 404

    def test_users_have_isolated_progress(self, client, db, demo_headers) -> None:
        """The demo user's seeded XP is invisible to a fresh account."""
        token = _register_and_login(client, "isolated_user")
        stats = client.get("/api/v1/profile/stats", headers=_auth(token)).json()
        assert stats["xp"] == 0
        assert stats["total_lessons_completed"] == 0


class TestInputValidation:
    def test_oversized_typed_answer_rejected(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Hello!")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        exercise = next(
            e for e in get_lesson_exercises(db, lesson) if e.type == "TYPE_ANSWER"
        )

        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
            json={"submitted_answer": {"answer": "x" * 10000}},
            headers=demo_headers,
        )
        assert response.status_code == 422

    def test_oversized_register_username_rejected(self, client, db, demo_headers) -> None:
        response = client.post(
            "/api/v1/register",
            json={"username": "x" * 100, "password": "valid-pass"},
        )
        assert response.status_code == 422

    def test_malformed_submission_shape_rejected(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Hello!")
        attempt_id = client.post(
            f"/api/v1/lessons/{lesson.id}/attempts", headers=demo_headers
        ).json()["attempt_id"]
        exercise = get_lesson_exercises(db, lesson)[0]

        # MC expects selected_option (string); send a list instead.
        response = client.post(
            f"/api/v1/lesson-attempts/{attempt_id}/exercises/{exercise.id}/submit",
            json={"submitted_answer": {"selected_option": ["not", "a", "string"]}},
            headers=demo_headers,
        )
        assert response.status_code == 422

    def test_invalid_pagination_limit_rejected(self, client, db, demo_headers) -> None:
        response = client.get(
            "/api/v1/profile/activity?limit=99999", headers=demo_headers
        )
        assert response.status_code == 422


class TestErrorEnvelope:
    def test_error_envelope_has_code_message_request_id(self, client, db, demo_headers) -> None:
        response = client.get(
            "/api/v1/lessons/does-not-exist", headers=demo_headers
        )
        assert response.status_code == 404
        body = response.json()
        assert body["detail"]["code"] == "NOT_FOUND"
        assert body["detail"]["message"]
        assert body["request_id"]

    def test_security_headers_present(self, client, db, demo_headers) -> None:
        response = client.get("/api/v1/health", headers=demo_headers)
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert response.headers["X-Request-ID"]


class TestDevToolsGating:
    def test_dev_endpoints_available_when_enabled(self, client, db, demo_headers) -> None:
        # ENABLE_DEV_TOOLS=true in the test environment.
        response = client.post("/api/v1/dev/reset-progress", headers=demo_headers)
        assert response.status_code == 200

    def test_validation_data_never_leaked(self, client, db, demo_headers) -> None:
        lesson = get_lesson_by_title(db, "Hello!")
        response = client.get(f"/api/v1/lessons/{lesson.id}", headers=demo_headers)
        raw = response.text
        assert "validation_data" not in raw
        assert "correct_pairs" not in raw
        assert "accepted_answers" not in raw
        assert "correct_option_ids" not in raw
        assert "password_hash" not in raw
