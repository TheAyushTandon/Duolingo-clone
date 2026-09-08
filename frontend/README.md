# 🦉 Duolingo Clone — Frontend

The Next.js client for the Duolingo clone: the winding skill-tree learning path, the interactive lesson player with all five exercise types, and the gamified shell (leaderboard, quests, shop, profile, settings) — visually faithful to the original Duolingo.

> Architecture, database schema, and the full API contract live in the **[root README](../README.md)**.

---

## 🧰 Stack

| Tool | Role |
|---|---|
| **Next.js 16** (App Router) | File-based routing; server-rendered pages with interactive client islands |
| **TypeScript** | Types for the entire backend API contract (`src/types/index.ts`) |
| **Tailwind CSS v4** | Duolingo's design language: chunky 3D buttons, `#58cc02` green, rounded everything |
| **TanStack React Query** | Server-state cache — one key per resource; lesson completion invalidates and the whole UI refreshes |
| **Zustand** | Lightweight client state (sound toggle, dev-tools modal) |
| **Framer Motion** | Onboarding transitions, toast animations |
| **Web Speech API** | Native-tongue narration (`fr-FR` / `en-US`) + synthesized sound effects |
| **canvas-confetti** | Lesson-complete celebration |

---

## 🚀 Run locally

```bash
npm install
npm run dev          # → http://localhost:3000
```

The API base URL defaults to `http://127.0.0.1:8000/api` (backend repo: `../backend`). Override with:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api npm run dev
```

**Login** with the seeded demo learner — `demo_learner` / `duolingo123` — or register a new account from the landing page.

---

## 🗺️ Pages

| Route | What it is |
|---|---|
| `/` | Marketing landing page (hero animation, feature showcase) |
| `/register` | Course selection + onboarding wizard (persists course & daily goal) |
| `/learn` | Skill tree: unit banners, skill nodes with states, daily-goal ring, live stats sidebar |
| `/lesson/[id]` | Lesson player: exercises, feedback bar, hearts, quit/out-of-hearts/completion modals |
| `/leaderboard` | Weekly league with promotion zone |
| `/quests` | Daily XP + lesson quests with real progress |
| `/shop` | Gem balance, 350-gem heart refill, Super preview |
| `/profile` | Stat cards, lifetime stats, achievement gallery |
| `/settings` | Daily-goal editor, sound/theme toggles, Coming-Soon placeholders |
| `/courses` | Course switcher (French ⇄ English) |

---

## 🧩 Key components

- **`lesson/exercises/*`** — the five exercise types (multiple choice, word bank, match pairs, fill blank, type answer), each with tactile Duolingo styling and narration via `speak(text, locale)`
- **`learn/LearningPath` + `SkillNode`** — sinusoidal path with server-resolved states (locked/available/in-progress/completed), progress rings, crowns, START popovers
- **`daily-goal-ring`** — circular flame indicator fed by today's real XP
- **`live-user-progress` / `live-quests`** — API-driven sidebar widgets
- **`hooks/useUserData`** — the shared React Query hooks (one cache key per backend resource)
- **`lib/api`** — typed fetch client with bearer-token auth and the backend's error-envelope handling

---

## 🏗️ Build & verify

```bash
npm run build    # production build (verified green: 13 routes)
npm run lint     # eslint
```

---

Made with 🦉 as part of the Duolingo Clone project by **Ayush Tandon**.
