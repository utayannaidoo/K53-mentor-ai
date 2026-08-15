-- Study sessions were the one progress table left out of the sync.
--
-- 0007 gave question_attempts, scenario_attempts, mock_exam_attempts and
-- diagnostic_attempts a client_id so pushes are idempotent. study_sessions was
-- created in 0001 and then never wired up, so `pushProgress` has never written
-- a single row to it — the table is empty for every user who has ever studied.
--
-- The visible symptom is "Time studied: 0 secs" on the progress page for an
-- account with hundreds of answered questions: durations live only in
-- localStorage, which is per-origin, so they also did not survive the
-- www./apex split that 0023's sibling fix (canonical-host) closed.
--
-- Same shape as 0007. NULLs never collide in a unique index, so the (empty)
-- pre-sync rows are unaffected.
alter table public.study_sessions add column if not exists client_id text;

create unique index if not exists study_sessions_client_uidx
  on public.study_sessions(user_id, client_id);

-- Pulling a learner's history reads the recent window newest-first.
create index if not exists study_sessions_user_ended_idx
  on public.study_sessions(user_id, ended_at desc);
