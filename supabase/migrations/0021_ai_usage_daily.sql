-- 0021: per-user daily AI usage, so *average* usage is knowable
-- ============================================================================
-- Every cap decision so far has been made against the wrong number.
--
-- The plan caps (15/day Premium, 35/day Premium Plus) are ceilings, and the
-- cost arithmetic in docs/ops/ai-cost-model.md prices a subscriber who sits at
-- theirs every single day. Nobody does that. The number that actually decides
-- whether a cap is too low (learners hitting a wall) or too high (an unpriced
-- tail) is the *distribution* of real usage, and it has never been recorded —
-- the caps were cut 15/40 → 10/20 and raised again to 15/35 within one day,
-- both times on estimates, because there was nothing else to reason from.
--
-- Upstash already counts requests per user per day, but as a rate limiter: the
-- keys are date-scoped with a ~25h TTL and are gone before anyone could learn
-- anything from them. That is correct for a limiter and useless for a trend.
-- This table is the durable, queryable half.
--
-- Deliberately an aggregate, not a log. One row per user per day per surface —
-- no prompts, no replies, no message text, nothing about *what* was asked. It
-- can answer "how many" and never "what about". That keeps it outside the
-- POPIA minimisation problem an event log would create, and keeps it small:
-- roughly one row per active user per day.

create table if not exists public.ai_usage_daily (
  user_id   uuid not null references auth.users(id) on delete cascade,
  day       date not null,
  -- 'tutor' | 'coach' | 'vision' — matches AiSurface in entitlements.server.ts.
  surface   text not null,
  -- Tier at the time of the request. Denormalised on purpose: a subscriber who
  -- upgrades mid-month must not retroactively rewrite what their free-week
  -- usage looked like, and "average messages per Premium subscriber" is
  -- unanswerable from a join against today's subscriptions row.
  tier      text not null,
  -- Requests actually served.
  requests  integer not null default 0,
  -- Requests refused because the daily allowance was spent. The signal that a
  -- cap is too low: a rising `capped` is learners hitting a wall, which no
  -- amount of average-usage data would show on its own.
  capped    integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day, surface)
);

-- Queries are "everyone, over a date range", not "one user" — the index that
-- matters is on day, not on the PK's leading user_id column.
create index if not exists ai_usage_daily_day_idx on public.ai_usage_daily (day, surface);

alter table public.ai_usage_daily enable row level security;

-- Reading your own usage is harmless and is what a future "12 of 15 messages
-- used today" indicator would read. Writes are server-only: the RPC below is
-- the sole writer and no client role may execute it, so a tampered client can
-- neither inflate nor erase its own numbers.
drop policy if exists own_ai_usage on public.ai_usage_daily;
create policy own_ai_usage on public.ai_usage_daily
  for select using ((select auth.uid()) = user_id);

/**
 * Record one AI request. Called by the AI routes with the service-role key.
 *
 * `p_capped` distinguishes a request that was served from one that was refused
 * for being over the allowance; both are worth counting, and conflating them
 * would make a cap look popular exactly when it is hurting.
 */
create or replace function public.record_ai_usage(
  p_user uuid,
  p_surface text,
  p_tier text,
  p_capped boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ai_usage_daily (user_id, day, surface, tier, requests, capped)
  values (
    p_user,
    (now() at time zone 'utc')::date,
    p_surface,
    p_tier,
    case when p_capped then 0 else 1 end,
    case when p_capped then 1 else 0 end
  )
  on conflict (user_id, day, surface) do update
    set requests   = public.ai_usage_daily.requests + excluded.requests,
        capped     = public.ai_usage_daily.capped + excluded.capped,
        -- Last tier seen wins. A tier change mid-day is rare and either answer
        -- is defensible; what matters is that the row keeps a tier at all.
        tier       = excluded.tier,
        updated_at = now();
end;
$$;

revoke execute on function public.record_ai_usage(uuid, text, text, boolean)
  from public, anon, authenticated;

-- ── Reading it ───────────────────────────────────────────────────────────────
-- The question the caps need answered, for the last 30 days:
--
--   select tier,
--          count(distinct user_id)                     as users,
--          round(avg(requests), 1)                     as mean_per_active_day,
--          percentile_cont(0.5) within group (order by requests)  as p50,
--          percentile_cont(0.9) within group (order by requests)  as p90,
--          max(requests)                               as most,
--          sum(capped)                                 as times_capped
--   from public.ai_usage_daily
--   where surface = 'tutor' and day > current_date - 30
--   group by tier order by tier;
--
-- Read p90 against the cap, not the mean. The mean is dragged down by everyone
-- who opened the app and asked one question; the cap only ever binds the tail.
