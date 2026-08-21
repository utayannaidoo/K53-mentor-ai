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
- **Content** — 1,296 questions, 974 flashcards, 68 scenarios, ~17 distinct mock papers per code (`node scripts/content-stats.mjs`, re-counted 11 Aug 2026).

---

## 0. Status as of 9 Aug 2026

**Live:** `https://k53mentorai.co.za` serves the app from Vercel. `www` resolves and
serves too (200, not a redirect — the canonical tag points at the apex, so Google
consolidates, but a 308 would be tidier). Canonicals, sitemap, robots and OG all emit
the correct origin. Migrations `0001` → `0020` applied and verified.

> **Migration status corrected 21 Aug 2026:** the repo now ships through `0025`, and a
> read-only introspection of the live database (`/rest/v1/` OpenAPI, service role) on
> that date confirmed every table and column introduced by **0021–0025 is present**:
> `ai_usage_daily`, `email_suppressions`, `profiles.licence_result*` / `drivers_result*`,
> `streaks.regains_used`, `study_sessions.client_id`. Production is migration-current;
> only this line was stale. Re-verify after any new migration the same way.
>
> Note `subscriptions.track` still exists on live — deliberate: 0018 retires rather than
> drops it (append-only history; nothing reads or writes it).

**Paystack is live-keyed** and the five billing routes respond correctly
(`/api/checkout`, `/api/billing/cancel`, `/api/paystack/verify`, `/api/paystack/webhook`,
`/api/cron/reconcile-payments`).

**Still blocking a real launch:**

| Blocker | Where |
|---|---|
| ~~No mail DNS~~ — **done 10 Aug 2026.** DNS on Cloudflare, Email Routing live, MX/SPF/DKIM/DMARC published, **Resend domain Verified** | §5 |
| ~~`RESEND_API_KEY` + `NOTIFY_FROM_EMAIL`~~ — set in Vercel and redeployed, 10 Aug 2026 | §5.5 |
| ~~Supabase custom SMTP~~ — configured against Resend, 10 Aug 2026 | §4 |
| ~~`token_hash` email templates~~ — applied and verified, 10 Aug 2026 | §4 |
| **Nothing has actually been sent yet.** No transactional email has left the building end to end — the whole chain is configured but unproven | §5.5 |
| `BUSINESS` in `src/lib/constants.ts` blank → ECTA s43 / POPIA s55 disclosures don't render. **Accepted, not outstanding** — decision taken 10 Aug 2026 to launch without it; §7 records what to fill when that changes | §7 |
| ~~Upstash, `CRON_SECRET`~~ — **set**, per owner confirmation 21 Aug 2026 (not independently verified — spot-check Vercel env or expect non-401 from both cron routes with the bearer token). AI provider keys (`DEEPSEEK_API_KEY`/`ANTHROPIC_API_KEY`/`OPENAI_API_KEY`) and PostHog: still confirm which are present — without any AI key the tutor runs on local fallback | §3, §9 |

> ⚠️ **Set Upstash *before* the AI keys.** `src/lib/ai/rate-limit.ts` throws at boot when
> an AI key is present without Upstash, so adding `DEEPSEEK_API_KEY` or
> `ANTHROPIC_API_KEY` first takes production down. All three provider keys count.

> **Mail DNS is one blocker wearing three hats.** It gates Resend, which gates custom
> SMTP, which gates the email templates (Supabase disables template editing entirely on
> the built-in mailer — confirmed on the live project 10 Aug 2026) and the `support@`
> inbox that `SUPPORT_EMAIL` is waiting on. Nothing else in §4 or §5 moves until the
> records exist, so start there.

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
| `DEEPSEEK_API_KEY` | | **Default provider.** ~9x cheaper per message than Haiku 4.5, which is what the 15/35-a-day tutor caps are priced against. Prepaid balance, no monthly spend cap — top it up and watch it |
| `ANTHROPIC_API_KEY` | | Fallback in the cascade, **and the only path for images.** DeepSeek's API is text-only, so without this (or `OPENAI_API_KEY`) the sign scanner reports itself unavailable |
| `OPENAI_API_KEY` | | Second fallback; also image-capable |
| `RESEND_API_KEY` | | Without it, receipts and dunning are skipped and the reminder cron runs dry |
| `NOTIFY_FROM_EMAIL` | `K53 Mentor <support@k53mentorai.co.za>` | Default is `onboarding@resend.dev` — Resend's shared sandbox sender. Spam-folder magnet. Must be an address §5.2 actually routes, because no `reply_to` is sent and replies go here. |
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
- [x] **Email templates applied 10 Aug 2026.** Confirm signup (`type=email` → `/continue`),
      Magic link (`type=magiclink` → `/continue`) and Change email (`type=email_change` →
      `/account`) now use `token_hash`; Reset password deliberately still uses
      `{{ .ConfirmationURL }}`. Each re-read after a fresh page load to confirm it
      persisted. Markup in [`supabase-auth-setup.md`](./supabase-auth-setup.md) §3.
