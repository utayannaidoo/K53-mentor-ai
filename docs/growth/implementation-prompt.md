# Implementation Prompt — Engagement MVP Slice

Use this prompt to kick off the second (implementation) pass. It's self-contained — paste it into a fresh session/task once you're ready to build, or use it as-is here.

---

## Prompt

We audited K53 Mentor AI's engagement/retention design and wrote up the findings in `docs/growth/engagement-research.md` — read that file first for full context before starting. Short version: the product has strong pedagogical bones (SM-2 flashcards, question bank, mock exams, AI tutor) but only one engagement mechanic (a streak counter) and **zero outbound return triggers** — the `notifications` table exists in Supabase and has never been written to, and the `study_plans` table exists but isn't surfaced as a hero UI element. That's the single biggest retention leak identified.

Implement the **MVP slice** from the research doc's Impact×Effort matrix (§8), in this order, without touching new schema beyond what's listed:

### 1. Outbound notifications (highest priority)
- Wire up the existing `notifications` table (`type`, `payload jsonb`, `scheduled_for`, `sent_at`, `opened_at`).
- Start with email only (no push yet). Pick the lightest-weight transactional email provider already available in the project's dependencies, or ask before adding a new one.
- Triggers to implement:
  - **Due-review reminder**: a daily job that finds users with flashcards past `due_at` (from `flashcard_review_log` / SM-2 scheduling) who haven't been active today, and emails them.
  - **Streak-at-risk nudge**: using `streaks.last_study_date`, notify users late in the day if their current streak will break by midnight and they haven't studied.
  - **Dormancy re-engagement**: 3-day and 7-day inactivity emails (based on `profiles.last_active_at`), each with a distinct message (soft nudge at 3 days, "pick up where you left off" at 7 days — never shaming copy).
- Respect existing auth/RLS patterns — writes to `notifications` and any cron/job trigger should go through the service-role client, same pattern as the Stripe webhook tier updates.

### 2. AI Daily Plan surfaced as the dashboard hero card
- `study_plans` already stores `plan_data jsonb` per user. Make it the first thing on `/dashboard`, above the existing "today's plan" list and readiness trend.
- Generate (or regenerate) the plan using: `diagnostic_attempts.weak_categories`, due flashcards, and test date proximity from `profiles.test_date`.
- Add a one-line LLM-generated rationale (reuse the existing tutor provider cascade in `src/app/api/tutor/route.ts` — same Anthropic→OpenAI→local fallback pattern) explaining *why* today's plan looks the way it does, e.g. "Because your last mock showed Right of Way as your weakest area, today starts there."

### 3. AI session recap after every study mode
- After flashcards, questions, scenarios, and mock exam sessions, show a short (2-3 sentence) LLM-generated recap: what improved, what's still shaky, and one deliberately unfinished thread to pull the user back tomorrow (e.g. "3 signs left in this set").
- Reuse the same LLM provider fallback pattern as the tutor. Keep it cheap — short prompt, short output, use the "fast" model tier already defined for simple tutor queries.

### 4. Live readiness predictor
- `diagnostic_attempts.predicted_pass_probability` currently only gets computed at the initial diagnostic. Extend the same calculation to run after every `mock_exam_attempts` insert, and update `readiness_history` so the trend chart reflects it.
- Make this recomputed number the single hero stat on `/dashboard` and `/dashboard/progress`, replacing/augmenting the current static readiness display.

### 5. Comeback / streak-risk UI
- Pair with item 1: when a streak is at risk (per the same logic driving the email nudge), show an in-app banner *before* the streak breaks, not just an email.
- If a streak does break, replace the current silent reset with a "Rebuilding" state — a specific, low-friction next action (e.g. one short mission) instead of just a reset counter.

### Constraints
- Don't introduce a new UI framework — the project uses a custom Tailwind component library (`src/components/ui/`) with existing shadow/animation tokens (soft, glass, elevate, shimmer, route-in, scale-in, etc.). Reuse those.
- Don't add XP/levels/badges/missions/Mastery Map/Driving Passport in this pass — those are the *next* slice (§8, second tier) and depend on this data foundation landing first.
- Keep all new LLM calls cheap: short prompts, "fast" model tier, and fall back gracefully the same way `src/app/api/tutor/route.ts` already does if a provider is unavailable.
- Every new mechanic must be traceable to real learning data (attempts, due dates, category weakness) — no attendance-only rewards, per the research doc's core design principle.

### Done means
- A dormant user receives at least one relevant, non-spammy email within a week of going quiet.
- The dashboard's first visible element is the AI-generated "why" behind today's plan, not a generic list.
- Every completed study session ends with a short AI recap instead of dropping straight back to the hub.
- The readiness number on the dashboard updates after mock exams, not just the initial diagnostic.
- A user approaching a streak break sees an in-app warning before it happens, and a non-punitive path back if it does.
