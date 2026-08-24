-- Performance: ordered pull indexes for the client progress sync.
--
-- pullProgress (src/lib/supabase/progress.ts) runs on every sign-in and
-- account hydration, and each of the four attempt tables is read with
-- `WHERE user_id = $1 ORDER BY <time> DESC LIMIT n`. The existing
-- `(user_id)` / `(user_id, client_id)` indexes answer the filter but not the
-- sort, so Postgres collected and sorted every row the user had ever written
-- before applying LIMIT — a heavy learner's question_attempts sort ran on
-- each hydration and grew without bound (the KEEP caps are client-side only).
-- These match the pattern 0023 already established for study_sessions.
--
-- flashcard_review_log gains its index alongside the code change that gave
-- its pull an explicit `.order("reviewed_at desc")`; `(user_id, due_at)`
-- cannot serve that ordering.

CREATE INDEX IF NOT EXISTS question_attempts_user_time_idx
  ON public.question_attempts (user_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS scenario_attempts_user_time_idx
  ON public.scenario_attempts (user_id, attempted_at DESC);

CREATE INDEX IF NOT EXISTS mock_exam_attempts_user_time_idx
  ON public.mock_exam_attempts (user_id, taken_at DESC);

CREATE INDEX IF NOT EXISTS diagnostic_attempts_user_time_idx
  ON public.diagnostic_attempts (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS flashcard_review_log_user_reviewed_idx
  ON public.flashcard_review_log (user_id, reviewed_at DESC);
