-- School diary check, for migration 0036.
-- ============================================================================
-- Proves against the real database that the diary cannot double-book an
-- instructor or a car, that cancelling frees the slot, that an instructor
-- books only themselves, and that no school can see — or point at — another
-- school's learners, cars or lessons.
--
-- Same contract as school_isolation.sql: ONE statement that ALWAYS raises at
-- the end, so everything it creates is rolled back, pass or fail. Safe to run
-- against production once 0035 and 0036 are applied.
--
-- Read the outcome from the error message:
--   DIARY PASSED: <n> checks (rolled back)
--   DIARY FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  teacher2 uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  m_owner_a uuid; m_teacher uuid; m_teacher2 uuid; m_owner_b uuid;
  learner_a uuid; learner_b uuid; car_a uuid; car_b uuid;
  first_lesson uuid; teacher2_lesson uuid;
  stamp timestamptz;
  n int;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup, as the migration owner ─────────────────────────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a,  'diary-a@example.invalid',  'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b,  'diary-b@example.invalid',  'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher,  'diary-t@example.invalid',  'authenticated', 'authenticated', '{"full_name":"Sipho"}'),
    (teacher2, 'diary-t2@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Lerato"}');
  school_a := public.create_school_for_owner(owner_a, 'Diary School A');
  school_b := public.create_school_for_owner(owner_b, 'Diary School B');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'diary-hash-1', 'DIARYAA2');
  perform public.accept_school_invite(teacher, null, 'DIARYAA2');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'diary-hash-2', 'DIARYBB2');
  perform public.accept_school_invite(teacher2, null, 'DIARYBB2');
  select id into m_owner_a  from public.school_members where user_id = owner_a;
  select id into m_teacher  from public.school_members where user_id = teacher;
  select id into m_teacher2 from public.school_members where user_id = teacher2;
  select id into m_owner_b  from public.school_members where user_id = owner_b;

  -- ── Owner A sets up the school through the browser's own grants ───────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.school_learners (school_id, first_name, last_name, phone, created_by)
    values (school_a, 'Thabo', 'Nkosi', '0821234567', owner_a) returning id into learner_a;
  insert into public.school_vehicles (school_id, registration, make, model)
    values (school_a, 'ND 123-456', 'VW', 'Polo') returning id into car_a;
  passed := passed + 1;

  -- A lesson, then the clash it must refuse.
  insert into public.school_lessons (school_id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, created_by)
    values (school_a, learner_a, m_teacher, car_a, '2030-01-15 10:00+02', '2030-01-15 11:00+02', owner_a)
    returning id into first_lesson;
  passed := passed + 1;

  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher, '2030-01-15 10:30+02', '2030-01-15 11:30+02', owner_a);
    failures := array_append(failures, 'the same instructor was booked twice at once');
  exception when exclusion_violation then passed := passed + 1;
  end;

  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher2, car_a, '2030-01-15 10:00+02', '2030-01-15 11:00+02', owner_a);
    failures := array_append(failures, 'the same car was booked twice at once');
  exception when exclusion_violation then passed := passed + 1;
  end;

  -- Half-open slots: ending at 11:00 and starting at 11:00 is not a clash.
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher, car_a, '2030-01-15 11:00+02', '2030-01-15 12:00+02', owner_a);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'back-to-back lessons were refused: ' || sqlerrm);
  end;

  -- A different instructor with no car at the same time is fine.
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher2, '2030-01-15 10:00+02', '2030-01-15 11:00+02', owner_a)
      returning id into teacher2_lesson;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'a second instructor could not teach at the same time: ' || sqlerrm);
  end;

  -- Cancelling frees the slot, with no cleanup code.
  update public.school_lessons set status = 'cancelled_school' where id = first_lesson;
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher, car_a, '2030-01-15 10:15+02', '2030-01-15 10:45+02', owner_a);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'a cancelled lesson still held its slot: ' || sqlerrm);
  end;

  -- A lesson needs a learner; blocked time must not have one.
  begin
    insert into public.school_lessons (school_id, instructor_id, kind, starts_at, ends_at, created_by)
      values (school_a, m_owner_a, 'lesson', '2030-01-16 08:00+02', '2030-01-16 09:00+02', owner_a);
    failures := array_append(failures, 'a lesson was booked with no learner');
  exception when check_violation then passed := passed + 1;
  end;
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, kind, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_owner_a, 'block', '2030-01-16 08:00+02', '2030-01-16 09:00+02', owner_a);
    failures := array_append(failures, 'blocked time was booked against a learner');
  exception when check_violation then passed := passed + 1;
  end;

  -- The row cannot be moved to another school, deleted, backdated, or have
  -- its author rewritten.
  begin
    update public.school_lessons set school_id = school_b where id = teacher2_lesson;
    failures := array_append(failures, 'a lesson was moved to another school');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    delete from public.school_lessons where id = teacher2_lesson;
    failures := array_append(failures, 'a lesson was deleted rather than cancelled');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    update public.school_learners set updated_at = '2000-01-01' where id = learner_a;
    failures := array_append(failures, 'a client set updated_at');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    insert into public.school_learners (school_id, first_name, created_by)
      values (school_a, 'Ghost', owner_b);
    failures := array_append(failures, 'a learner was created in someone else''s name');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  -- updated_at moves by itself.
  select updated_at into stamp from public.school_learners where id = learner_a;
  perform pg_sleep(0.01);
  update public.school_learners set notes = 'Nervous on hills' where id = learner_a;
  select count(*) into n from public.school_learners where id = learner_a and updated_at > stamp;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'updated_at did not move on edit'); end if;

  reset role;

  -- ── Sipho, an instructor at A ─────────────────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher, '2030-01-17 13:00+02', '2030-01-17 14:00+02', teacher);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'an instructor could not book their own lesson: ' || sqlerrm);
  end;

  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_teacher2, '2030-01-17 15:00+02', '2030-01-17 16:00+02', teacher);
    failures := array_append(failures, 'an instructor booked a lesson for a colleague');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  update public.school_lessons set status = 'no_show' where id = teacher2_lesson;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'an instructor changed a colleague''s lesson'); end if;

  begin
    insert into public.school_vehicles (school_id, registration) values (school_a, 'CA 999-999');
    failures := array_append(failures, 'an instructor added a car to the fleet');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  begin
    insert into public.school_learners (school_id, first_name, created_by)
      values (school_a, 'Ayanda', teacher);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'an instructor could not sign up a learner: ' || sqlerrm);
  end;

  reset role;

  -- ── Owner B, a different school entirely ──────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.school_learners where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s learners'); end if;
  select count(*) into n from public.school_vehicles where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s cars'); end if;
  select count(*) into n from public.school_lessons where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s diary'); end if;

  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_a, learner_a, m_owner_b, '2030-01-18 09:00+02', '2030-01-18 10:00+02', owner_b);
    failures := array_append(failures, 'B booked a lesson inside school A');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  -- Even in B's own diary, A's learner and car cannot be named.
  insert into public.school_learners (school_id, first_name, created_by)
    values (school_b, 'Bongani', owner_b) returning id into learner_b;
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_b, learner_a, m_owner_b, '2030-01-18 09:00+02', '2030-01-18 10:00+02', owner_b);
    failures := array_append(failures, 'B booked A''s learner into B''s diary');
  exception when foreign_key_violation then passed := passed + 1;
  end;
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, created_by)
      values (school_b, learner_b, m_owner_b, car_a, '2030-01-18 09:00+02', '2030-01-18 10:00+02', owner_b);
    failures := array_append(failures, 'B booked A''s car');
  exception when foreign_key_violation then passed := passed + 1;
  end;
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
      values (school_b, learner_b, m_teacher, '2030-01-18 09:00+02', '2030-01-18 10:00+02', owner_b);
    failures := array_append(failures, 'B booked A''s instructor');
  exception when foreign_key_violation then passed := passed + 1;
  end;

  reset role;

  -- ── A lapsed school keeps its diary and stops writing to it ───────────────
  update public.school_subscriptions set trial_ends_at = now() - interval '1 day' where school_id = school_a;
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.school_lessons where school_id = school_a;
  if n > 0 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school lost sight of its diary'); end if;
  begin
    insert into public.school_learners (school_id, first_name, created_by)
      values (school_a, 'After lapse', owner_a);
    failures := array_append(failures, 'a lapsed school could still add learners');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  update public.school_lessons set status = 'completed' where school_id = school_a;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school could still change lessons'); end if;

  reset role;

  -- ── Verdict. Always an exception, so everything above is rolled back. ─────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'DIARY PASSED: % checks (rolled back)', passed;
  else
    raise exception 'DIARY FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
