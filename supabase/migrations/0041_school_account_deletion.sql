-- K53 Mentor for Schools — deleting an account that has touched a school.
-- ============================================================================
-- POPIA gives every K53 Mentor user the right to erase their account, and
-- /api/account/delete does it by deleting the auth user and letting every
-- user table cascade. 0035–0039 quietly broke that for anyone who has ever
-- used a school workspace:
--
--   * every "who did this" column — created_by, invited_by, accepted_by,
--     assessed_by, received_by, voided_by, recorded_by — referenced
--     auth.users with the default NO ACTION, so deleting an instructor who
--     had ever booked a lesson or taken a payment failed on a foreign key;
--
--   * school_members.user_id cascaded, so even with those fixed, deleting an
--     instructor would delete the member row that the school's lessons,
--     learners and enquiries point at — refused again, or, had THOSE
--     cascaded, a school's diary and cash book silently losing everything
--     that instructor ever did.
--
-- The rule from here on:
--
--   1. An erased user's MEMBER row survives, detached: user_id becomes null
--      and the row is suspended. The school keeps its own record of who
--      taught which lesson (display_name) — a record the school owns and we
--      hold on its behalf — while the person's K53 account, and with it every
--      way to sign in to the school, is gone. A detached member uses no seat,
--      because only active members count.
--
--   2. Every audit column becomes nullable and ON DELETE SET NULL. "Taken
--      by" an erased account reads as unknown; the lesson, the payment and
--      the note are the school's and stay exactly as they were.
--
--   3. The active OWNER cannot be erased out from under a school. A school
--      with no owner can't be managed, billed or closed by anyone. The
--      account route refuses first, with a sentence a person can act on;
--      the trigger below is the backstop for a delete from anywhere else
--      (the dashboard, a script), and it aborts the whole delete.
--
-- Constraint names below are Postgres's defaults for the inline references in
-- 0035–0039 (<table>_<column>_fkey). If one is ever renamed this migration
-- fails loudly rather than leaving a blocking foreign key in place, and
-- supabase/tests/school_account_deletion.sql proves the end state.
--
-- DEPLOY CHECK: this is about foreign keys, so verify with the check script,
-- not the migration list (prod's ledger is not authoritative — see
-- supabase/migrations/README.md).

-- ── 1. Members: detach instead of cascade ───────────────────────────────────
alter table public.school_members
  alter column user_id drop not null,
  drop constraint school_members_user_id_fkey,
  add constraint school_members_user_id_fkey
    foreign key (user_id) references auth.users on delete set null;

-- Fires for the SET NULL above: a referential action is carried out as an
-- ordinary UPDATE, and row triggers on the referencing table see it. Not
-- SECURITY DEFINER — it only ever edits the row it is handed.
create function public.school_member_detached() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.user_id is null and old.user_id is not null then
    if old.role = 'owner' and old.status = 'active' then
      raise exception 'This account owns a driving school on K53 Mentor. Transfer the school to someone else, or close it, before deleting the account.'
        using errcode = 'P0001';
    end if;
    new.status := 'suspended';
    new.deactivated_at := coalesce(old.deactivated_at, now());
  end if;
  return new;
end $$;
revoke all on function public.school_member_detached() from public, anon, authenticated;

create trigger school_members_detached before update of user_id on public.school_members
  for each row execute function public.school_member_detached();

-- ── 2. Audit columns: the record stays, the pointer goes ────────────────────
alter table public.schools
  alter column created_by drop not null,
  drop constraint schools_created_by_fkey,
  add constraint schools_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

alter table public.school_invites
  alter column invited_by drop not null,
  drop constraint school_invites_invited_by_fkey,
  add constraint school_invites_invited_by_fkey
    foreign key (invited_by) references auth.users on delete set null,
  drop constraint school_invites_accepted_by_fkey,
  add constraint school_invites_accepted_by_fkey
    foreign key (accepted_by) references auth.users on delete set null;

alter table public.school_learners
  alter column created_by drop not null,
  drop constraint school_learners_created_by_fkey,
  add constraint school_learners_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

alter table public.school_lessons
  alter column created_by drop not null,
  drop constraint school_lessons_created_by_fkey,
  add constraint school_lessons_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

alter table public.school_lesson_notes
  alter column created_by drop not null,
  drop constraint school_lesson_notes_created_by_fkey,
  add constraint school_lesson_notes_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

alter table public.school_lesson_modules
  alter column assessed_by drop not null,
  drop constraint school_lesson_modules_assessed_by_fkey,
  add constraint school_lesson_modules_assessed_by_fkey
    foreign key (assessed_by) references auth.users on delete set null;

alter table public.school_packages
  alter column created_by drop not null,
  drop constraint school_packages_created_by_fkey,
  add constraint school_packages_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

alter table public.school_enquiries
  alter column created_by drop not null,
  drop constraint school_enquiries_created_by_fkey,
  add constraint school_enquiries_created_by_fkey
    foreign key (created_by) references auth.users on delete set null;

alter table public.school_test_results
  alter column recorded_by drop not null,
  drop constraint school_test_results_recorded_by_fkey,
  add constraint school_test_results_recorded_by_fkey
    foreign key (recorded_by) references auth.users on delete set null;

-- Payments need one more change. 0038 required voided_by to be set exactly
-- when voided_at is, so nulling the voider of a voided payment would fail the
-- CHECK and block the delete all over again. What matters for the cash book
-- is that a payment is voided or not, with a reason; who voided it becomes
-- unknown once that person has left, the same as every other audit column.
alter table public.school_payments
  alter column received_by drop not null,
  drop constraint school_payments_received_by_fkey,
  add constraint school_payments_received_by_fkey
    foreign key (received_by) references auth.users on delete set null,
  drop constraint school_payments_voided_by_fkey,
  add constraint school_payments_voided_by_fkey
    foreign key (voided_by) references auth.users on delete set null;

do $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.school_payments'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) like '%voided_at IS NULL) = (voided_by IS NULL)%';
  if c is null then
    raise exception '0041: the voided_at/voided_by check from 0038 was not found';
  end if;
  execute format('alter table public.school_payments drop constraint %I', c);
end $$;

-- Still true after the change: nobody is recorded as voiding a live payment.
alter table public.school_payments
  add constraint school_payments_voider_only_when_voided
    check (voided_by is null or voided_at is not null);
