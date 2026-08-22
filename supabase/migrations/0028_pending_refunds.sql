-- 0028: pending_refunds — the money-back retry queue
-- ============================================================================
-- Live-mode Paystack refunds are deducted from our settlement balance. When a
-- learner cancels inside the 7-day window and the balance is empty (settlement
-- already paid out, or not landed yet), the refund API refuses with
-- "Insufficient balance" and — before this table — the money simply never came
-- back without manual ops.
--
-- The cancel route now writes a row here when the instant refund fails, and
-- keeps `money_back_used` latched (the cron owns completing exactly this
-- refund; releasing the claim would let a manual retry race it). A cron pass
-- retries every queued row until Paystack accepts, then applies the same
-- revoke + stamp the instant path would have.
--
-- Rows are written only by server code (service role). RLS is enabled with no
-- policies: clients have nothing to read here.

create table if not exists public.pending_refunds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- The charge whose reversal is owed. Unique: one queue row per charge,
  -- so a retried cancel can never double-queue (or double-refund) one payment.
  transaction_reference text not null unique,
  status text not null default 'queued'
    check (status in ('queued', 'refunded', 'failed')),
  attempts int not null default 0,
  last_error text,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pending_refunds enable row level security;

comment on table public.pending_refunds is
  'Money-back refunds Paystack refused (typically insufficient balance). Retried by cron until accepted; on success the subscription row still naming this charge as its last payment is downgraded.';
comment on column public.pending_refunds.transaction_reference is
  'The charge to reverse. Guarded downgrade matches subscriptions.last_charge_reference so a re-subscribed learner never loses their new paid tier.';
comment on column public.pending_refunds.status is
  'queued = awaiting a cron retry; refunded = money returned; failed = gave up after REFUND_MAX_ATTEMPTS, ops notified.';
