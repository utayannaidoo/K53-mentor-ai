-- K53 Mentor for Schools — referral commission taken as account credit.
-- ============================================================================
-- A driving school in the partner programme earns R20 for each learner it
-- refers who pays (0033). Until now that money could only leave by EFT. A
-- school that also pays for the software can instead take it as CREDIT
-- against its own bill: schools.commission_mode = 'credit' (column in 0035).
--
-- How money moves, and why each step is shaped the way it is:
--
--   EARN     apply_commission_credit settles the school's payable commissions
--            by calling mark_partner_payout_paid — the EFT path, unchanged —
--            with a CREDIT:<subscription>:<date> reference. So clawbacks net
--            off exactly as they would for an EFT, the partner row lock
--            serialises it against every other payout, earning and reversal,
--            and the school's statement and the payout CSV see it settled
--            like any other payout. Whatever that payout's net comes to is
--            added to school_subscriptions.credit_cents.
--
--   REDEEM   Paystack cannot vary a Plan's amount, so credit cannot discount a
--            month. It pays for one instead: an admin refunds the school's
--            latest charge and redeem_school_credit debits the credit for it.
--            The debit is recorded FIRST, so that the refund.processed webhook
--            that follows can tell a month paid for with credit from a refund
--            that ends the plan (see routeSchoolEvent). If the refund itself
--            fails, reverse_school_credit_redemption puts the credit back.
--
--   NEVER    There is no path from credit to cash. A balance a school could
--            withdraw would be a refund obligation we carry forever. Credit
--            only ever pays for this school's own plan.
--
-- school_credit_ledger is the audit trail: credit_cents must always equal the
-- sum of the school's ledger rows, and the ledger is append-only — a mistake
-- is corrected by a reversing row, never an edit.

create table public.school_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools on delete cascade,
  kind text not null check (kind in ('earned', 'redeemed', 'reversed')),
  -- Signed: credit in is positive, credit spent is negative.
  amount_cents int not null,
  -- earned: the partner payout that settled the commissions it came from.
  partner_payout_id uuid references public.partner_payouts,
  -- redeemed (and its reversal): the school's own charge the credit paid for.
  charge_reference text check (length(charge_reference) <= 120),
  reverses uuid references public.school_credit_ledger,
  note text check (length(note) <= 300),
  created_at timestamptz not null default now(),
  check (
    (kind = 'earned' and amount_cents > 0 and partner_payout_id is not null)
    or (kind = 'redeemed' and amount_cents < 0 and charge_reference is not null)
    or (kind = 'reversed' and amount_cents > 0 and reverses is not null)
  )
);
create index school_credit_ledger_school on public.school_credit_ledger (school_id, created_at desc);
create index school_credit_ledger_charge on public.school_credit_ledger (charge_reference) where charge_reference is not null;
-- A redemption is reversed at most once.
create unique index school_credit_ledger_one_reversal on public.school_credit_ledger (reverses) where kind = 'reversed';

-- Append-only, for the service role too. (Deletes are left to the school's own
-- cascade: closing a school takes its ledger with it.)
create function public.school_credit_ledger_immutable() returns trigger
language plpgsql set search_path = public as $$
begin
  raise exception 'The credit ledger is append-only; record a reversal instead';
end $$;
create trigger school_credit_ledger_immutable before update on public.school_credit_ledger
  for each row execute function public.school_credit_ledger_immutable();

-- ── Earn ────────────────────────────────────────────────────────────────────
-- Returns the cents credited (0 when nothing was payable, the school is not in
-- credit mode, or it is not linked to a partner code). Safe to run on a
-- schedule: a second run finds nothing payable.
create function public.apply_commission_credit(p_school uuid) returns int
language plpgsql security definer set search_path = public as $$
declare
  partner uuid; mode text; sub_id uuid; payout uuid; credited int;
begin
  select partner_school_id, commission_mode into partner, mode from public.schools where id = p_school;
  if partner is null or mode is distinct from 'credit' then return 0; end if;

  -- Lock order: this school's subscription row, then (inside the payout) the
  -- partner row. Nothing takes them the other way round.
  select id into sub_id from public.school_subscriptions where school_id = p_school for update;
  if sub_id is null then return 0; end if;

  payout := public.mark_partner_payout_paid(
    partner,
    'CREDIT:' || sub_id::text || ':' || to_char(now() at time zone 'Africa/Johannesburg', 'YYYY-MM-DD'),
    'Taken as K53 Mentor for Schools account credit',
    0,     -- no payout minimum: credit has no bank fee to amortise
    true
  );
  if payout is null then return 0; end if;

  select total_cents into credited from public.partner_payouts where id = payout;
  if coalesce(credited, 0) > 0 then
    update public.school_subscriptions set credit_cents = credit_cents + credited where id = sub_id;
    insert into public.school_credit_ledger (school_id, kind, amount_cents, partner_payout_id, note)
      values (p_school, 'earned', credited, payout, 'Referral commission');
  end if;
  return coalesce(credited, 0);
