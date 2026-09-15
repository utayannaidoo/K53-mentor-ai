-- 0034: a payout fully offset by clawbacks must settle, not deadlock.
-- ============================================================================
-- `mark_partner_payout_paid` in 0033 nets outstanding clawbacks off the payable
-- total and then refuses the whole payout when nothing is left to send:
--
--     total := total - deductions;
--     if n = 0 or total <= 0 then return null; end if;
--
-- That is the common case for a small school, not an exotic one. One
-- conversion is paid in March and refunded in April; a second converts in May.
-- Payable R20, outstanding clawback R20, net R0 — and the owner clicks "Mark as
-- paid", receives a silent null, and nothing moves. The commissions stay
-- `payable`, the clawback stays unsettled, and the pair re-offset each other on
-- every future run: the school's ledger is stuck until enough new conversions
-- arrive to clear the debt in a single payout, and nothing on screen says why.
--
-- The accounting answer is that an offset IS a settlement. No money leaves the
-- bank, but the payable commissions have done their job — they have cancelled a
-- debt — so they are `paid`, the clawback they cancelled is settled, and a
-- zero-rand payout row records that it happened. `total_cents` is therefore
-- relaxed to allow 0; it stays non-negative, because a payout row never means
-- "this school owes us".
--
-- Clawbacks are settled oldest-first and only as far as the payable amount
-- reaches, so a R20 payable against R60 of clawbacks settles exactly one and
-- leaves the other two outstanding, rather than writing off all three.
--
-- Everything else about the function is unchanged, including the school-row
-- lock that serialises this against earning, review and reversal.

alter table public.partner_payouts drop constraint if exists partner_payouts_total_cents_check;
alter table public.partner_payouts add constraint partner_payouts_total_cents_check check (total_cents >= 0);

create or replace function public.mark_partner_payout_paid(
  p_school uuid, p_reference text, p_note text,
  p_minimum_cents int default 10000, p_override boolean default false
) returns uuid language plpgsql security definer set search_path = public as $$
declare result uuid; payable int; settled int; n int; first_at timestamptz; last_at timestamptz;
begin
  -- One school lock serialises payout, earning, review and reversal. A second
  -- click sees no payable rows, even while the first transaction is in flight.
  perform 1 from public.partner_schools where id=p_school for update;
  if not found then return null; end if;
  if nullif(trim(p_reference),'') is null then raise exception 'EFT reference required'; end if;

  select count(*),coalesce(sum(amount_cents),0),min(earned_at),max(earned_at)
    into n,payable,first_at,last_at
    from public.partner_commissions where school_id=p_school and status='payable';
  if n=0 then return null; end if;

  -- The minimum applies to what would actually be transferred, and an offset
  -- transfers nothing — so it is checked against the net, but only when there
  -- is a net to send. A pure offset is always allowed through: refusing it is
  -- what caused the deadlock this migration exists to fix.
  if not p_override
     and payable - (select coalesce(sum(amount_cents),0) from public.partner_commissions
                     where school_id=p_school and status='paid'
                       and void_reason is not null and clawback_settled_payout_id is null) > 0
     and payable - (select coalesce(sum(amount_cents),0) from public.partner_commissions
                     where school_id=p_school and status='paid'
                       and void_reason is not null and clawback_settled_payout_id is null)
         < greatest(0,p_minimum_cents)
  then raise exception 'Below payout minimum'; end if;

  insert into public.partner_payouts(school_id,commission_count,total_cents,period_start,period_end,status,paid_at,payment_reference,note)
    values(p_school,n,0,first_at,last_at,'paid',now(),p_reference,p_note) returning id into result;

  -- Settle clawbacks oldest-first, taking only those this payout's payable
  -- amount fully covers. A partially covered clawback stays outstanding rather
  -- than being silently written off.
  with ranked as (
    select id, sum(amount_cents) over (order by earned_at, id) as running
      from public.partner_commissions
     where school_id=p_school and status='paid'
       and void_reason is not null and clawback_settled_payout_id is null
  )
  update public.partner_commissions c set clawback_settled_payout_id=result
    from ranked where ranked.id=c.id and ranked.running<=payable;

  select coalesce(sum(amount_cents),0) into settled from public.partner_commissions
   where school_id=p_school and clawback_settled_payout_id=result;

  update public.partner_payouts set total_cents=payable-settled where id=result;
  update public.partner_commissions set status='paid',payout_id=result
   where school_id=p_school and status='payable';
  return result;
end; $$;

revoke execute on function public.mark_partner_payout_paid(uuid,text,text,int,boolean) from public, anon, authenticated;
grant execute on function public.mark_partner_payout_paid(uuid,text,text,int,boolean) to service_role;