- [x] Security + performance **advisors** run, nothing critical outstanding (10 Aug 2026).
      The only WARN is the leaked-password one below; the two `rls_enabled_no_policy`
      INFOs are `payment_events` and `account_deletion_codes`, which are service-role-only
      by design — RLS on with no policy is exactly right for them.
- [~] **Leaked-password protection — deliberately skipped.** It needs a paid Supabase
      plan, and the decision is to launch without it. The advisors will keep flagging it;
      that is expected, not an outstanding task. Revisit when the project moves off the
      free tier.
- [ ] Backup/PITR situation confirmed and the restore path understood

> None of the above is verified by CI. It is entirely dashboard-side, which is exactly why
> it needs ticking off by hand.

---

## 5. Email that actually lands

**This is the critical path.** Resend is send-only, so you need a verified sending domain
*and* a receiving inbox, and everything else waiting on mail — Supabase custom SMTP, the
`token_hash` templates in §4, the public support address — is downstream of these records.

Decided 10 Aug 2026: **move DNS to Cloudflare**, because Email Routing is the only free
way to receive at the domain, and because every remaining TXT record in this runbook
(Resend, DMARC, Search Console) then lives in one panel. The interim support inbox is
`support.k53mentor@gmail.com` — a role address, already live, already shipped as
`SUPPORT_EMAIL`, and the destination the domain address forwards to once §5.2 is done.

### 5.1 Move DNS to Cloudflare *without* dropping the site

The zone is two records:

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `k53mentorai.co.za` | `216.198.79.1` | **DNS only (grey cloud)** |
| CNAME | `www` | `17a3707dc089cda5.vercel-dns-017.com` | **DNS only (grey cloud)** |

- [x] Added to Cloudflare (Free plan). The add-site scan imported both records with the
      correct values — an empty zone was never the risk here.
- [x] **Both switched from Proxied to DNS only, 10 Aug 2026.** This is the part that
      nearly went wrong: the scan imports everything **orange-cloud proxied** and does not
      ask. Proxied, Vercel cannot complete its certificate challenges, and an SSL/TLS mode
      below Full gives an HTTP→HTTPS redirect loop — with §2's HSTS header already served,
      a bad certificate is a hard failure with no click-through for any returning visitor.
- [x] **Nameservers changed at domains.co.za to `ali.ns.cloudflare.com` and
      `drew.ns.cloudflare.com`.** Delegation confirmed at the registry, zone active,
      10 Aug 2026.
- [x] Apex still answers `216.198.79.1` and `www` still resolves through
      `vercel-dns-017.com` with Cloudflare authoritative — the grey-cloud fix held through
      the cutover. Both hostnames return 200 with a valid certificate.

> **How to tell "not saved" from "still propagating".** Query the `.co.za` registry
> directly rather than a resolver:
>
> ```bash
> nslookup -norecurse -type=NS k53mentorai.co.za coza1.dnsnode.net
> ```
>
> The registry is the parent delegation — resolver answers can trail a change by hours,
> but the registry has no cache. Once it shows the new names, the change is real and
> everything downstream is only waiting. During this cutover the registry lagged the
> registrar's own panel by several minutes, so a single early check showing the old
> nameservers is not evidence the edit failed. Check twice, a few minutes apart, before
> concluding anything.
- [ ] Once the delegation lands, confirm `https://k53mentorai.co.za` and
      `https://www.k53mentorai.co.za` still serve, and that the apex still answers
      `216.198.79.1` rather than a Cloudflare anycast address (`104.x` / `172.67.x`) —
      a Cloudflare IP means something got re-proxied

