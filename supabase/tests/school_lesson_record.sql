-- Lesson record check, for migration 0037.
-- ============================================================================
-- Proves against the real database that only the instructor who taught a
-- lesson (or the owner) can record it, that another school cannot touch it or
-- even learn it exists, that the progress grid shows the LATEST rating per
-- manoeuvre however lessons are edited, and that a browser can read these
-- tables but never write them directly.
--
-- Same contract as the other scripts: ONE statement that ALWAYS raises at the
-- end, so everything it creates is rolled back, pass or fail.
--   RECORD PASSED: <n> checks (rolled back)
--   RECORD FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  teacher2 uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  m_teacher uuid; m_teacher2 uuid;
  learner uuid;
  early_lesson uuid; late_lesson uuid; colleague_lesson uuid; block_lesson uuid; cancelled_lesson uuid;
  n int;
  r int;
  txt text;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup ─────────────────────────────────────────────────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a,  'rec-a@example.invalid',  'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b,  'rec-b@example.invalid',  'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher,  'rec-t@example.invalid',  'authenticated', 'authenticated', '{"full_name":"Sipho"}'),
    (teacher2, 'rec-t2@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Lerato"}');
  school_a := public.create_school_for_owner(owner_a, 'Record School A');
  school_b := public.create_school_for_owner(owner_b, 'Record School B');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'rec-hash-1', 'RECORDA2');
  perform public.accept_school_invite(teacher, null, 'RECORDA2');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'rec-hash-2', 'RECORDB2');
  perform public.accept_school_invite(teacher2, null, 'RECORDB2');
  select id into m_teacher  from public.school_members where user_id = teacher;
  select id into m_teacher2 from public.school_members where user_id = teacher2;

  insert into public.school_learners (school_id, first_name, created_by)
    values (school_a, 'Thabo', owner_a) returning id into learner;
  insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
    values (school_a, learner, m_teacher, '2030-02-01 09:00+02', '2030-02-01 10:00+02', owner_a)
    returning id into early_lesson;
  insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
    values (school_a, learner, m_teacher, '2030-02-08 09:00+02', '2030-02-08 10:00+02', owner_a)
    returning id into late_lesson;
  insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, created_by)
    values (school_a, learner, m_teacher2, '2030-02-03 09:00+02', '2030-02-03 10:00+02', owner_a)
    returning id into colleague_lesson;
  insert into public.school_lessons (school_id, instructor_id, kind, starts_at, ends_at, created_by)
    values (school_a, m_teacher, 'block', '2030-02-02 09:00+02', '2030-02-02 10:00+02', owner_a)
    returning id into block_lesson;
  insert into public.school_lessons (school_id, learner_id, instructor_id, starts_at, ends_at, status, created_by)
    values (school_a, learner, m_teacher, '2030-02-09 09:00+02', '2030-02-09 10:00+02', 'cancelled_learner', owner_a)
    returning id into cancelled_lesson;

  -- ── Sipho records his own lesson ──────────────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    perform public.record_lesson_assessment(
      early_lesson, 'First go at the yard.', 'Alley docking reference points', false,
      '[{"module_id":"alley_docking","rating":1,"faults":["Excessive shunting"]},
        {"module_id":"parallel_parking","rating":2,"faults":[]}]'::jsonb);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'the instructor could not record their own lesson: ' || sqlerrm);
  end;

  select count(*) into n from public.school_lesson_modules where lesson_id = early_lesson;
  if n = 2 then passed := passed + 1; else failures := array_append(failures, format('%s manoeuvres recorded, expected 2', n)); end if;
  select status into txt from public.school_lessons where id = early_lesson;
  if txt = 'completed' then passed := passed + 1; else failures := array_append(failures, 'recording did not mark the lesson done'); end if;
  select next_focus into txt from public.school_lesson_notes where lesson_id = early_lesson;
  if txt = 'Alley docking reference points' then passed := passed + 1; else failures := array_append(failures, 'the next focus was not saved'); end if;

  -- A later lesson raises alley docking to test-ready.
  perform public.record_lesson_assessment(
    late_lesson, 'Much better.', null, false,
    '[{"module_id":"alley_docking","rating":3,"faults":[]}]'::jsonb);
  select rating into r from public.school_learner_progress where learner_id = learner and module_id = 'alley_docking';
  if r = 3 then passed := passed + 1; else failures := array_append(failures, format('grid shows %s for alley docking, expected the later 3', r)); end if;

  -- Editing the EARLIER lesson must not overwrite the later rating.
  perform public.record_lesson_assessment(
    early_lesson, 'First go at the yard (corrected).', 'Alley docking reference points', false,
    '[{"module_id":"alley_docking","rating":2,"faults":[]},
      {"module_id":"parallel_parking","rating":2,"faults":[]}]'::jsonb);
  select rating into r from public.school_learner_progress where learner_id = learner and module_id = 'alley_docking';
  if r = 3 then passed := passed + 1; else failures := array_append(failures, 'editing an older lesson overwrote a newer rating'); end if;
  select rating into r from public.school_learner_progress where learner_id = learner and module_id = 'parallel_parking';
  if r = 2 then passed := passed + 1; else failures := array_append(failures, 'a manoeuvre rated only on the older lesson went missing'); end if;

  -- An edit REPLACES the lesson's set: dropping parallel parking removes it.
  perform public.record_lesson_assessment(
    early_lesson, 'First go at the yard.', null, false,
    '[{"module_id":"alley_docking","rating":2,"faults":[]}]'::jsonb);
  select count(*) into n from public.school_learner_progress where learner_id = learner and module_id = 'parallel_parking';
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a manoeuvre removed in an edit is still on the grid'); end if;

  -- Not his lesson, not a real lesson, not a lesson at all.
  begin
    perform public.record_lesson_assessment(colleague_lesson, 'x', null, false, '[]'::jsonb);
    failures := array_append(failures, 'an instructor recorded a colleague''s lesson');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.record_lesson_assessment(block_lesson, 'x', null, false, '[]'::jsonb);
    failures := array_append(failures, 'blocked time was recorded as a lesson');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.record_lesson_assessment(cancelled_lesson, 'x', null, false, '[]'::jsonb);
    failures := array_append(failures, 'a cancelled lesson was recorded');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.record_lesson_assessment(late_lesson, 'x', null, false,
      '[{"module_id":"alley_docking","rating":4,"faults":[]}]'::jsonb);
    failures := array_append(failures, 'a rating of 4 was accepted');
  exception when check_violation then passed := passed + 1;
  end;
  begin
    perform public.record_lesson_assessment(late_lesson, 'x', null, false,
      '[{"module_id":"Robert''); drop table x;--","rating":2,"faults":[]}]'::jsonb);
    failures := array_append(failures, 'a malformed module id was accepted');
  exception when check_violation then passed := passed + 1;
  end;

  -- A browser reads these tables and never writes them directly.
  begin
    insert into public.school_lesson_notes (lesson_id, school_id, summary, created_by)
      values (colleague_lesson, school_a, 'forged', teacher);
    failures := array_append(failures, 'a note was written without the function');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    delete from public.school_lesson_modules where lesson_id = late_lesson;
    failures := array_append(failures, 'an assessment line was deleted directly');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  reset role;

  -- ── The owner can record anyone's lesson ──────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    perform public.record_lesson_assessment(colleague_lesson, 'Owner stepped in.', null, false,
      '[{"module_id":"three_point_turn","rating":2,"faults":[]}]'::jsonb);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'the owner could not record a lesson: ' || sqlerrm);
  end;
  reset role;

  -- ── Another school sees nothing and can do nothing ────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.school_learner_progress where learner_id = learner;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s learner''s progress'); end if;
  select count(*) into n from public.school_lesson_notes where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can read A''s lesson notes'); end if;
  begin
    perform public.record_lesson_assessment(late_lesson, 'hijack', null, false, '[]'::jsonb);
    failures := array_append(failures, 'B recorded a lesson in school A');
  exception when raise_exception then
    -- And the refusal must not confirm the lesson exists.
    if sqlerrm = 'That lesson could not be found' then passed := passed + 1;
    else failures := array_append(failures, 'B''s refusal revealed the lesson exists: ' || sqlerrm); end if;
  end;
  reset role;

  -- ── A lapsed school keeps its records and stops writing ───────────────────
  update public.school_subscriptions set trial_ends_at = now() - interval '1 day' where school_id = school_a;
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.school_learner_progress where learner_id = learner;
  if n > 0 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school lost its progress grid'); end if;
  begin
    perform public.record_lesson_assessment(late_lesson, 'after lapse', null, false, '[]'::jsonb);
    failures := array_append(failures, 'a lapsed school could still record lessons');
  exception when raise_exception then passed := passed + 1;
  end;
  reset role;

  -- ── Nobody signed in ──────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    select count(*) into n from public.school_learner_progress;
    failures := array_append(failures, 'an anonymous visitor can read progress');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    perform public.record_lesson_assessment(late_lesson, 'anon', null, false, '[]'::jsonb);
    failures := array_append(failures, 'an anonymous visitor can call the record function');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  reset role;

  -- ── Verdict. Always an exception, so everything above is rolled back. ─────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'RECORD PASSED: % checks (rolled back)', passed;
  else
    raise exception 'RECORD FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
