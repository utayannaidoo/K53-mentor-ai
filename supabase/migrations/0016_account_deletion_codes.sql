-- 0016: emailed one-time codes for account deletion
-- ============================================================================
-- OAuth-only accounts (e.g. Google) have no password to reauthenticate with,
-- so before an irreversible account deletion we email a short-lived code and
-- require it back. Codes are stored HASHED and are written/read only by trusted
-- server code (the service-role key, which bypasses RLS). RLS is enabled with
-- NO client policy, so anon/authenticated get no access to this table at all.
--
-- ON DELETE CASCADE means a completed deletion also clears any pending code.

create table if not exists public.account_deletion_codes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  code_hash  text not null,
  expires_at timestamptz not null,
  attempts   integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.account_deletion_codes enable row level security;
-- Intentionally no policies: only the service-role key may touch this table.
