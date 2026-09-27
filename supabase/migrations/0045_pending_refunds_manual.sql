-- 0045: pending_refunds — refunds repaid outside Paystack
-- ============================================================================
-- In South Africa Paystack pays takings out after two working days, and a
-- refund can only draw on what has not been paid out yet. A learner who
-- cancels late in the 7-day window, when nobody else has paid recently, cannot
-- be refunded through Paystack at all: the queue retries daily and waits for
-- sales that may not come.
--
-- The way out is /admin/refunds: stop the automatic retries (status 'failed'),
-- pay the learner back by EFT, then record it. These columns are that record,
-- so a settled row says how the money went back instead of just 'refunded'.
--
-- Written only by server code (service role), like the rest of the table.

alter table public.pending_refunds
  add column if not exists manual_reference text,
  add column if not exists manual_recorded_by text;

-- A manual reference only ever sits on a settled row: recording one is what
-- settles it.
alter table public.pending_refunds
  drop constraint if exists pending_refunds_manual_settled;
alter table public.pending_refunds
  add constraint pending_refunds_manual_settled
  check (manual_reference is null or status = 'refunded');

comment on column public.pending_refunds.manual_reference is
  'Bank reference when an admin repaid the learner by EFT; null when Paystack processed the refund.';
comment on column public.pending_refunds.manual_recorded_by is
  'Email of the admin who recorded the EFT repayment.';
comment on column public.pending_refunds.status is
  'queued = awaiting a cron retry; refunded = money returned (by EFT when manual_reference is set, otherwise by Paystack); failed = automatic retries stopped, either after REFUND_MAX_ATTEMPTS or by an admin about to repay by EFT.';
