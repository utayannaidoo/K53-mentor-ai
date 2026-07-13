-- Single-section timed drills are recorded alongside mocks with a section
-- flag so the per-plan drill allowance can count them. Existing rows are
-- full or mini mocks (drill stays null).
alter table public.mock_exam_attempts
  add column if not exists drill text
  check (drill in ('controls', 'signs', 'rules'));