> **The ordering advice that actually matters.** "Recreate the zone before switching
> nameservers" is the usual warning, and it is not wrong — but the scan makes an empty
> zone unlikely, while *proxy status* is silently wrong every time. Check the cloud
> colour, not just the record values, and check it before the delegation lands rather
> than after.

### 5.2 Receiving — Cloudflare Email Routing

**Two independent gates, and only one of them is waiting on DNS.** Attempting the DNS half
early returns *"This zone must be active before you can enable Email Service"*, and the
routing rules refuse a destination that hasn't been verified — the address picker simply
reports "No verified destination addresses found" with nothing selectable.

- [x] Destination address `support.k53mentor@gmail.com` added and **Verified**
- [x] Routing rule `support@k53mentorai.co.za` → that destination — **Active**
- [x] Routing rule `dmarc@k53mentorai.co.za` → same destination — **Active** (see 5.4)
- [x] **Catch-all** left **disabled**. Enabled, every typo and every address a scraper
      invents forwards to the same inbox
- [x] Settings → DNS records → **Add missing records** — done. Three apex MX
      (`route1–3.mx.cloudflare.net`, priorities 18/27/83), a DKIM TXT at
      `cf2024-1._domainkey`, and an apex SPF `v=spf1 include:_spf.mx.cloudflare.net ~all`.
      All four verified live against `ali.ns.cloudflare.com`
- [x] **Email Routing status: Enabled**, DNS records Locked
- [x] Test mail sent 10 Aug 2026 — Cloudflare logged it **Forwarded**
- [ ] Find it in the Gmail. First forwarded message usually lands in **Spam**: the forward
      preserves the original `From:`, so gmail.com's SPF does not match Cloudflare's
      sending IP. Mark it "Not spam" once and it settles

> **When a forward "doesn't arrive", check Email Routing → Activity Log first.** It says
> whether Cloudflare ever received the message and what it did with it, which splits the
> problem cleanly in two: no row at all is a DNS/MX problem on the sender's side, while
> **Forwarded** means Cloudflare did its job and the message is sitting in a spam folder.
> Guessing at DNS when the log already says *Forwarded* wastes the hour.
>
> Related but separate: the apex had no MX until the records were added, and a NODATA
> answer is negatively cached for the SOA minimum — **7200s, two hours**. Any sender that
> looked up `k53mentorai.co.za` MX in that window keeps failing until its cache expires,
> and per RFC 5321 falls back to the A record, i.e. tries to deliver SMTP to Vercel.
> Nothing to fix; it ages out.
- [ ] Then flip `SUPPORT_EMAIL` in `src/lib/constants.ts` to `support@k53mentorai.co.za`
      and redeploy

### 5.3 Sending — Resend

- [x] `k53mentorai.co.za` added in Resend, region **Ireland (`eu-west-1`)** — same region
      as the Supabase project and the closest to South Africa
- [x] Three records added in Cloudflare and confirmed resolving:

      | Type | Name | Value |
      |---|---|---|
      | TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3…` (DKIM, unique per domain) |
      | TXT | `send` | `v=spf1 include:amazonses.com ~all` |
      | MX | `send` | `feedback-smtp.eu-west-1.amazonses.com`, priority 10 |

- [x] **Resend reports Verified** (10 Aug 2026)

> ⚠️ **Do not add Resend's "Enable Receiving" record.** Alongside the three above, Resend
> offers a fourth — an MX on the **apex** pointing at `inbound-smtp.eu-west-1.amazonaws.com`.
> Adding it puts a second receiver on the apex alongside Cloudflare Email Routing's
> `route1–3.mx.cloudflare.net`, and inbound mail starts landing at whichever one wins the
> priority race. **Receiving is Cloudflare's job here; Resend only sends.** The three
> records above are the complete set.

> **Choose "Manual setup", not "Auto configure".** Auto configure asks to authorise
> Resend against your DNS provider, which grants it write access to the whole Cloudflare
> zone — including the Vercel A/CNAME records and the Email Routing MX. Pasting three
> records by hand takes two minutes and keeps that blast radius at zero.

> **Two MX records is correct here and not a mistake.** Cloudflare's are on the apex and
> receive your mail; Resend's is on the `send.` subdomain and only collects bounce
> feedback. They are different names, so they never compete. The same goes for the two SPF
> records — one at the apex for forwarding, one at `send` for sending. What you must never
> do is publish **two SPF TXT records on the same name**; that is a permerror, and it
> fails every message rather than only the ambiguous ones.
>
> **Do not "fix" the apex SPF by adding Resend to it.** It will look wrong — mail goes out
> as `coach@k53mentorai.co.za`, yet the apex SPF names only Cloudflare. It is correct.
> SPF is evaluated against the Return-Path, which Resend sets to `send.k53mentorai.co.za`,
> and DMARC's relaxed alignment accepts a subdomain of the From: domain. DKIM signs with
> `d=k53mentorai.co.za` and aligns directly. Both mechanisms pass. Editing the apex record
> is how you end up with two SPF records on one name, which is the permerror above.

### 5.4 DMARC

- [x] TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:dmarc@k53mentorai.co.za; fo=1` —
      published and verified live, 10 Aug 2026. `p=none` is monitor-only: it cannot cause
      a message to fail, it only asks receivers to report
