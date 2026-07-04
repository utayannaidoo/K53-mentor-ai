# K53 Mentor AI — Engagement & Retention Research

Grounded in the current codebase (audited 2026-07-03): Next.js 15 + Supabase, three vehicle tracks (car/motorcycle/heavy), three tiers (free/premium/premium_plus), AI tutor (Anthropic→OpenAI→local fallback), practice questions, SM-2 flashcards, scenarios, mock exams, licence-prep modules, and exactly **one** engagement mechanic today: a streak counter with weekly freeze. No XP, levels, badges, leaderboards, missions, or outbound notifications exist. The `notifications` table and `study_plans` table are already in the schema but unused/underused — that's the cheapest leverage in this whole doc.

---

## 1. Brutal Critique

**The core loop reads as "take a quiz," not "become a driver."** Six study modes sit behind a menu (`/study`) with no throughline connecting them — a user picks one, does it, gets a score, and has to decide what to do next every single time. That decision fatigue is where a lot of casual users quietly stop.

**Onboarding front-loads cost before any payoff.** 7-step wizard → 20-question diagnostic → dashboard. That's 10-15 minutes of setup before a first "aha" moment. Compare to Duolingo, which gets you into a lesson in under 60 seconds and asks profiling questions *around* the first win, not before it.

**The only feedback language is percentages.** Readiness %, category mastery %, streak count, pass/fail — every surface is a number. There's no narrative layer translating "82% readiness" into something that feels like progress toward an identity ("you drive like a confident learner now"). This is the single biggest gap vs. Duolingo/Brilliant/Headway, all of which wrap stats in story.

**Streak-only gamification is a blunt, loss-framed instrument.** It punishes absence (breaks) but has almost no positive variable-reward texture — no surprise bonuses, no milestone moments at 7/30/100 days, nothing worth telling a friend about. And when it breaks, there is no comeback ritual — just a reset to zero and silence.

**Zero outbound triggers.** The SM-2 engine already computes `due_at` for every flashcard — the system *knows* exactly when a user should come back — and nothing tells them. The `notifications` table exists with zero rows ever written. This means retention today depends entirely on the user remembering the app exists. That is very likely the largest single leak in the funnel.

**No session closure.** Finishing a mock exam gives a pass/fail + category table — dry and spreadsheet-like. No AI-generated recap, no "here's what changed since last time," no reason to open tomorrow (Zeigarnik effect unused — nothing is left intentionally "almost done").

**The AI tutor has no continuity or identity.** It's a capable context-aware chat, but it doesn't proactively surface anything ("I noticed you missed 3 right-of-way questions — want to talk through one?"), doesn't remember the user across sessions in a way that's visible, and has no persona the user would recognize or miss.

**Paywalls gate by day/resource, not by mastery.** "15 messages/day," "3 scenarios/day" trains the user to think of the app as a metered utility to ration, not a coach to grow with. That's a subtly anti-retentive frame even though it's commercially reasonable.

**`study_plans` exists but isn't a hero surface.** There should be one obvious "here's your plan for today, and here's why" card generated from weak categories + due reviews + test date. Right now personalization data is collected (onboarding profile, diagnostic weak_categories, question_attempts history) but barely surfaced back to the user as guidance.

**No moments worth sharing.** No screenshot-worthy pass card, no milestone animation, no easter eggs. Nothing about using the product for a month would come up in conversation.

**Motivation drop-off points, specifically:**
- **Immediately post-onboarding**, if the diagnostic reports a discouragingly low readiness with no clear "start here" path.
- **After the first mock exam fail** — no reframing, no "here's exactly what to fix," just a red number.
- **Around day 10-14**, once novelty fades and the only remaining hook is the flame icon.
- **The moment a streak breaks** — there's currently no re-engagement mechanism at all, digital or otherwise.

---

## 2. Engagement System Redesign

Design principle: every mechanic must **also** improve K53 pass rates, or it doesn't ship. Attendance theater (points for opening the app) is explicitly excluded per the brief.

