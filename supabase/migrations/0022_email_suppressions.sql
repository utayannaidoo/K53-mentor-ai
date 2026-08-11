-- 0022: stop emailing addresses that have hard-bounced or complained
-- ============================================================================
-- Nothing currently consumes Resend's delivery events, so hard bounces and spam
-- complaints accumulate invisibly. That is a slow-acting outage: mailbox
-- providers score a sender on how often it keeps mailing addresses that do not
-- exist, and on how often recipients mark it as spam. Enough of either and the
-- whole domain's mail starts landing in Junk — including the signup
-- confirmations the entire account flow depends on.
--
-- The fix is a suppression list, checked before every send. A hard bounce means
-- the address does not exist: sending again cannot succeed and only costs
-- reputation. A complaint is stronger still — the recipient pressed "spam", and
-- continuing to mail them is both rude and actively harmful.
--
-- Written only by the Resend webhook (service-role). No client role can read or
-- write it: an address list is exactly the sort of thing not to expose, and
-- nothing in the app needs it.

create table if not exists public.email_suppressions (
  -- Lower-cased address. Not a foreign key to auth.users: bounces arrive for
  -- addresses that never became accounts (a typo at signup is the common case),
  -- and the suppression must outlive any account deletion.
  email      text primary key,
  -- 'bounced' | 'complained'
  reason     text not null,
  -- Provider detail, e.g. the SMTP diagnostic. Useful when a real customer says
  -- "I never get your emails" and the answer needs to be more than "you bounced".
  detail     text,
  created_at timestamptz not null default now()
);

create index if not exists email_suppressions_created_idx
  on public.email_suppressions (created_at desc);

alter table public.email_suppressions enable row level security;
-- Intentionally no policies: service-role only.

-- ── Soft bounces are deliberately absent ────────────────────────────────────
-- Resend distinguishes hard bounces from transient ones (full mailbox, greylist,
-- temporary server failure). Only permanent failures should ever reach this
-- table. Suppressing on a transient bounce would quietly cut off a real
-- customer whose mailbox was full for an afternoon, and they would never know
-- why the emails stopped. The webhook filters on bounce type; this comment is
-- here because "why don't we suppress every bounce" is the obvious question.
