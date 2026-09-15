-- School referrals are a separate contract from friend referrals. No browser
-- role may read bank details or manufacture attribution, rewards or money.
create table public.partner_schools (
  id uuid primary key default gen_random_uuid(), name text not null,
  contact_name text not null, contact_email text not null, contact_phone text,
  town text, province text, commission_cents int not null default 2000 check (commission_cents > 0),
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  bank_account_name text, bank_name text, bank_account_number text, bank_branch_code text,
  notes text, created_at timestamptz not null default now(), activated_at timestamptz,
  review_threshold int not null default 25 check (review_threshold > 0),
  monthly_commission_cap int not null default 100 check (monthly_commission_cap > 0),
  statement_month text
);
create table public.partner_school_codes (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.partner_schools,
  code text not null unique check (code ~ '^[a-z0-9-]{6,16}$'), label text,
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(), revoked_at timestamptz, revoked_reason text
);
create table public.school_referrals (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.partner_schools,
  user_id uuid not null references auth.users on delete cascade unique, code_used text not null,
  source text not null default 'manual' check (source in ('link','manual','admin')),
  attributed_at timestamptz not null default now(),
  -- A keyed digest, never a raw IP. Shared classroom Wi-Fi is a review signal,
  -- not evidence of fraud and never a reason to deny a learner their reward.
  ip_hash text
);
create index school_referrals_school_time on public.school_referrals(school_id, attributed_at);
create table public.partner_payouts (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.partner_schools,
  commission_count int not null, total_cents int not null check (total_cents > 0),
  period_start timestamptz, period_end timestamptz,
  status text not null default 'draft' check (status in ('draft','paid')),
  paid_at timestamptz, payment_reference text, note text, created_at timestamptz not null default now()
);
create table public.partner_commissions (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.partner_schools,
  -- Deliberately retained after account deletion: financial history must not
  -- disappear or release the once-ever guard when a profile is deleted.
  user_id uuid not null unique, amount_cents int not null check (amount_cents > 0),
  charge_reference text not null unique, plan text, cycle text,
  status text not null default 'pending' check (status in ('pending','payable','paid','void')),
  earned_at timestamptz not null default now(), eligible_at timestamptz not null,
  void_reason text, hold_reason text, payout_id uuid references public.partner_payouts,
  clawback_settled_payout_id uuid references public.partner_payouts,
  created_at timestamptz not null default now()
);
create index partner_commissions_school_status on public.partner_commissions(school_id,status);
alter table public.profiles add column trial_bonus_days int not null default 0 check (trial_bonus_days in (0,7));
-- 0020's explicit grants intentionally exclude trial_bonus_days.

-- paid_at is a moving refund anchor, not a first-payment marker. Keep an
-- immutable receipt so a failed best-effort earning call cannot pay a renewal.
create table public.partner_first_payments (
  user_id uuid primary key, charge_reference text, paid_at timestamptz not null default now()
);
insert into public.partner_first_payments(user_id,charge_reference,paid_at)
select user_id,last_charge_reference,coalesce(paid_at,now()) from public.subscriptions
where tier <> 'free' or paid_at is not null;
create function public.remember_partner_first_payment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.tier <> 'free' or new.paid_at is not null then
    insert into public.partner_first_payments(user_id,charge_reference,paid_at)
    values(new.user_id,new.last_charge_reference,coalesce(new.paid_at,now())) on conflict do nothing;
  end if;
  return new;
end; $$;
create trigger partner_first_payment after insert or update on public.subscriptions
for each row execute function public.remember_partner_first_payment();

-- A reversal can arrive before the successful-charge replay. Remember it by
-- charge, rather than accidentally voiding a different renewal or tutor top-up.
create table public.partner_charge_reversals (
  charge_reference text primary key, reason text not null, created_at timestamptz not null default now()
);

