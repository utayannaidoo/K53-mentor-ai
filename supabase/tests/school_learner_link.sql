-- Learner link check, for migration 0043.
-- ============================================================================
-- Proves that only a learner can connect their own K53 Mentor account to a
-- school's roster (a school cannot insert, update or code its way into one);
-- that a code works once, for its own school, and never for the school's own
-- staff; that what the school then sees is exactly a readiness number and a
-- strength per category, and only while the link stands; that either side
-- can end it and account deletion always can; and that the software feeds
-- the referral programme without ever overriding it.
--
-- Same contract as the other scripts: ONE statement that ALWAYS raises at the
-- end, so everything it creates is rolled back, pass or fail.
--   LINK PASSED: <n> checks (rolled back)
--   LINK FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  learner uuid := gen_random_uuid();
  paid_learner uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  partner uuid := gen_random_uuid();
  thabo uuid; ayanda uuid; lerato uuid;
  summary jsonb;
  txt text;
  n int;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup ─────────────────────────────────────────────────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'link-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b, 'link-b@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher, 'link-t@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Sipho"}'),
    (learner, 'link-l@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Thabo"}'),
    (paid_learner, 'link-p@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Lerato"}');
  school_a := public.create_school_for_owner(owner_a, 'Link School A');
  school_b := public.create_school_for_owner(owner_b, 'Link School B');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'link-hash-1', 'LINKTAB2');
  perform public.accept_school_invite(teacher, null, 'LINKTAB2');

  -- School A is also a referral partner.
  insert into public.partner_schools (id, name, contact_name, contact_email, status)
    values (partner, 'Link Partner', 'Owner A', 'link-a@example.invalid', 'active');
  insert into public.partner_school_codes (school_id, code) values (partner, 'link-partner');
  perform public.link_partner_school(owner_a, school_a, 'link-partner');

  insert into public.school_learners (school_id, first_name, created_by) values (school_a, 'Thabo', owner_a) returning id into thabo;
  insert into public.school_learners (school_id, first_name, created_by) values (school_a, 'Ayanda', owner_a) returning id into ayanda;
  insert into public.school_learners (school_id, first_name, created_by) values (school_a, 'Lerato', owner_a) returning id into lerato;

  -- The learner's own study history, in the learner app's tables.
  insert into public.readiness_history (user_id, day, readiness) values
    (learner, '2030-06-01', 40), (learner, '2030-06-02', 72);
  insert into public.question_attempts (user_id, question_id, category_id, selected_index, is_correct, attempted_at)
    select learner, 'q' || g, 'road_signs', 0, g <= 9, now() - make_interval(mins => g) from generate_series(1, 12) g;
  insert into public.question_attempts (user_id, question_id, category_id, selected_index, is_correct, attempted_at)
    select learner, 'r' || g, 'rules_of_the_road', 0, true, now() - make_interval(mins => g) from generate_series(1, 3) g;
  update public.subscriptions set tier = 'premium', paid_at = now() where user_id = paid_learner;

  -- ── A school cannot make a link itself ───────────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;
  -- If either of these ever succeeds, it is recorded AND undone (the custom
  -- raise rolls the block back), so the rest of the script still runs and
  -- the verdict names this failure rather than a knock-on one.
  begin
    insert into public.school_learners (school_id, first_name, created_by, linked_user_id, link_consent_at)
      values (school_a, 'Forged', teacher, learner, now());
    raise exception using errcode = 'KL001', message = 'forged';
  exception
    when insufficient_privilege then passed := passed + 1;
    when sqlstate 'KL001' then
      failures := array_append(failures, 'a school inserted a learner already linked to someone''s account');
  end;
  begin
    update public.school_learners set linked_user_id = learner, link_consent_at = now() where id = thabo;
    raise exception using errcode = 'KL001', message = 'forged';
  exception
    when insufficient_privilege then passed := passed + 1;
    when sqlstate 'KL001' then
      failures := array_append(failures, 'a school linked a roster row to someone''s account by editing it');
  end;
  -- ...while adding a learner the ordinary way still works, every column the app sends.
  begin
    insert into public.school_learners (school_id, first_name, last_name, phone, email, id_number_last4, licence_code,
                                        stage, status, assigned_instructor_id, test_date, test_centre, notes,
                                        documents, created_by)
      values (school_a, 'Ordinary', 'Learner', '0820000000', 'o@example.invalid', '1234', '8',
              'learners', 'active', null, '2030-07-01', 'Centurion', 'n', '{id_copy}', teacher);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'an instructor could no longer add a learner: ' || sqlerrm);
  end;
  -- ...and nobody signed in can read a learner's study history across the link.
  select count(*) into n from public.question_attempts where user_id = learner;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a school member read a learner''s answers directly'); end if;
  reset role;

  -- ── Codes ────────────────────────────────────────────────────────────────
  begin
    perform public.create_learner_link_code(owner_b, thabo, 'LNKBBBB2');
    failures := array_append(failures, 'another school made a code for this school''s learner');
  exception when raise_exception then passed := passed + 1;
  end;
  perform public.create_learner_link_code(teacher, thabo, 'THABKAA2');

  select count(*) into n from public.peek_learner_link('thabkaa2') where school_name = 'Link School A' and learner_first_name = 'Thabo';
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a valid code did not say which school it connects'); end if;
  select count(*) into n from public.peek_learner_link('ZZZZZZZ2');
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'an unknown code revealed a school'); end if;

  begin
    perform public.accept_learner_link(teacher, 'THABKAA2');
    failures := array_append(failures, 'a school''s own instructor connected themselves as its learner');
  exception when raise_exception then passed := passed + 1;
  end;

  -- ── The learner agrees ───────────────────────────────────────────────────
  txt := public.accept_learner_link(learner, 'THABKAA2');
  select count(*) into n from public.school_learners
   where id = thabo and linked_user_id = learner and link_consent_at is not null;
  if txt = 'Link School A' and n = 1 then passed := passed + 1;
  else failures := array_append(failures, 'the learner could not connect with a valid code');
  end if;

  begin
    perform public.accept_learner_link(paid_learner, 'THABKAA2');
    failures := array_append(failures, 'a used code connected a second account');
  exception when raise_exception then passed := passed + 1;
  end;

  -- One account, one roster row per school.
  perform public.create_learner_link_code(owner_a, ayanda, 'AYANDAA2');
  begin
    perform public.accept_learner_link(learner, 'AYANDAA2');
    failures := array_append(failures, 'one account was connected to two roster rows at the same school');
  exception when raise_exception then passed := passed + 1;
  end;

  -- The referral programme is fed, and cannot be gamed by a paid learner.
  select count(*) into n from public.school_referrals where user_id = learner and school_id = partner and source = 'link';
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'connecting did not attribute a new learner to the partner school'); end if;
  perform public.create_learner_link_code(owner_a, lerato, 'LERATXA2');
  begin
    perform public.accept_learner_link(paid_learner, 'LERATXA2');
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'a learner who had already paid could not connect: ' || sqlerrm);
  end;
  select count(*) into n from public.school_referrals where user_id = paid_learner;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a learner who had already paid was attributed as a referral'); end if;

  -- ── What the school sees ─────────────────────────────────────────────────
  summary := public.school_learner_progress_summary(teacher, thabo);
  if summary->>'readiness' = '72' and summary->>'readiness_day' = '2030-06-02' then passed := passed + 1;
  else failures := array_append(failures, 'the school did not get the learner''s latest readiness: ' || coalesce(summary::text, 'null'));
  end if;
  if (select count(*) from jsonb_array_elements(summary->'categories')) = 2
     and exists (select 1 from jsonb_array_elements(summary->'categories') c
                  where c->>'category_id' = 'road_signs' and (c->>'strength')::int = 75 and (c->>'enough')::boolean)
     and exists (select 1 from jsonb_array_elements(summary->'categories') c
                  where c->>'category_id' = 'rules_of_the_road' and not (c->>'enough')::boolean) then
    passed := passed + 1;
  else failures := array_append(failures, 'category strengths were wrong: ' || coalesce(summary->>'categories', 'null'));
  end if;
  -- Exactly the narrow shape, nothing else.
  if (select array_agg(k order by k) from jsonb_object_keys(summary) k) = array['categories', 'readiness', 'readiness_day']
     and not exists (select 1 from jsonb_array_elements(summary->'categories') c, jsonb_object_keys(c) k
                      where k not in ('category_id', 'strength', 'enough')) then
    passed := passed + 1;
  else failures := array_append(failures, 'the summary carried more than readiness and strengths: ' || summary::text);
  end if;
  if public.school_learner_progress_summary(owner_b, thabo) is null
     and public.school_learner_progress_summary(owner_a, ayanda) is null then
    passed := passed + 1;
  else failures := array_append(failures, 'a summary was given to another school, or for a learner who never connected');
  end if;

  -- No policy on a learner table names a school: the only door is the function.
  select count(*) into n from pg_policies
   where schemaname = 'public' and tablename in ('question_attempts', 'readiness_history')
     and (coalesce(qual, '') ilike '%school%' or coalesce(with_check, '') ilike '%school%');
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'a learner table has a policy that lets a school in'); end if;

  -- ── Ending it ────────────────────────────────────────────────────────────
  begin
    perform public.unlink_school_learner(owner_b, thabo);
    failures := array_append(failures, 'a stranger disconnected someone else''s link');
  exception when raise_exception then passed := passed + 1;
  end;
  if public.unlink_school_learner(learner, thabo) then passed := passed + 1;
  else failures := array_append(failures, 'the learner could not withdraw');
  end if;
  if public.school_learner_progress_summary(teacher, thabo) is null then passed := passed + 1;
  else failures := array_append(failures, 'the school still saw progress after the learner withdrew');
  end if;

  -- The school can disconnect too.
  if public.unlink_school_learner(teacher, lerato) then passed := passed + 1;
  else failures := array_append(failures, 'the school could not disconnect a learner');
  end if;

  -- Deleting the learner's account always works, and ends the link.
  perform public.create_learner_link_code(teacher, thabo, 'THABKBB2');
  perform public.accept_learner_link(learner, 'THABKBB2');
  begin
    delete from auth.users where id = learner;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'a connected learner could not delete their account: ' || sqlerrm);
  end;
  select count(*) into n from public.school_learners where id = thabo and linked_user_id is null and link_consent_at is null;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the roster row was lost or kept a dead link'); end if;

  -- An expired code is refused.
  perform public.create_learner_link_code(owner_a, ayanda, 'AYANDAB2');
  update public.school_learner_link_codes set expires_at = now() - interval '1 minute' where short_code = 'AYANDAB2';
  begin
    perform public.accept_learner_link(paid_learner, 'AYANDAB2');
    failures := array_append(failures, 'an expired code connected an account');
  exception when raise_exception then passed := passed + 1;
  end;

  -- ── Nobody signed in reaches any of it directly ──────────────────────────
  if not has_table_privilege('authenticated', 'public.school_learner_link_codes', 'select')
     and not has_function_privilege('authenticated', 'public.accept_learner_link(uuid,text)', 'execute')
     and not has_function_privilege('authenticated', 'public.create_learner_link_code(uuid,uuid,text,int)', 'execute')
     and not has_function_privilege('authenticated', 'public.peek_learner_link(text)', 'execute')
     and not has_function_privilege('authenticated', 'public.unlink_school_learner(uuid,uuid)', 'execute')
     and not has_function_privilege('authenticated', 'public.school_learner_progress_summary(uuid,uuid)', 'execute')
     and not has_function_privilege('anon', 'public.peek_learner_link(text)', 'execute') then
    passed := passed + 1;
  else failures := array_append(failures, 'a signed-in or anonymous user can reach the link codes or functions');
  end if;

  -- ── Verdict ──────────────────────────────────────────────────────────────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'LINK PASSED: % checks (rolled back)', passed;
  else
    raise exception 'LINK FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
