-- School money check, for migration 0038.
-- ============================================================================
-- Proves against the real database that a payment can be recorded by anyone
-- in the school but never edited, deleted or born void; that only the owner
-- or the office can void one, and only once; that a package is only ever used
-- by the learner it was sold to; and that no school can see or touch another
-- school's money.
--
-- Same contract as the other scripts: ONE statement that ALWAYS raises at the
-- end, so everything it creates is rolled back, pass or fail.
--   MONEY PASSED: <n> checks (rolled back)
--   MONEY FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  m_teacher uuid; m_owner_b uuid;
  thabo uuid; ayanda uuid; learner_b uuid;
  pkg uuid; pkg_b uuid;
  cash uuid; other_lesson uuid;
  n int;
  txt text;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup ─────────────────────────────────────────────────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'money-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b, 'money-b@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher, 'money-t@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Sipho"}');
  school_a := public.create_school_for_owner(owner_a, 'Money School A');
  school_b := public.create_school_for_owner(owner_b, 'Money School B');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'money-hash-1', 'MONEYAA2');
  perform public.accept_school_invite(teacher, null, 'MONEYAA2');
  select id into m_teacher from public.school_members where user_id = teacher;
  select id into m_owner_b from public.school_members where user_id = owner_b;

  insert into public.school_learners (school_id, first_name, created_by)
    values (school_a, 'Thabo', owner_a) returning id into thabo;
  insert into public.school_learners (school_id, first_name, created_by)
    values (school_a, 'Ayanda', owner_a) returning id into ayanda;
  insert into public.school_learners (school_id, first_name, created_by)
    values (school_b, 'Bongani', owner_b) returning id into learner_b;
  insert into public.school_packages (school_id, learner_id, name, lessons_included, price_cents, sold_on, created_by)
    values (school_b, learner_b, 'B package', 5, 150000, '2030-03-01', owner_b) returning id into pkg_b;

  -- ── Sipho, an instructor at A, sells a package and takes cash ─────────────
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;

  begin
    insert into public.school_packages (school_id, learner_id, name, lessons_included, price_cents, sold_on, created_by)
      values (school_a, thabo, '10 lessons', 10, 250000, '2030-03-01', teacher) returning id into pkg;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'an instructor could not sell a package: ' || sqlerrm);
  end;

  begin
    insert into public.school_payments (school_id, learner_id, package_id, amount_cents, method, received_on, received_by)
      values (school_a, thabo, pkg, 100000, 'cash', '2030-03-01', teacher) returning id into cash;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'an instructor could not record cash: ' || sqlerrm);
  end;

  -- A payment is never edited, deleted, born void, or recorded in someone
  -- else's name.
  begin
    update public.school_payments set amount_cents = 1 where id = cash;
    failures := array_append(failures, 'a payment amount was edited');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    delete from public.school_payments where id = cash;
    failures := array_append(failures, 'a payment was deleted');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by, voided_at, voided_by, void_reason)
      values (school_a, thabo, 5000, 'cash', '2030-03-01', teacher, now(), teacher, 'born void');
    failures := array_append(failures, 'a payment was created already void');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by)
      values (school_a, thabo, 5000, 'cash', '2030-03-01', owner_a);
    failures := array_append(failures, 'a payment was recorded in someone else''s name');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by)
      values (school_a, thabo, 0, 'cash', '2030-03-01', teacher);
    failures := array_append(failures, 'a zero payment was accepted');
  exception when check_violation then passed := passed + 1;
  end;

  -- The instructor cannot void the cash they took, or correct a package.
  begin
    perform public.void_school_payment(cash, 'my mistake');
    failures := array_append(failures, 'an instructor voided a payment');
  exception when raise_exception then passed := passed + 1;
  end;
  update public.school_packages set price_cents = 1 where id = pkg;
  get diagnostics n = row_count;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'an instructor re-priced a package'); end if;

  -- A package belongs to its learner: not Ayanda's lessons, not Ayanda's payments.
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, package_id, starts_at, ends_at, created_by)
      values (school_a, ayanda, m_teacher, pkg, '2030-03-02 09:00+02', '2030-03-02 10:00+02', teacher);
    failures := array_append(failures, 'Thabo''s package paid for Ayanda''s lesson');
  exception when foreign_key_violation then passed := passed + 1;
  end;
  begin
    insert into public.school_payments (school_id, learner_id, package_id, amount_cents, method, received_on, received_by)
      values (school_a, ayanda, pkg, 5000, 'cash', '2030-03-01', teacher);
    failures := array_append(failures, 'a payment for Ayanda was put against Thabo''s package');
  exception when foreign_key_violation then passed := passed + 1;
  end;

  -- A lesson is paid one way: package OR price.
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, package_id, price_cents, starts_at, ends_at, created_by)
      values (school_a, thabo, m_teacher, pkg, 30000, '2030-03-03 09:00+02', '2030-03-03 10:00+02', teacher);
    failures := array_append(failures, 'a lesson was charged twice (package and price)');
  exception when check_violation then passed := passed + 1;
  end;
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, package_id, starts_at, ends_at, created_by)
      values (school_a, thabo, m_teacher, pkg, '2030-03-03 09:00+02', '2030-03-03 10:00+02', teacher)
      returning id into other_lesson;
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'a package lesson could not be booked: ' || sqlerrm);
  end;

  -- Another school's package cannot be named at all.
  begin
    insert into public.school_lessons (school_id, learner_id, instructor_id, package_id, starts_at, ends_at, created_by)
      values (school_a, thabo, m_teacher, pkg_b, '2030-03-04 09:00+02', '2030-03-04 10:00+02', teacher);
    failures := array_append(failures, 'school B''s package paid for a school A lesson');
  exception when foreign_key_violation then passed := passed + 1;
  end;

  reset role;

  -- ── The owner voids it, once, with a reason ───────────────────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    perform public.void_school_payment(cash, '   ');
    failures := array_append(failures, 'a payment was voided without a reason');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.void_school_payment(cash, 'Counted twice');
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'the owner could not void a payment: ' || sqlerrm);
  end;
  select void_reason into txt from public.school_payments where id = cash;
  if txt = 'Counted twice' then passed := passed + 1; else failures := array_append(failures, 'the void reason was not kept'); end if;
  select count(*) into n from public.school_payments where id = cash;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'voiding removed the row instead of keeping it'); end if;
  begin
    perform public.void_school_payment(cash, 'again');
    failures := array_append(failures, 'a payment was voided twice');
  exception when raise_exception then passed := passed + 1;
  end;
  update public.school_packages set status = 'refunded' where id = pkg;
  get diagnostics n = row_count;
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the owner could not correct a package'); end if;
  reset role;

  -- ── Another school sees none of it and can do none of it ──────────────────
  perform set_config('request.jwt.claims', json_build_object('sub', owner_b, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.school_payments where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s payments'); end if;
  select count(*) into n from public.school_packages where school_id = school_a;
  if n = 0 then passed := passed + 1; else failures := array_append(failures, 'B can see A''s packages'); end if;
  begin
    insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by)
      values (school_a, thabo, 5000, 'cash', '2030-03-01', owner_b);
    failures := array_append(failures, 'B recorded a payment in school A');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by)
      values (school_b, thabo, 5000, 'cash', '2030-03-01', owner_b);
    failures := array_append(failures, 'B recorded a payment against A''s learner');
  exception when foreign_key_violation then passed := passed + 1;
  end;
  begin
    perform public.void_school_payment(cash, 'hijack');
    failures := array_append(failures, 'B voided A''s payment');
  exception when raise_exception then
    if sqlerrm = 'That payment could not be found' then passed := passed + 1;
    else failures := array_append(failures, 'B''s refusal revealed the payment exists: ' || sqlerrm); end if;
  end;
  reset role;

  -- ── A lapsed school keeps its books and stops writing to them ─────────────
  update public.school_subscriptions set trial_ends_at = now() - interval '1 day' where school_id = school_a;
  perform set_config('request.jwt.claims', json_build_object('sub', teacher, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.school_payments where school_id = school_a;
  if n > 0 then passed := passed + 1; else failures := array_append(failures, 'a lapsed school lost sight of its payments'); end if;
  begin
    insert into public.school_payments (school_id, learner_id, amount_cents, method, received_on, received_by)
      values (school_a, thabo, 5000, 'cash', '2030-03-05', teacher);
    failures := array_append(failures, 'a lapsed school could still record payments');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  reset role;

  -- ── Nobody signed in ──────────────────────────────────────────────────────
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    select count(*) into n from public.school_payments;
    failures := array_append(failures, 'an anonymous visitor can read payments');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  begin
    perform public.void_school_payment(cash, 'anon');
    failures := array_append(failures, 'an anonymous visitor can call void');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  reset role;

  -- ── Verdict. Always an exception, so everything above is rolled back. ─────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'MONEY PASSED: % checks (rolled back)', passed;
  else
    raise exception 'MONEY FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
