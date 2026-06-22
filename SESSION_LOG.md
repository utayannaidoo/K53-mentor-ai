# K53 Mentor AI — Session Log

> AI-assisted development session. All design, implementation, and verification work
> documented below. Functionality, business logic, routes, and content never changed —
> only visual design, motion, and interaction improvements.

---

## Project Overview

**K53 Mentor AI** — a production-quality South African K53 learner's & driver's licence
study platform built from scratch in this session.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase · OpenAI ·
Stripe-ready · Vercel-ready  
**Repo:** https://github.com/utayannaidoo/K53-mentor-ai  
**Location:** `C:\Users\utaya\Downloads\k53-mentor-ai`

---

## Phase 1 — Full MVP Build (14 Tasks)

### Task 1 — Foundation
- `tailwind.config.ts`, `globals.css`, root `layout.tsx`
- Design tokens: teal-green primary `#2C5F4F`, amber accent `#FF8A3D`
- Fonts: Sora (display), Inter (body), JetBrains Mono
- Dark mode, CSS custom properties, antialiasing

### Task 2 — UI Primitive Library (shadcn-style)
- `Button` (CVA, 8 variants), `Card`, `Input`, `Label`, `Progress`, `Separator`,
  `Skeleton`, `Spinner`, `Avatar`, `Badge`, `Chip`, `Accordion`, `Dialog`
- `ScoreRing` — animated SVG circular progress with tone-based colour
- `MasteryBar` — horizontal mastery bar with tone colouring

### Task 3 — K53 Content Seed
- `categories.ts` — 7 K53 categories (signs, rules, controls, intersections,
  parking, following\_distance, hazard\_awareness)
- `questions.ts` — ~30 K53-aligned questions with real explanations
- `flashcards.ts` — ~30 SM-2 flashcards
- `scenarios.ts` — 8 branching scenario challenges
- `driver-modules.ts` — 6 yard-test modules with step-by-step procedures

### Task 4 — Domain Logic
- `types/index.ts` — complete TypeScript domain model
- `srs/sm2.ts` — SM-2 spaced repetition (ease factor, intervals, ratings)
- `diagnostic/scoring.ts` — readiness score, pass probability, category weights
- `diagnostic/select.ts` — adaptive question sampling
- `store/local-store.ts` — localStorage persistence with streak logic
- `plan.ts` — daily plan generation
- `billing/plans.ts` — Free / Premium / Premium Plus feature gates + caps

### Task 5 — Supabase + SQL Migrations
- `supabase/migrations/0001_init.sql` — complete schema with RLS on all user tables
- `supabase/migrations/0002_seed.sql` — categories, modules, representative content
- New-user bootstrap trigger (profile + streak + free subscription)
- Graceful null fallback when Supabase not configured (demo mode)

### Task 6 — Landing Page
- `MarketingNav` — sticky glass header with scroll-triggered backdrop
- `Hero` — "Only 4 in 10 pass…" headline, dual CTAs, trust badges
- `Problem`, `HowItWorks`, `Features`, `Testimonials`
- `ProductPreview` — interactive dashboard mockup
- `PricingSection` — 3-tier pricing with monthly/annual toggle (ZAR)
- `Faq`, `CtaBand`, `Footer`

### Task 7 — Auth
- Login / signup / reset-password pages
- `AuthShell` — brand left panel + form right panel
- `AuthForm` — Supabase (prod) + localStorage demo mode
- Route protection via `AppShell` + `middleware.ts`

### Task 8 — Onboarding
- 7-step wizard: goal → vehicle code → test date → confidence → knowledge →
  frequency → ready screen
- `OptionCard` — card-based option selector with check indicator
- Auto-advances single-choice steps; navigates to `/diagnostic` on complete

### Task 9 — Diagnostic
- `DiagnosticRunner` — 15-question flow with progress bar + "analysing" animation
- `DiagnosticResults` — readiness ring, pass probability, contrast analysis,
  gated full breakdown with upgrade paywall

### Task 10 — Dashboard
- `ReadinessCard` — animated ScoreRing + pass probability + weekly delta
- `TodayPlan` — 3-4 personalized daily tasks with completion animation
- `WeakAreas` — colour-coded category mastery bars
- `AIRecommendation` — personalised nudge card based on missed questions
- `TrendChart` — Stripe-style SVG line chart with gradient fill
- `/dashboard/progress` — 8 stat tiles, full category grid, mock history,
  advanced analytics (Premium Plus gated)

### Task 11 — Study Experiences
- `FlashcardDeck` — 3D flip animation, SM-2 rating (Again/Hard/Good/Easy)
  with interval previews, daily cap enforcement
