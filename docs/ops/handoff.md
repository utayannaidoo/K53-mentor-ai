# Handoff — 11 Aug 2026

A point-in-time snapshot for picking this up in a fresh session. The live status
board is [`launch-runbook.md`](./launch-runbook.md) §0 — **read that first**;
this document is the delta, the reasoning behind recent decisions, and the
ordering of what is left.

---

## Where the product stands

Live on `https://k53mentorai.co.za` (Vercel). Migrations `0001`→`0022` applied.
Paystack on live keys. 1,296 questions, 974 flashcards, 68 scenarios, ~17 distinct
mock papers per licence code (re-counted 11 Aug 2026 with `node
scripts/content-stats.mjs`; the 1,060/~14 figures carried in this doc were stale).

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
| Env | All set in Vercel, including `DEEPSEEK_API_KEY` and `RESEND_WEBHOOK_SECRET` (11 Aug 2026) |
| AI credit | **Both providers at zero balance, deliberately** — no top-up until advertising starts. See §1; it is a gate, not an oversight |

---

## What changed today, and why

Everything below was on branch **`claude/supabase-email-templates`** and has
**merged**, as [PR #47](https://github.com/utayannaidoo/K53-mentor-ai/pull/47)
and then [PR #48](https://github.com/utayannaidoo/K53-mentor-ai/pull/48) for the
last three commits, which were pushed after #47 was cut.

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
5. **Tutor caps lowered, then raised again** — 15/40 → 10/20 → **15/35**. The
   second move came with a provider switch. See below.
6. **DeepSeek is the tutor's fast tier** — see below.

### The caps came down, then went back up

At Haiku 4.5 rates, a subscriber using the *old* allowance every day cost:

| Plan | Old cap | Cost/month at cap | Revenue |
|---|---|---|---|
| Premium | 15/day | $1.46 | R60 (~$3.33) — **44%** |
| Premium Plus | 40/day | $3.90 | R70 (~$3.89) — **100%** |

A Premium Plus subscriber at their ceiling cost their entire subscription in
tokens, before Paystack's fee. Halving both fixed the margin — and then the model
changed underneath it, which made the halving unnecessary.

### The provider switch

The fast tier is now **DeepSeek V4-Flash** at $0.14/$0.28 per MTok, roughly a
ninth of Haiku 4.5. The cascade is **DeepSeek → Anthropic → OpenAI → local**;
Anthropic stays as the fallback and is unchanged.

That is what pays for the caps going back up to **15/day Premium, 35/day Premium
Plus** — higher than the numbers that caused the panic, at a fifth of the cost:

| Plan | Cap now | Cost/month at cap | Revenue |
|---|---|---|---|
| Premium | 15/day | $0.16 | R60 — **4.7%** |
| Premium Plus | 35/day | $0.37 | R70 — **9.4%** |

Three things about this that are not obvious:

- **DeepSeek cannot see.** Its API is text-only, and sending an image does not
  error — it answers from the surrounding text, which for the sign scanner means
  describing a photo it never received. Every image path now asks the cascade for
  an image-capable provider and skips DeepSeek, falling to `local` (and an honest
  "I can't look at photos right now") rather than answering blind. **Keep
  `ANTHROPIC_API_KEY` set: it is the scanner's only path now.**
- **The new caps are only affordable on DeepSeek.** 35/day on the Anthropic
  fallback is 88% of Premium Plus revenue. A long DeepSeek outage is a margin
  incident, and nothing in the code notices. Lower the caps by hand if it lasts.
- **Grounding drift is unevaluated.** K53 is South African road law and no model
  knows it from pre-training; the app retrieves cited facts into the prompt, so
  the question is whether V4-Flash *stays* on that grounding, not whether it
  knows the material. Run the question bank past it and read the answers.
  `TUTOR_PROVIDER=anthropic` reverts everything in one env var.

Full arithmetic, the env vars, and the provider comparison (Gemini, GPT budget
tiers) are in [`ai-cost-model.md`](./ai-cost-model.md).

**The number nobody had was real usage**, and both cap changes were made without
it. Migration **0021** adds `ai_usage_daily` — one aggregate row per user per day
per surface, plus a `capped` count of requests refused over the allowance — and
`npm run usage:report` prints the distribution next to the caps. No prompts, no
replies, nothing about *what* was asked; it can answer "how many" and never "what
about". Apply 0021 and leave it a fortnight before touching a cap again.

---

## What is left

### 1. 🚦 THE ADVERTISING GATE — both AI accounts are at zero balance

**Decision taken 11 Aug 2026: no credit goes on either AI provider until
advertising starts.** With no traffic, nothing is lost by waiting — every
provider call today would be the operator testing.

That decision is sound *only* if the top-up happens **before the first advert**,
never after. This section exists because "after" is the natural order of events
and it is the wrong one.

Verified 11 Aug 2026 — both keys are valid, both accounts are empty:

- DeepSeek → `HTTP 402 Insufficient Balance`
- Anthropic → `Your credit balance is too low to access the Anthropic API`

A 402 rather than a 401 means the key authenticates; there is simply no money
behind it. `DEEPSEEK_API_KEY` and `RESEND_WEBHOOK_SECRET` are in Vercel.

**What zero balance actually does.** Nothing errors. `streamTutorReply` catches
the 402 and streams the rule-based local explainer instead, which is correct
behaviour for an outage and is precisely why this is invisible. The consequences
are commercial, not technical:

1. **A paying subscriber gets the lesser product.** They pay R60–70 for a plan
   whose headline feature is the AI tutor and receive the local explainer. That
   is charging for something that is not working.
2. **The free week is the conversion mechanism, and it is what stops working.**
   `provider.ts` deliberately spends a real provider call on free accounts
   *inside* their seven days, because that is when the tutor is being evaluated.
   At zero balance every trial serves the explainer, so nobody experiences the
   paid product. A trial gets one run at making its case and does not repeat.

The sums, so this is never re-litigated from memory: a full free week is 2/day ×
7 = 14 messages ≈ **$0.005 per signup** at V4-Flash rates. **$5 covers about
1,000 trials.** A Premium subscriber at their full 15/day cap costs $0.16/month
against R60 of revenue.

Before the first advert, in this order:

- [ ] Top up **DeepSeek** (`platform.deepseek.com`). Keep it small, leave
      auto-recharge **off** — that balance is the only spend cap the platform
      offers, so it has to do the job
- [ ] Top up **Anthropic** and set a monthly cap. This one also restores the
      sign scanner, which has no other provider
- [ ] Redeploy if the Vercel variables have changed since the last build —
      server-side env only applies to a *new* deployment
- [ ] Run `npm run tutor:eval -- --compare` and read the two reports in
      `.tutor-eval/`. The grounding check, and the one thing that should gate
      traffic on the new provider — see `ai-cost-model.md`. Start with the
      **free-form** block, hardest of all on anything marked
      "NO GROUNDING RETRIEVED"
- [ ] Confirm the sign scanner works — it must route to Anthropic, not report
      unavailable

⚠️ Upstash is already set, so the rate-limiter boot guard is satisfied. If it
ever gets cleared, `DEEPSEEK_API_KEY` now trips the same throw the other two keys
do.

### 2. ~~Apply migrations `0021` and `0022`~~ — done 11 Aug 2026

Both verified live against the project: `ai_usage_daily` and
`email_suppressions` exist, and `record_ai_usage` runs and correctly rejects an
unknown user id, so the foreign key is wired. `npm run usage:report` prints an
empty table, which is the right answer until traffic exists.

<details><summary>What they were for</summary>

- [x] Run it in the Supabase SQL editor (or `supabase db push`). Until it exists,
      `recordAiUsage` logs an error per AI request and records nothing — the
      routes keep working, but the data everyone keeps asking for is not being
      collected.
- [x] Then `npm run usage:report` should print an empty table rather than an
      error. That is the check that 0021 landed.
- [x] 0022 creates the email suppression list. Until it exists, every send logs
      a lookup error and no bounce is ever suppressed.

</details>

### 3. Cost control — do before driving any traffic

The caps bound a *subscriber*. Nothing yet bounds a runaway.

- [ ] **Keep the DeepSeek prepaid balance small** — there is no monthly spend
      cap on that platform, so the balance *is* the cap
- [ ] **Hard spend cap in the Anthropic dashboard**
- [ ] **Hard spend cap in the OpenAI dashboard**
- [ ] Vercel spend limit + billing alerts
- [ ] Supabase usage alerts
- [ ] Uptime monitor on `/` and `/pricing` (UptimeRobot free; alert to the
      support Gmail)

All six need an account or a dashboard sign-in, so they are yours. They are
cheap and they are the difference between a bad week and a bad month.

### 4. Money correctness — the highest-stakes open item

- [ ] **Run `npm run paystack:check`.** Diffs every live Paystack Plan against
      [`plans.ts`](../../src/lib/billing/plans.ts) — amount, currency and
      interval — and exits non-zero on any mismatch. Checkout sends both an
      amount *and* a plan code, and for a subscription **Paystack bills the
      Plan's dashboard amount**, not what we send, so the two can silently
      disagree: the site advertises one price and the card is charged another,
      which is a Consumer Protection Act problem rather than a bug. Needs the
      live secret key, so it is a script, not CI. Run it with `sk_live_…`, not
      the test key — test-mode Plans are a different set.
      *(A runtime backstop now exists too: `applyChargeSuccess` compares every
      charge against the advertised price and emails `SUPPORT_EMAIL` on a
      mismatch. It still grants the tier — the buyer paid in good faith and the
      fault is ours. That is detection, not prevention; this script is the
      prevention.)*
- [ ] Webhook URL points at `https://k53mentorai.co.za/api/paystack/webhook`
- [ ] **Live end-to-end with a real card**: pay → webhook writes `subscriptions`
      → tier unlocks → receipt arrives → cancel → refund lands
- [ ] Declined-card path — and while a subscription exists, click **Update card**
      on the billing page and confirm it lands on Paystack's hosted page
- [ ] Settlement account and schedule confirmed

### 5. Finish the mail loop

- [ ] Find the forwarded test in the Gmail's **Spam** and mark Not spam
- [ ] Then flip `SUPPORT_EMAIL` to `support@k53mentorai.co.za` and redeploy
- [ ] Raise the Supabase per-hour email cap (Auth → Rate Limits) — the built-in
      mailer's low limit stays in force after SMTP is configured, and will
      strand launch-day signups
- [ ] Test-send to Gmail, Outlook **and** Yahoo; check spam placement
- [ ] Tighten DMARC to `p=quarantine` after ~2 weeks of reports
- [ ] **Resend → Webhooks**: add `https://k53mentorai.co.za/api/resend/webhook`,
      subscribe to `email.bounced` and `email.complained`, and put the signing
      secret in `RESEND_WEBHOOK_SECRET` on Vercel. Until then the route answers
      501 and bounces keep accumulating unseen
- [ ] Apply migration `0022_email_suppressions.sql` — without it every send
      logs a lookup error and nothing is ever suppressed
- [ ] Sign up a throwaway account and confirm the **welcome email** arrives
      (both paths: email confirmation and Google)

### 6. SEO — I can do most of this

- [ ] **Google Search Console** — sign in, add `k53mentorai.co.za` as a *Domain*
      property. **Paste the TXT token into the next session and it can add the
      record to Cloudflare and submit the sitemap.**
- [ ] Bing Webmaster Tools (imports from Search Console)
- [ ] Test the OG card in **WhatsApp** — the SA sharing channel — on a `/guides`
      URL as well as the homepage
- [ ] PageSpeed / Core Web Vitals on the live domain

### 7. Legal — needs information or people I am not

- [~] **`BUSINESS` in [`constants.ts`](../../src/lib/constants.ts) deliberately
      blank.** Decision taken to launch without the ECTA s43 / POPIA s55
      disclosures rendering. Runbook §7 records that this is *not* blocked on
      registering a company — three of the four fields already have answers, and
      the only open one is a physical address, which is a privacy call.
- [ ] Register with the Information Regulator as Information Officer (POPIA s55)
      — a queue, so start early; independent of the disclosure text
- [ ] A South African lawyer reads `/privacy`, `/terms`, `/refunds` — and in
      particular the **China transfer** section added on 11 Aug 2026 when DeepSeek
      became the tutor's provider. Section 72 contract-necessity is the ground
      relied on and the disclosure is specific about what is sent, but a transfer
      to a jurisdiction with no comparable regime is the kind of thing worth a
      professional opinion rather than a careful guess

### 8. Pre-flight

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

- ~~No card-update flow~~ — **done.** `/api/billing/update-card` hands out a link
  to Paystack's hosted subscription-management page (`GET
  /subscription/:code/manage/link`), reachable from an "Update card" button on
  the billing page and embedded directly in the failed-payment email, which is
  the moment it is actually needed. Untested against a live subscription — it
  needs one to exist, so fold it into the real-card end-to-end run in §4.
- ~~`subscriptions.provider_subscription_id` is never written~~ — now recorded on
  the first charge, from the customer fetch the reconciliation step already does.
  Cancellation still *reads* `provider_customer_id`; wiring it to prefer the
  stored code is a follow-up, and only now possible because the column has data.
- ~~`applyChargeSuccess` grants tier without comparing `amount`~~ — it now
  compares against `plans.ts` and alerts on a mismatch. It deliberately still
  grants: metadata is server-set and Paystack sets the amount, so there is no
  underpayment attack to stop, only our own misconfiguration to catch.
- ~~No Resend bounce/complaint webhook~~ — `/api/resend/webhook` now verifies the
  Svix signature and suppresses hard bounces and complaints (migration 0022);
  `sendEmail` checks the list before every send. **Needs `RESEND_WEBHOOK_SECRET`
  and an endpoint configured in Resend** — see §5. Note it cannot cover
  Supabase's auth emails, which go over SMTP and never pass through `sendEmail`;
  their bounces are still recorded, which is what matters for reputation.
- ~~No welcome email for free signups~~ — sent once per account from the auth
  callback, covering both the `token_hash` confirmation and the OAuth code
  exchange, deduped through the `notifications` ledger.
- `OPENAI_MODEL_FAST` still defaults to `gpt-4o-mini`, well behind the current
  budget tier.
