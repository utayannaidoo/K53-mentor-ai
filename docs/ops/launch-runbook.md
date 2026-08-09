# Launch runbook — k53mentorai.co.za

Written for the **hard public launch**: live domain, live Paystack money, marketing from
day one.

Work top to bottom. Sections 1–6 are the critical path (nothing is live until they're
done); 7–10 must be done before you drive traffic; 11–12 are the day-of.

> **Related docs**
> - [`supabase-auth-setup.md`](./supabase-auth-setup.md) — SMTP, redirect allowlist, `token_hash` templates. Read it in full at §4; it is not duplicated here.
> - [`production-hardening-spec.md`](./production-hardening-spec.md) — **stale.** Written against Stripe (S5 names `checkout.session.completed`) before the Paystack migration in `0008_paystack.sql`. All eight invariants S1–S8 *are* implemented, but the document describes a provider the app no longer uses. **Do not use it as the go-live gate.** Rewriting it against Paystack is post-launch work.

---

## Where the app already stands

Worth knowing what you *don't* have to build, so the checklist below reads as short
rather than alarming. Already in place and tested:

- **Billing** — server-truth tier resolution from `subscriptions` failing closed to free; HMAC-SHA512 webhook signature verification with `timingSafeEqual`; a `payment_events` idempotency ledger shared by the webhook and the callback-verify path; self-serve cancel with auto-refund inside 7 days.
- **Auth** — Supabase SSR with middleware session refresh, prefix-matched route protection, an open-redirect allowlist (`safe-next.ts`), cross-device email confirmation via `token_hash`, and full password reset.
- **Security** — RLS on every user table; `payment_events` and `account_deletion_codes` are service-role-only; `security definer` functions with pinned `search_path` and `execute` revoked from `public`; CSP + HSTS + `X-Frame-Options: DENY` + `Permissions-Policy`; empty `images.remotePatterns` closing the sharp/libvips fetch path; the service-role key confined to `src/lib/supabase/admin.ts` behind `import "server-only"`.
- **Rate limiting** — per-IP *and* per-user daily limits on every AI route, with a production boot-throw if an AI key is set without Upstash, and vision failing closed on limiter outage.
- **SEO** — sitemap, robots, manifest, OG image, per-page metadata with canonicals, FAQ + Article JSON-LD, all guarded by `tests/seo.test.ts` and `tests/public-links.test.ts`.
- **Content** — 1,060 questions, 68 scenarios, ~14 distinct mock papers (`node scripts/content-stats.mjs`).

---

## 0. Status as of 9 Aug 2026

**Live:** `https://k53mentorai.co.za` serves the app from Vercel. `www` resolves and
serves too (200, not a redirect — the canonical tag points at the apex, so Google
consolidates, but a 308 would be tidier). Canonicals, sitemap, robots and OG all emit
the correct origin. Migrations `0001` → `0020` applied and verified.

**Paystack is live-keyed** and the five billing routes respond correctly
(`/api/checkout`, `/api/billing/cancel`, `/api/paystack/verify`, `/api/paystack/webhook`,
`/api/cron/reconcile-payments`).

**Still blocking a real launch:**

| Blocker | Where |
|---|---|
| No mail DNS at all — no MX, SPF, DKIM or DMARC | §5 |
| Supabase custom SMTP not configured (blocked on the above) | §4 |
| Supabase `token_hash` email templates not applied | §4 — **do this now, it isn't blocked** |
| `BUSINESS` in `src/lib/constants.ts` is blank → ECTA s43 / POPIA s55 disclosures don't render | §7 |
| `SUPPORT_EMAIL` is still a personal Gmail, public on `/contact` and `/refunds` | §8 |
| Upstash, Anthropic/OpenAI, `CRON_SECRET`, PostHog env vars unset → both crons 401, tutor on local fallback | §3, §9 |

> ⚠️ **Set Upstash *before* the AI keys.** `src/lib/ai/rate-limit.ts` throws at boot when
> an AI key is present without Upstash, so adding `ANTHROPIC_API_KEY` first takes
> production down.

**Do not reference `k53mentor.co.za` or `k53mentor.com`.** Both were front-run on
2026-08-06 — registered two seconds apart to a third party via domains.co.za, minutes
after the name was typed into a registrar search box. They are not ours and never will be.

---

## 1. ~~Buy the domain~~ — done