**Confidence Points (CP), not XP.** Earned for *correct, spaced, and difficulty-weighted* performance — a first-time-correct hard question earns more than a repeated easy one; grinding the same known-easy question earns little. This keeps the reward tied to actual learning (competence loop, not a Skinner box).

**Driver Rank** — the level system, framed as the progression in section 3, driven by CP + category mastery, not raw time-in-app.

**Mastery Map** — each of the 10 categories shown as a node with a mastery % driven by spaced-repetition retention (not "did it once"), not a single quiz score. Hitting 90%+ sustained retention unlocks a category badge. This directly reuses `question_attempts`, `flashcard_review_log`, and `scenario_attempts` — no new tracking tables needed for v1.

**Daily Missions (3, adaptive)** generated each morning from: due flashcards (SM-2 `due_at`), weakest category from `diagnostic_attempts`/`question_attempts`, and one AI-tutor-prompted "question of the day." Small (5-8 min), always completable, replacing the undirected "pick a mode" menu as the default landing action.

**Weekly Boss Challenge** — a themed, harder mock covering the user's current weakest category, framed as a checkpoint rather than a generic retake.

**Comeback mechanics, not just streak freeze:**
- Predictive save: if `last_active_at` + due reviews suggest a lapse is imminent, surface an in-app nudge *before* the streak breaks ("2 cards are due and your streak is on the line").
- When a streak does break, replace the reset-to-zero silence with a soft "Rebuilding" state and a one-tap "get back on track" mission, not shame.
- Re-engagement notifications (email at minimum, push later) for 3-day and 7-day dormancy, using the currently-unused `notifications` table.

**AI Daily Plan, surfaced** — turn `study_plans` into the literal first thing a returning user sees: "Coach's Plan for Today" with a one-line LLM-generated rationale tied to their actual weak spots and test date countdown.

**AI Session Recap** — 2-3 sentence LLM summary after every session (flashcards/questions/mock/scenario): what improved, what's still shaky, and one deliberately unfinished thread for next time (Zeigarnik) — e.g. "3 signs left in this set, pick up tomorrow."

**Adaptive difficulty** — the `difficulty` 1-3 field already exists on questions/flashcards/scenarios; use attempt history to actually serve harder items as mastery rises instead of flat random selection.

**Collections, reframed from existing content** — the road-sign library becomes a literal collectible album (visual grid, "seen/mastered" states); scenarios become "case files" unlocked in sequence rather than a flat list.

**Live readiness predictor** — `predicted_pass_probability` already exists on `diagnostic_attempts`; recompute it after *every* mock exam (not just the initial diagnostic) and make it the single hero number on the dashboard, with a visible trend line (data already exists in `readiness_history`).

---

## 3. Progression Framing — "The Road to Licence"

Reject a generic XP bar in favor of a **literal road**, since the driving metaphor is free, on-brand, and instantly legible:

```
Garage → Learner's Permit → Confident Driver → Road Ready → Test-Day Ready → Licence Achieved
```

- Rendered as a highway with checkpoints per category (10 categories = 10 landmarks along the route), a car icon that physically advances as mastery grows.
- **Driving Passport**: a visual passport/licence-card mockup that gets a "stamp" per mastered category — final stamp reserved for a self-reported real-test pass, which triggers the biggest celebration in the product (see §7).
- **AI co-pilot**: the tutor gets a subtle, adult-appropriate visual identity (not a cartoon mascot) whose "confidence" meter mirrors the user's own — reinforces the coach framing without infantilizing a product aimed at 17-18+ year olds and adult learners.
- Framing test: every progression label should sound like "becoming a driver," never "finishing a course."

---

## 4. Screen-by-Screen Redesign Notes

Working within the existing custom Tailwind system (Sora/Inter, CSS-variable tokens, existing soft/glass/elevate shadows, existing keyframes) — no new UI framework needed.

