# Site health fixes — 26 September 2026

Based on production commit 5ecfa66e00f8eeae1a95401f07d26a74df037185.

## Changes

- Free quiz prepares shuffled options once per attempt and remaps the correct
  answer. Shared helper preserves diagnostic/study behavior. Regression tests
  exercise the actual public sampler, correct-answer mapping, section balance,
  unique questions and source-bank immutability.
- Public road-sign search starts with All. The in-app library retains its
  existing Regulatory default.
- Sign category metadata is separate from the full catalogue. The public
  browser no longer evaluates or downloads the complete 439-sign catalogue.
  Its First Load JS in the production build falls from 150 kB to 131 kB (~13%).
  The linked scripts contain at most one catalogue ID each, versus the old
  catalogue chunk containing all 439 IDs. The 151 verified public signs still
  arrive as server-provided page data. This measures JS, not total page weight
  or real-user load time; rendering All increases the initial HTML list.
- Next 15.5.26, aligned ESLint config, Vitest 4.1.11 and compatible security
  updates. PostCSS 8.5.28 replaces Next's pinned 8.4.31 through a scoped override
  tied to the root PostCSS range. Sharp resolves to 0.35.4. npm audit: zero
  reported vulnerabilities. Remove the PostCSS override when the framework's
  own dependency constraint is patched.
- Added a read-only Paystack refund preflight and an exhausted-queue recovery
  runbook. The observed live refund remains blocked by insufficient funds;
  no refund, queue update, subscription change or notification was performed.

## Verification

- TypeScript and lint passed.
- All 1,414 tests passed in 154 files, including the actual PGlite money tests
  with PARTNER_SQL_REQUIRED=1; no skips.
- Production build passed: 83 static pages. Existing Supabase Edge-runtime
  process.version warning remains.
- Accessibility: 45 prerendered pages, zero serious/critical violations. The
  same 11 minor/moderate landmark findings as the baseline remain.
- npm ci dry run passed, including the PostCSS override; npm ls is valid.
- Public search: typing children immediately returns Children ahead with All
  selected. A full 10-question quiz completes and scores consistently with its
  answer feedback (the all-A sample scored 4/10; deterministic tests establish
  correctness rather than relying on a random score).
- 72 responsive page checks: landing, dashboard, study, questions, flashcards,
  mock exam, progress, tutor, billing, account, road signs and free quiz at
  375/768/1280 widths in light/dark. Zero horizontal overflow or console errors.
- Demo guest onboarding and saved study preference survive navigation. Data
  saver persists and disables glass blur. No production-user writes occurred.
- Content remains unchanged: 1,296 questions, 974 flashcards, 68 scenarios.

## Limits and release follow-up

Local verification used Node 25.4.0; GitHub CI is configured for Node 22.
Production auth and money boundaries passed automated tests; a live paid
checkout/refund was not performed. Browser tools did not expose reduced-motion
emulation, so that specific OS preference was not separately exercised. No CSS
or motion definitions changed. Follow docs/ops/refund-recovery.md after funding;
Paystack accepting a request is not evidence of final bank settlement.
