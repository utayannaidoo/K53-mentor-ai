-- 0032: one follow-up email per captured lead, and the column that guarantees
-- it stays one.
-- ============================================================================
-- `plan_leads` (0031) captured an address and then never used it again: a
-- visitor asked for their plan, got it once, and heard nothing more. The
-- follow-up is the other half of that — a single email a few days later
-- naming the same weak section and offering the account.
--
-- Nullable, not a boolean: "when" answers the question a boolean cannot,
-- which is whether the send was recent enough to explain a reply landing in
-- support today. Absent means "not yet", which is the state every existing
-- row is correctly already in.
alter table public.plan_leads
  add column if not exists followup_sent_at timestamptz;

-- The cron reads exactly one shape: leads old enough to follow up that have
-- not been followed up. A partial index means the scan stays proportional to
-- the backlog rather than to the table, and it empties itself as they are sent.
create index if not exists plan_leads_followup_pending_idx
  on public.plan_leads (created_at)
  where followup_sent_at is null;

comment on column public.plan_leads.followup_sent_at is
  'When the single follow-up email was sent. Null = not yet; it is never sent twice.';
