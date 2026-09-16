# Driving School Partner Programme — Implementation Prompt

Self-contained build prompt for the R20-per-conversion driving-school referral
system. Paste the **Prompt** section below into a fresh session. Everything
outside it is scope reasoning that the prompt already encodes.

The programme in one line: **a driving school sends us a learner; the learner
pays full price but gets a doubled free trial and 250 CP for using the code;
the school earns a flat R20 — whatever plan the learner buys — once that first
payment clears the refund window; and the owner pays the schools by hand,
monthly.**

---

## Prompt

Build the **Driving School Partner Programme** for K53 Mentor AI. Read
`CLAUDE.md` first — the architecture rules there (server-truth billing, RLS on
every user table, security-definer RPCs for money, two modes that must both
keep working) are binding on every part of this. Then read, in this order,
because this feature bolts onto all four:

- `supabase/migrations/0009_referrals.sql` + `0020_lock_referral_columns.sql` —
  the existing **learner-to-friend** referral (pays 250 Confidence Points, no
  money). This new system is a *separate* programme. Do not extend, rename or
  reuse its tables, its `referral_code` column, its `claim_referral` RPC, or
  its `k53.ref` localStorage key. Both must be able to apply to one signup.
- `src/lib/paystack/apply.ts` — `applyChargeSuccess`, the single grant path for
  every successful charge. This is where a commission is earned.
- `src/app/api/paystack/webhook/route.ts` — the `payment_events` ledger, and
  the `refund.processed` / `charge.dispute.create` handlers, where a commission
  gets voided.
- `src/lib/leads/unsubscribe-token.ts` and `src/lib/cron/auth.ts` — the HMAC
  link and cron-auth patterns this feature reuses instead of inventing new ones.

### 1. The deal (these are the business rules — implement exactly)

- **R20 per converted learner, once, ever.** Earned on that learner's **first
  successful paid charge** — not on renewals, not per month.
- **The R20 is flat, whatever the learner buys.** Premium (R60/mo) or Premium
  Plus (R70/mo), monthly or annual, promotional price or full — the school
  earns exactly R20. There is one rate and it does not vary by plan, by cycle,
  or by what the charge was worth. Concretely: the commission amount is read
  from the school's `commission_cents` column (default `2000`) and **never**
  computed from `data.amount`, `meta.plan` or `meta.cycle`. Those are recorded
  on the commission row for reporting only. A reviewer must be able to read the
  earning code and see that no plan-dependent branch exists.
  (`commission_cents` is per-*school* so a negotiated rate can be raised for one
  partner — it is never a per-plan rate.)
- **Full price for the learner.** No discount, no coupon, no change to the
  price path. Checkout is untouched except for attribution that already lives
  on the profile. What the learner gets instead is in §3.
- **7-day hold.** A commission is born `pending` and matures to `payable` only
  after `MONEY_BACK_DAYS` (`src/lib/billing/refund-policy.ts`, currently 7)
  plus a 1-day buffer has passed since the charge — import the constant, never
  hard-code 7. If the charge is refunded, disputed or charged back in that
  window the commission goes `void` and is never paid.
- **Payouts are manual EFT, monthly**, with a **R100 minimum** carried forward
  (a configurable constant, with an admin override to pay below it). Nothing in
  this system moves money automatically. Paystack Transfers are out of scope.
- **One school per learner, forever. One commission per learner, forever.**
  Both enforced by unique indexes, not by application logic.

### 2. Data model — one new migration, `0033_driving_school_partners.sql`

Append-only, RLS on every table, no client-writable columns anywhere. Follow
the commenting style of `0031_plan_leads.sql` (say *why*, not *what*).

