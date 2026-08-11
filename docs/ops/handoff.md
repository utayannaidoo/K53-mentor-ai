# Handoff — 11 Aug 2026

A point-in-time snapshot for picking this up in a fresh session. The live status
board is [`launch-runbook.md`](./launch-runbook.md) §0 — **read that first**;
this document is the delta, the reasoning behind recent decisions, and the
ordering of what is left.

---

## Where the product stands

Live on `https://k53mentorai.co.za` (Vercel). Migrations `0001`→`0020` applied.
Paystack on live keys. 1,060 questions, 68 scenarios, ~14 mock papers.

**The email chain is complete and proven end to end** — a real signup, confirmed
on a different device, works. That was the blocker holding four others and it is
cleared.

| Piece | State |
|---|---|
| DNS | Cloudflare (`ali`/`drew.ns.cloudflare.com`); registrar stays domains.co.za |
| Vercel records | apex A `216.198.79.1`, `www` CNAME — both **DNS only (grey cloud)** |
| Email Routing | `support@` and `dmarc@` → `support.k53mentor@gmail.com`; catch-all disabled |
| Resend | domain **Verified**, `eu-west-1`; DKIM at `resend._domainkey`, SPF+MX on `send.` |
| DMARC | `p=none`, `rua=mailto:dmarc@k53mentorai.co.za` |
| Supabase SMTP | configured against Resend |
| Auth templates | `token_hash` applied to Confirm signup / Magic link / Change email; Reset password deliberately left on `{{ .ConfirmationURL }}` |
| Env | Upstash, AI keys, `CRON_SECRET`, `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` all set |

---

## What changed today, and why

