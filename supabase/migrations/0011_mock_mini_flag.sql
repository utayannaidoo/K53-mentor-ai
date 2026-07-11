-- Mini mocks are now recorded alongside full mocks (with a flag) so the
-- per-plan mock limits can count them. Existing rows are all full mocks.
alter table public.mock_exam_attempts
  add column if not exists mini boolean not null default false;
