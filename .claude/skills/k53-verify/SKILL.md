---
name: k53-verify
description: The project's definition of done — typecheck, tests, build, and browser sweep before any change ships. Use before committing, after finishing a feature/fix, or when asked to verify.
---

# K53 Verify — Definition of Done

## 1. Static gates (mirrors `.github/workflows/ci.yml`, Node 22)
```bash
npm run typecheck   # tsc --noEmit
npm run test        # vitest run (11 suites incl. billing-security + content ratchet)
npm run build       # next build — all routes must compile
```
All three must be green. Content changes additionally require the `tests/content-coverage.test.ts` ratchet to be bumped, never lowered.

## 2. Browser sweep (dev server via `.claude/launch.json`)
Preview at 375 / 768 / 1280 px, light AND dark:
- No horizontal overflow anywhere; tap targets + sticky bars usable at 375px.
- Surfaces to hit: landing, dashboard, study hub, questions, flashcards, mock exam, progress, tutor, billing, account.
- Toggle data-saver (account settings) — blur/loops must drop, layout intact.
- Reduced motion (emulate via devtools) — no looping animation remains.

## 3. Mode checks
The app runs in two modes; both must work:
- **Demo mode** (no env): localStorage persistence, rule-based tutor fallback, no auth wall, guest flows.
- **Supabase mode**: middleware guards `/dashboard /study /tutor /licence-prep /account`; entitlements resolve server-side.

## 4. Money-path invariants (from `docs/ops/production-hardening-spec.md`)
Grep-level guarantees that must survive any change:
- No code path sets a paid tier without a verified Paystack webhook event (client unlock only behind `!isPaystackConfigured`).
- AI routes (`/api/tutor`, `/api/coach`, `/api/vision`) resolve tier from the `subscriptions` table server-side and fail **closed** to free.
- Free user calling `/api/vision` directly → 403; tutor beyond allowance → 429, regardless of localStorage.
- Zero `console.log` left in `src/`.

## 5. Content sanity
`node scripts/content-stats.mjs` — per-category counts match the roadmap table in `docs/content/expansion-roadmap.md`.
