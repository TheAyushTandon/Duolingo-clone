# Duolingo-Inspired Language Learning Platform
## Fullstack Architecture & Implementation Master Plan (LOCKED SYSTEM DESIGN)

**Status: LOCKED & AUTHORITATIVE**

---

## 1. Architecture Principles

1. **Backend Authoritative**:
   - Backend is the single source of truth for: XP rewards, Hearts, Streaks, Skill progression, Lesson completion, Achievements, Unlocking content.
   - Frontend may optimistically animate interactions, but never permanently award or deduct gamification state without backend confirmation.

2. **Modular Monolith**:
   - Single deployable FastAPI application with clearly separated domains and service layers. No unnecessary microservices.

3. **Attempt-Based Learning**:
   - Every lesson session is represented by a durable `LessonAttempt`.
   - Enables: resume after refresh, historical tracking, idempotent completion, correct reward handling, failure handling.

4. **Transactional Gamification**:
   - Atomic lesson completion using atomic SQL update/ownership claim.
   - XP ledger (`xp_transactions`) with uniqueness constraints.

5. **Content-Driven Exercises**:
   - Exercises stored in database with clear separation between public `exercise_data` and backend-only `validation_data`.

6. **Presentation Separated from Business Logic**:
   - Sounds, animations, mascot media, and visual effects contain no business logic.

---

## 2. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     NEXT.JS FRONTEND                     │
│                                                          │
│  Learning Path │ Lesson Player │ Profile │ Leaderboard   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ UI Layer: Tailwind CSS + Framer Motion + CSS     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ State Layer: TanStack Query + Zustand            │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────┘
                             │ REST / JSON
┌────────────────────────────▼─────────────────────────────┐
│                     FASTAPI BACKEND                      │
│                                                          │
│  API / Router Layer                                      │
│  ├── /health                                             │
│  ├── /api/learning-path                                  │
│  ├── /api/lessons & /api/lesson-attempts                 │
│  ├── /api/profile & /api/leaderboard & /api/achievements │
│  └── /api/dev (feature-flagged)                          │
│                                                          │
│  Service Layer                                           │
│  ├── LearningPathService                                 │
│  ├── LessonService                                       │
│  ├── ExerciseValidationService (Unicode NFKD)            │
│  ├── ProgressService                                     │
│  ├── XPService (Ledger)                                  │
│  ├── HeartService (Lazy regeneration)                    │
│  ├── StreakService                                       │
│  ├── AchievementService (Data-driven)                    │
│  └── LeaderboardService (Live XP + Seeded Bots)          │
│                                                          │
│  Repository / ORM Layer (SQLAlchemy 2.0)                 │
└────────────────────────────┬─────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────┐
│                   DATABASE (SQLite)                      │
│  Content │ Users │ Attempts │ Progress │ Rewards │ Social│
└──────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: Next.js (TypeScript), Tailwind CSS, Framer Motion, TanStack Query, Zustand, Lucide Icons, Canvas Confetti.
- **Backend**: Python 3.9+, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite, Uvicorn.
- **Testing & Quality**: Pytest, Vitest, Playwright, Ruff, ESLint, Prettier.

---

## 4. Core Domain Model & Database Schema

### Content Domain
- `courses` (id, title, code, description, flag_icon, is_active, created_at, updated_at)
- `units` (id, course_id FK, order_index, title, description, banner_color, is_active, created_at, updated_at)
- `skills` (id, unit_id FK, order_index, title, description, icon, total_levels, is_active, created_at, updated_at)
- `lessons` (id, skill_id FK, order_index, title, xp_reward, estimated_duration, is_active, created_at, updated_at)
- `exercises` (id, lesson_id FK, order_index, type, prompt, question_audio_url, exercise_data JSON, validation_data JSON, created_at, updated_at)

> **Key Rule**: `exercise_data` is sent to frontend; `validation_data` is kept backend-only.

