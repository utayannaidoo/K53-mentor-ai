-- K53 Mentor for Schools — an owner closes their school.
-- ============================================================================
-- Until now the only way out of a school was to email support: an owner could
-- not delete their own account while they owned one (0041), and nothing let
-- them delete the school. The school's diary, learners, cash book and notes
-- are the school's records — POPIA says it may have them deleted, and "email
-- us" is not a deletion right anyone can use at 9pm.
--
-- close_school deletes the school row and lets every table that hangs off it
-- cascade: members, invites, the subscription row and its credit, learners
-- and their app links, lessons with their notes and ratings, packages,
-- payments, vehicles, enquiries, test results. It is irreversible, so it is
-- guarded three ways:
--
--   * only the school's active owner may do it;
--   * the owner must type the school's name — checked here, not only in the
--     browser, because a server action is a public POST endpoint;
--   * a paid plan that is still renewing must be stopped first. The app stops
--     it at Paystack before calling this; the check is the backstop, so a
--     closed school can never leave a card being charged for it.
--
-- What is NOT deleted: the partner-programme record (partner_schools and its
-- commissions and payouts) is a separate contract with its own history; the
-- members' and learners' own K53 Mentor accounts; and one line in
-- school_closures saying which school was closed, by whom and when — the
-- record support needs when someone asks where their school went, holding
-- nothing about the school's learners.

create table public.school_closures (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  school_name text not null,
  closed_by uuid references auth.users on delete set null,
  closed_at timestamptz not null default now(),
  plan text,
  partner_school_id uuid
);
alter table public.school_closures enable row level security;
revoke all on public.school_closures from public, anon, authenticated;
grant all on public.school_closures to service_role;

create function public.close_school(p_user uuid, p_school uuid, p_confirm_name text) returns boolean
language plpgsql security definer set search_path = public as $$
declare s public.schools%rowtype; sub public.school_subscriptions%rowtype;
begin
  select * into s from public.schools where id = p_school for update;
  if not found then return false; end if;
  if (select role from public.school_members
       where school_id = p_school and user_id = p_user and status = 'active') is distinct from 'owner' then
    raise exception 'Only the school owner can close the school';
  end if;
  if lower(btrim(coalesce(p_confirm_name, ''))) <> lower(btrim(s.name)) then
    raise exception 'Type the school''s name exactly as it appears to confirm';
  end if;

  select * into sub from public.school_subscriptions where school_id = p_school;
  if found and sub.status in ('active', 'past_due') and sub.provider_customer_id is not null
     and not sub.cancel_at_period_end then
    raise exception 'Stop the plan renewing before closing the school';
  end if;

  insert into public.school_closures (school_id, school_name, closed_by, plan, partner_school_id)
    values (p_school, s.name, p_user, sub.plan, s.partner_school_id);
  delete from public.schools where id = p_school;
  return true;
end $$;

revoke execute on function public.close_school(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.close_school(uuid, uuid, text) to service_role;
