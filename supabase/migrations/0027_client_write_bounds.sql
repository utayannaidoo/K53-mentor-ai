-- 0027_client_write_bounds.sql
-- Study progress is client-authoritative by MVP decision: RLS makes every row
-- owner-only but owner-WRITABLE, so a tampered browser can push arbitrary
-- values through pushProgress/saveAccount into its own rows. The DB is the
-- last sanity layer: these CHECK bounds accept everything the legitimate
-- writers produce (src/lib/supabase/progress.ts + account.ts, SM-2 math in
-- src/lib/srs/sm2.ts, streak logic in src/lib/store/local-store.ts) and
-- exclude the absurd. NOT VALID so legacy rows can't fail this migration;
-- new and updated rows are enforced immediately.
--
-- Ops: once data is confirmed clean, run per table in a low-traffic window:
--   alter table public.<t> validate constraint <name>;

-- ── streaks ──────────────────────────────────────────────────────────────────
-- current grows at most +1/day (touchStreak); longest = max(longest, current);
-- freezes_remaining refills to 1 weekly; regains_used is capped at 1/run
-- (MAX_REGAINS_PER_RUN) and refunds to 0. cp accrues ≤12/question, ≤50/mock.
alter table public.streaks add constraint streaks_current_sane
  check (current between 0 and 3660) not valid;
-- validate: alter table public.streaks validate constraint streaks_current_sane;

alter table public.streaks add constraint streaks_longest_sane
  check (longest between 0 and 3660) not valid;
-- validate: alter table public.streaks validate constraint streaks_longest_sane;

alter table public.streaks add constraint streaks_freezes_remaining_sane
  check (freezes_remaining between 0 and 52) not valid;
-- validate: alter table public.streaks validate constraint streaks_freezes_remaining_sane;

alter table public.streaks add constraint streaks_regains_used_sane
  check (regains_used between 0 and 52) not valid;
-- validate: alter table public.streaks validate constraint streaks_regains_used_sane;

alter table public.streaks add constraint streaks_cp_sane
  check (cp between 0 and 1000000) not valid;
-- validate: alter table public.streaks validate constraint streaks_cp_sane;

-- ── mock_exam_attempts ───────────────────────────────────────────────────────
-- Totals are fixed by format: full = 64 (EXAM_FORMAT), mini = 5..20, drill =
-- section size 8/28. Score is the count of correct answers within the paper.
alter table public.mock_exam_attempts add constraint mock_exam_attempts_total_sane
  check (total between 0 and 500) not valid;
-- validate: alter table public.mock_exam_attempts validate constraint mock_exam_attempts_total_sane;

alter table public.mock_exam_attempts add constraint mock_exam_attempts_score_sane
  check (score >= 0 and score <= total) not valid;
-- validate: alter table public.mock_exam_attempts validate constraint mock_exam_attempts_score_sane;

-- duration_seconds is raw wall clock (Date.now() - startedAt) with no clamp;
-- 7 days absorbs a suspended tab resumed days later, still excludes 10^9.
alter table public.mock_exam_attempts add constraint mock_exam_attempts_duration_seconds_sane
  check (duration_seconds between 0 and 604800) not valid;
-- validate: alter table public.mock_exam_attempts validate constraint mock_exam_attempts_duration_seconds_sane;

-- ── diagnostic_attempts ──────────────────────────────────────────────────────
-- readiness/passProbability are clamp(0..100) in scoring.ts; the paper is 15
-- questions (DIAGNOSTIC_PLAN sums to 15), correct counts within it.
alter table public.diagnostic_attempts add constraint diagnostic_attempts_readiness_sane
  check (readiness between 0 and 100) not valid;
-- validate: alter table public.diagnostic_attempts validate constraint diagnostic_attempts_readiness_sane;

alter table public.diagnostic_attempts add constraint diagnostic_attempts_pass_probability_sane
  check (predicted_pass_probability between 0 and 100) not valid;
-- validate: alter table public.diagnostic_attempts validate constraint diagnostic_attempts_pass_probability_sane;

alter table public.diagnostic_attempts add constraint diagnostic_attempts_total_sane
  check (total between 0 and 500) not valid;
-- validate: alter table public.diagnostic_attempts validate constraint diagnostic_attempts_total_sane;

alter table public.diagnostic_attempts add constraint diagnostic_attempts_correct_sane
  check (correct >= 0 and correct <= total) not valid;
-- validate: alter table public.diagnostic_attempts validate constraint diagnostic_attempts_correct_sane;

-- ── study_sessions ───────────────────────────────────────────────────────────
-- Same raw-wall-clock provenance as mocks (recordSession callers).
alter table public.study_sessions add constraint study_sessions_duration_seconds_sane
  check (duration_seconds between 0 and 604800) not valid;
-- validate: alter table public.study_sessions validate constraint study_sessions_duration_seconds_sane;

-- ── readiness_history ────────────────────────────────────────────────────────
-- One point/day; readiness is clamped 0..100 by computeReadiness.
alter table public.readiness_history add constraint readiness_history_readiness_sane
  check (readiness between 0 and 100) not valid;
-- validate: alter table public.readiness_history validate constraint readiness_history_readiness_sane;

-- ── flashcard_review_log ─────────────────────────────────────────────────────
-- ease floor 1.3 in scheduleCard (starts 2.5, +0.1 max/review → 5.0 needs ~25
-- consecutive "easy" reviews, whose compounding intervals take years of real
-- time). mastery is clamp(0..100); reps/lapses increment once per review.
alter table public.flashcard_review_log add constraint flashcard_review_log_ease_sane
  check (ease >= 1.0 and ease <= 5.0) not valid;
-- validate: alter table public.flashcard_review_log validate constraint flashcard_review_log_ease_sane;

alter table public.flashcard_review_log add constraint flashcard_review_log_interval_days_sane
  check (interval_days between 0 and 36500) not valid;
-- validate: alter table public.flashcard_review_log validate constraint flashcard_review_log_interval_days_sane;

alter table public.flashcard_review_log add constraint flashcard_review_log_reps_sane
  check (reps between 0 and 100000) not valid;
-- validate: alter table public.flashcard_review_log validate constraint flashcard_review_log_reps_sane;

alter table public.flashcard_review_log add constraint flashcard_review_log_lapses_sane
  check (lapses between 0 and 100000) not valid;
-- validate: alter table public.flashcard_review_log validate constraint flashcard_review_log_lapses_sane;

alter table public.flashcard_review_log add constraint flashcard_review_log_mastery_sane
  check (mastery between 0 and 100) not valid;
-- validate: alter table public.flashcard_review_log validate constraint flashcard_review_log_mastery_sane;

-- ── question_attempts ────────────────────────────────────────────────────────
-- selected_index -1 = blank (timed-mock passport); options arrays hold ≤4
-- entries, so real indices are 0..3 — headroom for richer formats.
alter table public.question_attempts add constraint question_attempts_selected_index_sane
  check (selected_index between -1 and 7) not valid;
-- validate: alter table public.question_attempts validate constraint question_attempts_selected_index_sane;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- prior_attempts is a 4-chip picker (0..3) in the onboarding wizard.
alter table public.profiles add constraint profiles_prior_attempts_sane
  check (prior_attempts between 0 and 100) not valid;
-- validate: alter table public.profiles validate constraint profiles_prior_attempts_sane;
