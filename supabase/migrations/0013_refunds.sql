-- 0013: self-serve 7-day money-back refunds
-- ============================================================================
-- To refund a first payment automatically on cancellation, we need to know
-- which charge to refund and when it happened. These are written only by
-- trusted server code (the Paystack webhook / verify grant and the cancel
-- route, both service-role); clients keep SELECT-only access from 0004.

alter table public.subscriptions
  -- Paystack reference of the first subscription charge — the one a 7-day
  -- money-back refund reverses.
  add column if not exists last_charge_reference text,
  -- When that first charge was applied; the 7-day window is measured from here.
  add column if not exists paid_at timestamptz,
  -- Set once a money-back refund is issued, so the guarantee can't be reused.
  add column if not exists money_back_used boolean not null default false;
