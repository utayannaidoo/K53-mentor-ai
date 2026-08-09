-- 0019: dispute, refund and non-renewal visibility
-- ============================================================================
-- The webhook previously handled only charge.success, invoice.payment_failed
-- and subscription.disable. Three money-bearing events fell through to the
-- default "acknowledge and ignore" branch:
--
--   charge.dispute.create  — a chargeback was opened. Silent today.
--   refund.processed       — money went back to the customer, but a refund
--                            issued from the Paystack dashboard (rather than
--                            through our own money-back flow) never downgraded
--                            the tier, so the account stayed paid for free.
--   subscription.not_renew — auto-renew was switched off. Access is still paid
--                            for until the period ends, so this must NOT
--                            revoke anything; it only needs to be visible.
--
-- These columns are written only by the webhook (service role). Clients keep
-- SELECT-only access from 0004.

alter table public.subscriptions
  -- When a chargeback was opened against this customer's charge. Deliberately
  -- does NOT change tier or status: a dispute is a claim, not an outcome, and
  -- auto-downgrading would punish a customer whose bank flagged a charge in
  -- error. Ops decides.
  add column if not exists disputed_at timestamptz,
  -- When a refund on this subscription's charge completed. Set alongside the
  -- downgrade so "why did this account go free" is answerable later.
  add column if not exists refunded_at timestamptz,
  -- Auto-renew is off; the plan lapses at the end of the paid period rather
  -- than immediately. Entitlements intentionally ignore this — the learner
  -- paid through the period — it exists so the billing page can say so.
  add column if not exists cancel_at_period_end boolean not null default false;

comment on column public.subscriptions.disputed_at is
  'Chargeback opened (charge.dispute.create). Advisory only — does not affect entitlement.';
comment on column public.subscriptions.refunded_at is
  'Refund completed (refund.processed). Accompanies a downgrade to free.';
comment on column public.subscriptions.cancel_at_period_end is
  'Auto-renew disabled (subscription.not_renew). Access continues until current_period_end.';
