-- Enquiries and test results check, for migration 0039.
-- ============================================================================
-- Proves that enquiries and test results stay inside their school, that any
-- member can log a result but only the owner or the office can correct one,
-- that nobody can delete a result (so a pass rate cannot be tidied up), and
-- that the documents checklist only accepts the fixed set.
--
-- ONE statement that ALWAYS raises at the end, so everything is rolled back.
--   ENQUIRY PASSED: <n> checks (rolled back)
--   ENQUIRY FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  m_teacher uuid;
  thabo uuid; enquiry uuid; result_id uuid;
  n int;
  passed int := 0;
  failures text[] := '{}';
begin
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'enq-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b, 'enq-b@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher, 'enq-t@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Sipho"}');
  school_a := public.create_school_for_owner(owner_a, 'Enquiry School A');
  school_b := public.create_school_for_owner(owner_b, 'Enquiry School B');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'enq-hash-1', 'ENQUIRA2');
  perform public.accept_school_invite(teacher, null, 'ENQUIRA2');
  select id into m_teacher from public.school_members where user_id = teacher;
  insert into public.school_learners (school_id, first_name, created_by)
    values (school_a, 'Thabo', owner_a) returning id into thabo;

  -- ── Sipho logs an enquiry, converts it, records a result ──────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.school_enquiries (school_id, name, phone, source, created_by)
    values (school_a, 'Naledi', '0614442222', 'whatsapp', teacher) returning id into enquiry;
  passed := passed + 1;
  update public.school_enquiries set status = 'contacted', next_follow_up_on = '2030-04-02' where id = enquiry;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'an instructor could not update an enquiry'); end if;
  update public.school_enquiries set converted_learner_id = thabo, status = 'booked' where id = enquiry;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'an enquiry could not be converted'); end if;

  insert into public.school_test_results (school_id, learner_id, test_type, taken_on, result, instructor_id, recorded_by)
    values (school_a, thabo, 'drivers', '2030-04-10', 'failed', m_teacher, teacher) returning id into result_id;
  passed := passed + 1;

  -- A result is corrected by the owner or office, never by the instructor,
  -- and never deleted by anyone.
  update public.school_test_results set result = 'passed' where id = result_id;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'an instructor rewrote a test result'); end if;
  begin
    delete from public.school_test_results where id = result_id;
    failures := array_append(failures, 'a test result was deleted');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    delete from public.school_enquiries where id = enquiry;
    failures := array_append(failures, 'an enquiry was deleted');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    insert into public.school_test_results (school_id, learner_id, test_type, taken_on, result, recorded_by)
      values (school_a, thabo, 'drivers', '2030-04-11', 'passed', owner_a);
    failures := array_append(failures, 'a result was recorded in someone else''s name');
  exception when insufficient_privilege then passed := passed + 1;
  end;

  -- Documents: the fixed set only.
  update public.school_learners set documents = array['id_copy','eye_test'] where id = thabo;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'documents could not be ticked'); end if;
  begin
    update public.school_learners set documents = array['passport'] where id = thabo;
    failures := array_append(failures, 'an unknown document was accepted');
  exception when check_violation then passed := passed + 1;
  end;
  reset role;

  -- ── The owner corrects the mis-tapped result ──────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  update public.school_test_results set result = 'passed' where id = result_id;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the owner could not correct a result'); end if;
  reset role;

  -- ── Another school sees none of it ─────────────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.school_enquiries where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s enquiries'); end if;
  select count(*) into n from public.school_test_results where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s test results'); end if;
  begin
    insert into public.school_test_results (school_id, learner_id, test_type, taken_on, result, recorded_by)
      values (school_b, thabo, 'drivers', '2030-04-12', 'passed', owner_b);
    failures := array_append(failures, 'B recorded a result for A''s learner');
  exception when foreign_key_violation then passed := passed + 1;
  end;
  begin
    insert into public.school_enquiries (school_id, name, created_by) values (school_a, 'Spam', owner_b);
    failures := array_append(failures, 'B logged an enquiry in school A');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  update public.school_enquiries set status = 'lost' where id = enquiry;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B changed A''s enquiry'); end if;
  reset role;

  -- ── Nobody signed in ──────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    select count(*) into n from public.school_enquiries;
    failures := array_append(failures, 'an anonymous visitor can read enquiries');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  reset role;

  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'ENQUIRY PASSED: % checks (rolled back)', passed;
  else
    raise exception 'ENQUIRY FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