create function public.claim_school_referral(p_user uuid,p_code text,p_source text default 'manual',p_ip_hash text default null)
returns text language plpgsql security definer set search_path = public as $$
declare s public.partner_schools; c text;
begin
  select ps.* into s from public.partner_schools ps join public.partner_school_codes pc on pc.school_id=ps.id
  where pc.code=lower(trim(p_code)) and pc.status='active' and ps.status='active' for update of ps;
  if not found then return null; end if;
  -- Recheck after the school lock; rotation and suspension take the same lock.
  select code into c from public.partner_school_codes where school_id=s.id and code=lower(trim(p_code)) and status='active';
  if c is null then return null; end if;
  perform 1 from public.profiles where id=p_user for update;
  if not found then return null; end if;
  perform 1 from public.subscriptions where user_id=p_user for update;
  if exists(select 1 from public.partner_first_payments where user_id=p_user)
    or exists(select 1 from public.subscriptions where user_id=p_user and (tier<>'free' or paid_at is not null))
    or exists(select 1 from auth.users where id=p_user and lower(email)=lower(trim(s.contact_email)))
    or p_source not in ('manual','link','admin') then return null; end if;
  insert into public.school_referrals(school_id,user_id,code_used,source,ip_hash)
    values(s.id,p_user,c,p_source,p_ip_hash) on conflict(user_id) do nothing;
  if not found then return null; end if;
  insert into public.streaks(user_id,cp) values(p_user,250)
    on conflict(user_id) do update set cp=coalesce(public.streaks.cp,0)+250;
  update public.profiles set trial_bonus_days=7 where id=p_user;
  return s.name;
end; $$;

create function public.record_school_commission(p_user uuid,p_reference text,p_plan text,p_cycle text,p_hold_days int)
returns uuid language plpgsql security definer set search_path = public as $$
declare s public.partner_schools; result uuid; paid timestamptz;
begin
  if p_hold_days < 1 then raise exception 'Invalid hold'; end if;
  select ps.* into s from public.partner_schools ps join public.school_referrals r on r.school_id=ps.id
    where r.user_id=p_user for update of ps;
  if not found then return null; end if;
  select paid_at into paid from public.partner_first_payments where user_id=p_user and charge_reference=p_reference;
  if not found then return null; end if;
  insert into public.partner_commissions(school_id,user_id,amount_cents,charge_reference,plan,cycle,earned_at,eligible_at,status,void_reason)
  values(s.id,p_user,s.commission_cents,p_reference,p_plan,p_cycle,paid,paid+make_interval(days=>p_hold_days),
    case when exists(select 1 from public.partner_charge_reversals where charge_reference=p_reference) then 'void' else 'pending' end,
    (select reason from public.partner_charge_reversals where charge_reference=p_reference))
  on conflict(user_id) do nothing returning id into result;
  return result;
end; $$;

