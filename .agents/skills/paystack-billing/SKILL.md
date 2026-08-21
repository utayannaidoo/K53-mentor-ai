---
name: paystack-billing
description: Server-truth billing rules for the Paystack integration — webhook, entitlements, plan codes, and the review flow. Use for ANY change touching payments, subscriptions, tiers, credits, or AI usage caps.
---

# Paystack Billing — Server Truth

**The one sentence that matters:** the server is the only source of truth for what a user paid for. Client tier is display state; every request that costs money resolves tier from the `subscriptions` table server-side.

## Architecture invariants (do not break)
1. **The webhook is the ONLY writer of paid tier.** `src/app/api/paystack/webhook/route.ts`: HMAC-SHA512 signature verified with constant-time compare (`src/lib/paystack/client.ts`) BEFORE any processing; idempotent via the `payment_events` ledger (unique violation = duplicate delivery); writes with service-role key only.
2. **Entitlements fail closed.** `src/lib/billing/entitlements.server.ts` resolves tier from DB (status active/trialing); any lookup failure → `free`. Never trust client-supplied tier, price, or plan.
3. **Plan codes come from server env**, keyed tier × cycle × track (car vs bike/heavy; 8 codes; bike falls back to car price). Checkout (`src/app/api/checkout/route.ts`) requires a signed-in user; top-up amounts are server constants; credits capped server-side (`min(500, …)`).
4. **Demo unlock** (`demo:true` → client-local premium) is only reachable when `!isPaystackConfigured`. Never widen this branch.
5. Webhook events: `charge.success` (subscription + tutor top-ups via `grant_tutor_credits` RPC), `invoice.payment_failed` → `past_due` grace, `subscription.disable` → free downgrade.
6. RLS: `subscriptions` is SELECT-only for clients (`0004_lock_subscriptions.sql`); credit/referral mutations are `security definer` RPCs with execute revoked from anon/authenticated.

## Hardening lessons (S1–S8, already fixed — don't regress)
- S1: never unlock locally on checkout *failure* — only on explicit `demo:true` + unconfigured billing.
- S2: AI caps enforce per **user id** server-side (Redis), not localStorage, not per-IP alone.
- S3: vision/scanner is a paid feature — free server allowance is 0.
- S5: grant tier only when payment actually completed (check payment status, not just event receipt).
- S6: secrets compared constant-time. S7: escape user strings in email HTML. S8: after redirect-back, poll until the webhook lands before claiming "payment complete".

## Testing & review flow
- Unit gates: `tests/billing-security.test.ts`, `tests/plans.ts`, `tests/limits.test.ts` — run on any billing change.
- Merchant review (onboarding in progress): use Paystack **test keys** on a **Vercel preview deployment**; test cards complete hosted checkout; verify webhook delivery to the preview URL and tier lands in `subscriptions`.
- Production checklist: migrations applied through latest, Paystack plan codes set for all 8 combos, webhook URL + secret configured, `UPSTASH_REDIS_*` set (AI caps are ineffective without it), `CRON_SECRET`, Resend key.