- [ ] Tighten to `p=quarantine` once you have watched reports for a couple of weeks

> **Why not point `rua` straight at the Gmail?** A `rua` address outside the policy domain
> is an *external destination*, and RFC 7489 §7.1 requires the receiving domain to publish
> a matching authorisation record. `gmail.com` publishes no such record for your domain, so
> compliant reporters are entitled to drop the reports — silently. Routing through
> `dmarc@k53mentorai.co.za` keeps the address inside the domain, and Email Routing
> forwards it to the same Gmail anyway.

### 5.5 Then, and only then

- [ ] `RESEND_API_KEY` set in Vercel Production. Create it at Resend → **API Keys** →
      Create, with **Sending access** only and scoped to `k53mentorai.co.za` — a key that
      can only send cannot delete your domain or read your logs if it leaks. Resend shows
      it once; copy it straight into Vercel
- [ ] `NOTIFY_FROM_EMAIL` = **`K53 Mentor <support@k53mentorai.co.za>`**, and redeploy —
      Vercel only picks up env changes on a new deployment

> **The From address is also the reply address.** `src/lib/notify/email.ts:22` sends no
> `reply_to`, so whatever `NOTIFY_FROM_EMAIL` names is where a learner's reply goes. Use
> `support@`, which §5.2 already routes. The `coach@` address this runbook used to suggest
> has **no routing rule**, and with catch-all disabled a reply to it is rejected outright —
> silently, from the sender's point of view, on a payment receipt. If you want the `coach@`
> branding, add a routing rule for it first, or add a `reply_to` to the sender.
- [ ] **Supabase custom SMTP** (§4) → host `smtp.resend.com`, port `465`, user `resend`,
      password = a Resend API key, sender `support@k53mentorai.co.za` (it **must** be on
      the verified domain, or Resend rejects the message and it looks like Supabase
      silently not sending)
- [ ] **Raise the per-hour cap** under Auth → **Rate Limits**. The built-in mailer's low
      limit stays in force until you change it — this is the "custom SMTP is configured
      but mail still isn't arriving" trap

> **Use a separate API key per consumer** — one for Vercel, one named `supabase-smtp` —
> each with Sending access only and scoped to the domain. Resend hashes keys on creation
> and will never show one again, so a shared key that goes missing means rotating every
> system at once. Separate keys mean the name tells you what to rotate, and revoking one
> cannot take the other down. They are free and unlimited.
- [ ] **Then the `token_hash` email templates** (§4) — the editor stays read-only until
      the SMTP step above is saved
- [ ] Test-send to **Gmail, Outlook and Yahoo** — check **spam placement**, not just
      delivery