- `QuestionPractice` — MCQ with instant feedback, inline explanation, tutor link
- `ScenarioPlayer` — branching scenario with consequence panel + debrief
- `MockExam` — 68-question timed exam, navigable, category breakdown,
  mistake review, pass/fail badge
- `/study` hub — 5 mode cards + study-by-category grid

### Task 12 — AI Tutor
- `src/lib/ai/openai.ts` — lazy client + model tiering (fast: gpt-4o-mini,
  smart: gpt-4o)
- `src/lib/ai/tutor-prompt.ts` — system prompt builder with context resolution
- `src/lib/ai/fallback.ts` — rule-based explainer (keyword search over seeded
  content, grounded responses)
- `src/app/api/tutor/route.ts` — POST handler, graceful fallback on any error
- `TutorChat` — chat UI with context pill, suggested chips, persisted threads,
  glass message bubbles, daily cap gating

### Task 13 — Driver's Licence Prep
- `/licence-prep` — module grid with tier/difficulty badges, progress bars
- `ModuleCookMode` — step-by-step cook-mode with step dots, "mark practised"
  toggle, common faults, allDone celebration

### Task 14 — Pricing, Account, Billing + Build Verification
- `/pricing` — standalone pricing page (marketing layout)
- `/account` — profile, subscription, study profile, preferences, account actions
- `/account/billing` — tier switching with Stripe-ready checkout route
- `src/app/api/checkout/route.ts` — real Stripe session or demo-mode unlock
- `npm run build` ✅ all 24 routes compile

---

## Phase 2 — Liquid Glass Visual Redesign

### Pass 1 — Glass System Foundation (Tasks 15–19)
**Goal:** Replace warm teal brand with a cool, Apple-inspired blue; introduce a true
Liquid Glass material.

**Color system** (`globals.css`):
- `--primary`: `hsl(216 64% 52%)` (confident blue)
- `--background`: `hsl(210 38% 98%)` (soft cool white)
- Dark mode: `hsl(222 30% 7%)` deep cool slate

**Glass material classes:**
```css
.glass        { bg: card/55%, blur: 22px, sat: 185%, inset top + outer shadow }
.glass-panel  { bg: background/66%, blur: 26px — nav chrome }
.glass-subtle { bg: card/40%, blur: 14px — recessed insets }
.glass-2      { bg: card/68%, blur: 34px, sat: 195% — most elevated }
```

**Other additions:**
- `ease-glass`, `ease-soft` easing tokens
- `blur-in` keyframe animation
- `hover-elevate`, `press` utilities
- `bg-app` / `bg-aurora` atmospheric radial gradients
- `ScoreRing` glow via `drop-shadow` + `overflow-visible`
- Gradient progress/mastery bar fills
- Glass modal (blur-in backdrop)
- Frosted `glass-panel` app shell (sidebar, topbar, mobile nav)
- Blue favicon + theme-color

**Build:** ✅ all 24 routes, no type errors

---

### Pass 2 — Cluely-Grade Depth (Tasks 20–23)
**Goal:** "More transparency and depth between components."

**3-tier depth system:**

| Tier | Class | Usage | Blur | Fill |
|------|-------|-------|------|------|
| Recessed | `glass-subtle` | Stat insets | 14px | 40% |
| Content | `glass` | Cards | 22px | 50% |
| Floating | `glass-2` / `glassFloat` | Hero, modals | 30–34px | 66–68% |

**Richer atmosphere** — `bg-aurora` now layers blue + violet + warm bloom so glass
actually refracts something visible.

**`glassFloat` applied to:** readiness card, product preview, featured surfaces.  
**`glass` applied to:** dashboard content cards, today's plan, weak areas, trend chart.

**Hero redesign:**
- `clamp(2.6rem, 6.4vw, 4.5rem)` display type, tracking `–0.03em`
- Blue → violet gradient on accent headline phrase
- Atmospheric glow behind floating product shot

**Scroll reveals** — `Reveal` component (IntersectionObserver, opacity + translateY
+ blur-out, staggered, reduced-motion safe, always-in-DOM).

**Build:** ✅ green. Light + dark verified.

---

### Pass 3 — Petr Knoll Glass Edge (inspired by CodePen QwWLZdx)
**Goal:** Lit glass edges so components read as real material.

**Technique:** A `::before` pseudo-element drawn *between* each surface's background
and its content (`isolation: isolate`, `z-index: -1`):

```css
.glass-edge::before {
  background: linear-gradient(180deg, hsl(0 0% 100% / 0.1), transparent 64px);
  box-shadow:
    inset 0 1px 0 0 hsl(0 0% 100% / 0.4),   /* top specular */
    inset 0 0 0 1px hsl(0 0% 100% / 0.08);  /* full perimeter rim */
}
```

