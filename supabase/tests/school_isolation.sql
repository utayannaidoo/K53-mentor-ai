-- School workspace isolation check, for migration 0035.
-- ============================================================================
-- Proves against the real database that one school cannot see or change
-- another school's data, that an instructor cannot promote themselves, and
-- that a lapsed subscription is read-only rather than locked. There is no
-- test database in CI, and a fake query builder that ignores filters would
-- happily pass a broken policy — so this runs against Postgres itself.
--
-- IT IS ONE STATEMENT THAT ALWAYS FAILS AT THE END. Everything it creates —
-- three throwaway auth users, their profiles, two schools, an invite — is
-- rolled back with it, pass or fail. That makes it safe to run against
-- production. Checked before writing this: the only trigger on auth.users is
-- handle_new_user, and no pg_net / dblink / http extension is installed, so
-- nothing inside can reach outside the transaction.
--
-- Read the outcome from the error message:
--   ISOLATION PASSED: <n> checks (rolled back)
--   ISOLATION FAILED: <which> (<n> passed, rolled back)
-- Any other error means the check itself could not run.
--
-- Impersonation works the way PostgREST does it: switch to the
-- `authenticated` role and set request.jwt.claims, which auth.uid() reads.

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  school_a uuid;
  school_b uuid;
  teacher_member uuid;
  n int;
  t text;
  col record;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup, as the migration owner ─────────────────────────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'isolation-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b, 'isolation-b@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher, 'isolation-t@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Teacher"}');

  school_a := public.create_school_for_owner(owner_a, 'Isolation School A');
  school_b := public.create_school_for_owner(owner_b, 'Isolation School B');

  -- A trial must leave room to invite someone — at one seat it could not.
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'iso-hash-a', 'TESTAAA2');
  perform public.accept_school_invite(teacher, null, 'TESTAAA2');
  select id into teacher_member from public.school_members
   where user_id = teacher and school_id = school_a and status = 'active';
  if teacher_member is null then
    failures := array_append(failures, 'setup: the instructor invite was not accepted');
  else
    passed := passed + 1;
  end if;

  -- ── Owner A, signed in ────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.schools where id = school_a;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'A cannot see its own school'); end if;
  select count(*) into n from public.schools where id = school_b;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'A can see school B'); end if;

  -- Reading school_members at all is the recursion test: a policy that looked
  -- itself up without SECURITY DEFINER would raise 42P17 right here.
  select count(*) into n from public.school_members where school_id = school_a;
  if n = 2 then passed := passed + 1; else failures := array_append(failures, format('A sees %s members of A, expected 2', n)); end if;
  select count(*) into n from public.school_members where school_id = school_b;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'A can see B''s members'); end if;

  select count(*) into n from public.school_subscriptions where school_id = school_a;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'A cannot see its own subscription'); end if;
  select count(*) into n from public.school_subscriptions where school_id = school_b;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'A can see B''s subscription'); end if;

  begin
    select count(*) into n from public.school_invites;
    failures := array_append(failures, 'a signed-in user can read school_invites (token hashes)');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  update public.schools set name = 'hijacked' where id = school_b;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'A renamed school B'); end if;

  update public.schools set name = 'Isolation School A (renamed)' where id = school_a;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the owner cannot rename their own school'); end if;

  begin
    insert into public.school_members (school_id, user_id, role) values (school_b, owner_a, 'owner');
    failures := array_append(failures, 'A inserted itself into school B');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  begin
    insert into public.schools (name, slug, created_by) values ('Rogue', 'rogue-school', owner_a);
    failures := array_append(failures, 'a signed-in user created a school without the RPC');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  begin
    update public.school_subscriptions set status = 'active', seats = 100 where school_id = school_a;
    failures := array_append(failures, 'an owner rewrote their own subscription');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  -- These two only pass if 0035 revoked Supabase's grant-everything defaults
  -- before granting. The privilege audit at the end covers every table.
  begin
    delete from public.schools where id = school_a;
    failures := array_append(failures, 'an owner could DELETE their school row directly');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  -- The owner may edit name/town/province/phone/email/lesson length, and not
  -- who created the school or which partner record it is linked to.
  begin
    update public.schools set created_by = owner_b where id = school_a;
    failures := array_append(failures, 'an owner rewrote schools.created_by');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  reset role;

  -- ── The instructor at school A ────────────────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.schools where id = school_a;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the instructor cannot see their school'); end if;

  update public.schools set name = 'renamed by instructor' where id = school_a;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'an instructor renamed the school'); end if;

  begin
    update public.school_members set role = 'owner' where id = teacher_member;
    failures := array_append(failures, 'an instructor promoted themselves to owner');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  begin
    perform public.transfer_school_ownership(teacher, school_a, teacher_member);
    failures := array_append(failures, 'a signed-in user can call a membership RPC directly');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  reset role;

  -- ── Owner B, signed in ────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.schools where id in (school_a, school_b);
  if n = 1 then passed := passed + 1; else failures := array_append(failures, format('B sees %s schools, expected 1', n)); end if;
  select count(*) into n from public.school_members where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s members'); end if;

  reset role;

  -- ── Nobody signed in ──────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    select count(*) into n from public.schools;
    failures := array_append(failures, 'an anonymous visitor can read schools');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  reset role;

  -- ── The RPCs check who is asking, not just who is calling ─────────────────
  -- Server actions pass the signed-in user's id; these prove the functions
  -- refuse the wrong one even when invoked with the service role's authority.
  begin
    perform public.create_school_invite(owner_b, school_a, 'instructor', null, 'iso-hash-b', 'TESTBBB2');
    failures := array_append(failures, 'B created an invite for school A');
  exception when raise_exception then passed := passed + 1;
  end;

  begin
    perform public.set_member_role(teacher, teacher_member, 'assistant');
    failures := array_append(failures, 'an instructor changed a role through the RPC');
  exception when raise_exception then passed := passed + 1;
  end;

  begin
    perform public.create_school_for_owner(owner_a, 'A second school');
    failures := array_append(failures, 'one owner created a second school');
  exception when raise_exception then passed := passed + 1;
  end;

  -- ── Seats ─────────────────────────────────────────────────────────────────
  update public.school_subscriptions set seats = 1 where school_id = school_b;
  begin
    perform public.create_school_invite(owner_b, school_b, 'instructor', null, 'iso-hash-c', 'TESTCCC2');
    failures := array_append(failures, 'an instructor invite beyond the seat limit was allowed');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    -- Office staff do not use a seat.
    perform public.create_school_invite(owner_b, school_b, 'assistant', null, 'iso-hash-d', 'TESTDDD2');
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, ('an office-staff invite was blocked: ' || sqlerrm));
  end;

  -- ── A lapsed trial is read-only, not locked ───────────────────────────────
  update public.school_subscriptions set trial_ends_at = now() - interval '1 day' where school_id = school_a;
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.schools where id = school_a;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school lost read access'); end if;
  update public.schools set name = 'written after lapse' where id = school_a;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school could still write'); end if;

  reset role;

  -- ── Ownership moves without ever leaving zero or two owners ───────────────
  -- Caught rather than left to abort: every check after setup must record its
  -- failure, or a broken earlier step would hide the verdict entirely.
  begin
    perform public.transfer_school_ownership(owner_a, school_a, teacher_member);
  exception when others then
    failures := array_append(failures, 'the ownership transfer raised: ' || sqlerrm);
  end;
  select count(*) into n from public.school_members
   where school_id = school_a and role = 'owner' and status = 'active';
  if n = 1 then passed := passed + 1; else failures := array_append(failures, format('%s active owners after a transfer', n)); end if;
  select count(*) into n from public.school_members
   where school_id = school_a and role = 'owner' and user_id = teacher;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'ownership did not move to the new owner'); end if;

  -- ── Privilege audit over EVERY school table, present and future ──────────
  -- Supabase grants every privilege on every new public table to anon and
  -- authenticated by default, TRUNCATE included — and TRUNCATE ignores RLS.
  -- Each migration must revoke those before granting. This loops over whatever
  -- school tables exist, so a later slice that forgets fails here without
  -- anyone remembering to add a check. It reads the grants directly rather
  -- than attempting the operation, because a foreign key or a trigger can make
  -- an attempt fail for an unrelated reason and hide a privilege that exists.
  for t in
    select c.relname::text from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
     where ns.nspname = 'public' and c.relkind = 'r'
       and (c.relname = 'schools' or c.relname like 'school\_%')
  loop
    if (select relrowsecurity from pg_class where oid = format('public.%I', t)::regclass) then
      passed := passed + 1;
    else
      failures := array_append(failures, format('RLS is off on %s', t));
    end if;
    if has_table_privilege('authenticated', format('public.%I', t), 'TRUNCATE') then
      failures := array_append(failures, format('authenticated can TRUNCATE %s', t));
    else passed := passed + 1; end if;
    if has_table_privilege('authenticated', format('public.%I', t), 'DELETE') then
      failures := array_append(failures, format('authenticated can DELETE from %s', t));
    else passed := passed + 1; end if;
    if has_table_privilege('anon', format('public.%I', t), 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') then
      failures := array_append(failures, format('anon holds a privilege on %s', t));
    else passed := passed + 1; end if;
    -- Moving a row to another school, or rewriting who created it, must be
    -- impossible for a browser, whatever the policies say.
    for col in
      select a.attname::text as name from pg_attribute a
       where a.attrelid = format('public.%I', t)::regclass
         and a.attname in ('school_id', 'created_by') and not a.attisdropped
    loop
      if has_column_privilege('authenticated', format('public.%I', t), col.name, 'UPDATE') then
        failures := array_append(failures, format('authenticated can UPDATE %s.%s', t, col.name));
      else passed := passed + 1; end if;
    end loop;
  end loop;

  -- ── Verdict. Always an exception, so everything above is rolled back. ─────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'ISOLATION PASSED: % checks (rolled back)', passed;
  else
    raise exception 'ISOLATION FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