**`partner_schools`**
`id uuid pk`, `name`, `contact_name`, `contact_email`, `contact_phone`, `town`,
`province`, `commission_cents int not null default 2000`,
`status text check (status in ('pending','active','suspended'))`,
`bank_account_name`, `bank_name`, `bank_account_number`, `bank_branch_code`,
`notes`, `created_at`, `activated_at`,
plus the two leak controls from §8:
`review_threshold int not null default 25` (attributions per rolling 7 days
above which new commissions stop maturing on their own) and
`monthly_commission_cap int not null default 100` (the blast-radius ceiling, in
commissions not rand).
The bank columns are POPIA-sensitive: service-role reads only, and the admin UI
renders the account number masked to its last 4 digits behind an explicit
reveal action. A `pending` school's codes must not attribute anything.

**`partner_school_codes`** — the codes a school hands out. **A table, not a
column on `partner_schools`, and this is the single most important structural
decision in the migration** (§8 explains why): a leaked code must be killable
in one click without disturbing the school, its history, or the commissions it
already earned.
`id`, `school_id fk`, `code text unique` (6–16 chars, `[a-z0-9-]`, stored
lower-cased), `label text` (what it was printed on — "class whiteboard",
"October flyer" — so the owner can see *which* one leaked),
`status text check (status in ('active','revoked'))`, `created_at`,
`revoked_at`, `revoked_reason`.
A school has exactly one `active` code at a time under normal operation, but
the schema permits several so a school can run a separate code per branch or
per campaign. `school_referrals.code_used` stores the literal string, so
revoking a code never orphans or rewrites an attribution that already happened.

**`school_referrals`** — the attribution record, not the money.
`id`, `school_id fk`, `user_id uuid references auth.users on delete cascade`
**`unique`**, `code_used text`,
`source text check (source in ('link','manual','admin'))`, `attributed_at`.
First touch wins and the row is immutable once written.

**`partner_commissions`** — the money record.
`id`, `school_id fk`, `user_id` **`unique`** (this index is the idempotency
guard that makes double-payment structurally impossible, even if the webhook
replays), `amount_cents`, `charge_reference text`, `plan text`, `cycle text`,
`status text check (status in ('pending','payable','paid','void'))`,
`earned_at`, `eligible_at timestamptz` (earned_at + hold), `void_reason text`,
`hold_reason text` (set when a leak control in §8 stopped it maturing),
`payout_id uuid references partner_payouts null`, `created_at`.

**`profiles.trial_bonus_days int not null default 0`** — the extra free-trial
days a school referral buys the learner (§3). Added in this same migration.
Deliberately **not** added to the column grants in `0020`, which is what makes
it server-owned.

**`partner_payouts`** — one row per EFT the owner actually sends.
`id`, `school_id fk`, `commission_count int`, `total_cents int`,
`period_start`, `period_end`,
`status text check (status in ('draft','paid'))`, `paid_at`,
`payment_reference text`, `note text`, `created_at`.

**RPCs — security definer, `set search_path = public`, and
`revoke execute ... from public, anon, authenticated`** (the 0010 convention;
every one of these is a money path and none may ever be callable from a
browser):

- `claim_school_referral(p_user uuid, p_code text) returns text` — resolves an
  **`active` code in `partner_school_codes` belonging to an `active` school**
  (a `revoked` code is simply an unknown code), writes the `school_referrals`
  row recording the literal `code_used`, **grants the
  learner both rewards from §3 in the same transaction** (+250 CP into
  `streaks.cp`, and `profiles.trial_bonus_days = 7`), and returns the school
  name on success or null on every failure. Refuses when: the code is unknown
  or its school is not `active`; the user already has an attribution; or **the
  user has ever held a paid subscription** (a school must not be able to claim
  credit for someone who was already paying — check `subscriptions.tier <>
  'free'` or a non-null `paid_at`). Rewards and attribution are one transaction
  or none: a learner must never collect the trial extension off a code that
  credited nobody.
- `record_school_commission(p_user uuid, p_reference text, p_plan text, p_cycle text, p_hold_days int) returns uuid` —
  looks up the attribution, inserts the `pending` commission at that school's
  own rate with `eligible_at = now() + p_hold_days`, and returns null (not an
  error) when there is no attribution or a commission already exists.