`k53mentorai.co.za` is registered at **domains.co.za**, DNS served by ClouDNS
(`ns1–4.anycast-ns.com/.net`, SOA admin `dns-admin.domains.co.za`). Manage records in the
domains.co.za panel — not HOSTAFRICA, and not Vercel's DNS tab, which is inert here.

Kept for the next time: `.co.za` is administered by ZACR/ZADNA, and **neither Cloudflare
Registrar nor Vercel Domains sells it** — you need a South African registrar. And never
type a candidate name into a registrar's public search box before you are ready to buy in
the same session; plain DNS lookups against `8.8.8.8` are safe, registrar searches are not.

---

## 2. DNS + Vercel

- [ ] Point nameservers at Cloudflare (free) — fastest path to the TXT records needed for
      Resend, DMARC and Search Console below. Registrar DNS also works if you'd rather
      keep it simple.
- [ ] Vercel → Project → Settings → Domains → add `k53mentorai.co.za` **and**
      `www.k53mentorai.co.za`
- [ ] Use the exact A/CNAME values **Vercel's dashboard shows you** — not values copied
      from a blog post; they have changed over time
- [ ] If proxying through Cloudflare, the records pointing at Vercel must be **DNS-only
      (grey cloud)**
- [ ] Wait for certificate issuance; confirm `https://k53mentorai.co.za` loads
- [ ] Confirm the `www` → apex redirect works
- [ ] Vercel → Deployment Protection is **off for production** (leave it on for previews)

> `next.config.mjs` already sends `Strict-Transport-Security: max-age=63072000;
> includeSubDomains` in production. Every subdomain you ever add must therefore be HTTPS.
> **Do not submit to the HSTS preload list** at launch — it is effectively irreversible.

---

## 3. Environment variables — then rebuild, *then* cut DNS

`NEXT_PUBLIC_*` values are **inlined at build time**. Setting them and switching DNS
without a redeploy leaves every email link, sitemap URL and canonical pointing at the old
origin. Order matters: **set env → redeploy → cut DNS.**

Set these in Vercel → Settings → Environment Variables, **Production** scope:

| Var | Value | Why it matters |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://k53mentorai.co.za` | **Blocker.** `src/lib/constants.ts:11` falls back to `http://localhost:3000`. Unset ⇒ every canonical, the whole sitemap, the `robots.txt` sitemap line, both JSON-LD blocks and every transactional email link say localhost. Silently. |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://eu.i.posthog.com` | **Blocker.** Your PostHog project is in the **EU** region; `src/lib/analytics.ts:13` defaults to `us.i.posthog.com`. Wrong host ⇒ zero events, no error. |
| `NEXT_PUBLIC_POSTHOG_KEY` | project key | |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | | Guarded — the app throws at boot on Vercel prod without them |
| `SUPABASE_SERVICE_ROLE_KEY` | | Server-only. Never `NEXT_PUBLIC_`. |
| `PAYSTACK_SECRET_KEY` | **`sk_live_…`** | A `sk_test_` key on a *production* deployment throws in `paystack/client.ts`, so checkout breaks loudly rather than accepting test cards for real tiers. Preview keeps using test keys — that is the merchant-review setup. |
| `PAYSTACK_ALLOW_TEST_KEY` | unset (or `1` **temporarily**) | Escape hatch for the window before merchant activation completes, when there is no live key to hold. Exactly `1` downgrades the throw above to a per-boot warning. **Remove it the day you get an `sk_live_` key** — while it is set, anyone who knows Paystack's test card numbers gets a paid tier free. |
| `PAYSTACK_PLAN_PREMIUM_MONTHLY` / `_ANNUAL` / `_PLUS_MONTHLY` / `_PLUS_ANNUAL` | live plan codes | Missing ⇒ 500 "Price not configured for this plan" at checkout |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | | Guarded. Without them the in-memory fallback resets per lambda — i.e. no real rate limiting |
| `ANTHROPIC_API_KEY` | | Preferred provider |
| `OPENAI_API_KEY` | | Fallback in the cascade |
| `RESEND_API_KEY` | | Without it, receipts and dunning are skipped and the reminder cron runs dry |
| `NOTIFY_FROM_EMAIL` | `K53 Mentor <coach@k53mentorai.co.za>` | Default is `onboarding@resend.dev` — Resend's shared sandbox sender. Spam-folder magnet. |
| `CRON_SECRET` | long random string | Otherwise `/api/cron/notifications` is open |

- [ ] All of the above set on **Production**
- [ ] `NEXT_PUBLIC_SITE_URL` set separately on **Preview** — it must **not** be the
      production origin. A `*.vercel.app` value is correct here.
