# Admin surface: deferred (decision record)

**Status:** deferred — 2026-07-26
**Decision:** do not build an `/admin` panel yet. Turn PostHog on, run support through Supabase Studio, and ship config changes as deploys. Build `/admin` when one of the triggers in §2 lands, using the auth model in §3.

Deferring costs nothing architecturally. There is no role column, no `is_admin`, and no staff concept anywhere in the schema or middleware, so nothing in the app has to be designed around a future admin panel — adding staff auth later is a single migration. The actual risk of "later" is that it becomes an `/admin` page guarded by a client-side email check. §3 exists so that doesn't happen.

## 1. What covers each need today

| Need | Covered by | Gap |
|---|---|---|
| Analytics | `src/lib/analytics.ts` — full PostHog integration: 15 typed events, `identify()`, manual App Router pageviews, 9 call sites. No-ops purely because `NEXT_PUBLIC_POSTHOG_KEY` is unset | None — needs a key (§1.1) |
| Fixing user accounts | Supabase Studio SQL editor (§1.2) | None for a solo operator |
| Tweaking settings | Constants + Vercel env: `DAILY_ALLOWANCE` (`src/lib/billing/entitlements.server.ts`), prices and feature gates (`src/lib/billing/plans.ts`), rate limits (`src/lib/ai/rate-limit.ts`) | Needs a deploy (~2 min). **Deliberate** — `DAILY_ALLOWANCE` is the money guard and must not sit behind mutable data |
| Posting notices | Nothing. No announcement table, no feature flags, no maintenance mode. `notifications` is written by the email cron and never read by the UI | **Real gap** — a notice today is a copy change + deploy |

### 1.1 Switching PostHog on

No code required; `AnalyticsProvider` is already mounted in `src/app/layout.tsx` and the vars are already in `.env.example`.

1. Create a PostHog project. **The Cloud region (US/EU) is fixed at creation** and cannot be changed later without a migration — EU is the closer hop for a South African user base. `NEXT_PUBLIC_POSTHOG_HOST` must match the region chosen or every event 404s silently.
2. Set in Vercel (production + preview + development) and local `.env.local`:
   - `NEXT_PUBLIC_POSTHOG_KEY=phc_…` (project API key — never a personal API key; this ships to the browser)
   - `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (or `eu.…`)
3. **Redeploy.** These are `NEXT_PUBLIC_` — inlined at build time, so an env change without a rebuild does nothing.

Wiring notes (already done, don't re-litigate): `identify()` fires from the Supabase auth listener in `src/hooks/use-study-store.tsx` — not from the sign-in form — so password, OAuth and returning `INITIAL_SESSION` all land on one identity; it sends the user id only, no name or email. Sign-out calls `resetAnalytics()` so a shared phone doesn't merge two learners. The CSP in `next.config.mjs` lists the PostHog host in **both** `script-src` and `connect-src`; capture only needs the latter, but session replay, surveys and the toolbar lazy-load bundles and would otherwise fail silently.

Still open, if funnel accuracy starts mattering: ad-blockers and some mobile networks block `*.posthog.com` outright (commonly 20–30% of events). The fix is a Next.js rewrite from a first-party path to the PostHog host.

Build the funnels in PostHog, not in app code:

- **Activation:** `signup_completed` → `diagnostic_completed` → `mock_completed`
- **Conversion:** `paywall_viewed` → `paywall_cta_clicked` → `checkout_started` → `plan_activated`

The event vocabulary is the `AnalyticsEvent` union in `src/lib/analytics.ts`. Keep it small and add to the union rather than capturing ad-hoc strings.

### 1.2 Support recipes (Supabase Studio → SQL editor)

**Look a user up.** Everything you need for "I paid but I'm still on free":

```sql
select p.email, p.vehicle_code, p.created_at,
       s.tier, s.status, s.provider_customer_id,
       s.current_period_end, s.paid_at, s.last_charge_reference,
       s.tutor_credits, s.money_back_used
