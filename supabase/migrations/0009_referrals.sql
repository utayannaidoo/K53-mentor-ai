-- 0009: referral program — invite a friend, both sides get Confidence Points.
-- The reward is CP (the in-app progression currency), not money, so there is
-- no billing surface to defraud; claim_referral is service-role-only and a
-- profile can only ever be referred once.

alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles
  add column if not exists referred_by uuid references auth.users(id) on delete set null;

-- Deterministic 8-char code from the user id; backfill + trigger for new rows.
update public.profiles
   set referral_code = substr(replace(id::text, '-', ''), 1, 8)
 where referral_code is null;

create or replace function public.set_referral_code()
returns trigger language plpgsql as $$
begin
  if new.referral_code is null then
    new.referral_code := substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_referral_code on public.profiles;
create trigger profiles_referral_code
  before insert on public.profiles
  for each row execute function public.set_referral_code();

/** CP granted to each side of a successful referral. */
create or replace function public.claim_referral(p_referee uuid, p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
begin
  select id into v_referrer from public.profiles where referral_code = lower(p_code);
  if v_referrer is null or v_referrer = p_referee then
    return false;
  end if;
  -- One referral per account, ever.
  update public.profiles set referred_by = v_referrer
   where id = p_referee and referred_by is null;
  if not found then
    return false;
  end if;
  insert into public.streaks (user_id, cp) values (p_referee, 250)
    on conflict (user_id) do update set cp = coalesce(public.streaks.cp, 0) + 250;
  insert into public.streaks (user_id, cp) values (v_referrer, 250)
    on conflict (user_id) do update set cp = coalesce(public.streaks.cp, 0) + 250;
  return true;
end;
$$;

revoke execute on function public.claim_referral(uuid, text) from public, anon, authenticated;
