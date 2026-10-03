-- Refund requests are durable before POST /refund; only processed means refunded.
alter table public.pending_refunds drop constraint if exists pending_refunds_status_check;
alter table public.pending_refunds add constraint pending_refunds_status_check
  check (status in ('queued','submitting','processing','needs_attention','refunded','failed'));
alter table public.pending_refunds add column if not exists provider_refund_id bigint;
-- Include the manual-resolution columns in fresh databases as well as the live schema.
alter table public.pending_refunds add column if not exists manual_reference text;
alter table public.pending_refunds add column if not exists manual_recorded_by text;
create index if not exists pending_refunds_user_id_idx on public.pending_refunds(user_id);
create index if not exists pending_refunds_work_idx on public.pending_refunds(updated_at)
  where status in ('queued','submitting','processing');

create table public.billing_email_outbox (
  id text primary key,
  message jsonb not null,
  created_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  sent_at timestamptz
);
alter table public.billing_email_outbox enable row level security;
revoke all on public.billing_email_outbox from anon, authenticated;
grant select, insert, update, delete on public.billing_email_outbox to service_role;
create index billing_email_outbox_unsent_idx on public.billing_email_outbox(last_attempt_at nulls first) where sent_at is null;
comment on table public.billing_email_outbox is 'Service-only transactional billing notifications; sent_at means accepted by email provider, not inbox delivery.';
comment on column public.pending_refunds.status is 'queued: safe to submit; submitting: outcome may be uncertain; processing: accepted by provider; needs_attention/failed: manual intervention; refunded: confirmed processed or recorded manual repayment.';
