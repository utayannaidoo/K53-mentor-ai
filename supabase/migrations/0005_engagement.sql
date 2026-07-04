-- Engagement / notifications groundwork.
--
-- The SM-2 schedule lives client-side, so the account sync (saveAccount)
-- snapshots a tiny due-summary onto the user's streak row. The daily
-- notification cron reads it server-side to send due-review reminders
-- without needing the full card state.

alter table public.streaks
  add column if not exists due_cards int not null default 0,
  add column if not exists next_due_at timestamptz;

-- Reminder opt-out (POPIA-friendly default-on for transactional study nudges;
-- honoured by the cron before any send).
alter table public.profiles
  add column if not exists email_notifications boolean not null default true;

-- Cron dedup lookups: "was a notification of this type sent recently?"
create index if not exists notifications_user_type_idx
  on public.notifications (user_id, type, created_at desc);

create index if not exists profiles_last_active_idx
  on public.profiles (last_active_at);