- [ ] Redeploy so the new `NEXT_PUBLIC_*` values are baked in
- [ ] Only then cut DNS

> `assertSiteUrlConfiguredInProduction()` throws if a **production** deployment
> (`VERCEL_ENV=production`) has `NEXT_PUBLIC_SITE_URL` unset, pointed at a `*.vercel.app`
> host, or missing its scheme. **Preview deployments are exempt entirely** — they run with
> `NODE_ENV=production` and `VERCEL=1` as well, so a guard keyed off those alone takes
> every preview down the moment the Preview scope has no `NEXT_PUBLIC_SITE_URL` of its
> own. (It did exactly that once; `tests/env-guard.test.ts` now pins the behaviour.)
> Setting a Preview value is therefore optional — do it only if you want preview
> canonicals to be accurate.
>
> This was added after the live site was found publishing canonicals, a sitemap and a
> robots.txt pointing at `k53-mentor-ai.vercel.app` while serving on the custom domain.

> Both `src/lib/billing/callback-origin.ts` (Paystack return URL) and the auth flows
> (which use `window.location.origin`) are already domain-change-safe by design. It is the
> *build-time* vars that need the redeploy.

---

## 4. Supabase

- [x] Every migration `0001` → `0020` applied. 0019 adds the dispute/refund/non-renewal
      columns the webhook writes — without it those three events throw and Paystack
      retries them forever. 0020 makes `profiles.referral_code` / `referred_by`
      server-owned. Both applied and verified on 8 Aug 2026.
- [ ] **Auth → URL Configuration → Site URL** = `https://k53mentorai.co.za`
- [ ] **Auth → URL Configuration → Redirect URLs** include:
      - `https://k53mentorai.co.za/auth/callback`
      - the preview wildcard (`https://*-<your-vercel-scope>.vercel.app/auth/callback`)
      - `http://localhost:3000/auth/callback`

      Supabase silently falls back to Site URL when a redirect isn't allowlisted — that's
      the "the link works but dumps me on the landing page" failure.
- [ ] **Google Cloud OAuth client** — add `https://k53mentorai.co.za` as an authorised
      JavaScript origin and the Supabase callback as an authorised redirect URI; put the
      live privacy and terms URLs on the consent screen
- [ ] **Custom SMTP configured** (point it at Resend). The built-in mailer is capped at a
      handful of messages an hour and will strand launch-day signups
- [ ] **Email templates** use `token_hash` for Confirm signup / Magic link / Change email;
      Reset password keeps `{{ .ConfirmationURL }}`. Exact markup in
      [`supabase-auth-setup.md`](./supabase-auth-setup.md) §3
- [ ] Security + performance **advisors** run, nothing critical outstanding
- [ ] Leaked-password protection enabled
- [ ] Backup/PITR situation confirmed and the restore path understood

> None of the above is verified by CI. It is entirely dashboard-side, which is exactly why
> it needs ticking off by hand.

---

## 5. Email that actually lands

Resend is **send-only**. You need both a verified sending domain and a receiving inbox.

- [ ] Verify `k53mentorai.co.za` in Resend — add the **SPF** and **DKIM** records
- [ ] Add **DMARC**: `v=DMARC1; p=none; rua=mailto:you@…` to start. Tighten to
      `p=quarantine` once you've watched reports for a couple of weeks
- [ ] Receiving inbox for `support@k53mentorai.co.za` — **Cloudflare Email Routing** (free)
      forwarding to your Gmail is the cheapest credible option. Zoho Mail free tier or
      Google Workspace if you want a real mailbox
- [ ] `NOTIFY_FROM_EMAIL` points at the verified sender
- [ ] Test-send to **Gmail, Outlook and Yahoo** — check **spam placement**, not just
      delivery