- `void_school_commission(p_user uuid, p_reason text) returns boolean` — voids
  a `pending` or `payable` commission. A commission already `paid` is **not**
  silently reversed: leave it, record `void_reason`, and surface it in the
  admin UI as a clawback to settle against that school's next payout.
- `mature_school_commissions() returns int` — flips `pending` to `payable`
  where `eligible_at <= now()` and the learner's subscription has not been
  refunded. **It does not mature a commission whose school tripped either leak
  control in §8** — over `review_threshold` attributions in the 7 days around
  the attribution, or over `monthly_commission_cap` commissions this month. Those
  stay `pending` with `hold_reason` set, and wait for an admin to release them.
  Returns the count matured; log the count held separately.
- `release_held_commissions(p_school uuid) returns int` — an admin's explicit
  "I looked at this and it is legitimate": matures every commission held for
  review on that school. The counterpart to suspending them.
- `rotate_school_code(p_school uuid, p_new_code text, p_reason text) returns uuid` —
  revokes every `active` code for the school and issues one new one, in a single
  transaction. Existing attributions and commissions are untouched; only future
  claims are affected. This is the one-click answer to a leak.
- `mark_partner_payout_paid(p_school uuid, p_reference text, p_note text) returns uuid` —
  in one transaction: create the `partner_payouts` row from every `payable`
  commission for that school, flip them all to `paid`, and point their
  `payout_id` at it. This must be atomic, or a crash mid-payout leaves
  commissions that look unpaid and get paid a second time.

### 3. Attribution flow

Two ways in, because real driving schools work both ways — a link in a WhatsApp
group, and a code written on a whiteboard in class.

1. **Link**: `k53mentorai.co.za/signup?school=CODE`. Park it in `localStorage`
   under **`k53.school`** exactly the way `auth-form.tsx` already parks
   `k53.ref` (same validation shape, lower-cased), then claim it after first
   sign-in from `use-study-store.tsx`, next to the existing `k53.ref` claim —
   one `POST /api/partners/claim`, fire-and-forget, cleared before the request
   so a failure cannot loop. Both claims run; they are independent programmes.
2. **Manual**: a "Did a driving school refer you?" field in onboarding
   (optional, skippable, never blocking) and in `/account` while the account
   has never paid. Same endpoint.

Attribution does not expire — a school that hands out a code in January and
sees the learner convert in June did cause that conversion.

#### What the learner gets for entering a code

The learner still pays full price. But "type this code so someone else gets
R20" is not a proposition anyone acts on, so the claim pays them in the two
currencies that cost us no cash. **Both are granted inside
`claim_school_referral`, in the same transaction as the attribution**, so a
learner can never receive a reward without the school receiving the credit, or
the reverse.

1. **250 Confidence Points**, exactly mirroring the friend-referral reward in
   `0009_referrals.sql` (`insert into streaks (user_id, cp) ... on conflict do
   update set cp = coalesce(cp, 0) + 250`). Free, instant, and it lands them on
   the dashboard already on the board rather than at zero.

2. **Double their free trial — 14 days instead of 7.** This is the one with
   real pull, and it is the reward to lead the messaging with: *"Your driving
   school just doubled your free trial."* It costs zero rand, and it makes the
   school's incentive, the learner's incentive and ours point the same way —
   a learner with fourteen days of full daily allowances forms the habit the
   product is built around, which is precisely what the school is being paid
   R20 to produce.

   Implement it as `profiles.trial_bonus_days int not null default 0`, set to
   `7` by the claim RPC. Two things about it are load-bearing:

   - **It is server-owned for free.** `0020_lock_referral_columns.sql` revoked
     the table-level INSERT/UPDATE grants on `profiles` and re-granted an
     explicit column list, so any column added afterwards is automatically not
     client-writable. **Do not add `trial_bonus_days` to those grant lists.**
     SELECT is untouched, so the client can still read its own value.
   - **The trial is computed in two places and both must move together.**
     `trialDaysRemaining()` in `src/lib/billing/trial.ts` renders "3 days left
     in your free week"; `isWithinFreeTrial()` in
     `src/lib/billing/entitlements.server.ts` decides whether the AI tutor
     spends a real model call. Each resolves `PLAN_MAP.free.limits.trialDays`
     independently, and the comment on `isWithinFreeTrial` explains why they
     are deliberately mirrored. Add the bonus to **both** — server-side by
     selecting `trial_bonus_days` in the query that already reads
     `onboarded_at, created_at`, client-side by hydrating it through
     `loadAccount` / `hydrateAccountState` alongside `tier` and `cp`. Miss one
     and a referred learner is told they have fourteen days while the tutor
     cuts them off on day eight — a worse experience than never extending it.
   - Default it to `0` everywhere, demo mode included, and keep every existing
     free learner on exactly the seven days they have now.

