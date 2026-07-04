# Slice 3 Spec — Vision, Active Recall & Smart Guidance

The user's request, restructured into a build spec. Eight features, ordered by
shared infrastructure (vision pipeline first, then AI copy, then pure-client).

## Guiding rules (carried over from docs/growth/engagement-research.md)
- Every feature must improve learning outcomes, not just time-in-app.
- Every AI feature degrades gracefully: demo mode / provider outage never shows an error.
- Reuse the existing provider cascade (Anthropic → OpenAI → local), rate-limit
  patterns, and glass design system. No new dependencies unless unavoidable.

## Features

### 1. AI road-sign camera scanner (`/study/scan`)
Photograph or upload a road sign → vision model identifies it and explains the
K53 meaning. Phone camera via `<input capture="environment">` (no getUserMedia
complexity). New `/api/vision` route; images capped ~4MB; IP rate-limited
(vision calls are the priciest in the app). Local fallback explains the scanner
needs an AI key. Entry points: study hub Free practice grid + signs library.

### 2. Tutor accepts photos (and descriptions)
Attach an image to any tutor message — "what does this sign mean?", "what
should I do here?". Extends `/api/tutor` with an optional image on the last
user message; describing a scene in words already works today (no change
needed, but add a suggestion chip for it). Demo mode: image questions get an
honest "I can't see images without a provider" reply.

### 3. AI second opinion on wrong answers
When an answer is wrong, the explanation gains an "Explain it differently"
button → one-shot coach call (`second_opinion` kind) that re-explains with a
different angle/analogy, shown inline. Targets the exact moment learning stalls.

### 4. Active-recall flashcards (user's own design)
Before a card reveals, the learner types — or dictates via the Web Speech API
(en-ZA, hidden if unsupported) — their answer. The reveal then shows their
attempt beside the real answer so the SM-2 self-rating (Again/Hard/Good/Easy)
is honest. Optional, zero-friction: reveal always works without typing.
No AI call — retrieval practice is the point, and it stays free and instant.

### 5. Smart re-test scheduling
When a full mock is "due" (never taken, or >7 days old while readiness keeps
moving), a mock-exam task appears in the daily plan (Coach's Plan + study-hub
missions) automatically. Mock tasks never gate the daily +15 CP bonus (a 60-min
exam shouldn't hold the daily bonus hostage). Due-flashcard email reminders
already exist; this closes the "nothing tells you when to re-test" gap.

### 6. "While you were away" comeback diff
After 3+ days away, the dashboard opens with a dismissible card framing the
return positively: days away, readiness held, reviews queued, longest streak
intact. Computed from a lightweight `lastSeen` snapshot (at, readiness, cp)
taken on each app open.

### 7. Mini mock exam (replaces the print cheat-sheet idea)
15 questions, 12 minutes, pass 12/15 — weighted toward the learner's weakest
categories. Answers feed the readiness predictor (context "mock") but do NOT
count as a full mock (rank gates and mock history stay honest) and do NOT eat
the daily practice cap. Free for all tiers. Entry: study hub + retest nudges
when a full mock feels too big.

### 8. Real analytics (replace placeholders)
"Best study time" is currently hardcoded to "Evenings"; compute it from actual
attempt timestamps (accuracy per time-of-day bucket, min. 10 attempts).
"Most-improved" currently shows the *strongest* category (mislabeled); compute
a real first-half vs second-half accuracy delta, with data guards.

## UI theme decision
Recommendation: **keep the current system** (liquid-glass, Sora/Inter,
teal-green + amber). It's coherent, recently polished, and on-brand for the
road metaphor. A re-theme mid-feature-push is high risk / low reward. Instead,
keep leaning into the road-trip motifs already landing (Road to Licence,
Driving Passport, checkpoints).
