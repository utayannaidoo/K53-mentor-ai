-- 0014: web-push subscriptions
-- ============================================================================
-- Browser push endpoint per device, alongside the existing email reminder
-- channel (profiles.email_notifications, see 0001/0005). A subscription row
-- is created only after the browser permission prompt succeeds, so presence
-- of a row IS the opt-in — no separate boolean needed.

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  -- {p256dh, auth} from PushSubscription.toJSON().keys
  keys       jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;
create policy "own_push_subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