end $$;

-- ── Redeem ──────────────────────────────────────────────────────────────────
-- Debits credit for the school's LATEST charge — the month being paid for.
-- Returns the ledger row, which the caller passes to the reversal if the
-- Paystack refund then fails.
create function public.redeem_school_credit(
  p_school uuid, p_charge_reference text, p_amount_cents int, p_note text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare sub record; entry uuid; ref text := btrim(coalesce(p_charge_reference, ''));
begin
  if p_amount_cents is null or p_amount_cents <= 0 then raise exception 'Redeem a positive amount'; end if;
  if ref = '' then raise exception 'Name the charge the credit pays for'; end if;

  select * into sub from public.school_subscriptions where school_id = p_school for update;
  if not found then raise exception 'That school has no subscription'; end if;
  if sub.last_charge_reference is distinct from ref then
    raise exception 'Credit only pays for the school''s latest charge';
  end if;
  if sub.credit_cents < p_amount_cents then raise exception 'Not enough credit'; end if;
  if exists (
    select 1 from public.school_credit_ledger r
     where r.kind = 'redeemed' and r.charge_reference = ref
       and not exists (select 1 from public.school_credit_ledger v where v.kind = 'reversed' and v.reverses = r.id)
  ) then
    raise exception 'That charge has already been paid for with credit';
  end if;

  update public.school_subscriptions set credit_cents = credit_cents - p_amount_cents where id = sub.id;
  insert into public.school_credit_ledger (school_id, kind, amount_cents, charge_reference, note)
    values (p_school, 'redeemed', -p_amount_cents, ref, left(p_note, 300))
    returning id into entry;
  return entry;
end $$;

-- Puts a redemption's credit back when its refund did not happen.
create function public.reverse_school_credit_redemption(p_entry uuid, p_reason text) returns boolean
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from public.school_credit_ledger where id = p_entry and kind = 'redeemed';
  if not found then return false; end if;
  perform 1 from public.school_subscriptions where school_id = r.school_id for update;
  if exists (select 1 from public.school_credit_ledger where kind = 'reversed' and reverses = p_entry) then
    return false;
  end if;
  update public.school_subscriptions set credit_cents = credit_cents - r.amount_cents where school_id = r.school_id;
  insert into public.school_credit_ledger (school_id, kind, amount_cents, reverses, charge_reference, note)
    values (r.school_id, 'reversed', -r.amount_cents, p_entry, r.charge_reference, left(p_reason, 300));
  return true;
end $$;

-- ── The owner's choice ──────────────────────────────────────────────────────
-- EFT or credit, for commission not yet settled. Credit already earned stays
-- credit either way (there is no path back to cash).
create function public.set_school_commission_mode(p_user uuid, p_school uuid, p_mode text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_mode not in ('eft', 'credit') then raise exception 'Choose bank transfer or credit'; end if;
  if (select role from public.school_members
       where school_id = p_school and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can change how commission is paid';
  end if;
  if (select partner_school_id from public.schools where id = p_school) is null then
    raise exception 'Link your partner code first';
  end if;
  update public.schools set commission_mode = p_mode where id = p_school;
  return true;
end $$;

-- ── Grants ──────────────────────────────────────────────────────────────────
-- Service role only, table and functions alike: the school reads its balance
-- from school_subscriptions.credit_cents (members can already select it) and
-- its ledger through the server, after a membership check.
alter table public.school_credit_ledger enable row level security;
revoke all on public.school_credit_ledger from public, anon, authenticated;
grant all on public.school_credit_ledger to service_role;

do $$ declare f record; begin
  for f in select oid::regprocedure as signature from pg_proc where pronamespace = 'public'::regnamespace
    and proname in ('apply_commission_credit', 'redeem_school_credit', 'reverse_school_credit_redemption',
                    'set_school_commission_mode', 'school_credit_ledger_immutable') loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.signature);
    execute format('grant execute on function %s to service_role', f.signature);
  end loop;
end $$;
