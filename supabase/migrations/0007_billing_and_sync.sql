-- 0007: self-serve billing (top-ups) + progress-sync support
-- ============================================================================

-- ── Tutor top-up credits ─────────────────────────────────────────────────────
-- Credits live on subscriptions, which clients can only SELECT (0004), so a
-- user can't self-grant credits; only the Stripe webhook (service role)
-- writes them, and only the tutor route (service role) spends them.
alter table public.subscriptions
  add column if not exists tutor_credits int not null default 0 check (tutor_credits >= 0);

-- Atomic credit operations for trusted server code (called with the service
-- role only; execute is revoked from client roles below).
create or replace function public.grant_tutor_credits(p_user uuid, p_credits int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, tier, status, tutor_credits)
  values (p_user, 'free', 'active', greatest(p_credits, 0))
  on conflict (user_id)
  do update set tutor_credits = public.subscriptions.tutor_credits + greatest(p_credits, 0);
end;
$$;

create or replace function public.use_tutor_credit(p_user uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
     set tutor_credits = tutor_credits - 1
   where user_id = p_user and tutor_credits > 0;
  return found;
end;
$$;

revoke execute on function public.grant_tutor_credits(uuid, int) from public, anon, authenticated;
revoke execute on function public.use_tutor_credit(uuid) from public, anon, authenticated;

-- ── Stripe webhook idempotency ledger ────────────────────────────────────────
-- Stripe redelivers events; subscription upserts are idempotent but credit
-- grants are not. First insert wins; a duplicate event id is skipped.
create table if not exists public.stripe_events (
  id           text primary key,
  type         text not null,
  processed_at timestamptz not null default now()
);
-- Service-role access only: RLS on with no policies.
alter table public.stripe_events enable row level security;

-- ── Progress sync ────────────────────────────────────────────────────────────
-- The client's local ids make pushes idempotent: re-sending the same item
-- upserts instead of duplicating. NULLs never collide in a unique index, so
-- pre-sync rows (if any) are unaffected.
alter table public.question_attempts   add column if not exists client_id text;
alter table public.scenario_attempts   add column if not exists client_id text;
alter table public.mock_exam_attempts  add column if not exists client_id text;
alter table public.diagnostic_attempts add column if not exists client_id text;

create unique index if not exists question_attempts_client_uidx
  on public.question_attempts(user_id, client_id);
create unique index if not exists scenario_attempts_client_uidx
  on public.scenario_attempts(user_id, client_id);
create unique index if not exists mock_exam_attempts_client_uidx
  on public.mock_exam_attempts(user_id, client_id);
create unique index if not exists diagnostic_attempts_client_uidx
  on public.diagnostic_attempts(user_id, client_id);

-- The Mastery Map's derived score rides along with the SRS snapshot.
alter table public.flashcard_review_log
  add column if not exists mastery int not null default 0;
