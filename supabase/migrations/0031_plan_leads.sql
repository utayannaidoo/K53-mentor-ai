-- Visitors who finished the starting check, asked for their plan by email, and
-- did not create an account.
--
-- They are the largest measurable drop in the funnel: the results screen is
-- where someone has just seen their weakest section, and the only thing on
-- offer there was "create an account". This table is the other option.
--
-- Deliberately not a profile: no auth user exists, and one may never. The row
-- carries only what the plan email needs plus the consent timestamp that makes
-- holding the address lawful (POPIA s69). An address that later signs up is
-- simply an account as well — nothing here is merged or promoted, because the
-- account's own data is authoritative from that moment.
create table if not exists public.plan_leads (
  -- Lower-cased, like email_suppressions. One row per address: asking twice
  -- refreshes the plan, it does not make a second lead.
  email            text primary key,
  vehicle_code     text,
  -- Ordered worst-first, as the results screen showed them.
  weak_categories  text[] not null default '{}',
  score            integer,
  correct          integer,
  total            integer,
  -- Which surface captured it, so a second capture point stays attributable.
  source           text not null default 'diagnostic_results',
  -- When they ticked the box. Kept because consent is the lawful basis for
  -- holding this row at all, and "when" is the first thing anyone asks.
  consented_at     timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  last_sent_at     timestamptz
);

create index if not exists plan_leads_created_idx on public.plan_leads (created_at desc);

alter table public.plan_leads enable row level security;
-- Intentionally no policies: service-role only, like email_suppressions. The
-- browser never reads or writes this table; the API route holds the key.

comment on table public.plan_leads is
  'Signed-out visitors who asked for their starting-check plan by email (POPIA-consented).';
