# Duolingo Clone — Backend

A complete, self-contained backend for a Duolingo-inspired language learning
platform. Built as a clean **modular monolith**: fully functional and
independently testable through Swagger/OpenAPI and automated tests. The API
contract matches the Next.js frontend client in `frontend/src/types/index.ts`
and `frontend/src/lib/api.ts` (mounted at both `/api` and `/api/v1`).

---

## Overview

The backend implements:

- **Course content** — two seeded courses: **French** (default, `fr-FR`
  narration) and **English** (`en-US`). Each course → units → skills →
  lessons → exercises (all five exercise types), fully database-driven.
  Prompts are written in the site language (English); exercise content is in
  the target language. `course.speech_locale` enables native-tongue
  narration in the client (Web Speech API).
- **Durable lesson sessions** — every lesson run is a persistent
  `LessonAttempt` that can be resumed after a page refresh.
- **Backend-authoritative gamification** — answer validation, XP, gems,
  hearts, streaks, skill unlocks, and achievements are all computed and
  persisted server-side. The client is never trusted.
- **Idempotent reward processing** — duplicate completion requests can never
  award XP twice (atomic claim + unique constraint + stored result).
- **Weekly leaderboard** — seeded bot competitors plus the live user's XP
  derived from the XP ledger.

---

## Tech Stack

| Dependency | Why |
|---|---|
| **Python 3.12+** | Modern typing (`X \| None`, generics) used throughout |
| **FastAPI** | Async REST framework, first-class OpenAPI/Swagger |
| **SQLAlchemy 2.0** | Typed declarative ORM; sync sessions keep the architecture simple |
| **Alembic** | Versioned schema migrations |
| **Pydantic v2** | Request/response validation and serialization |
| **pydantic-settings** | `.env`-driven configuration |
| **SQLite** | Zero-config development database; PostgreSQL-ready by design |
| **pytest + httpx** | Unit and integration tests via FastAPI's TestClient |
| **Ruff** | Linting |

Synchronous SQLAlchemy is used deliberately — the domain is small and
transactional; async would add complexity without benefit here.

---

## Architecture

```text
Request
   ↓
API Router              (app/api/)        thin: parsing, service calls, response shaping
   ↓
Service Layer           (app/services/)   ALL business logic: validation, rewards, unlock rules
   ↓
Repository Layer        (app/repositories/)  query encapsulation, no business rules
   ↓
ORM Models              (app/models/)     declarative tables, no business logic
   ↓
Database                (SQLite → PostgreSQL later)
```

Key principles:

- **Backend is authoritative.** The frontend never decides correctness,
  rewards, heart deductions, streaks, unlocks, or achievement state.
- **Attempt-based lessons.** Every session creates a persistent attempt
  supporting resume, analytics, and idempotent completion.
- **Transactional rewards.** All permanent gamification writes for a lesson
  completion happen in one database transaction.
- **One auth seam.** `get_current_user()` in `app/api/dependencies.py`
  currently returns the seeded demo user; replacing it with JWT/session auth
  later requires no route changes.

---

## Database Schema

| Table | Purpose | Key constraints |
|---|---|---|
| `users` | Learners with cached `xp`, hearts, streak | `hearts ∈ [0, max_hearts]`, `xp ≥ 0`, `streak ≥ 0` |
| `courses` | e.g. French (`code: fr`), English (`code: en`) | unique `code`, `speech_locale` for narration |
| `units` | Course sections | `UNIQUE(course_id, order_index)` |
| `skills` | Unit nodes on the learning path | `UNIQUE(unit_id, order_index)` |
| `lessons` | Lesson metadata + `xp_reward` | `UNIQUE(skill_id, order_index)` |
| `exercises` | Five types; `exercise_data` (safe) + `validation_data` (secret) | `UNIQUE(lesson_id, order_index)` |
| `user_skill_progress` | Per-user skill level/percentage/completion | `UNIQUE(user_id, skill_id)` |
| `lesson_attempts` | Durable lesson sessions | status enum, `completion_result` JSON |
| `exercise_attempts` | Every submitted answer (append-only history) | `UNIQUE(lesson_attempt_id, exercise_id, attempt_number)` |
| `xp_transactions` | XP ledger — source of truth for XP history | **`UNIQUE(user_id, reason, reference_type, reference_id)`** — the idempotency guard |
| `user_activity` | Daily XP/lesson aggregates for goals & streaks | `UNIQUE(user_id, activity_date)` |
| `achievements` | Definitions with JSON criteria + XP reward | unique `name` |
| `user_achievements` | Unlock records | `UNIQUE(user_id, achievement_id)` |
| `leaderboard_entries` | Seeded bot competitors | user XP never duplicated here — derived live |

