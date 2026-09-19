-- Commission credit check, for migration 0042.
-- ============================================================================
-- Proves that a school in credit mode has its payable referral commission
-- settled into account credit exactly once, with clawbacks netted off as an
-- EFT payout would; that credit only ever pays for the school's own latest
-- charge, once, and comes back if that refund fails; that the ledger always
-- adds up to the balance and cannot be edited; that a school on EFT is left
-- alone; and that nobody signed in can reach any of it directly.
--
-- Same contract as the other scripts: ONE statement that ALWAYS raises at the
-- end, so everything it creates is rolled back, pass or fail.
--   CREDIT PASSED: <n> checks (rolled back)
--   CREDIT FAILED: <which> (<n> passed, rolled back)

do $test$
declare
  owner_a uuid := gen_random_uuid();
  owner_b uuid := gen_random_uuid();
  teacher uuid := gen_random_uuid();
  school_a uuid; school_b uuid;
  partner_a uuid := gen_random_uuid();
  partner_b uuid := gen_random_uuid();
  credited int;
  entry uuid;
  n int;
  balance int;
  ledger_sum int;
  passed int := 0;
  failures text[] := '{}';
begin
  -- ── Setup: school A in credit mode, school B on EFT ──────────────────────
  insert into auth.users (id, email, aud, role, raw_user_meta_data) values
    (owner_a, 'credit-a@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner A"}'),
    (owner_b, 'credit-b@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Owner B"}'),
    (teacher, 'credit-t@example.invalid', 'authenticated', 'authenticated', '{"full_name":"Sipho"}');
  school_a := public.create_school_for_owner(owner_a, 'Credit School A');
  school_b := public.create_school_for_owner(owner_b, 'Credit School B');
  perform public.create_school_invite(owner_a, school_a, 'instructor', null, 'credit-hash-1', 'CREDTAB2');
  perform public.accept_school_invite(teacher, null, 'CREDTAB2');

  insert into public.partner_schools (id, name, contact_name, contact_email, status) values
    (partner_a, 'Credit Partner A', 'Owner A', 'credit-a@example.invalid', 'active'),
    (partner_b, 'Credit Partner B', 'Owner B', 'credit-b@example.invalid', 'active');
  insert into public.partner_school_codes (school_id, code) values
    (partner_a, 'credit-aaa'), (partner_b, 'credit-bbb');
  perform public.link_partner_school(owner_a, school_a, 'credit-aaa');
  perform public.link_partner_school(owner_b, school_b, 'credit-bbb');

  -- Two R20 conversions ready to pay at each partner.
  insert into public.partner_commissions (school_id, user_id, amount_cents, charge_reference, status, eligible_at) values
    (partner_a, gen_random_uuid(), 2000, 'credit-ref-a1', 'payable', now()),
    (partner_a, gen_random_uuid(), 2000, 'credit-ref-a2', 'payable', now()),
    (partner_b, gen_random_uuid(), 2000, 'credit-ref-b1', 'payable', now());

  -- ── Only the owner chooses, and only once linked ─────────────────────────
  begin
    perform public.set_school_commission_mode(teacher, school_a, 'credit');
    failures := array_append(failures, 'an instructor chose how commission is paid');
  exception when raise_exception then passed := passed + 1;
  end;
  perform public.set_school_commission_mode(owner_a, school_a, 'credit');
  select count(*) into n from public.schools where id = school_a and commission_mode = 'credit';
  if n = 1 then passed := passed + 1; else failures := array_append(failures, 'the owner could not switch to credit'); end if;

  -- ── Earn ─────────────────────────────────────────────────────────────────
  credited := public.apply_commission_credit(school_a);
  select credit_cents into balance from public.school_subscriptions where school_id = school_a;
  if credited = 4000 and balance = 4000 then passed := passed + 1;
  else failures := array_append(failures, format('payable commission was not credited once (credited %s, balance %s)', credited, balance));
  end if;

  select count(*) into n from public.partner_commissions pc
    join public.partner_payouts p on p.id = pc.payout_id
   where pc.school_id = partner_a and pc.status = 'paid' and p.payment_reference like 'CREDIT:%' and p.total_cents = 4000;
  if n = 2 then passed := passed + 1;
  else failures := array_append(failures, 'the credited commissions were not settled as a CREDIT payout');
  end if;

  credited := public.apply_commission_credit(school_a);
  select credit_cents into balance from public.school_subscriptions where school_id = school_a;
  if credited = 0 and balance = 4000 then passed := passed + 1;
  else failures := array_append(failures, 'a second run credited the same commission again');
  end if;

  -- A school on EFT is untouched: its commission waits for a bank transfer.
  credited := public.apply_commission_credit(school_b);
  select count(*) into n from public.partner_commissions where school_id = partner_b and status = 'payable';
  if credited = 0 and n = 1 then passed := passed + 1;
  else failures := array_append(failures, 'a school on EFT had its commission turned into credit');
  end if;

  -- A clawback nets off first, exactly as it would against an EFT: a refunded
  -- conversion (paid, then voided) cancels the next R20 rather than being lost.
  update public.partner_commissions set void_reason = 'Refunded' where charge_reference = 'credit-ref-a1';
  insert into public.partner_commissions (school_id, user_id, amount_cents, charge_reference, status, eligible_at)
    values (partner_a, gen_random_uuid(), 2000, 'credit-ref-a3', 'payable', now());
  credited := public.apply_commission_credit(school_a);
  select credit_cents into balance from public.school_subscriptions where school_id = school_a;
  select count(*) into n from public.partner_commissions
   where charge_reference = 'credit-ref-a1' and clawback_settled_payout_id is not null;
  if credited = 0 and balance = 4000 and n = 1 then passed := passed + 1;
  else failures := array_append(failures, format('a clawback was not netted off the credit (credited %s, balance %s)', credited, balance));
  end if;

  -- ── Redeem ───────────────────────────────────────────────────────────────
  update public.school_subscriptions
     set status = 'active', plan = 'solo', last_charge_reference = 'school-charge-1'
   where school_id = school_a;

  begin
    perform public.redeem_school_credit(school_a, 'some-other-charge', 1990);
    failures := array_append(failures, 'credit paid for a charge that is not the school''s latest');
  exception when raise_exception then passed := passed + 1;
  end;
  begin
    perform public.redeem_school_credit(school_a, 'school-charge-1', 99999);
    failures := array_append(failures, 'credit was spent past its balance');
  exception when raise_exception then passed := passed + 1;
  end;

  entry := public.redeem_school_credit(school_a, 'school-charge-1', 1990, 'Free month');
  select credit_cents into balance from public.school_subscriptions where school_id = school_a;
  if entry is not null and balance = 2010 then passed := passed + 1;
  else failures := array_append(failures, 'a redemption did not debit the credit');
  end if;

  begin
    perform public.redeem_school_credit(school_a, 'school-charge-1', 1990);
    failures := array_append(failures, 'the same charge was paid for with credit twice');
  exception when raise_exception then passed := passed + 1;
  end;

  -- The refund failed: the credit comes back, once.
  if public.reverse_school_credit_redemption(entry, 'Paystack refused the refund')
     and not public.reverse_school_credit_redemption(entry, 'again') then
    passed := passed + 1;
  else failures := array_append(failures, 'a failed redemption was not reversed exactly once');
  end if;
  select credit_cents into balance from public.school_subscriptions where school_id = school_a;
  if balance = 4000 then passed := passed + 1; else failures := array_append(failures, 'a reversal did not restore the credit'); end if;

  -- ...and the month can then be paid for properly.
  begin
    perform public.redeem_school_credit(school_a, 'school-charge-1', 1990);
    passed := passed + 1;
  exception when others then
    failures := array_append(failures, 'a reversed redemption could not be retried: ' || sqlerrm);
  end;

  -- ── The ledger explains the balance, and cannot be rewritten ─────────────
  select credit_cents into balance from public.school_subscriptions where school_id = school_a;
  select coalesce(sum(amount_cents), 0) into ledger_sum from public.school_credit_ledger where school_id = school_a;
  if balance = ledger_sum then passed := passed + 1;
  else failures := array_append(failures, format('the ledger (%s) does not add up to the balance (%s)', ledger_sum, balance));
  end if;
  begin
    update public.school_credit_ledger set amount_cents = 99999 where school_id = school_a;
    failures := array_append(failures, 'a ledger row was edited');
  exception when raise_exception then passed := passed + 1;
  end;

  -- ── Nobody signed in reaches any of it ───────────────────────────────────
  if not has_table_privilege('authenticated', 'public.school_credit_ledger', 'select')
     and not has_function_privilege('authenticated', 'public.apply_commission_credit(uuid)', 'execute')
     and not has_function_privilege('authenticated', 'public.redeem_school_credit(uuid,text,int,text)', 'execute')
     and not has_function_privilege('authenticated', 'public.reverse_school_credit_redemption(uuid,text)', 'execute')
     and not has_function_privilege('authenticated', 'public.set_school_commission_mode(uuid,uuid,text)', 'execute')
     and not has_function_privilege('anon', 'public.apply_commission_credit(uuid)', 'execute') then
    passed := passed + 1;
  else failures := array_append(failures, 'a signed-in or anonymous user can reach the credit ledger or its functions');
  end if;

  -- Credit cannot be granted by editing the subscription row from a browser.
  perform set_config('request.jwt.claims', json_build_object('sub', owner_a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    update public.school_subscriptions set credit_cents = 1000000 where school_id = school_a;
    failures := array_append(failures, 'an owner granted themselves credit');
  exception when insufficient_privilege then passed := passed + 1;
  end;
  reset role;

  -- ── Verdict ──────────────────────────────────────────────────────────────
  if coalesce(array_length(failures, 1), 0) = 0 then
    raise exception 'CREDIT PASSED: % checks (rolled back)', passed;
  else
    raise exception 'CREDIT FAILED: % (% passed, rolled back)', array_to_string(failures, '; '), passed;
  end if;
end
$test$;
