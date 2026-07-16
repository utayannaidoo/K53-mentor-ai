# K53 Mentor AI

AI-powered South African K53 learner's & driver's licence prep SaaS. Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Supabase (SSR auth + RLS) · **Paystack** billing (not Stripe) · AI provider cascade **Anthropic → OpenAI → rule-based local fallback** (not OpenAI-first) · Vercel + Upstash Redis.

## Commands
```bash
npm run dev        # dev server (use .claude/launch.json for previews)
npm run typecheck  # tsc --noEmit
npm run test       # vitest run
npm run build      # next build
node scripts/content-stats.mjs  # per-category question/flashcard counts
```
CI (`.github/workflows/ci.yml`) runs typecheck + test + build on Node 22.

## Skills — use them
- `k53-content-sprint` — adding questions/flashcards/scenarios (fact-file pipeline + gates)
- `glass-design-system` — ANY UI/styling/motion work
- `k53-verify` — definition of done before shipping
- `paystack-billing` — anything touching payments/tiers/AI caps

## Architecture rules
1. **Two modes, both must always work**: zero-config demo mode (localStorage via `src/hooks/use-study-store.tsx` + `src/lib/store/local-store.ts`, rule-based tutor) and production mode (Supabase persistence, real AI). Integrations activate independently via env — never assume a key exists.
2. **Server is the source of truth for money.** Tier resolves from `subscriptions` server-side (`src/lib/billing/entitlements.server.ts`, fails closed to free); the Paystack webhook is the only paid-tier writer; client gates are UX only.
3. **Client state is the source of truth for study progress** (MVP decision): `use-study-store.tsx` persists to localStorage; Supabase mirrors the same shapes and hydrates via `src/lib/store/account-hydrate.ts`.
4. **Content pipeline**: all questions/flashcards live in `src/lib/content/` as typed pack files aggregated into `QUESTIONS`/`FLASHCARDS`. Every fact must trace to `docs/content/facts/*.md` with a source. `tests/content-coverage.test.ts` is a ratchet — bump minimums up, never down.
5. **RLS on every user table**; credit/referral mutations only via security-definer RPCs; service-role key only in `src/lib/supabase/admin.ts` (server-only).
6. AI routes enforce auth + entitlement + rate limits server-side (`src/lib/ai/rate-limit.ts`, Upstash). Vision is paid-only.

## Key docs
- `docs/content/expansion-roadmap.md` — content sprint log, targets, sources
- `docs/ops/production-hardening-spec.md` — S1–S8 security invariants
- `docs/growth/` — engagement research + slice specs
- `DESIGN_DIRECTION.md` / `SESSION_LOG.md` — design system history & spec

## Conventions
- No `console.log` in `src/`. No new deps unless unavoidable. Every AI feature degrades gracefully (demo mode / provider outage never shows a raw error). Vehicle-code content (A/10/14) is gated per track. Migrations are append-only (`supabase/migrations/`).
