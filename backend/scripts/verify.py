"""API smoke test (audit §59): exercises the full learner flow against a
running server. Requires the backend to be up and seeded:

    python -m uvicorn app.main:app
    python scripts/verify.py

Exits non-zero on the first failure. Uses the seeded demo credentials.
"""

from __future__ import annotations

import os
import sys

import requests

BASE_URL = os.environ.get("API_URL", "http://127.0.0.1:8000/api/v1")
DEMO_USERNAME = os.environ.get("DEMO_USERNAME", "demo_learner")
DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "duolingo123")

_passed = 0


def check(name: str, condition: bool, detail: str = "") -> None:
    global _passed
    if not condition:
        print(f"FAIL  {name} {detail}")
        sys.exit(1)
    _passed += 1
    print(f"ok    {name}")


def main() -> None:
    session = requests.Session()

    # 1. Health
    response = session.get(f"{BASE_URL}/health", timeout=10)
    check("health", response.status_code == 200, str(response.status_code))

    # 2. Login
    response = session.post(
        f"{BASE_URL}/login",
        json={"username": DEMO_USERNAME, "password": DEMO_PASSWORD},
        timeout=10,
    )
    check("login", response.status_code == 200, response.text[:200])
    session.headers["Authorization"] = f"Bearer {response.json()['access_token']}"

    # 3. Learning path
    response = session.get(f"{BASE_URL}/learning-path", timeout=10)
    check("learning-path", response.status_code == 200)
    path = response.json()
    check("learning-path course", path.get("course", {}).get("code") in ("fr", "en"))

    # 4. Find an available lesson (first skill with next_lesson_id).
    lesson_id = None
    for unit in path["units"]:
        for skill in unit["skills"]:
            if skill["next_lesson_id"]:
                lesson_id = skill["next_lesson_id"]
                break
        if lesson_id:
            break
    check("found next lesson", lesson_id is not None)

    # 5. Fetch lesson (answers must not leak).
    response = session.get(f"{BASE_URL}/lessons/{lesson_id}", timeout=10)
    check("lesson detail", response.status_code == 200)
    check("no answer leak", "validation_data" not in response.text)
    exercises = response.json()["exercises"]
    check("lesson has exercises", len(exercises) > 0)

    # 6. Start attempt.
    response = session.post(f"{BASE_URL}/lessons/{lesson_id}/attempts", timeout=10)
    check("start attempt", response.status_code == 201, response.text[:200])
    attempt_id = response.json()["attempt_id"]

    # 7. Submit a wrong answer -> incorrect with solution.
    first = exercises[0]
    wrong_payload = {
        "MULTIPLE_CHOICE": {"selected_option": "__wrong__"},
        "FILL_BLANK": {"selected_option": "__wrong__"},
        "TYPE_ANSWER": {"answer": "__wrong__"},
        "WORD_BANK": {"selected_words": ["__wrong__"]},
        "MATCH": {"pairs": []},
    }.get(first["type"], {"answer": "__wrong__"})
    response = session.post(
        f"{BASE_URL}/lesson-attempts/{attempt_id}/exercises/{first['id']}/submit",
        json={"submitted_answer": wrong_payload},
        timeout=10,
    )
    check(
        "wrong answer rejected",
        response.status_code == 200 and response.json()["is_correct"] is False,
    )
    check("solution shown on wrong", bool(response.json().get("solution_text")))

    # 8. Resume: reconstruction data present.
    response = session.get(f"{BASE_URL}/lesson-attempts/{attempt_id}", timeout=10)
    check("resume state", response.status_code == 200)
    check("submitted history", len(response.json()["submitted_exercises"]) >= 1)

    # 9. Abandon (safe smoke path — no state pollution on demo data).
    response = session.post(f"{BASE_URL}/lesson-attempts/{attempt_id}/abandon", timeout=10)
    check("abandon", response.status_code == 200)

    # 10. Profile + leaderboard + achievements.
    response = session.get(f"{BASE_URL}/profile", timeout=10)
    check("profile", response.status_code == 200)
    response = session.get(f"{BASE_URL}/leaderboard", timeout=10)
    check("leaderboard", response.status_code == 200 and len(response.json()) >= 1)
    response = session.get(f"{BASE_URL}/achievements", timeout=10)
    check("achievements", response.status_code == 200)

    print(f"\nAll {_passed} smoke checks passed.")


if __name__ == "__main__":
    main()