- [ ] Send yourself a real payment receipt and a reminder email; confirm every link in
      them resolves to `k53mentorai.co.za` (this is the acid test that §3's rebuild worked)

Known gaps, post-launch:
- No Resend bounce/complaint webhook — hard bounces accumulate invisibly.
- No welcome email for free signups; the only welcome is bundled into the payment receipt
  (`src/lib/notify/templates.ts:89`).

---

## 6. Paystack go-live

- [ ] Merchant activation complete (business docs + bank account), live keys issued
- [ ] Four ZAR Plans created and their codes copied into env:
      - Premium — **R60/mo**, **R480/yr**
      - Premium Plus — **R70/mo**, **R600/yr**
- [ ] **Reconcile each Plan's dashboard amount against `src/lib/billing/plans.ts`**
      (`monthly: 60` at line 148, `monthly: 70` at line 183; annual = `(monthly − 20) × 12`
      via `ANNUAL_MONTHLY_SAVING` at line 40).

      This one deserves a beat: checkout sends *both* an amount and a plan code, but for a
      subscription **Paystack bills the Plan's dashboard amount**, not the amount we send.
      Nothing in code or CI asserts they agree. If the dashboard says R99 and `plans.ts`
      says R60, the site advertises R60 and the card is charged R99 — silently, and it's a
      consumer-protection problem, not just a bug.
- [ ] Webhook URL → `https://k53mentorai.co.za/api/paystack/webhook` (update it from any
      vercel.app URL used during testing)
- [ ] **Live end-to-end with a real card:** pay → webhook writes `subscriptions` → tier
      unlocks in the app → receipt email arrives → cancel → refund lands
- [ ] Declined-card path tested
- [ ] Settlement account and schedule confirmed

**Closed on 8 Aug 2026:**

- [x] **Reconciliation job** — `GET /api/cron/reconcile-payments`, daily at 03:00 UTC
      (`vercel.json`). Lists Paystack's successful transactions for the last 3 days and
      grants anything with no `payment_events` row, reusing the webhook's idempotency via
      `applyChargeOnce`. It exists because the webhook and `/api/paystack/verify` share
      that ledger: if the webhook lands first and returns `duplicate`, then `verify`'s
      apply throws and releases the row, Paystack has already been ACKed and will **not**
      retry — money taken, tier never granted. Every repair logs `[reconcile] granted a
      charge the webhook never applied`; **make that a log alert.**
- [x] **`refund.processed`** — downgrades to free and stamps `refunded_at`. Matched on the
      refunded charge's reference, not the customer, so refunding a one-off tutor top-up
      can't strip somebody's subscription.
- [x] **`charge.dispute.create`** — stamps `disputed_at` and logs loudly. Deliberately
      does *not* downgrade: a dispute is a claim, not an outcome. If it resolves against
      you, Paystack issues a refund and `refund.processed` does the downgrade.
- [x] **`subscription.not_renew`** — sets `cancel_at_period_end`. Deliberately does *not*
      touch tier or status; the learner paid through the period, and any status outside
      active/trialing/past_due makes entitlements fail closed and revokes access early.
      `subscription.disable` is still the actual cutoff.

Requires **migration 0019** and `CRON_SECRET` (the same one the notifications cron uses).

Still open, post-launch:

- **No card-update flow.** The billing page tells users to cancel and resubscribe, which
  will churn people whose cards expire. With disputes and refunds now handled, this is
  the largest remaining support-load item.
- `subscriptions.provider_subscription_id` is never written; cancellation depends wholly
  on `provider_customer_id` plus a live Paystack customer fetch.
- `applyChargeSuccess` grants tier from `metadata.plan` without comparing `amount` or
  `currency` to the expected price. Metadata is server-set so it isn't directly
  exploitable, but an underpaid charge still grants the tier.

---

## 7. Legal / SA compliance

Most of this shipped on 8 Aug 2026:

- [x] **`/contact` route added** — footer-linked and in the sitemap. Gives a signed-out
      visitor a route to make a POPIA request, which `/privacy` previously answered with
      "use your account page".
- [x] **Processors named in the privacy policy** — Supabase, Vercel, Paystack, Anthropic,
      OpenAI, Resend, PostHog, Upstash, each with what it receives.
- [x] **Cross-border transfer section added**, relying on the POPIA s72
      contract-necessity ground.
- [x] **PostHog disclosed** in the cookies section, including that autocapture is off.
- [x] **ECTA s44 cooling-off named** on `/refunds`, framed as the 7-day money-back window
      meeting it automatically. **Auto-renewal now disclosed explicitly** in section 1.
- [x] "Last updated" refreshed on privacy, terms and refunds.

Still outstanding — these need information only you have:

- [ ] **Fill in `BUSINESS` in `src/lib/constants.ts`**: legal name (or your own name if
      trading as a sole proprietor), CIPC registration number, **street address** (a PO
      box does not satisfy ECTA s43), and the Information Officer's name. `/contact` and
      `/privacy` render these the moment they are set, and omit the sections while blank.
- [ ] **Register with the Information Regulator** as an Information Officer (POPIA s55).
      This is a queue — start it early.
- [ ] **Have a South African lawyer read the three legal pages.** They are written to be
      honest and specific, not to be legal advice, and you are about to take real money
      from consumers under the CPA.

A cookie consent banner is arguably not required under POPIA (which is
consent-at-collection rather than ePrivacy-style), and consent is already taken at signup
(`src/components/auth/auth-form.tsx`). **Disclosure** is the obligation here, not a banner.

---

## 8. Code defects

Fixed on 8 Aug 2026 — kept here as the record of what changed and why.

| # | Where | Issue | Status |
|---|---|---|---|
| 1 | `src/lib/constants.ts` | `SUPPORT_EMAIL` is a personal Gmail address, rendered publicly on `/refunds` and now `/contact` | **Open — deliberately.** Flip it to `support@k53mentorai.co.za` the same day Cloudflare Email Routing exists (§5). Doing it sooner advertises a dead address, which is worse than the Gmail |
| 2 | `src/components/engagement/share-card.tsx` | Share image read "…with k53mentor.ai", a domain you don't own, on the WhatsApp share path | Fixed — now derives from `SITE_DOMAIN` |
| 3 | `src/app/api/checkout/route.ts` | Guest placeholder `guest@k53mentor.ai` sent to Paystack | Fixed — `SITE_DOMAIN` |
| 4 | `src/components/auth/auth-form.tsx` | Demo-mode `demo@k53mentor.ai` | Fixed — `SITE_DOMAIN` |
| 5 | `docs/ops/supabase-auth-setup.md` | Worked examples used `k53mentor.ai` | Fixed |
| 6 | `src/lib/env.ts` | No production assertion for `SITE_URL` | Fixed — `assertSiteUrlConfiguredInProduction()`, called from middleware so it covers every page request |
| 7 | `src/lib/env.ts` | No assertion that `PAYSTACK_SECRET_KEY` is a live key | Fixed — `assertLivePaystackKeyInProduction()`, scoped to `paystack/client.ts` so a test-key deploy breaks checkout loudly without taking the study app down |
| 8 | `src/app/sitemap.ts` | `/refunds` missing though footer-linked and public | Fixed — `/refunds` and `/contact` added, plus three `tests/seo.test.ts` ratchets: every public legal page is listed, no sitemap entry points at a non-existent route, and nothing is both submitted and disallowed |
| 9 | `src/components/landing/faq.tsx` | `FAQPage` JSON-LD emitted on both `/` and `/pricing` | Fixed — schema is now opt-in via `withSchema`, only `/` opts in, and a test pins the count at one |
| 10 | `public/favicon.ico` | Missing; only `favicon.svg` existed | Fixed — generated by wrapping `icon-192.png` in an ICO container (no image dependency added). Declared after the SVG so modern browsers still prefer the vector |
| 11 | `src/app/opengraph-image.tsx` | Slate/blue, not the product's Road Atlas green | Fixed — repainted from the dark-mode tokens in `globals.css`. Also corrected "500+ real questions" to **1,000+**; the bank is at 1,060 |
| 12 | `src/lib/report-error.ts` | Client errors went only to `console.error` — no grouping, no alerting, short retention | Fixed — also calls `captureException` via the already-loaded `posthog-js`. Both sinks kept: the log line survives when analytics is blocked, PostHog adds grouping |

**New follow-up from this work:** `src/lib/constants.ts` now exports a `BUSINESS` object
(legal name, registration number, street address, Information Officer) that `/contact`
and `/privacy` render **only when set**. They are currently blank, so the ECTA s43 and
POPIA s55 disclosures are still outstanding — filling them in is a one-place edit.

---

## 9. Cost control + monitoring

Non-optional for a hard launch — `/api/tutor` and `/api/vision` are the cost blast radius,
and the Upstash limits are the only thing standing between a scraper and your card.

- [ ] **Hard spend cap set in the Anthropic dashboard**
- [ ] **Hard spend cap set in the OpenAI dashboard**
- [ ] Upstash Redis live and reachable from production
- [ ] Vercel spend limit + billing alerts configured
- [ ] Uptime monitor (UptimeRobot / BetterStack, both free) on `/` and `/pricing`
- [ ] Supabase usage alerts

Note for later: the Supabase and Upstash boot guards both gate on `process.env.VERCEL`, so
they only fire on Vercel. Fine for this launch — worth remembering if hosting ever moves,
because on another host a missing Supabase config would silently serve everyone
`premium_plus` with route protection disabled.

---

## 10. SEO + launch marketing

- [ ] **Google Search Console** — verify `k53mentorai.co.za` by DNS TXT, submit
      `https://k53mentorai.co.za/sitemap.xml`
- [ ] **Bing Webmaster Tools** — imports directly from Search Console
- [ ] **Test the OG card in WhatsApp**, not just Twitter/LinkedIn. It's the SA sharing
      channel. Check a **guide** URL as well as the homepage — `layout.tsx` deliberately
      omits `openGraph.title` so each page resolves its own
- [ ] PageSpeed / Core Web Vitals pass once the domain is live
- [ ] Optional: `Organization` + `SoftwareApplication`/`Offer` JSON-LD on `/pricing`
      (prices already live in `src/lib/billing/plans.ts`)

Lead organic acquisition with the four articles under `/guides` — they're the indexable
surface. The content bank (1,060 questions, 68 scenarios, ~14 non-repeating mock papers) is
a real differentiator against the Play Store competition; say so on the landing page.

---

## 11. Pre-flight

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

- [ ] Green on all four (CI runs the same set on Node 22)
- [ ] Stale remote `claude/*` branches audited — merge or delete, so the first hotfix
      branches off something clean
- [ ] **Full manual sweep on the live domain:** signup → confirm the email **on a different
      device** → onboarding → diagnostic → hit the paywall → real payment → tier unlocks →
      tutor replies → cancel
- [ ] Demo mode still works with no env — open the app, "Continue as demo guest"
- [ ] Real Android Chrome **and** iOS Safari, including PWA install and `/offline`
- [ ] Password reset end to end
- [ ] Google sign-in end to end on the new domain

---

## 12. Day one

- [ ] Vercel runtime logs open, filtered for `[client-error]`
- [ ] Paystack dashboard watched for failed charges and disputes
- [ ] PostHog funnel confirmed to be receiving events (this is your first proof the EU host
      is right)
- [ ] Vercel instant-rollback kept in reach

---

## Handover — work in flight (9 Aug 2026)

Branch **`claude/tutor-cost-controls`** is pushed with one commit and **no PR opened**.
It is green (typecheck, lint, 458 tests, build) and safe to merge as-is.

### What that commit already does

Cuts tutor cost before the AI keys go live: escalation threshold 220→500 chars, smart
model `claude-sonnet-4-6`→`claude-sonnet-5`, `TUTOR_MAX_TOKENS` 500→350, free tier served
by the local rule-based explainer, and removal of a `cache_control` marker that was a
silent no-op (the persona is ~350 tokens; the minimum cacheable prefix is 4096 on Haiku
4.5, 1024 on Sonnet 5 — a breakpoint below the minimum returns
`cache_creation_input_tokens: 0` rather than erroring).

### The unfinished task

The free tier is **also the 7-day trial** (`PLAN_MAP.free.limits.trialDays`, 2 tutor
messages/day). Serving it the local explainer therefore removes the demo of the headline
feature from exactly the people deciding whether to pay. The agreed fix: **real AI during
the trial, local once it expires** — roughly R0.59 per trialling signup (14 messages ×
~R0.042).

Everything needed was already traced:

- `src/app/api/tutor/route.ts` currently passes `forceLocal: ent.tier === "free"`. That
  becomes something like `ent.tier === "free" && !withinTrial`.
- The trial anchor lives client-side in `src/lib/billing/trial.ts` → `trialStartedAt()`,
  which takes the first of `onboarding.completedAt`, `diagnostics[0].at`,
  `profile.createdAt`. **The tutor route cannot see any of that** — it only has
  `ent.tier` and `ent.userId` from `resolveEntitlement`.
- So the trial start has to be resolved **server-side**. `profiles.onboarded_at` is the
  closest match to the client's primary anchor, with `profiles.created_at` as the
  fallback. Both already exist — no migration needed.
- Suggested shape: a `isWithinFreeTrial(userId)` helper in
  `src/lib/billing/entitlements.server.ts` (it already holds the admin client and the
  tier logic), reading those two columns and comparing against `FREE_TRIAL_DAYS` from
  `src/lib/billing/plans.ts`.
- Match the client's forgiving behaviour: when **nothing** anchors the trial (fresh
  account, wizard unfinished), `trialDaysRemaining` treats the week as *untouched* rather
  than expired. Server-side must do the same, or a brand-new signup gets the local
  explainer on their very first message.
- `tests/tutor-cost-controls.test.ts` pins the current behaviour; extend it rather than
  rewriting — the "free tier never reaches a provider" block becomes "free tier reaches a
  provider during the trial, and stops after it".