On a successful claim, confirm all three in one line — who gets the credit and
what the learner got for it: *"You're credited to Kasi Driving School. They
earn R20 if you subscribe, and you've got 14 days free instead of 7, plus 250
CP."* Transparency is the point: a school is claiming credit for this learner,
and the learner should be able to see it, and query it if it is wrong.

`POST /api/partners/claim` is auth-required, Zod-validated, rate-limited with
`limitCheckout(clientIp(req))` plus `limitUserDaily` (add a `school_claim`
entry to `ACCOUNT_DAILY_LIMIT` in `src/lib/ai/rate-limit.ts`), and does nothing
but call the RPC through `createAdminClient()`.

### 4. Money flow — earning, maturing, voiding

- **Earn**: in `applyChargeSuccess`, *after* the tier grant has succeeded, in
  the branch that handles a subscription's first charge (the one with
  `meta.plan` and `data.plan.plan_code`), call the commission RPC via a helper
  in `src/lib/partners/commission.ts`. It is **best-effort and must never
  throw**: the grant has landed and the ledger row is committed, so a failure
  here logs loudly and continues, exactly like
  `pruneDuplicateSamePlanSubscriptions` does. A commission we have to
  reconstruct by hand is a bad afternoon; a thrown error replays an applied
  charge and is a production incident. The `payment_events` ledger already
  makes this run once per charge, and `unique(user_id)` catches whatever it
  doesn't.
- **Void**: call `void_school_commission` from the `refund.processed` and
  `charge.dispute.create` handlers in the webhook, and from the automatic
  money-back cancellation path in `src/lib/billing/subscription-cancel.ts`.
  Same best-effort rule.
- **Mature**: fold `mature_school_commissions()` into the existing
  `/api/cron/reconcile-payments` run rather than adding a third entry to
  `vercel.json` — it is already a daily job about payment truth, and the cron
  allowance is limited. Log the count it matured.

### 5. Admin surface — `/admin`, the thing the owner actually uses

There is no admin area in this codebase today; this creates the first one.

**Auth**: a comma-separated `ADMIN_EMAILS` env var, checked **server-side on
every admin route and every admin mutation** through a shared `requireAdmin()`
in `src/lib/partners/admin-auth.ts` that resolves the Supabase user and
compares lower-cased emails. It fails closed when the env var is unset, so a
misconfigured deploy locks the owner out rather than opening the door. Add
`/admin` to the middleware matcher. Never gate on the client.

Pages:

- **`/admin`** — the money dashboard: schools active, learners attributed,
  conversions, conversion rate, R pending, **R payable now**, R paid to date,
  clawbacks outstanding, and **anything held for review** (§8) with a direct
  link to it. A hold nobody sees is a partner waiting on money for no reason.