Everything below is on branch **`claude/supabase-email-templates`** →
[PR #47](https://github.com/utayannaidoo/K53-mentor-ai/pull/47), **not yet
merged**. It is fifteen commits and green on typecheck, lint, 490 tests, build.

1. **Mail setup, end to end** — DNS cutover to Cloudflare, Email Routing, DMARC,
   Resend, the `token_hash` templates. Each trap hit along the way is recorded in
   the runbook where it will be read, not in a changelog.
2. **Tutor cost controls** (merged earlier as [#46](https://github.com/utayannaidoo/K53-mentor-ai/pull/46))
   — escalation threshold 220→500 chars, smart model → `claude-sonnet-5`,
   `TUTOR_MAX_TOKENS` 500→350, and free accounts served the local explainer
   **only after** their 7-day trial expires.
3. **Password-reset guidance** — reset stays same-browser by design (PKCE); the
   email, the "check your email" screen, and the `error=device` copy all now say
   so. That last one was actively wrong: it promised "a new one that works
   anywhere", which stopped being true once signup moved to `token_hash`.
4. **`SUPPORT_EMAIL`** → `support.k53mentor@gmail.com`, and `NOTIFY_FROM_EMAIL`
   set to `support@` — because [`email.ts:22`](../../src/lib/notify/email.ts)
   sends no `reply_to`, so the From address *is* the reply address, and nothing
   routes `coach@`.
5. **Tutor caps lowered** — Premium 15→**10**/day, Premium Plus 40→**20**/day.
   See below.

### Why the caps came down

At Haiku 4.5 rates, a subscriber using the *old* allowance every day cost:

| Plan | Old cap | Cost/month at cap | Revenue |
|---|---|---|---|
| Premium | 15/day | $1.46 | R60 (~$3.33) — **44%** |
| Premium Plus | 40/day | $3.90 | R70 (~$3.89) — **100%** |

A Premium Plus subscriber at their ceiling cost their entire subscription in
tokens, before Paystack's fee. Halving both fixes the margin and costs nothing
real — 20 messages a day is far more tutor than a ten-minute session uses.

Full arithmetic and a provider comparison (DeepSeek, Gemini, GPT budget tiers) is
in [`ai-cost-model.md`](./ai-cost-model.md). **The number nobody has yet is
*average* usage** — instrument per-user message counts before deciding whether a
cheaper provider is worth the POPIA and grounding-drift costs.

---

## What is left

### 1. Merge the PR

```bash
gh pr merge 47 --merge
```

Everything else assumes this has landed. It carries the `SUPPORT_EMAIL` change,
the cap reduction, and all the runbook updates that make the rest of this
document navigable.

### 2. Cost control — do before driving any traffic

The caps bound a *subscriber*. Nothing yet bounds a runaway.

- [ ] **Hard spend cap in the Anthropic dashboard**
- [ ] **Hard spend cap in the OpenAI dashboard**
- [ ] Vercel spend limit + billing alerts
- [ ] Supabase usage alerts
- [ ] Uptime monitor on `/` and `/pricing` (UptimeRobot free; alert to the
      support Gmail)

All five need an account or a dashboard sign-in, so they are yours. They are
cheap and they are the difference between a bad week and a bad month.

### 3. Money correctness — the highest-stakes open item

- [ ] **Reconcile each Paystack Plan's dashboard amount against
      [`plans.ts`](../../src/lib/billing/plans.ts)** — `monthly: 60` and
      `monthly: 70`, annual = `(monthly − 20) × 12`. Checkout sends both an
      amount *and* a plan code, and for a subscription **Paystack bills the
      Plan's dashboard amount**, not what we send. Nothing in code or CI asserts
      they agree. A mismatch means the site advertises one price and the card is
      charged another — a Consumer Protection Act problem, not a bug.
      *(Today's change touched allowances only. Prices did not move.)*
- [ ] Webhook URL points at `https://k53mentorai.co.za/api/paystack/webhook`
- [ ] **Live end-to-end with a real card**: pay → webhook writes `subscriptions`
      → tier unlocks → receipt arrives → cancel → refund lands
- [ ] Declined-card path
- [ ] Settlement account and schedule confirmed

### 4. Finish the mail loop

- [ ] Find the forwarded test in the Gmail's **Spam** and mark Not spam
- [ ] Then flip `SUPPORT_EMAIL` to `support@k53mentorai.co.za` and redeploy
- [ ] Raise the Supabase per-hour email cap (Auth → Rate Limits) — the built-in
      mailer's low limit stays in force after SMTP is configured, and will
      strand launch-day signups
- [ ] Test-send to Gmail, Outlook **and** Yahoo; check spam placement
- [ ] Tighten DMARC to `p=quarantine` after ~2 weeks of reports

### 5. SEO — I can do most of this

- [ ] **Google Search Console** — sign in, add `k53mentorai.co.za` as a *Domain*
      property. **Paste the TXT token into the next session and it can add the
      record to Cloudflare and submit the sitemap.**
- [ ] Bing Webmaster Tools (imports from Search Console)
- [ ] Test the OG card in **WhatsApp** — the SA sharing channel — on a `/guides`
      URL as well as the homepage
- [ ] PageSpeed / Core Web Vitals on the live domain

### 6. Legal — needs information or people I am not

- [~] **`BUSINESS` in [`constants.ts`](../../src/lib/constants.ts) deliberately
      blank.** Decision taken to launch without the ECTA s43 / POPIA s55
      disclosures rendering. Runbook §7 records that this is *not* blocked on
      registering a company — three of the four fields already have answers, and
      the only open one is a physical address, which is a privacy call.
- [ ] Register with the Information Regulator as Information Officer (POPIA s55)
      — a queue, so start early; independent of the disclosure text
- [ ] A South African lawyer reads `/privacy`, `/terms`, `/refunds`

### 7. Pre-flight

- [ ] Audit the ~20 stale remote `claude/*` branches — merge or delete, so the
      first hotfix branches off something clean
- [ ] Full manual sweep on the live domain: signup → confirm on another device →
      onboarding → diagnostic → paywall → real payment → tier unlocks → tutor
      replies → cancel *(the email half of this is done)*
- [ ] Demo mode with no env — "Continue as demo guest"
- [ ] Real Android Chrome **and** iOS Safari, incl. PWA install and `/offline`
- [ ] Google sign-in on the new domain
- [ ] Supabase backup/PITR situation confirmed and the restore path understood
- [ ] `www` → apex is a **200, not a 308**. Canonicals point at the apex so
      Google consolidates; a redirect would be tidier

---

## Carried-forward hazards

Things that have already caused an outage or a wrong conclusion here. Worth
reading before touching the relevant area.

- **Upstash before AI keys.** `rate-limit.ts` throws at boot if an AI key is set
  without Upstash. *(Both are now set, in the right order.)*
- **Guards keyed off `VERCEL_ENV`, never `NODE_ENV`+`VERCEL`.** Previews set the
  latter too; a guard written that way takes every preview down. This has
  happened twice — the site-origin guard and the Paystack live-key guard.
- **Cloudflare's add-site scan imports records *proxied*.** Grey-cloud is
  mandatory: proxied breaks Vercel cert issuance, and the two-year HSTS header
  turns a bad cert into a hard failure with no click-through.
- **Never add Resend's "Enable Receiving" apex MX.** It would compete with Email
  Routing's apex MX and break forwarding. Resend sends; Cloudflare receives.
- **Don't "fix" the apex SPF** by adding Resend to it. SPF is evaluated against
  the Return-Path, which Resend sets to `send.k53mentorai.co.za`. Editing the
  apex record is how you end up with two SPF records on one name — a permerror
  that fails *every* message.
- **Registry vs resolver.** To tell "the nameserver change didn't save" from
  "still propagating", query the registry directly
  (`nslookup -norecurse -type=NS k53mentorai.co.za coza1.dnsnode.net`) — and
  check twice, minutes apart. It lagged the registrar's own panel here and read
  as a failure when it wasn't.
- **Forwarding diagnosis order.** Email Routing → **Activity Log** first. No row
  = never reached Cloudflare (sender-side MX). "Forwarded" = Cloudflare's half
  worked and it is spam placement.
- **`docs/ops/production-hardening-spec.md` is stale** — written against Stripe.
  All eight S1–S8 invariants *are* implemented, but do not use it as a go-live
  gate.

---

## Known-open code work (post-launch, not blocking)

- **No card-update flow.** The billing page tells users to cancel and
  resubscribe, which will churn people whose cards expire. Largest remaining
  support-load item.
- `subscriptions.provider_subscription_id` is never written; cancellation depends
  wholly on `provider_customer_id` plus a live Paystack customer fetch.
- `applyChargeSuccess` grants tier from `metadata.plan` without comparing
  `amount` or `currency` to the expected price. Metadata is server-set so it is
  not directly exploitable, but an underpaid charge still grants the tier.
- No Resend bounce/complaint webhook — hard bounces accumulate invisibly.
- No welcome email for free signups; the only welcome is bundled into the
  payment receipt.
- `OPENAI_MODEL_FAST` still defaults to `gpt-4o-mini`, well behind the current
  budget tier.
