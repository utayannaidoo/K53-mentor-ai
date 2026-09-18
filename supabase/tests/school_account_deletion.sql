-- Account deletion check, for migration 0041.
-- ============================================================================
-- Proves that an instructor who has booked lessons, taken and voided cash,
-- written notes, rated modules, logged an enquiry and recorded a test result
-- can still delete their K53 Mentor account — and that when they do, every
-- one of those records stays with the school. Proves that the active owner
-- cannot be erased out from under their school. And checks, structurally,
-- that no school table has a foreign key that would block deleting a user.
--
-- Same contract as the other scripts: ONE statement that ALWAYS raises at the
-- end, so everything it creates is rolled back, pass or fail. Safe to run in
-- the production SQL editor, where it deletes only the users it created.
--   ERASURE PASSED: <n> checks (rolled back)
--   ERASURE FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  school_a uuid;
  m_owner uuid; m_teacher uuid;
  thabo uuid; lesson uuid; pkg uuid; cash uuid; voided uuid; enquiry uuid; test_row uuid;
  blockers text;
  n int;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Structure: nothing in a school table may block deleting a user ──────
  select string_agg(conrelid::regclass::text || '.' || conname, ', ') into blockers
    from pg_constraint
   where contype = 'f'
     and confrelid = 'auth.users'::regclass
     and conrelid::regclass::text like 'school%'
     and confdeltype in ('a', 'r');
  if blockers is null then passed := passed + 1;
  else failures := array_append(failures, 'these foreign keys block account deletion: ' || blockers);
  end if;

  -- ── Setup: an owner, and an instructor who has done a bit of everything ──
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'erase-owner@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (teacher, 'erase-teacher@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Sipho"}');
  school_a := public.create_school_for_owner(owner_a, 'Erasure School');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'erase-hash-1', 'ERASEAB2');
  perform public.accept_school_invite(teacher, null, 'ERASEAB2');
  select id into m_owner from public.school_members where user_id = owner_a;
  select id into m_teacher from public.school_members where user_id = teacher;

  insert into public.school_learners (school_id, first_name, created_by)
    values (school_a, 'Thabo', teacher) returning id into thabo;
  insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
    values (school_a, thabo, m_teacher, '2030-05-04 10:00+02', '2030-05-04 11:00+02', teacher)
    returning id into lesson;
  insert into public.school_lesson_notes (lesson_id, school_id, summary, created_by)
    values (lesson, school_a, 'Clutch control much better.', teacher);
  insert into public.school_lesson_modules (lesson_id, school_id, module_id, rating, assessed_by)
    values (lesson, school_a, 'alley_docking', 2, teacher);
  insert into public.school_packages (school_id, learner_id, name, lessons_included, price_cents, sold_on, created_by)
    values (school_a, thabo, '10 lessons', 10, 250000, '2030-05-01', teacher) returning id into pkg;
  insert into public.school_payments (school_id, learner_id, package_id, amount_cents, method, received_on, received_by)
    values (school_a, thabo, pkg, 100000, 'cash', '2030-05-01', teacher) returning id into cash;
  -- A payment the instructor took AND voided: the case 0038's CHECK tripped on.
  insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by,
                                      voided_at, voided_by, void_reason)
    values (school_a, thabo, 5000, 'cash', '2030-05-01', teacher, now(), teacher, 'typed the wrong amount')
    returning id into voided;
  insert into public.school_enquiries (school_id, name, created_by)
    values (school_a, 'Lerato', teacher) returning id into enquiry;
  insert into public.school_test_results (school_id, learner_id, test_type, taken_on, result, instructor_id, recorded_by)
    values (school_a, thabo, 'drivers', '2030-05-10', 'passed', m_teacher, teacher) returning id into test_row;

  -- ── The instructor deletes their account ─────────────────────────────────
  begin
    delete from auth.users where id = teacher;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'an instructor could not delete their account: ' || sqlerrm);
  end;

  -- Their member row is detached and suspended, not gone.
  select count(*) into n from public.school_members
   where id = m_teacher and user_id is null and status = 'suspended' and display_name = 'Sipho';
  if n = 1 then passed := passed + 1;
  else failures := array_append(failures, 'the departed instructor''s member row was not kept, detached and suspended');
  end if;

  -- Every record they made is still the school's, with the pointer cleared.
  select count(*) into n from public.school_lessons where id = lesson and instructor_id = m_teacher and created_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the lesson was lost or still names the erased account'); end if;
  select count(*) into n from public.school_lesson_notes where lesson_id = lesson and created_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the lesson note was lost'); end if;
  select count(*) into n from public.school_lesson_modules where lesson_id = lesson and assessed_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the module rating was lost'); end if;
  select count(*) into n from public.school_learners where id = thabo and created_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the learner was lost'); end if;
  select count(*) into n from public.school_packages where id = pkg and created_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the package was lost'); end if;
  select count(*) into n from public.school_payments where id = cash and received_by is null and amount_cents = 100000;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the cash payment was lost or changed'); end if;
  select count(*) into n from public.school_payments
   where id = voided and voided_at is not null and voided_by is null and void_reason = 'typed the wrong amount';
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the voided payment stopped being void'); end if;
  select count(*) into n from public.school_enquiries where id = enquiry and created_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the enquiry was lost'); end if;
  select count(*) into n from public.school_test_results where id = test_row and recorded_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the test result was lost'); end if;
  select count(*) into n from public.school_invites where school_id = school_a and accepted_at is not null and accepted_by is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the accepted invite was lost'); end if;

  -- A departed instructor no longer uses a seat.
  select count(*) into n from public.school_members
   where school_id = school_a and status = 'active' and role in ('owner', 'instructor');
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a departed instructor still counts against the seats'); end if;

  -- The owner still sees all of it through their own policies.
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.school_payments where school_id = school_a;
  if n = 2 then passed := passed + 1; else failures := array_append(failures, 'the owner lost sight of the departed instructor''s payments'); end if;
  reset role;

  -- ── The owner tries to delete their account ──────────────────────────────
  begin
    delete from auth.users where id = owner_a;
    failures := array_append(failures, 'an owner was erased out from under their school');
  exception when raise_exception then
    if sqlerrm like '%owns a driving school%' then passed := passed + 1;
    else failures := array_append(failures, 'the owner guard raised the wrong error: ' || sqlerrm);
    end if;
  end;
  select count(*) into n from public.school_members
   where id = m_owner and user_id = owner_a and role = 'owner' and status = 'active';
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the refused delete still changed the owner''s membership'); end if;

  -- ── Verdict ──────────────────────────────────────────────────────────────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'ERASURE PASSED: % checks (rolled back)', passed;
  else
    raise exception 'ERASURE FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