- [ ] Send yourself a real payment receipt and a reminder email; confirm every link in
      them resolves to `k53mentorai.co.za` (this is the acid test that §3's rebuild worked)
- [ ] Signup → confirm the email **on a different device**, which is the whole point of
      the `token_hash` templates

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

- [~] **`BUSINESS` in `src/lib/constants.ts` — deliberately left blank, 10 Aug 2026.**
      Decision taken to launch without the ECTA s43 / POPIA s55 sections rendering. It is
      a one-place edit to reverse, and `/contact` and `/privacy` pick the fields up the
      moment they are set.

      **This is not blocked on registering a company**, which is what it looked like the
      first time round. Selling in your own name without incorporating *is* a legal form —
      a sole proprietorship — and ECTA applies to anyone offering goods or services
      electronically, incorporated or not. It changes what you disclose, not whether you
      disclose. So when you come back to this, three of the four fields already have
      answers:

      | Field | Sole proprietor |
      |---|---|
      | `legalName` | Your own full legal name |
      | `registrationNumber` | **Correctly empty** — there is no CIPC number to give |
      | `informationOfficer` | You. For a private body the head is the Information Officer by default |
      | `address` | The only genuinely open one |

      The address is the whole decision, and it is a privacy one rather than a legal
      unknown: ECTA wants a physical address precisely so someone can be served there, so
      a PO box is out and a home-based operation means a home address on a public,
      crawlable page next to a payment flow. The usual way out is a virtual/registered
      office (roughly R150–400/month in SA), which gives a real street address that can
      receive service without publishing where you live.

      Cross-check whatever you choose against what Paystack has: merchant activation
      recorded you as either an individual or a business, and the two should agree.
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
| 1 | `src/lib/constants.ts` | `SUPPORT_EMAIL` is a personal Gmail address, rendered publicly on `/refunds` and now `/contact` | Fixed on 10 Aug 2026 — now `support.k53mentor@gmail.com`. A role address rather than someone's name, which was the part that mattered; a learner disputing a charge should not be mailing an individual. It becomes `support@k53mentorai.co.za` the day Email Routing forwards it (§5.2), with the same inbox behind it. Shipping the domain address first would advertise one that bounces |
| 2 | `src/components/engagement/share-card.tsx` | Share image read "…with k53mentor.ai", a domain you don't own, on the WhatsApp share path | Fixed — now derives from `SITE_DOMAIN` |
| 3 | `src/app/api/checkout/route.ts` | Guest placeholder `guest@k53mentor.ai` sent to Paystack | Fixed — `SITE_DOMAIN` |
| 4 | `src/components/auth/auth-form.tsx` | Demo-mode `demo@k53mentor.ai` | Fixed — `SITE_DOMAIN` |
| 5 | `docs/ops/supabase-auth-setup.md` | Worked examples used `k53mentor.ai` | Fixed |
| 6 | `src/lib/env.ts` | No production assertion for `SITE_URL` | Fixed — `assertSiteUrlConfiguredInProduction()`, called from middleware so it covers every page request |
| 7 | `src/lib/env.ts` | No assertion that `PAYSTACK_SECRET_KEY` is a live key | Fixed — `assertLivePaystackKeyInProduction()`, scoped to `paystack/client.ts` so a test-key deploy breaks checkout loudly without taking the study app down |
| 8 | `src/app/sitemap.ts` | `/refunds` missing though footer-linked and public | Fixed — `/refunds` and `/contact` added, plus three `tests/seo.test.ts` ratchets: every public legal page is listed, no sitemap entry points at a non-existent route, and nothing is both submitted and disallowed |
| 9 | `src/components/landing/faq.tsx` | `FAQPage` JSON-LD emitted on both `/` and `/pricing` | Fixed — schema is now opt-in via `withSchema`, only `/` opts in, and a test pins the count at one |
| 10 | `public/favicon.ico` | Missing; only `favicon.svg` existed | Fixed — generated by wrapping `icon-192.png` in an ICO container (no image dependency added). Declared after the SVG so modern browsers still prefer the vector |
| 11 | `src/app/opengraph-image.tsx` | Slate/blue, not the product's Road Atlas green | Fixed — repainted from the dark-mode tokens in `globals.css`. Also corrected "500+ real questions" to **1,000+**; the bank is at 1,296 |
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
surface. The content bank (1,296 questions, 68 scenarios, ~17 non-repeating mock papers) is
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

## Pre-launch audit changes (21 Aug 2026)

Full-repository audit; everything below is landed, typechecked, linted, and covered by
the test suite (756 tests green at the time of writing).

**Security / entitlements**

1. **Entitlement-aware content caching** (`src/lib/content/pack-cache.ts`, rewritten
   `src/components/content/content-provider.tsx`). Before this, a downloaded pack sat in
   Cache Storage forever, keyed only by content version: a cancelled/expired/refunded
   account kept serving the full paid bank offline indefinitely, and a manipulated
   `localStorage` tier re-unlocked it — no server involvement. Now every cached read
   requires either a live `/api/content/pack?probe=1` confirmation or an unexpired,
   server-stamped grant (`entitlement.expiresAt`, 72h). Cache entries are keyed by
   version + tier + owner id, so accounts can't read each other's packs and a Premium
   cache can't satisfy a Plus session. Sign-out purges the whole cache.
2. **Premium no longer receives Plus-only modules** (`src/app/api/content/pack/route.ts`).
   The yard-test modules are a Premium Plus feature per the pricing page, but the pack
   shipped all of them to any paid tier and hid them in the UI. Now filtered server-side:
   `modules` is empty unless `hasFeature(tier, "licencePrep")`. Questions/flashcards/
   scenarios remain shared by design — the regression guard that Premium gets the study
   bank still holds.

**Honesty fixes**

3. **Readiness evidence handling** (`src/lib/diagnostic/scoring.ts`). Question accuracy
   was a raw average — 1/1 read as 100% mastery and inflated the predicted-pass figure.
   Now a Beta-binomial posterior mean shrunk toward the baseline (strength 2), plus a
   `measured` flag on the breakdown (<12 answered questions ⇒ dashboard and progress say
   "Predicted pass (estimate)"). Calibrated so 70 straight correct answers across every
   category still promotes (~70% predicted pass) while one lucky answer cannot.
4. **Sitemap** — dropped the fake `lastModified: now` on every URL.
5. **Privacy policy** — added the missing AI photo-upload disclosure (images go to the
   vision providers, never DeepSeek, never persisted).
6. **Free plan card** — "R0 forever" now reads "R0 · free week" with "daily practice for
   your first 7 days", matching what the product actually does after `FREE_TRIAL_DAYS`.

**Tooling / content**

7. **`node scripts/content-audit.mjs`** — duplicate prompts/fronts/titles, invalid
   category refs, missing sign images, thin explanations, malformed option sets. Found
   and fixed a real defect: the generated-sign sentence splitter cut options at "(e."
   (14 affected questions + their derived flashcards + two starter-pack copies); the
   splitter is abbreviation-aware now. Remaining 2 flagged pairs are distinct physical
   signs sharing an official description — legitimate, left alone.

### Second-pass audit fixes (21 Aug 2026, later)

Re-audited against the current tree by independent reviewers; the following were still
broken and are now fixed (783 tests green):

**Billing correctness**

1. **Webhook ledger swallowed all-but-the-first lifecycle event.** Ledger ids were
   `${event}:${data.id ?? reference ?? ""}` — most lifecycle events carry neither field,
   so every customer's `refund.processed` / `subscription.disable` /
   `invoice.payment_failed` collapsed onto one id per event type and only the first ever
   applied. Now `webhookLedgerId()` (`src/lib/paystack/ledger.ts`) derives a per-instance
   id (refund reference, subscription code, dispute id); events with no stable identity
   apply unclaimed (their handlers are idempotent writes), and a `charge.success`
   without a transaction id is refused rather than applied unprotected.
2. **Renewal refunds never revoked access.** `refund.processed` matched only
   `last_charge_reference`, which is written once at first charge — a dashboard refund of
   any renewal left the account paid forever. Now the refunded transaction is resolved via
   Paystack (`verifyTransaction`) and downgraded by customer when it was a plan charge;
   tutor top-up refunds still don't strip subscriptions; on Paystack outage the legacy
   reference match remains as fallback.
3. **Expired-but-"active" rows resolved paid forever.** The entitlement date check ran
   only when `cancel_at_period_end` was set — exactly the flag a dropped disable webhook
   leaves unset. `tierFromSubscriptionRow()` now expires ANY paid row whose
   `current_period_end` is more than `EXPIRY_GRACE_MS` (3 days) past.
4. **Migration 0026** grants UPDATE/INSERT on the six 0024 licence-result columns to
   anon/authenticated. 0020's column allow-list had not been extended, so any profile
   upsert naming them failed with 42501 — and PostgREST fails the whole statement,
   taking the learner's name/code/date down with it.

**Study model**

5. **Weakness ranking is evidence-aware** (`scoring.ts`). Untouched categories sat at the
   baseline (18) and outranked genuinely-failed ones in `weakCategories`, sending the
   daily plan to never-attempted material. Each category now carries `perCategoryEvidence`
   and `perCategoryFloor` (≈80% one-sided lower bound); measured-weak categories rank
   before unmeasured ones.

**PWA / offline security**

6. Pack cache purges unconditionally on sign-out (demo mode included), and connectivity
   return re-probes entitlement instead of serving the cached pack on a stale grant until
   reload. `tests/sw-source.test.ts` pins the SW rule that `/api/` responses are never
   cached.

**AI robustness**

7. Provider clients get a 30s timeout with max one retry (SDK defaults were 10 min × 2),
   `maxDuration = 60` declared on all three AI routes, and the learner-profile block is
   fenced as untrusted data in the system prompt so a tampered client can't rewrite the
   persona through it.

**UI / a11y**

8. Inputs render at 16px (iOS no longer zooms on focus); tutor message log is a live
   region; Dialog focus management runs on open/close only instead of every parent
   keystroke; bottom nav pads to the safe-area inset (`viewportFit: cover`); dashboard,
   tutor and mock-results views have an h1; practice answers carry a double-tap lock,
   mock submit fires once; FAQ JSON-LD serialises plain text again (one answer was JSX);
   onboarding draft restore whitelist-checks enums; `.env.example` documents
   `CONTENT_HOURLY_IP_LIMIT`, `EYE_TEST_RELEASED`, `EYE_TEST_ALLOWLIST`; emails warn
   loudly if forced onto the resend.dev test sender in production.

---

## Tutor cost controls (10 Aug 2026)

Landed before the AI keys go live, so the first real invoice is the shape you chose
rather than the shape you inherited.

**The levers.** Escalation threshold 220→500 chars (at 220, "I don't understand why you
stop at a stop sign when nobody is coming" cleared it — nearly every ordinary question
was reaching the pricier model, which is the opposite of what a fast/smart split is
for), smart model `claude-sonnet-4-6`→`claude-sonnet-5`, `TUTOR_MAX_TOKENS` 500→350
(output is 5× the price of input, so this is the dominant term), and removal of a
`cache_control` marker that was a silent no-op — the persona is ~350 tokens and the
minimum cacheable prefix is 4096 on Haiku 4.5, 1024 on Sonnet 5, and a breakpoint below
the minimum returns `cache_creation_input_tokens: 0` rather than erroring. It read as a
working optimisation while doing nothing.

**Who gets a real model.** The free tier *is* the seven-day trial
(`PLAN_MAP.free.limits.trialDays`, 2 tutor messages/day), so `tier === "free"` covers two
people with opposite economics. Inside the week the learner is deciding whether to pay
for exactly this feature, so they reach a provider — about **R0.59 per trialling signup**
(14 messages × ~R0.042), bounded by the daily cap. Once the week lapses, the rule-based
explainer takes over, and the gap between the two is the upgrade pitch.

`isWithinFreeTrial()` in `src/lib/billing/entitlements.server.ts` resolves the week
server-side from `profiles.created_at` and `profiles.onboarded_at` (both exist since
`0001` — no migration). Two decisions worth keeping:

- It anchors on the **earliest** timestamp, mirroring `trialStartedAt()` in
  `src/lib/billing/trial.ts`. That client function renders "3 days left in your free
  week"; if the server resolved the window differently, the banner and the tutor would
  disagree about the same seven days.
- It is **forgiving on failure** — a missing profile, an unreadable one, or no admin
  client all resolve to *within* trial. Deliberately the opposite of `resolveTier`, which
  fails closed: that one decides what somebody paid for, this one only decides which
  engine answers a message already capped at 2/day. Failing closed here would serve the
  worse tutor to new signups during an outage.

Pinned by `tests/tutor-trial-routing.test.ts` (route → real entitlement → real trial
logic, only Supabase stubbed) and `tests/tutor-cost-controls.test.ts` (the thresholds,
and that `forceLocal` short-circuits before any provider call).

**Watch after the keys go live:** cost per trialling signup against the R0.59 estimate,
and what share of questions escalate to Sonnet. Both move the bill more than any other
knob here.