**Applied to:** all buttons (except ghost/link), all cards, all glass classes.  
**ScoreRing fix:** `overflow-visible` + centered `drop-shadow(0 0 14px …)` so the
glow is a clean circular halo, not a box shape.

**Build:** ✅ green. Verified in dark mode (boxy halo gone).

---

## Phase 3 — Design Direction Execution (Phased)

### Design Direction Document
`DESIGN_DIRECTION.md` — a codebase-grounded, executable design brief covering:
material tiers, blur budget, motion spec, component checklist, guardrails,
phased plan, and DoD per pass.

---

### Phase 1 — Motion Foundation ✅
- **`--ease-spring`** token: `cubic-bezier(0.34, 1.3, 0.64, 1)` — gentle overshoot
- **`.press`** rebuilt: transform springs (scale 0.97 + settle), colour/border/shadow
  on calm ease; no `transition-all` clash
- **Buttons** use `ease-spring` base transition + animated focus ring
- **Modal** enters with `animate-modal-in` (spring scale-in)
- **Route transitions** — 4 `template.tsx` files in `dashboard/`, `study/`,
  `licence-prep/`, `account/` — 240ms opacity fade on content while chrome stays put
- **Verified:** real client-side nav tested (dashboard → study), no breakage

---

### Phase 2 — Inputs & Overlays ✅
- **`Input` focus:** `border-primary`, `bg-card` (fully opaque while typing),
  soft 4px ring, `caret-primary`, hover border cue, scoped transitions
- **New `Switch` primitive** (`src/components/ui/switch.tsx`): tactile glass toggle,
  track eases colour, knob springs across (`ease-spring`), focus ring
- **Refactored 2 inline toggles** (account data-saver + pricing annual) → shared
  `Switch` — DRY + consistent motion
- **New `Tooltip` primitive** (`src/components/ui/tooltip.tsx`): floating `glass-2`,
  scales/fades on hover/focus, CSS-only, no deps; wired to theme toggle
- **Mobile menu overlay** → `glass-panel` + `animate-fade-in`
- **Verified:** Switch on/off works, data-saver engages; login inputs dark mode ✅

---

### Phase 3 — Tables & Lists ✅
- **Today's plan rows:** quieter fill (`bg-background/40`), hairline border,
  hover tint, `.press` for tactile response
- **Mock exam history:** converted to single `divide-y` container with hairline
  dividers + row hover tint (verified in DOM: `divide-border` class present)
- **Tutor thread list:** `.press` + softer hover tint on thread items
- **Study hub cards:** `hover-elevate` (lift + shadow on hover)
- **Diagnostic plan rows:** quieter, consistent with other rows
- **Verified:** "Passed"/"Not yet" pills confirmed in divided list DOM

---

### Phase 4 — Depth Tuning ✅
New `glassSubtle` helper for recessed tier. Applied clear tier hierarchy across
every app page:

| Page | glassFloat | glass | glassSubtle |
|------|-----------|-------|-------------|
| Account | Profile card | All section cards | — |
| Progress | — | Trend / category / history | Stat tiles |
| Study | — | Mode cards + category card | — |
| Licence Prep | — | Module cards | — |
| Cook-mode | Active step card | Common faults | — |

**Sidebar:** soft `10px 0 30px -22px` right-edge shadow — page content floats
above the nav rail. Upgrade card gains `backdrop-blur-md`.

**Verified:** Dark mode progress page shows recessed tiles vs elevated section
cards — 3 tiers clearly legible over atmosphere ✅

---

### Phase 5 — Empty & Loading States (In Progress)
- **Shimmer animation:** corrected keyframe `0% translateX(-100%)` → `100%`
  with `1.8s ease-in-out infinite`
- `Skeleton` component gets the shimmer pass
- `EmptyState` primitive planned
- `PageLoader` (branded, replaces bare `<Spinner>`)
- Application to: mock-history empty, flashcard "all caught up", tutor empty,
  diagnostic analysing

---

### Phase 6 — Marketing Polish (Pending)
- Floating glass nav pill (Tourera-style)
- Hero rhythm refinement
- Section reveals polish
- Product-shot framing improvements

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| `localStorage` primary, Supabase optional | Zero-config demo mode; swap persistence layer without touching UI |
| `useStudyStore` centralised hook | Single source of truth; every action persists + updates readiness |
| `glass-edge` in `::before` with `isolation` | Lit rim never washes over text; paints between bg and content |
| `template.tsx` for route transitions | Scoped to page content; shell never remounts |
| `glassSubtle` / `glass` / `glassFloat` tiers | Adjacent surfaces must sit at different depths — legible without explanation |
| Fallback AI tutor | Real K53 content, keyword search — useful without OpenAI key |