from profiles p
left join subscriptions s on s.user_id = p.id
where p.email = 'someone@example.com';
```

Reading the result:

- **No `subscriptions` row** — the `handle_new_user()` trigger should have seeded a free row at signup. A missing row means signup half-failed; investigate before granting anything.
- **`status = 'past_due'`** — a failed renewal inside Paystack's retry window. This is a *grace* state and still grants the paid tier (`entitlements.server.ts`). If they're complaining about lost access, `past_due` is not the cause.
- **`status = 'canceled'` + `tier = 'free'`** — the `subscription.disable` webhook fired. Correct behaviour, not a bug.
- **Paid on Paystack but `tier = 'free'` here** — the webhook didn't land. Check the Paystack dashboard's webhook log first, then `payment_events` (`id`, `type`, `processed_at` — the idempotency ledger, keyed on the Paystack event id).

**Before ever hand-editing `subscriptions`:** the Paystack webhook is the only legitimate paid-tier writer (CLAUDE.md rule 2). A manual `update` silently diverges the app from Paystack — the learner keeps access with no live billing behind it. Prefer **replaying the webhook from the Paystack dashboard**; it's idempotent, and `payment_events` prevents double-granting. Only write by hand when replay is impossible, and when you do, set `provider_customer_id`, `paid_at` and `last_charge_reference` too — the cancel/refund path (`src/lib/billing/subscription-cancel.ts`) reads them, and a row missing them cannot be refunded correctly.

**Never grant credits with a bare `update`.** Use the RPC, which is what the webhook uses:

```sql
select grant_tutor_credits('<user-uuid>'::uuid, 20);
```

## 2. Triggers — build `/admin` when any one of these lands

- **You needed to post a notice and shipping a deploy for it felt wrong.** Most likely first trigger; notices are the only genuinely uncovered need.
- **Support lookups exceed ~2–3 a week**, or they start arriving faster than you clear them.
- **You want to comp, refund, or grant credits** without hand-writing SQL against the money tables. Hand-editing billing is fine at one a month and dangerous at one a day.
- **A second person needs any of the above.** Handing out a Supabase Studio login is the moment deferring stops being free — Studio has no notion of least privilege.

Explicitly **not** triggers:

- Wanting a nicer analytics view. PostHog is better than anything built here, and a hand-rolled dashboard would read from progress tables that are incomplete by design (§4).
- Wanting to change caps or prices without a deploy. A deploy is the *safer* path for the money guard; runtime-editable entitlements are a downgrade in safety, not an upgrade in convenience.

## 3. The auth model to use when the time comes

Fixed now so it isn't improvised under pressure.

- **`profiles.is_staff boolean not null default false`**, set only by hand in SQL. No self-serve path, no email allowlist in code, no env-var list of admin emails.
- **One server-side `requireStaff()` helper**, shaped like `resolveEntitlement()` in `src/lib/billing/entitlements.server.ts`: `import "server-only"`, resolves the session, fails closed, returns a `Response` on failure so routes can `if (x instanceof Response) return x`.
- **Middleware is UX only.** Add `/admin` to `PROTECTED` in `src/lib/supabase/middleware.ts` for the login redirect, but never rely on it. **Trap:** `updateSession` returns early when Supabase is unconfigured, so in demo mode an `/admin` prefix is entirely unguarded. Every admin page and route must re-check server-side and refuse outright when `isSupabaseConfigured` is false — there are no accounts in demo mode, so there is no such thing as a demo-mode admin.
- **Cross-user reads go through server routes** using `createAdminClient()` behind `requireStaff()`. Never a client-side service-role path, and never a new RLS policy that widens a user table — the existing owner-only policies stay exactly as they are. `src/app/api/cron/notifications/route.ts` is the existing precedent for a guarded cross-user service-role read.
- **The notice slice, when built:** one `announcements` table (public-read RLS, staff-write), a banner following the `glass-design-system` skill. Both modes must still work — demo mode has no Supabase, so the banner renders nothing rather than erroring.

## 4. Known limits of deferring

Things that are *not* being recorded while this is deferred, so they aren't discovered later as gaps:

- **Per-user AI spend has no history.** Usage counters live in Upstash Redis with a ~25h TTL (`src/lib/ai/rate-limit.ts`), not Postgres. There is no queryable record of who consumed how much AI, and none is accumulating. If cost-per-user analysis ever matters, that instrumentation has to be added first — an admin panel cannot surface data that was never written.
- **Client errors expire.** `src/app/api/log/route.ts` only `console.error`s; errors are visible in Vercel logs and gone with them. The file's own comment flags Sentry/PostHog as the intended replacement.
- **Progress tables are incomplete by design.** Client state is the source of truth (CLAUDE.md rule 3) and Supabase sync is best-effort client push. Never treat `question_attempts` and friends as analytics truth — use PostHog events for behaviour.
- **Several tables are unused.** `tutor_conversations`, `tutor_messages`, `study_sessions`, `study_plans`, `user_procedure_progress`, `licence_modules`, `categories` have no reads or writes in `src/`; question and flashcard content is served from bundled packs in `src/lib/content/`, not the DB. An admin dashboard querying them would render convincing zeroes.