All tables use UUID string primary keys and timezone-aware UTC timestamps.

### Exercise data separation

`exercises.exercise_data` is safe to expose (prompts, word banks, options);
`exercises.validation_data` holds correct answers and is **never** serialized
to public API responses. Separate Pydantic schemas (`ExerciseInternal` /
`ExercisePublic`) and a single conversion choke point (`to_public_exercise`)
enforce this — verified by an integration test that greps the API response
for leaked validation keys.

---

## API Overview

Base prefix: `/api/v1`. Full interactive docs at **`/docs`** (Swagger) and
`/redoc`.

| Method & Path | Description |
|---|---|
| `GET /health` | Liveness check |
| `GET /api/v1/learning-path?course_id=` | Course → units → skills with server-resolved LOCKED/AVAILABLE/IN_PROGRESS/COMPLETED states |
| `GET /api/v1/lessons/{lesson_id}` | Lesson with client-safe exercises (no answers) |
| `POST /api/v1/lessons/{lesson_id}/attempts` | Start or resume an attempt (403 if locked or out of hearts) |
| `GET /api/v1/lesson-attempts/{attempt_id}` | Resume/reconstruction payload |
| `POST /api/v1/lesson-attempts/{attempt_id}/exercises/{exercise_id}/submit` | Validate one answer; deduct heart on wrong; fail at zero |
| `POST /api/v1/lesson-attempts/{attempt_id}/complete` | Atomic completion + rewards (idempotent) |
| `POST /api/v1/lesson-attempts/{attempt_id}/abandon` | Abandon (cannot resume) |
| `GET /api/v1/profile` | Profile with gamification snapshot |
| `GET /api/v1/profile/stats` | Lifetime aggregates |
| `GET /api/v1/profile/activity?limit=&cursor=` | Cursor-paginated daily activity |
| `GET /api/v1/hearts` | Heart state with lazy regeneration |
| `POST /api/v1/hearts/refill` | Refill hearts (mocked) |
| `GET /api/v1/leaderboard` | Weekly league: seeded bots + live user XP |
| `GET /api/v1/achievements` | All achievements with unlock state |
| `POST /api/v1/dev/simulate-day` | Dev only: streak/day-transition testing |
| `POST /api/v1/dev/reset-progress` | Dev only: wipe demo user progress |

Errors are always:

```json
{ "error": { "code": "ATTEMPT_NOT_IN_PROGRESS", "message": "..." } }
```

Domain exceptions map to HTTP statuses centrally in
`app/core/error_handlers.py`.

---

## Lesson Lifecycle

```text
POST /lessons/{id}/attempts        Start (or resume existing IN_PROGRESS)
        ↓
POST .../exercises/{id}/submit     (repeat per exercise)
   correct  → advance index
   wrong    → deduct heart, stay on exercise, return correct answer
   hearts=0 → attempt FAILED (no XP)
        ↓
POST .../complete                   Atomic claim + reward pipeline
        ↓
GET  /lesson-attempts/{id}          Resume after refresh anytime
```

### Atomic completion — why XP cannot be awarded twice

Completion is guarded by **three independent layers**:

1. **Atomic claim.** A single conditional UPDATE transitions the attempt:
   ```sql
   UPDATE lesson_attempts
   SET status='COMPLETED', completed_at=CURRENT_TIMESTAMP
   WHERE id=:attempt_id AND status='IN_PROGRESS'
   ```
   The affected row count decides ownership: 1 → this request runs the
   reward pipeline; 0 → another request already completed it, and this one
   returns the stored `completion_result` unchanged.
2. **Ledger constraint.** `xp_transactions` has
   `UNIQUE(user_id, reason, reference_type, reference_id)` — the same
   `(LESSON_COMPLETION, LESSON_ATTEMPT, <attempt_id>)` reward physically
   cannot be inserted twice; `XPService` also pre-checks and raises
   `DuplicateXPError`.
3. **Snapshot.** The completion result is stored on the attempt, so a
   duplicate request returns byte-identical output.