---

## File Structure (Key Files)

```
src/
  app/
    page.tsx                    # Landing (Reveal-wrapped sections)
    dashboard/page.tsx          # Dashboard
    dashboard/progress/page.tsx # Analytics
    dashboard/template.tsx      # Route transition
    study/page.tsx              # Study hub
    study/template.tsx
    tutor/page.tsx              # AI Tutor
    licence-prep/page.tsx       # Licence prep hub
    licence-prep/[moduleId]/    # Cook-mode
    account/page.tsx            # Account settings
    account/billing/page.tsx    # Tier switching
    api/tutor/route.ts          # OpenAI + fallback
    api/checkout/route.ts       # Stripe-ready
  components/
    ui/                         # Design system primitives
      button.tsx score-ring.tsx mastery-bar.tsx
      switch.tsx tooltip.tsx skeleton.tsx
    app/app-shell.tsx           # Glass nav shell + PageHeader
    landing/                    # All marketing sections
    dashboard/                  # Readiness, plan, weak-areas, AI rec, trend
    study/                      # Flashcards, questions, scenarios, mock-exam
    tutor/tutor-chat.tsx        # Chat UI
    driver/module-cook-mode.tsx # Step-by-step guide
    shared/reveal.tsx           # Scroll reveal component
  lib/
    utils.ts                    # cn(), glass, glassFloat, glassSubtle
    srs/sm2.ts                  # Spaced repetition
    diagnostic/                 # Scoring + sampling
    billing/plans.ts            # Tiers + feature gates
    ai/                         # OpenAI + fallback + prompt builder
    store/local-store.ts        # localStorage persistence
    supabase/                   # Client, server, middleware
  hooks/
    use-study-store.tsx         # Central state (React Context)
    use-data-saver.ts           # Data-saver toggle
  types/index.ts                # Complete domain model
  app/globals.css               # Tokens + glass system + motion
tailwind.config.ts              # Shadows, easings, keyframes
supabase/migrations/            # SQL schema + seed
DESIGN_DIRECTION.md             # Executable design brief
```

---

## Environment Setup

```bash
# Run zero-config (demo mode)
npm install
npm run dev
# open http://localhost:3000

# Production build
npm run build
```

**To activate integrations** (each activates independently via `.env.local`):

```env
# Supabase (persistence + auth)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# OpenAI (AI tutor)
OPENAI_API_KEY=...
OPENAI_MODEL_FAST=gpt-4o-mini
OPENAI_MODEL_SMART=gpt-4o

# Stripe (billing)
STRIPE_SECRET_KEY=...
STRIPE_PRICE_PREMIUM_MONTHLY=...
STRIPE_PRICE_PREMIUM_PLUS_MONTHLY=...
```

---

## Design System Summary

### Glass Depth Tiers
| Tier | Class | Blur | Fill | Usage |
|------|-------|------|------|-------|
| Atmosphere | `bg-app` / `bg-aurora` | — | radial gradients | Page backdrop |
| Chrome | `glass-panel` | 26px | 66% bg | Sidebar, topbar, mobile nav |
| Recessed | `glass-subtle` | 14px | 40% card | Stat tiles, insets |
| Content | `glass` | 22px | 50% card | Content cards |
| Floating | `glassFloat` / `glass-2` | 30–34px | 66–68% card | Hero, active step, modals |

### Edge Lighting
```css
/* Petr Knoll glass edge — on all buttons + cards + glass surfaces */
.glass-edge::before {
  /* top specular + perimeter rim */
}
```

### Motion Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `ease-glass` | `cubic-bezier(0.22, 1, 0.36, 1)` | Page/element reveals |
| `ease-soft` | `cubic-bezier(0.4, 0, 0.2, 1)` | Colour/opacity changes |
| `ease-spring` | `cubic-bezier(0.34, 1.3, 0.64, 1)` | Press/release, switch knob |

### Colour Palette
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | `hsl(216 64% 52%)` | `hsl(214 90% 64%)` | Blue, brand, CTAs |
| `--accent` | `hsl(28 92% 55%)` | `hsl(28 92% 60%)` | Amber, streak, highlights |
| `--background` | `hsl(210 38% 98%)` | `hsl(222 30% 7%)` | Page |
| `--success` | `hsl(150 56% 40%)` | `hsl(150 50% 54%)` | Pass, correct |
| `--warning` | `hsl(36 92% 48%)` | `hsl(36 90% 58%)` | Caution, average |
| `--danger` | `hsl(4 72% 56%)` | `hsl(4 78% 64%)` | Error, weak |

---

*Last updated: June 2026 — Phase 5 (Empty & Loading States) in progress.*
