-- Paid-period check, for migration 0040.
-- ============================================================================
-- Proves that a paid school subscription is writable while it is paid for,
-- goes read-only exactly when a cancelled plan's period ends, and goes
-- read-only three days after any period ends — and never locks the school
-- out of reading its own records.
--
-- ONE statement that ALWAYS raises at the end, so everything is rolled back.
--   PERIODS PASSED: <n> checks (rolled back)
--   PERIODS FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  school_a uuid;
  n int;
  passed int := 0;
  failures text[] := '{}';
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'periods-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}');
  school_a := public.create_school_for_owner(owner_a, 'Periods School');

  -- The one write this script uses to probe writability: renaming the school.
  -- Returns 1 row when writable, 0 when read-only (the policy filters it out).

  -- Paid and running.
  update public.school_subscriptions
     set status = 'active', plan = 'team', cancel_at_period_end = false,
         current_period_end = now() + interval '20 days'
   where school_id = school_a;
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.schools set name = 'Paid' where id = school_a;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a paid, running school could not write'); end if;
  reset role;

  -- Cancelled, still inside the paid-for period.
  update public.school_subscriptions set cancel_at_period_end = true where school_id = school_a;
  set local role authenticated;
  update public.schools set name = 'Cancelled but paid' where id = school_a;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a cancelled school lost access before its paid period ended'); end if;
  reset role;

  -- Cancelled, and the period has now ended.
  update public.school_subscriptions set current_period_end = now() - interval '1 minute' where school_id = school_a;
  set local role authenticated;
  update public.schools set name = 'Cancelled and over' where id = school_a;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a cancelled school could still write after its period ended'); end if;
  select count(*) into n from public.schools where id = school_a;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school lost read access'); end if;
  reset role;

  -- Not cancelled, period ended two days ago: still inside the card-retry slack.
  update public.school_subscriptions
     set cancel_at_period_end = false, current_period_end = now() - interval '2 days'
   where school_id = school_a;
  set local role authenticated;
  update public.schools set name = 'Retrying card' where id = school_a;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a renewing school lost access inside the retry slack'); end if;
  reset role;

  -- Period ended four days ago with no word from Paystack: read-only.
  update public.school_subscriptions set current_period_end = now() - interval '4 days' where school_id = school_a;
  set local role authenticated;
  update public.schools set name = 'Silently stopped' where id = school_a;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a school past the retry slack could still write'); end if;
  reset role;

  -- Past due with a recent period: the grace state keeps working.
  update public.school_subscriptions
     set status = 'past_due', current_period_end = now() - interval '1 day'
   where school_id = school_a;
  set local role authenticated;
  update public.schools set name = 'Past due' where id = school_a;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a past-due school lost access inside the grace window'); end if;
  reset role;

  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'PERIODS PASSED: % checks (rolled back)', passed;
  else
    raise exception 'PERIODS FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