- **`/admin/schools`** — list with status, active code, attributed/converted
  counts and R earned, plus the two leak signals from §8: **attributions in the
  last 7 days** (against that school's `review_threshold`) and **commissions
  currently held for review**. Sort by the 7-day count so anything anomalous
  surfaces without being hunted for. Create a school (generating its first
  code), activate, suspend, edit the commission rate. Copy-link button and a
  downloadable QR for the school's own posters and WhatsApp broadcasts.
- **`/admin/schools/[id]`** — one school: contact details, masked bank details,
  its learners (attributed date, converted yes/no, commission status), payout
  history, internal notes. Plus the code panel: every code it has ever had with
  label and status, a **Rotate code** action (takes a reason, calls
  `rotate_school_code`, shows the new code and refreshes the QR), and a
  **Release held commissions** action for anything §8 put on hold — each held
  row showing why, so the decision is made with the evidence visible.
- **`/admin/payouts`** — the one that matters. Every school with `payable`
  commissions, its total, whether it clears the R100 minimum, its bank details,
  and a **Mark as paid** action taking an EFT reference and calling
  `mark_partner_payout_paid`. Plus a **CSV export** of the pay run (school,
  account holder, bank, account number, branch code, amount, reference) so it
  can be uploaded to a bank's bulk-EFT screen instead of retyped.

### 6. Partner-facing surface — no login

Schools do not get accounts. That is a second auth surface, a second support
burden and a second thing to secure, for a page showing four numbers.

Instead: **`/partners/[code]?t=<hmac>`**, an HMAC of the code built with the
exact pattern in `src/lib/leads/unsubscribe-token.ts` (new
`src/lib/partners/statement-token.ts`, `PARTNER_SECRET || CRON_SECRET`,
`timingSafeEqual`, truncated base64url). It shows: learners signed up, learners
converted, R pending, R payable, R paid, last payout date. No learner names, no
emails, no personal information — a school is entitled to its counts, not to a
list of people's identities.

Send each active school a **monthly statement email** through the existing
Resend integration (`src/lib/notify/`), carrying that link. Build the template
in `src/lib/notify/templates.ts` alongside the others.

### 7. Public acquisition surface

- **`/for-driving-schools`** — the landing page that sells the programme: R20
  per learner who subscribes, **flat, whichever plan they pick**, no cost, no
  lock-in, and here is the link and the printable code. Give the learner-facing
  half equal weight, because it is what a school repeats to its own students:
  *your learners pay the same price as everyone else, and they get 14 days free
  instead of 7 for using your code.* A school needs a reason to hand the code
  out that isn't only "I get paid". Then: how and when you get paid. Build it
  with the `glass-design-system` skill; it is a marketing page and must look
  like the rest of the site.
- An application form on that page posting to `/api/partners/apply`, creating a
  `pending` `partner_schools` row plus an alert email to `SUPPORT_EMAIL`.
  Rate-limited, Zod-validated, and collecting **no** bank details — those come
  after a human conversation.
- **`/partners/terms`** — the programme terms: R20 per converted learner paid
  once, the 7-day hold, void on refund or chargeback, R100 minimum payout,
  monthly EFT, no self-referral or fake accounts, suspension for abuse, a POPIA
  note on the bank details held, and that each school is responsible for its
  own tax on referral income. Link it from the landing page and the admin
  school form.
- Link `/for-driving-schools` from the footer.

### 8. Fraud and money guards (this system pays out real cash)

- `unique(user_id)` on both `school_referrals` and `partner_commissions` — the
  structural guarantee that no learner is ever paid for twice.
- Commissions are created **only** from a signature-verified Paystack charge
  that has already passed the `payment_events` ledger. No client path exists.
- No school code may attach to an account that has already paid.
- Self-referral: refuse a claim when the learner's email matches the school's
  `contact_email`, and flag (do not auto-void) a school whose attributions
  cluster on one IP or arrive faster than a threshold — surface it in the admin
  list as "review" rather than blocking automatically.
- The 7-day hold is the real financial guard: a fraudulent signup that pays and
  refunds never reaches `payable`.
- A `suspended` school's code stops attributing immediately, and its pending
  commissions stop maturing.
#### Code leakage — the three controls, and the one deliberately rejected

Giving the learner a real reward (§3) makes a code worth passing around. A code
posted to a deals page or a large WhatsApp group would harvest R20 off signups
that were already coming to us organically.

**Do not solve this with a use cap on the code.** It is the intuitive answer
and it is the wrong instrument, for three reasons that should survive anyone
re-proposing it:

1. **It punishes the best partner.** The school sending 200 learners is the one
   that hits the wall. The exposure from a leak is bounded at R20 per converting
   signup; the upside of a high-volume school is not bounded at all. Capping the
   channel to limit a small, reversible loss is the wrong trade.
2. **Under attack the quota goes to the attacker.** A cap does not distinguish
   a legitimate use from a harvested one — it just serves them first-come. A
   leaked code is used *faster* than a classroom works through it, so the leak
   wins the race for the quota and the real students hit the wall.
3. **It fails silently, in public.** Learner #51 types the code in front of the
   class, gets nothing, and the instructor looks foolish. That is a
   partner-relationship injury inflicted to prevent a R20 loss.

The shape that does work: **let attribution stay cheap and always succeed, and
put the control on the money and on the code's lifetime instead.** Every one of
these is reversible and none is visible to a learner.

- **Revocable codes.** `partner_school_codes` (§2) means a leaked code is killed
  in one click via `rotate_school_code` — old code dead, new code issued,
  existing credit untouched. This is the actual fix for an actual leak, and it
  is why codes are a table rather than a column. Everything else here only buys
  time until someone notices.
- **A review threshold, not a refusal.** Above `review_threshold` attributions
  in a rolling 7 days (default 25 — roughly "bigger than a class"), new
  commissions still accrue but stop maturing on their own and wait for
  `release_held_commissions`. A false positive costs the owner one click; a
  false negative costs R20. That asymmetry is the whole design.
- **A circuit breaker, not a quota.** `monthly_commission_cap` (default 100 =
  R2000/month/school) exists solely to bound the blast radius of something
  nobody noticed for three weeks. It is set high enough that no honest school
  reaches it, and hitting it *holds* commissions for review — it never refuses
  an attribution and never denies a learner their trial.
- **Visibility is what makes all of the above work.** Surface each school's
  attributions-per-week and held-commission count on `/admin/schools`, and flag
  volume that jumps past a plausible class size. None of these controls help if
  nobody looks at the screen.

Keep the exposure in proportion while building this: one commission per learner
ever, no claims on accounts that have already paid, the 8-day hold, and void on
refund together mean a leaked code costs R20 × *converting* signups, not R20 ×
uses. A leak that reaches 500 people and converts 20 of them is R400 and a
rotated code — worth defending against cheaply, not worth capping growth over.
- Every admin mutation goes through `requireAdmin()` on the server.

### 9. Files

Create:
```
supabase/migrations/0033_driving_school_partners.sql
src/lib/partners/codes.ts                 # normalise + validate a school code (shared)
src/lib/partners/commission.ts            # server-only RPC wrappers, never throw
src/lib/partners/statement-token.ts       # HMAC, mirrors leads/unsubscribe-token.ts
src/lib/partners/admin-auth.ts            # requireAdmin(), fails closed
src/app/api/partners/claim/route.ts
src/app/api/partners/apply/route.ts
src/app/admin/...                         # dashboard, schools, school detail, payouts
src/app/for-driving-schools/page.tsx
src/app/partners/[code]/page.tsx
src/app/partners/terms/page.tsx
tests/partner-attribution.test.ts
tests/partner-commission.test.ts          # incl. flat R20 across every plan + cycle
tests/partner-payout.test.ts
tests/partner-admin-auth.test.ts
tests/partner-statement-token.test.ts
tests/partner-trial-bonus.test.ts         # client and server agree on 14 days
tests/partner-leak-controls.test.ts       # revoked codes, review holds, the cap
```

Edit:
```
src/lib/paystack/apply.ts                     # earn, after the grant, best-effort
src/app/api/paystack/webhook/route.ts         # void on refund + dispute
src/lib/billing/subscription-cancel.ts        # void on money-back cancellation
src/app/api/cron/reconcile-payments/route.ts  # mature pending -> payable
src/components/auth/auth-form.tsx             # park ?school= as k53.school
src/hooks/use-study-store.tsx                 # claim k53.school after sign-in
src/lib/ai/rate-limit.ts                      # ACCOUNT_DAILY_LIMIT.school_claim
src/middleware.ts                             # /admin in the matcher
src/lib/notify/templates.ts                   # monthly statement + application alert
src/lib/env.ts                                # ADMIN_EMAILS / PARTNER_SECRET boot audit

# the 14-day trial bonus (§3) — these five move together or not at all
src/lib/billing/trial.ts                      # trialDaysRemaining + bonus
src/lib/billing/entitlements.server.ts        # isWithinFreeTrial + bonus
src/lib/supabase/account.ts                   # select trial_bonus_days
src/lib/store/account-hydrate.ts              # hydrate it onto account state
src/types/index.ts                            # trialBonusDays on UserState
tests/limits.test.ts                          # extend: bonus days in the client view
tests/coach-lapsed-free.test.ts               # extend: bonus days in the AI routing
```

### 10. Constraints

- **Demo mode must stay intact.** No Supabase means no partner system at all:
  the claim endpoint 501s like its neighbours, `/admin` 404s, and nothing on a
  study surface changes. Zero-config demo mode is an architecture rule, not a
  nice-to-have.
- Use the `glass-design-system` skill for every pixel, `/admin` included — it
  is an internal tool but it is still this product.
- Use the `paystack-billing` skill before touching `apply.ts`, the webhook or
  `subscription-cancel.ts`.
- No new dependencies. QR generation is the one allowed exception if it cannot
  be done as inline server-rendered SVG.
- No `console.log` in `src/` (`console.error` for the loud logs above is the
  established convention).
- Migrations are append-only.
- Money is integer cents everywhere. Never a float.
- Run the `k53-verify` skill before calling this done: `npm run typecheck`,
  `npm run lint`, `npm run test`, `npm run build`.

### 11. Build order

Ship it in four reviewable commits, not one:

1. **Migration + RPCs + tests.** The schema and the money rules, provable
   before any UI exists.
2. **Attribution and learner rewards.** Link parking, claim endpoint,
   onboarding/account field, learner confirmation, the 250 CP grant, and the
   14-day trial bonus wired through both the client and server trial checks.
3. **Earning.** The `apply.ts` hook, the void paths, cron maturation. After
   this the system correctly accrues money owed, with no way to see it yet.
4. **Surfaces.** `/admin` (dashboard, schools, payouts, CSV), the tokenised
   partner statement, `/for-driving-schools`, `/partners/terms`, the monthly
   statement email.

### 12. Done means

- An owner can create a school in `/admin`, hand over a link and a code, and
  see a learner attributed to it within seconds of that learner signing up.
- That learner sees 14 days on their trial banner **and** still gets the real
  AI tutor on day ten — the client and server trial checks agree.
- When that learner pays, R20 appears as `pending` against the school and
  becomes `payable` eight days later — automatically, with nobody touching it.
- The R20 is identical whether they bought Premium monthly or Premium Plus
  annual, and a test proves it across all four plan/cycle combinations.
- If that learner refunds inside the window, the R20 disappears and never
  becomes payable.
- The owner can open `/admin/payouts` on the first of the month, see exactly
  what is owed to whom with bank details attached, export a CSV, pay by EFT and
  mark it paid — and the same commission can never be paid twice.
- A school can open its own link and see its numbers without an account.
- A leaked code can be killed in one click: the old string stops working
  immediately, a new one is issued, and every attribution and commission the
  old code already earned is untouched. No learner is ever refused a code
  because a quota ran out.
- Nothing about the learner's price, checkout or study experience changed.
- Demo mode still runs with no Supabase and no Paystack.

---

## Decisions already made (change these before building, not after)

| Decision | Chosen | Why |
| --- | --- | --- |
| Commission frequency | **Once per learner**, on first paid charge | R20 against a R60 first month is a 33% one-off CAC — excellent. R20 *every* month against R60 revenue is a business that cannot fund itself. |
| Rate by plan | **Flat R20**, every plan and cycle | Owner's call. It is the version a school can repeat from memory and check without a calculator, and it keeps the earning code free of any branch that could pay the wrong amount. An annual sale is worth ~8× a monthly one to us, so this is deliberately generous on monthlies and cheap on annuals — and it costs nothing to revisit later, since the rate already lives in a column. |
| Hold before payable | **7 days + 1** | Mirrors `MONEY_BACK_DAYS`. Paying before the refund window closes means paying for churn. |
| Attribution timing | **At signup**, first touch, immutable | Attributing at payment loses every school whose learner signs up free first — which is most of them. |
| Attribution expiry | **Never** | The school did the work, and open-ended liability is capped anyway by one-commission-per-learner. |
| Already-paying learners | **Cannot be claimed** | Otherwise a school harvests codes from existing customers and is paid for nothing. |
| School login | **None** — HMAC statement link | A four-number page does not justify a second auth surface to build and secure. |
| Leaked codes | **Revocable codes + review holds. Explicitly no use cap.** | A cap punishes the highest-volume school, hands its quota to the attacker first, and fails in front of a class. Holding the *money* for review costs a click when wrong and R20 when wrong the other way. Full reasoning in §8 — it is written down because "just limit the code to 50 uses" is the thing everyone proposes. |
| Payout mechanism | **Manual EFT**, R100 minimum | Explicitly what was asked for. Automated transfers are a far larger compliance surface. |
| Learner incentive | **250 CP + a 14-day free trial** (double the usual 7), no discount | The learner pays full price as specified, so the reward has to be non-cash. CP is free and instant; the doubled trial is the one with real pull, and it is the only reward that also raises the school's conversion rate and ours — more habit before the wall is exactly what the R20 is buying. |

## Open questions for the owner

1. **Volume tiers.** A school sending 50 learners a month is a different
   relationship from one sending two. `commission_cents` is per-school, so a
   negotiated rate is already supported without touching the flat published
   R20 — decide whether to publish a ladder or keep it a private conversation.
2. **Payout cadence.** Monthly is assumed. A school sending one learner a month
   waits five months to clear R100 — consider a quarterly sweep of anything
   under the minimum, or dropping the minimum once volumes are known.
3. **Watch what the bonus trial does to conversion.** Fourteen days is a guess,
   and it cuts both ways: more habit formed, but the paywall arrives a week
   later. Referred learners are a clean cohort to measure against everyone
   else, and the number lives in one RPC — if 14 days converts worse than 7,
   change the `7` and move on. Worth a note in `docs/growth/`.

## Other learner rewards considered, and why they lost

Kept here so they are not re-litigated from scratch. All were judged against:
costs no cash, needs no discount, and preferably raises conversion rather than
just buying goodwill.

- **A second free full mock exam.** Free gets one lifetime full mock
  (`mockExamReset: "lifetime"`); a second is genuinely wanted, since the mock
  is the "am I actually ready" moment. The strongest runner-up, and the one to
  add if the trial extension gets dropped. Costs nothing, needs a bonus counter
  in the store the way the trial bonus needs one on the profile.
- **A bundle of free tutor messages** (say 20, the size of a paid top-up).
  Rejected: it spends real AI budget on unconverted users, and it hands out the
  headline paid feature at the exact moment we are trying to sell it.
- **An extra streak freeze.** Nearly free, but worthless on day one — a learner
  with no streak does not value protecting it.
- **A co-branded pass card** (the existing share passport carries the school's
  name when they pass). Not a reward to the learner, but genuinely good for the
  school and cheap — worth building later as a *partner* perk, not a learner one.
