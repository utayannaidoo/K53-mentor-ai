# K53 Mentor AI

An AI-powered study platform for the South African **K53 learner's and driver's licence** tests.
It diagnoses a learner's weak spots, builds a personalised spaced-repetition plan, and coaches them
with an AI tutor — not just another question bank.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase · OpenAI · Stripe-ready**.

> Not affiliated with or endorsed by the RTMC. Content is aligned to the structure of the official
> K53 manual; it is not government-issued material.

---

## ✨ Features

- **AI diagnostic** — a 15-question adaptive assessment that produces a **readiness score**, a
  **predicted pass probability**, and a per-category weakness breakdown.
- **Personalised daily plan** — due flashcards, targeted practice on your weakest category, and a
  scenario, sized to a "10 minutes a day" habit.
- **Spaced repetition** — SM-2 flashcards with `Again / Hard / Good / Easy` and per-category mastery.
- **AI Tutor** — a ChatGPT-style coach that explains the *why*, anchored to the exact question or
  card you're stuck on. Powered by OpenAI, with a genuinely useful rule-based fallback when no key
  is set.
- **Scenario learning** — branching, real-world situational judgement (traffic circles, hazards,
  dead robots) with consequence feedback.
- **Mock exam** — full 68-question / 51-to-pass simulation with category breakdown and mistake review.
- **Driver's-licence prep** — step-by-step "cook-mode" yard-test guides (parallel parking, alley
  docking, three-point turn, inspection, observation).
- **Retention** — streaks with a weekly *freeze* (forgiveness), a readiness trend, and proactive AI
  nudges when you're repeatedly missing a category.
- **Subscriptions** — Free / Premium / Premium Plus with real feature-gating and a Stripe-ready
  checkout route.
- **Calm, premium UI** — light/dark, mobile-first, data-saver mode, accessible.

---

## 🚀 Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

**It runs out of the box with zero configuration.** In this *local demo mode*:

- content is seeded from `src/lib/content/*`
- your progress (diagnostic, reviews, streak, plan) persists to the browser via `localStorage`
- the AI tutor uses a built-in rule-based explainer
- auth accepts any email/password, or "Continue as demo guest"
- choosing a paid plan unlocks its features locally (no charge)

Try the core journey: **Landing → Start free assessment → onboarding → diagnostic → results →
create account → dashboard → study.**

---

## 🔌 Going to production

Copy `.env.example` to `.env.local` and fill in what you need — each integration activates
independently.

### Supabase (persistence + auth)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Run the migrations in `supabase/migrations` (via the Supabase SQL editor or `supabase db push`).
The schema (`0001_init.sql`) creates every table with **Row Level Security** so users only ever
touch their own rows, plus a trigger that bootstraps a profile, streak and free subscription on
sign-up. `0002_seed.sql` seeds categories, licence modules and representative content.

### OpenAI (AI tutor)

```
OPENAI_API_KEY=...
OPENAI_MODEL_FAST=gpt-4o-mini   # routine explanations
OPENAI_MODEL_SMART=gpt-4o       # escalated for complex prompts
```

The tutor route (`src/app/api/tutor/route.ts`) tiers models for cost control and falls back to the
local explainer on any error.

### Stripe (billing)

```
STRIPE_SECRET_KEY=...
STRIPE_PRICE_PREMIUM_MONTHLY=...
STRIPE_PRICE_PREMIUM_PLUS_MONTHLY=...
```

`src/app/api/checkout/route.ts` creates a real Checkout Session when configured; otherwise the
client unlocks the tier locally for demoing.

---

## 🧱 Project structure

```
src/
  app/                     # routes (App Router)
    (marketing)            # /, /pricing
    login, signup, reset-password
    onboarding             # multi-step wizard
    diagnostic, diagnostic/results
    dashboard, dashboard/progress
    study/{flashcards,questions,scenarios,mock-exam}
    tutor                  # AI chat
    licence-prep/[moduleId]
    account, account/billing
    api/{tutor,checkout}
  components/
    ui/                    # design-system primitives (button, card, score-ring…)
    landing/  app/  auth/  onboarding/  diagnostic/  dashboard/  study/  tutor/  driver/  shared/
  lib/
    content/               # seeded K53 content (source of truth for MVP)
    srs/sm2.ts             # spaced-repetition engine
    diagnostic/            # scoring + readiness model + sampling
    billing/plans.ts       # tiers + feature gating
    store/                 # localStorage-backed persistence
    supabase/  ai/         # production integrations
  hooks/                   # use-study-store (central state), use-data-saver
  types/                   # domain model
supabase/migrations/       # SQL schema + seed
```

## 🏛️ Architecture notes

- **State**: `useStudyStore` (`src/hooks/use-study-store.tsx`) is the single source of truth on the
  client. It persists `UserState` to `localStorage` and exposes every study action. Swapping to
  Supabase is a matter of replacing the persistence layer — the table shapes already match.
- **Readiness model**: `src/lib/diagnostic/scoring.ts` blends category accuracy with flashcard
  mastery (weighted toward signs & rules) so the score moves after every session.
- **Feature gating**: `src/lib/billing/plans.ts` defines tiers, daily caps and feature flags;
  the UI enforces them with `hasFeature()` / `usageFor()`.

## ☁️ Deploy

Optimised for **Vercel** + a managed Postgres (Supabase/Neon). Push the repo, set the env vars, deploy.

## 📜 License

Private project / portfolio sample.
