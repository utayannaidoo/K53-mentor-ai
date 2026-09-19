-- 0040: a paid school subscription ends when its period does.
-- ============================================================================
-- Slice 4 (school billing). Until now my_writable_school_ids() only looked at
-- `status`, which was enough for a trial but not for a paid plan: a school
-- that cancels is told access continues until the end of the period it paid
-- for, and Paystack's `subscription.disable` arrives the moment they cancel —
-- not when that period ends. With status alone, a cancelled school would stay
-- writable forever, and a school whose final `subscription.disable` webhook
-- was lost would too.
--
-- The rule is now the learner app's rule, from src/lib/billing/tier-rule.ts,
-- so the two products expire the same way:
--   * cancel_at_period_end → writable until current_period_end, not a moment
--     longer (the school was told that date);
--   * any paid row → no longer writable three days after current_period_end,
--     flag or no flag. Paystack charges ON the renewal date and a card retry
--     can leave the stored date stale by a day or two; beyond three days it
--     is a subscription that stopped renewing without us hearing about it.
-- "No longer writable" is read-only, never locked out (0035).
--
-- The function keeps its signature, so every policy that uses it picks the
-- new rule up without being touched. TypeScript mirrors it in
-- accessFromSubscription (src/lib/schools/auth.ts); tests pin both.

create or replace function public.my_writable_school_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select m.school_id
  from public.school_members m
  join public.school_subscriptions s on s.school_id = m.school_id
  where m.user_id = (select auth.uid()) and m.status = 'active'
    and (
      (s.status = 'trialing' and s.trial_ends_at > now())
      or (
        s.status in ('active','past_due')
        and not (s.cancel_at_period_end and s.current_period_end is not null
                 and now() >= s.current_period_end)
        and not (s.current_period_end is not null
                 and now() >= s.current_period_end + interval '3 days')
      )
    )
$$;

-- Re-assert the NOTE 3 exception from 0035: this runs inside policies.
do $$ declare f record; begin
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname = 'my_writable_school_ids' loop
    execute format('revoke execute on function %s from public, anon',f.signature);
    execute format('grant execute on function %s to authenticated, service_role',f.signature);
  end loop;
end; $$;