create function public.void_school_commission(p_user uuid,p_reason text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.partner_schools where id=(select school_id from public.partner_commissions where user_id=p_user) for update;
  update public.partner_commissions set status=case when status='paid' then 'paid' else 'void' end,
    void_reason=p_reason,hold_reason=null where user_id=p_user and status in ('pending','payable','paid');
  return found;
end; $$;
create function public.reverse_school_charge(p_reference text,p_reason text) returns boolean
language plpgsql security definer set search_path = public as $$
declare u uuid;
begin
  insert into public.partner_charge_reversals(charge_reference,reason) values(p_reference,p_reason) on conflict do nothing;
  select user_id into u from public.partner_commissions where charge_reference=p_reference;
  if u is null then return false; end if;
  return public.void_school_commission(u,p_reason);
end; $$;

create function public.mature_school_commissions() returns int
language plpgsql security definer set search_path = public as $$
declare s public.partner_schools; c record; reason text; matured int:=0; held int:=0;
begin
  for s in select * from public.partner_schools order by id for update loop
    for c in select pc.*,r.attributed_at from public.partner_commissions pc
      left join public.school_referrals r on r.user_id=pc.user_id
      where pc.school_id=s.id and pc.status='pending' and pc.eligible_at<=now() order by pc.earned_at,pc.id for update of pc loop
      if exists(select 1 from public.partner_charge_reversals where charge_reference=c.charge_reference)
        or exists(select 1 from public.subscriptions where user_id=c.user_id and (refunded_at is not null or disputed_at is not null)) then
        perform public.void_school_commission(c.user_id,'Refunded or disputed'); continue;
      end if;
      reason:=c.hold_reason; -- Review holds are sticky until explicitly released.
      if s.status<>'active' then reason:='School is not active';
      elsif (select count(*) from public.school_referrals where school_id=s.id and attributed_at between c.attributed_at-interval '7 days' and c.attributed_at)>s.review_threshold
        or (select count(*) from public.school_referrals where school_id=s.id and attributed_at>=c.attributed_at and attributed_at<c.attributed_at+interval '7 days')>s.review_threshold
        then reason:='Attributions exceeded the rolling 7-day review threshold';
      elsif (select count(*) from public.partner_commissions where school_id=s.id
        and earned_at>=date_trunc('month',c.earned_at) and earned_at<date_trunc('month',c.earned_at)+interval '1 month'
        and (earned_at,id)<=(c.earned_at,c.id))>s.monthly_commission_cap
        then reason:='Monthly commission cap exceeded';
      end if;
      if reason is null then
        update public.partner_commissions set status='payable' where id=c.id; matured:=matured+1;
      else
        update public.partner_commissions set hold_reason=reason where id=c.id; held:=held+1;
      end if;
    end loop;
  end loop;
  raise log 'Partner commissions held: %',held;
  return matured;
end; $$;
create function public.release_held_commissions(p_school uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform 1 from public.partner_schools where id=p_school and status='active' for update;
  if not found then return 0; end if;
  update public.partner_commissions c set status='payable',hold_reason=null
  where school_id=p_school and status='pending' and hold_reason is not null and eligible_at<=now()
    and not exists(select 1 from public.partner_charge_reversals where charge_reference=c.charge_reference)
    and not exists(select 1 from public.subscriptions where user_id=c.user_id and (refunded_at is not null or disputed_at is not null));
  get diagnostics n=row_count; return n;
end; $$;
create function public.rotate_school_code(p_school uuid,p_new_code text,p_reason text) returns uuid
language plpgsql security definer set search_path = public as $$
declare result uuid;
begin
  perform 1 from public.partner_schools where id=p_school for update;
  if not found then return null; end if;
  if length(trim(p_reason))=0 then raise exception 'A reason is required'; end if;
  update public.partner_school_codes set status='revoked',revoked_at=now(),revoked_reason=p_reason
    where school_id=p_school and status='active';
  insert into public.partner_school_codes(school_id,code,label) values(p_school,lower(trim(p_new_code)),p_reason) returning id into result;
  return result;
end; $$;

create function public.mark_partner_payout_paid(p_school uuid,p_reference text,p_note text,p_minimum_cents int default 10000,p_override boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare result uuid; total int; deductions int; n int; first_at timestamptz; last_at timestamptz;
begin
  -- One school lock serialises payout, earning, review and reversal. A second
  -- click sees no payable rows, even while the first transaction is in flight.
  perform 1 from public.partner_schools where id=p_school for update;
  if not found then return null; end if;
  if nullif(trim(p_reference),'') is null then raise exception 'EFT reference required'; end if;
  select count(*),coalesce(sum(amount_cents),0),min(earned_at),max(earned_at) into n,total,first_at,last_at
    from public.partner_commissions where school_id=p_school and status='payable';
  select coalesce(sum(amount_cents),0) into deductions from public.partner_commissions
    where school_id=p_school and status='paid' and void_reason is not null and clawback_settled_payout_id is null;
  total:=total-deductions;
  if n=0 or total<=0 then return null; end if;
  if not p_override and total<greatest(0,p_minimum_cents) then raise exception 'Below payout minimum'; end if;
  insert into public.partner_payouts(school_id,commission_count,total_cents,period_start,period_end,status,paid_at,payment_reference,note)
    values(p_school,n,total,first_at,last_at,'paid',now(),p_reference,p_note) returning id into result;
  update public.partner_commissions set status='paid',payout_id=result where school_id=p_school and status='payable';
  update public.partner_commissions set clawback_settled_payout_id=result
    where school_id=p_school and status='paid' and void_reason is not null and clawback_settled_payout_id is null;
  return result;
end; $$;

-- First touch is an audit fact, even service-role code must not rewrite it.
create function public.immutable_school_referral() returns trigger language plpgsql as $$
begin raise exception 'School attribution is immutable'; end; $$;
create trigger immutable_school_referral before update on public.school_referrals
for each row execute function public.immutable_school_referral();

do $$ declare t text; f record; begin
  foreach t in array array['partner_schools','partner_school_codes','school_referrals','partner_payouts','partner_commissions','partner_first_payments','partner_charge_reversals'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
  for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace
    and proname in ('claim_school_referral','record_school_commission','void_school_commission','reverse_school_charge','mature_school_commissions','release_held_commissions','rotate_school_code','mark_partner_payout_paid','remember_partner_first_payment','immutable_school_referral') loop
    execute format('revoke execute on function %s from public, anon, authenticated',f.signature);
    execute format('grant execute on function %s to service_role',f.signature);
  end loop;
end; $$;
