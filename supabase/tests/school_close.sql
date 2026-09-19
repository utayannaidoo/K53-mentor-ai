-- Close-school check, for migration 0044.
-- ============================================================================
-- Proves that only the owner can close a school, only by typing its name, and
-- never while a paid plan is still renewing; that closing leaves nothing of the
-- school in ANY table that carries a school_id — found structurally, so a
-- table added later that fails to cascade fails this check too; that other
-- schools, the people's own K53 accounts and their study history, and the
-- partner-programme record are untouched; that a closure is logged; and that
-- the former owner can then delete their account.
--
-- Same contract as the other scripts: ONE statement that ALWAYS raises at the
-- end, so everything it creates is rolled back, pass or fail.
--   CLOSE PASSED: <n> checks (rolled back)
--   CLOSE FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  learner uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  partner uuid := gen_random_uuid();
  m_teacher uuid; thabo uuid; lesson uuid; pkg uuid; car uuid;
  t text;
  leftovers text := '';
  n int;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup: a school with a bit of everything ─────────────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'close-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b, 'close-b@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher, 'close-t@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Sipho"}'),
    (learner, 'close-l@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Thabo"}');
  school_a := public.create_school_for_owner(owner_a, 'Closing School');
  school_b := public.create_school_for_owner(owner_b, 'Staying School');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'close-hash-1', 'CLSEAAB2');
  perform public.accept_school_invite(teacher, null, 'CLSEAAB2');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'close-hash-2', 'CLSEAAC2');
  select id into m_teacher from public.school_members where user_id = teacher;

  insert into public.partner_schools (id, name, contact_name, contact_email, status)
    values (partner, 'Closing Partner', 'Owner A', 'close-a@example.invalid', 'active');
  insert into public.partner_school_codes (school_id, code) values (partner, 'close-partner');
  perform public.link_partner_school(owner_a, school_a, 'close-partner');

  insert into public.school_learners (school_id, first_name, created_by) values (school_a, 'Thabo', owner_a) returning id into thabo;
  insert into public.school_learners (school_id, first_name, created_by) values (school_b, 'Bongani', owner_b);
  insert into public.school_vehicles (school_id, registration, vehicle_group, transmission)
    values (school_a, 'CL 12 AB GP', 'car', 'manual') returning id into car;
  insert into public.school_lessons (school_id, learner_id, instructor_id, vehicle_id, starts_at, ends_at, created_by)
    values (school_a, thabo, m_teacher, car, '2030-08-04 10:00+02', '2030-08-04 11:00+02', owner_a) returning id into lesson;
  insert into public.school_lesson_notes (lesson_id, school_id, summary, created_by) values (lesson, school_a, 'Good', teacher);
  insert into public.school_lesson_modules (lesson_id, school_id, module_id, rating, assessed_by) values (lesson, school_a, 'alley_docking', 2, teacher);
  insert into public.school_packages (school_id, learner_id, name, lessons_included, price_cents, sold_on, created_by)
    values (school_a, thabo, '10 lessons', 10, 250000, '2030-08-01', owner_a) returning id into pkg;
  insert into public.school_payments (school_id, learner_id, package_id, amount_cents, method, received_on, received_by)
    values (school_a, thabo, pkg, 100000, 'cash', '2030-08-01', owner_a);
  insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by, voided_at, voided_by, void_reason)
    values (school_a, thabo, 5000, 'cash', '2030-08-01', owner_a, now(), owner_a, 'typo');
  insert into public.school_enquiries (school_id, name, created_by) values (school_a, 'Lerato', owner_a);
  insert into public.school_test_results (school_id, learner_id, test_type, taken_on, result, recorded_by)
    values (school_a, thabo, 'learners', '2030-08-10', 'passed', owner_a);

  -- Thabo has connected his own app, and has studied in it.
  perform public.create_learner_link_code(owner_a, thabo, 'CLSETHB2');
  perform public.accept_learner_link(learner, 'CLSETHB2');
  insert into public.question_attempts (user_id, question_id, category_id, selected_index, is_correct)
    values (learner, 'q1', 'signs', 0, true);

  -- And the school is on a paid plan that is still renewing.
  update public.school_subscriptions
     set status = 'active', plan = 'team', provider_customer_id = 'CUS_close', provider_subscription_id = 'SUB_close',
         current_period_end = now() + interval '20 days'
   where school_id = school_a;

  -- ── The guards ───────────────────────────────────────────────────────────
  begin
    perform public.close_school(teacher, school_a, 'Closing School');
    failures := array_append(failures, 'an instructor closed the school');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.close_school(owner_a, school_a, 'Closing Schoo');
    failures := array_append(failures, 'the school closed without its name typed exactly');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.close_school(owner_a, school_a, 'Closing School');
    failures := array_append(failures, 'the school closed while its plan was still renewing');
  exception when raise_exception then passed := passed + 1;
  end;
  select count(*) into n from public.schools where id = school_a;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'a refused close still deleted something'); end if;

  -- ── Billing stopped: the owner closes it ─────────────────────────────────
  update public.school_subscriptions set cancel_at_period_end = true where school_id = school_a;
  if public.close_school(owner_a, school_a, '  closing school ') then passed := passed + 1;
  else failures := array_append(failures, 'the owner could not close their school');
  end if;

  -- Nothing of the school is left in any table that carries a school_id.
  for t in
    select c.table_name from information_schema.columns c
      join information_schema.tables tb on tb.table_schema = c.table_schema and tb.table_name = c.table_name
     where c.table_schema = 'public' and c.column_name = 'school_id' and tb.table_type = 'BASE TABLE'
       and c.table_name not in ('school_closures', 'partner_school_codes', 'partner_commissions',
                                'partner_payouts', 'school_referrals')
  loop
    execute format('select count(*) from public.%I where school_id = $1', t) into n using school_a;
    if n > 0 then leftovers := leftovers || t || '(' || n || ') '; end if;
  end loop;
  select count(*) into n from public.schools where id = school_a;
  if n > 0 then leftovers := leftovers || 'schools '; end if;
  if leftovers = '' then passed := passed + 1;
  else failures := array_append(failures, 'the closed school left rows behind: ' || leftovers);
  end if;

  -- Everything that was not the school's is still there.
  select count(*) into n from public.school_learners where school_id = school_b;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'closing one school touched another'); end if;
  select count(*) into n from auth.users where id in (owner_a, teacher, learner);
  if n = 3 then passed := passed + 1; else failures := array_append(failures, 'closing a school deleted someone''s own account'); end if;
  select count(*) into n from public.question_attempts where user_id = learner;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'closing a school deleted a learner''s own study history'); end if;
  select count(*) into n from public.partner_schools where id = partner;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'closing the workspace deleted the partner-programme record'); end if;

  -- One line says what happened.
  select count(*) into n from public.school_closures
   where school_id = school_a and school_name = 'Closing School' and closed_by = owner_a
     and plan = 'team' and partner_school_id = partner;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the closure was not logged'); end if;

  -- The former owner can now leave K53 Mentor altogether.
  begin
    delete from auth.users where id = owner_a;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'the former owner still could not delete their account: ' || sqlerrm);
  end;

  -- Nobody signed in reaches the function or the log.
  if not has_function_privilege('authenticated', 'public.close_school(uuid,uuid,text)', 'execute')
     and not has_function_privilege('anon', 'public.close_school(uuid,uuid,text)', 'execute')
     and not has_table_privilege('authenticated', 'public.school_closures', 'select') then
    passed := passed + 1;
  else failures := array_append(failures, 'a signed-in user can reach close_school or the closures log');
  end if;

  -- ── Verdict ──────────────────────────────────────────────────────────────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'CLOSE PASSED: % checks (rolled back)', passed;
  else
    raise exception 'CLOSE FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