### Users & Progress Domain
- `users` (id, username, email, avatar_url, xp, gems, hearts, max_hearts, hearts_updated_at, streak, last_active_date, created_at, updated_at)
- `user_skill_progress` (id, user_id FK, skill_id FK, level, progress_percentage, is_completed, completed_at, created_at, updated_at) -> `UNIQUE(user_id, skill_id)`
- `user_activity` (id, user_id FK, activity_date, xp_earned, lessons_completed, created_at, updated_at) -> `UNIQUE(user_id, activity_date)`

### Learning Sessions & Attempts Domain
- `lesson_attempts` (id, user_id FK, lesson_id FK, status: IN_PROGRESS | COMPLETED | FAILED | ABANDONED, current_exercise_index, started_at, completed_at, xp_earned, hearts_lost, completion_result JSON, created_at, updated_at)
- `exercise_attempts` (id, lesson_attempt_id FK, exercise_id FK, submitted_answer JSON, is_correct, attempt_number, created_at)

### Gamification & Social Domain
- `xp_transactions` (id, user_id FK, amount, reason, reference_type, reference_id, created_at) -> `UNIQUE(user_id, reason, reference_type, reference_id)`
- `achievements` (id, name, description, icon, criteria JSON, xp_reward, created_at)
- `user_achievements` (id, user_id FK, achievement_id FK, unlocked_at) -> `UNIQUE(user_id, achievement_id)`
- `leaderboard_entries` (id, user_id, league, weekly_xp, week_start, is_bot, username, avatar_url)

---

## 5. Core Operational Protocols

### A. Atomic Lesson Completion & Idempotency
```sql
UPDATE lesson_attempts
SET status = 'COMPLETED', completed_at = :now, completion_result = :result
WHERE id = :attempt_id AND status = 'IN_PROGRESS';
```
- Affected rows = 1: Current request claims completion -> process XP ledger, skill progress, daily activity, streak, achievements.
- Affected rows = 0: Already completed or failed -> return existing stored `completion_result`.

### B. Lazy Heart Regeneration
- Max Hearts = 5.
- Rate: 1 heart per 30 minutes.
- Evaluated lazily on profile/user fetch:
  $$\text{hearts\_to\_restore} = \lfloor \text{elapsed\_minutes} / 30 \rfloor$$
  $$\text{new\_hearts} = \min(\text{max\_hearts}, \text{current\_hearts} + \text{hearts\_to\_restore})$$

### C. Streak Mechanics
- First lesson of the day:
  - If already active today -> streak unchanged.
  - If active yesterday -> `streak + 1`.
  - If inactive > 1 day -> `streak = 1`.

### D. Centralized Answer Normalization Pipeline
- Normalize Unicode (NFKD) -> Lowercase -> Strip punctuation -> Trim whitespace -> Configurable accent-insensitivity.

### E. Generative Skill Path Layout
- Algorithmic sinusoidal or wave offset based on `order_index`:
  $$x = \text{center} + \sin(\text{index} \times 0.8) \times \text{amplitude}$$

---

## 6. Complete API Surface

- `GET /health`
- `GET /api/learning-path`
- `GET /api/lessons/{lesson_id}`
- `POST /api/lessons/{lesson_id}/attempts`
- `GET /api/lesson-attempts/{attempt_id}`
- `POST /api/lesson-attempts/{attempt_id}/exercises/{exercise_id}/submit`
- `POST /api/lesson-attempts/{attempt_id}/complete`
- `POST /api/lesson-attempts/{attempt_id}/abandon`
- `GET /api/profile`
- `GET /api/profile/stats`
- `GET /api/profile/activity`
- `POST /api/hearts/refill`
- `GET /api/leaderboard`
- `GET /api/achievements`
- `POST /api/dev/simulate-day` (dev feature-flagged)
- `POST /api/dev/reset-progress` (dev feature-flagged)