- **Landing (`/`)**: keep Lenis smooth-scroll; add a 10-second interactive product taste (e.g. answer one real K53 question inline) before asking for signup — proof before commitment.
- **Onboarding wizard**: compress 7 steps to 3-4 visible steps with the rest deferred/optional; show a mini animated payoff (e.g. road illustration filling in) after each answer so it feels like progress being built, not a form being filled.
- **Diagnostic results**: reframe the number with a plain-language readiness sentence + a single clear "start here" CTA into the weakest category — never leave a low score unaccompanied by a next action.
- **Dashboard (`/dashboard`)**: replace the generic "today's plan" list with the Coach's Plan card (rationale-led) + the Road progression widget above the fold; keep the trend chart but pair it with one narrative sentence.
- **Progress (`/dashboard/progress`)**: turn the category breakdown into the Mastery Map nodes instead of a bar list; streak card gets milestone states (7/30/100) with distinct visual treatment, not just a growing number.
- **Study hub (`/study`)**: replace the flat mode grid with "Today's Missions" as the primary path and modes as a secondary "free practice" section underneath — directed by default, freely explorable on demand.
- **Flashcards/Questions**: add a lightweight per-session progress ring (using existing `route-in`/`scale-in` keyframes) and end with the AI recap card instead of dropping straight back to the hub.
- **Mock exam results**: replace the plain pass/fail table with a short animated reveal (tension → result, borrowing the peak-end rule), category breakdown as Mastery Map deltas, and a single "fix this next" CTA.
- **Scenarios/Signs**: present as the Collections/Case Files framing described in §2, with a visible "X/80 collected" counter.
- **Tutor (`/tutor`)**: add lightweight thread history/continuity and a proactive suggestion surfaced from recent wrong answers, not just reactive chat.
- **Licence prep**: add per-module completion stamps feeding the Driving Passport.
- **Account/Billing**: reframe tier comparison around "what you can master" not just "message limits" — mastery-gated messaging tests better long-term than pure day-count limits.
- **Empty/loading/error states**: every empty state (no due cards, no attempts yet) should carry a specific next action, not a blank illustration; loading states get skeletons using existing shimmer keyframe rather than spinners.

---

## 5. Major Features Worth Building

- **AI weak-topic detection & custom quiz generation** — cheapest big win; the data (`question_attempts`, `diagnostic_attempts`) already exists, just needs a generation endpoint.
- **Live/continuous readiness predictor** — extend existing `predicted_pass_probability` logic to recompute after every mock, not just the diagnostic.
- **Outbound notifications (email first, push later)** — dormancy nudges, due-review reminders, streak-at-risk alerts. Biggest leverage-per-effort item in the whole roadmap given the schema already exists.
- **AI-generated session recaps** — small LLM call, reuses existing tutor infrastructure/provider cascade.
- **AI road-sign camera scanner** — point phone at a sign, get instant AI explanation (vision-capable Claude/GPT-4o); strong "wow" factor, moderate effort, clear learning value (signs are one of the hardest K53 categories).
- **AI voice tutor** — TTS/STT layered on the existing tutor pipeline; useful for scenario/roleplay practice and accessibility.
- **Mentor/parent mode** — opt-in share of readiness/progress with a parent or instructor; must be strictly opt-in and POPIA-conscious given the audience skews to minors/young adults.
- **Opt-in cohort challenges** ("learners with your test date") instead of a public leaderboard — competitive pressure without the risk of demotivating low performers or exposing minors' data.
- **AR sign recognition** — genuinely ambitious, high engineering cost, defer to future roadmap; overlaps heavily with the camera scanner idea at a fraction of the cost.

---

## 6. Retention Audit by Stage

**Day 1** — return driver: novelty + a completed first mission with a visible reward (CP, road progress). Prevent drop-off by never ending onboarding on a discouraging raw number without a next step.

**Week 1** — return driver: daily missions + due-flashcard reminders (first real use of outbound notifications) + streak building. Unlocks: first category badge, first Driving Passport stamp. Prevents drop-off: predictive "streak at risk" nudges before day 3-4 lapse risk peaks.

**Month 1** — return driver: visible readiness trend climbing + weekly boss challenge cadence + AI recaps showing compounding improvement. Unlocks: Confident Driver rank, collections filling in. Prevents drop-off: comeback mechanic (soft rebuilding state) catches the inevitable missed week without shame-driven churn.