The entire pipeline — XP ledger insert, cached `users.xp` update, skill
progress, daily activity, streak, achievement evaluation (which may award
more XP) — executes inside one transaction, committed once.

---

## Gamification Logic

### XP
`users.xp` is a cached aggregate for fast reads; `xp_transactions` is the
source of truth. Awards are keyed idempotently (see above). Weekly
leaderboard totals derive live from the ledger.

### Gems
Tracked as `users.gems` (counter; 100 seeded). Economy:

| Event | Gems |
|---|---|
| Lesson completion | **+5** |
| Achievement unlock | **+10** (plus the achievement's XP reward) |
| Heart refill (`POST /hearts/refill`) | **−350** |
| Practice refill (`?is_practice=true`) | free |

Amounts are configurable (`HEART_REFILL_GEM_COST`,
`LESSON_COMPLETION_GEM_REWARD`, `ACHIEVEMENT_GEM_REWARD`).

### Hearts
**Lazy regeneration** — no cron job. Every access replays elapsed time since
`hearts_updated_at`: `restored = floor(elapsed / interval)`, capped at
`max_hearts`. At full, the timestamp resets so credit never accumulates;
partial progress toward the next heart is preserved by advancing the
reference only by whole consumed intervals. Configure via
`HEART_REGENERATION_MINUTES` and `DEFAULT_MAX_HEARTS`.

### Streak
Day comparisons use calendar **dates** through the single `app/utils/dates`
utility. Rules: already active today → no change; active yesterday → `+1`;
older → reset to 1. `user_activity` (daily aggregates) backs history and
analytics.

### Achievements
`AchievementService.evaluate_user_achievements()` fetches a stats snapshot,
then evaluates every not-yet-unlocked achievement through a **generic
criteria dispatcher** (`FIRST_LESSON`, `TOTAL_XP`, `STREAK_THRESHOLD`,
`SKILLS_COMPLETED`, `LESSONS_COMPLETED`). Unlocks award XP idempotently and
can cascade (an XP achievement unlocked by an achievement reward).

### Skill unlocking
All in `LearningPathService`: first skill → AVAILABLE; previous completed →
AVAILABLE; partial progress → IN_PROGRESS; all lessons completed →
COMPLETED; else LOCKED. Progress = completed lessons / total lessons.

### Answer normalization
`app/utils/answer_normalization.py` — NFKD → optional accent strip →
optional lowercase → whitespace collapse → optional punctuation strip.
Configurable per exercise via `validation_data.normalization`
(`ignore_case`, `ignore_accents`, `ignore_punctuation`), so accents are
preserved where the lesson demands them.

---

## Pagination

Cursor (keyset) pagination — never OFFSET on growing histories. Opaque
base64 cursors; responses carry `next_cursor: null` when exhausted. Used by
`/profile/activity` (and the same utility is ready for XP history /
lesson history endpoints).

---

## Setup

### Prerequisites
- Python 3.12+

### Linux / macOS

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit as desired
alembic upgrade head
python -m app.seed.seed_database
uvicorn app.main:app --reload
```

### Windows (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
alembic upgrade head
python -m app.seed.seed_database
uvicorn app.main:app --reload
```

Then open **http://127.0.0.1:8000/docs** — the entire backend can be
exercised from Swagger.

Seeding is **idempotent**: run it any number of times without duplicating
content (natural keys: course code, achievement name, bot+week, username).

---

## Testing

```bash
pytest
```

Every test runs against its own fresh in-memory SQLite database (schema +
seed created per test). This was chosen deliberately over transaction /
savepoint rollback: the stock pysqlite driver does not implement SAVEPOINT
semantics correctly, so rollback-based isolation silently leaks state
between tests. A disposable database per test cannot leak by construction.
Coverage:

- **Unit** — heart deduction/regeneration/caps/timestamps; streak day
  boundaries; XP idempotency; every exercise type plus case/accent/
  whitespace/punctuation/malformed submissions; achievement thresholds,
  duplicate prevention, cascading rewards.
- **Integration** — full lesson flow (XP, progress, activity, streak);
  wrong answers → heart loss → FAILED → no XP; **duplicate completion
  awards exactly one XP transaction**; resume after refresh; abandoned
  attempts; locked lessons; cross-lesson exercise rejection; validation-data
  leak checks; leaderboard rank/ordering; pagination; dev tools.

### Linting

```bash
ruff check .
```

---

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./data/duolingo_clone.db` | Database; swap for PostgreSQL URL later |
| `HEART_REGENERATION_MINUTES` | `30` | Minutes per heart |
| `DEFAULT_MAX_HEARTS` | `5` | Heart capacity |
| `DEMO_USERNAME` | `demo_learner` | User returned by `get_current_user()` |
| `ENABLE_DEV_TOOLS` | `false` | Mount `/api/v1/dev/*` (never in production) |
| `CORS_ORIGINS` | *(empty)* | Comma-separated allowed origins for the future frontend |

---

## Project Layout

```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── routers/    all endpoints (thin: parse -> service -> respond)
│   │   │   └── router.py   v1 aggregation
│   │   └── dependencies.py get_current_user, pagination params
│   ├── core/           config, database, logging, auth utils, security,
│   │                   rate limiting, exceptions, error handlers
│   ├── models/         SQLAlchemy models
│   ├── schemas/        Pydantic request/response schemas
│   ├── repositories/   query layer
│   ├── services/       business logic
│   ├── utils/          normalization, pagination, dates
│   ├── seed/           idempotent seed system
│   └── main.py         app factory (startup validation, middleware)
├── scripts/            seed.py, verify.py (API smoke test)
├── tests/              unit + integration + security
├── alembic/            migrations
├── Dockerfile
├── docker-compose.yml
├── .github/workflows/backend-ci.yml  (repo root)
├── requirements.txt
├── pyproject.toml      ruff / pytest / mypy / coverage config
├── alembic.ini
├── .env.example
└── README.md
```

## Security

| Control | Implementation |
|---|---|
| Authentication | Register/login with PBKDF2-HMAC-SHA256 (100k iterations, per-user salt); HMAC-SHA256 signed bearer tokens with expiry |
| Authorization | Every attempt/progress access verifies `user_id == current_user.id` (404 on mismatch — no existence oracle) |
| Rate limiting | slowapi, per-IP, configurable per policy (general 100/min, submissions 30/min, completions 10/min, auth 20/min, dev 20/min) |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, no `Server` header |
| CORS | Explicit origins only; production requires `CORS_ORIGINS`; method/header allow-lists |
| Input validation | Pydantic at every boundary; domain limits (username ≤50, answers ≤500 chars, ≤20 words/pairs, pagination ≤100) |
| Answer secrecy | `validation_data` never serialized; single conversion choke point + leak tests |
| Error safety | One envelope with `request_id`; stack traces/SQL errors to logs only; generic 500 in production |
| SQL injection | SQLAlchemy parameterized queries exclusively; no string interpolation |
| Dev tools | Router unmounted unless `ENABLE_DEV_TOOLS=true`; startup fails if enabled in production |
| Startup validation | Production startup exits on DEBUG/dev-tools/CORS/SECRET_KEY misconfiguration |

## Observability

- **Structured logs** — `event=key=value` lines for app start, attempt start,
  lesson completion, login outcomes, config problems; request-ID context var
  filters every record.
- **Request correlation** — `X-Request-ID` generated (or accepted) per
  request; returned on responses and error envelopes.
- **Health** — `GET /api/health` (liveness), `GET /api/health/ready`
  (database connectivity).

## Quality Pipeline

```bash
ruff format --check .   # formatting
ruff check .            # lint
mypy app/               # static types
pytest --cov=app --cov-report=term-missing   # tests + coverage
bandit -r app/          # static security analysis
pip-audit               # dependency vulnerabilities
```

CI (`.github/workflows/backend-ci.yml`) runs all of these on every push/PR
touching `backend/`.

`scripts/verify.py` is an API smoke test: health → login → learning path →
lesson → start → wrong answer (solution shown) → resume → abandon →
profile/leaderboard/achievements.

## Docker

```bash
docker build -t language-learning-api .
docker run -p 8000:8000 language-learning-api
# or: docker compose up
```

Non-root user, migration + idempotent seed at start, container health check
on `/api/health`. Docker is optional — local development needs only
Python 3.12.

## PostgreSQL Later

The business logic is engine-agnostic. To switch: set
`DATABASE_URL=postgresql+psycopg://...`, add the driver to requirements, and
run `alembic upgrade head` against the new database. No service code
changes.

SQLite is appropriate for this assignment/demo/single-instance deployment;
PostgreSQL is the recommendation for real production scale.
