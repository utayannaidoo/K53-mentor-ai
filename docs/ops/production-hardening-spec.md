# Production Hardening Spec

> Restructured from: "find and fix any security flaws for production, the user should only
> have access once they have paid — enforce this completely; clean up the project; make the
> website responsive; no lag."

## Objective

Make the paid tier impossible to obtain or use without paying, harden every production
surface found in the audit, and ship a clean, responsive, lag-free build — verified by
typecheck, production build, and a browser sweep at mobile/tablet/desktop widths.

## Architecture rule (the one sentence that matters)

**The server is the only source of truth for what a user paid for.** The client's tier is
display state; every request that costs money (AI calls) resolves the tier from the
`subscriptions` table on the server and enforces per-user daily allowances there. Client
gates remain for UX only. A tampered localStorage or devtools session can change what the
browser *shows*, never what the server *serves*.

## Audit findings → fixes

### Critical — paid access is bypassable today

| # | Flaw | Fix |
|---|------|-----|
| S1 | Billing page unlocks any paid tier **locally** whenever `/api/checkout` fails (rate-limit, network error, misconfig). Blocking the request in devtools = free Premium Plus. | Local unlock only when the server explicitly answers `demo: true` **and** Supabase is unconfigured (pure local demo). Real failures show an error banner. |
| S2 | AI routes (`/api/tutor`, `/api/coach`, `/api/vision`) check *signed in* but never *paid*. Per-tier daily caps live only in localStorage. A free user can call the tutor 40×/day directly. | New server-only entitlements module: resolve tier from `subscriptions` (status must be active/trialing; lookup failure fails **closed** to free), enforce per-user per-tier daily allowances in Redis (in-memory fallback). IP limits stay as the outer abuse guard. |
| S3 | Sign scanner (the priciest AI calls) has **no tier gate anywhere** — client or server. | Scanner becomes a paid feature: `scanner` feature key in plans, Paywall for free tier, server vision allowance for free = 0. |
| S4 | "Continue as demo guest" renders in production, skipping signup entirely. | Guest button only when Supabase is unconfigured. |

### Hardening

| # | Flaw | Fix |
|---|------|-----|
| S5 | Webhook trusts `checkout.session.completed` without checking `payment_status`; delayed payment methods would grant tier before money moves. | Guard `payment_status === "paid"`; handle `checkout.session.async_payment_succeeded`. |
| S6 | Cron secret compared with `!==` (timing-leaky). | `crypto.timingSafeEqual`. |
| S7 | User-controlled `full_name` interpolated unescaped into notification-email HTML. | Escape it. |
| S8 | After Stripe redirects back with `?status=success`, the UI claims "payment complete" but the tier only updates on a later reload (webhook race) — looks like paid-but-locked. | Billing page polls the account until the paid tier lands, then confirms. |

### Accepted / documented (not fixed in this pass)

- Study **content** (questions, signs, scenarios) ships in the client bundle; free-tier
  content gates are client-side. Moving content behind a paid API is a product rebuild —
  the money layer (AI usage) is what's server-enforced. Documented as a known trade-off.
- In-memory rate-limit fallback is weak on serverless. Production must set Upstash env —
  now stated in `.env.example`'s production checklist.

## Performance ("no lag")

- P1: The localStorage blob grows without bound (every attempt, tutor message, readiness
  point forever). Prune on save: keep recent attempts, cap tutor threads/messages,
  readiness history, and expire old daily-usage keys.
- P2: The full state JSON-stringifies synchronously on every answer. Debounce writes
  (~250ms) with a `pagehide`/hidden flush so nothing is lost on tab close.
- P3: Ambient paint (aurora gradients, blur glass) already has data-saver kill-switches
  and Lenis respects reduced motion — verify reduced-motion coverage for looping
  animations, add where missing.

## Responsiveness

- Sweep at 375 / 768 / 1280px: landing, dashboard, study hub, questions, flashcards,
  mock exam, progress, tutor, billing, account. Zero horizontal overflow; tap targets
  and sticky bars usable at 375px. Fix everything found.

## Cleanup

- `.env.example`: document every env var actually read, plus a "before you go live"
  checklist (migrations 0001–0006, Stripe prices + webhook, Upstash, CRON_SECRET, Resend).
- Remove dead code/mock leftovers; zero `console.log` in src; typecheck + production
  build must pass.

## Acceptance criteria

1. With Stripe + Supabase configured, there is **no code path** that sets a paid tier
   without a verified Stripe event. (Grep-level guarantee: `setTier("premium…")` only in
   the demo branch behind `!isSupabaseConfigured`.)
2. Signed-in free user calling `/api/vision` directly gets 403; `/api/tutor` beyond the
   free allowance gets 429 with an upgrade hint — regardless of localStorage contents.
3. Paid caps (15/40 tutor msgs) enforce per **user id**, not per IP.
4. Webhook grants tier only on paid events; cancel/expiry downgrades to free.
5. Typecheck + `next build` pass; browser sweep shows no overflow at 375px.