**Month 3** (long-track learners, e.g. delayed test dates) — return driver: test-date countdown urgency + continuous predictor updates + mentor/parent visibility if opted in. Unlocks: Road Ready / Test-Day Ready ranks. Prevents drop-off: content freshness (new scenarios/quizzes generated by AI so it doesn't feel like the same 1,100 questions on loop).

**Until pass** — final stretch is about confidence, not new content: live predictor crossing a threshold, a final mock "exam day dress rehearsal," and the Licence Achieved celebration + shareable recap as the payoff for the whole journey.

---

## 7. Surprise & Delight

- Confetti + AI-voiced congratulations the moment predicted pass probability crosses a threshold, not just at the very end.
- A personalized "journey recap" video/card generated at pass time — stats + narrative, built to be screenshot-shared.
- Small tutor personality touches — a dry joke about parallel parking, an aside about a famously confusing K53 rule — used sparingly so it stays earned rather than gimmicky.
- A quiet easter egg for hitting exactly 100% on a full mock.
- Micro-sound design for correct-streaks within a session (subtle, mutable, off by default on mobile silent mode).
- The Driving Passport's final stamp animation as the single biggest, most deliberately over-produced moment in the app — it's the peak-end payoff for the entire product.

---

## 8. Implementation Plan — Impact × Effort

| Feature | Impact | Effort | Notes |
|---|---|---|---|
| Outbound notifications (dormancy, due-review, streak-risk) | Very High | Low-Med | Schema exists; biggest leverage in the doc |
| AI Daily Plan surfaced as hero dashboard card | High | Low | `study_plans` table exists, mostly a UI/prompt task |
| AI session recap after every mode | High | Low-Med | Reuses existing tutor LLM pipeline |
| Live readiness predictor (recompute post-mock) | High | Low-Med | Extends existing diagnostic logic |
| Mastery Map (replace bar list with category nodes) | High | Med | Reuses existing attempt tables, new UI component |
| Daily Missions (replace mode-picker default) | High | Med | New generation logic + UI, no new schema |
| Driving Passport / Road progression visual | Med-High | Med | Primarily front-end; ties disparate progress into one narrative |
| Comeback / streak-risk nudges | High | Low | Extends existing streak logic + notifications |
| Confidence Points (CP) system | Med | Med | New scoring logic layered on existing attempt data |
| Collections framing for signs/scenarios | Med | Low-Med | Mostly presentational reuse of existing content |
| AI weak-topic custom quiz generator | Med-High | Med | New generation endpoint over existing attempt data |
| AI road-sign camera scanner | High (novelty+learning) | Med-High | New vision pipeline, mobile camera permissions |
| AI voice tutor | Med | High | STT/TTS integration, latency/cost considerations |
| Mentor/parent mode | Med | Med-High | Needs careful consent/privacy design |
| Opt-in cohort challenges | Med | Med | Needs moderation/reporting for community safety |
| AR sign recognition | Low-Med (redundant w/ scanner) | Very High | Defer indefinitely |

**Suggested MVP slice (highest impact-per-effort, ship together):** outbound notifications, AI daily plan surfaced, AI session recap, live predictor, comeback/streak-risk nudges. These alone address the single biggest diagnosed problem — zero return triggers — without touching new schema beyond what already exists, and each independently improves both retention and learning outcomes.

**Second slice:** Mastery Map, Daily Missions, Confidence Points, Driving Passport visual — the visible "game" layer built on top of the MVP data foundation.

**Roadmap (future):** AI road-sign scanner, AI voice tutor, mentor mode, cohort challenges.

---

## 9. Why This, Not a Duolingo Clone

Every mechanic above is chosen because it **also** moves the needle on actual K53 pass rates: CP rewards correctness under difficulty, missions are built from real weak spots and real due reviews, the predictor is the same diagnostic math already shipped, and the biggest single investment (notifications) is just telling users what the spaced-repetition engine already silently knows. The game layer (Road, Passport, Ranks) is a narrative skin over real competence data — it should never reward attendance or grinding disconnected from mastery, which is the core failure mode of engagement systems that produce time-in-app without producing pass rates. The goal is a product where checking in daily and getting better at driving are the same action.
