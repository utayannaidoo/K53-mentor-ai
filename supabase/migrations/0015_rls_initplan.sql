-- 0015: RLS initplan optimization
-- ============================================================================
-- The owner policies call auth.uid() bare, so Postgres re-evaluates it once
-- per row scanned (Supabase advisor lint 0003_auth_rls_initplan). Wrapping it
-- as (select auth.uid()) makes the planner treat it as a one-time initplan —
-- evaluated once per query. This is a pure performance change: the access
-- rules are byte-for-byte equivalent (a user still sees only their own rows).
--
-- RLS stays enabled throughout. Each policy is dropped and immediately
-- recreated inside this migration's transaction, so there is never a window
-- where a table is readable without its owner check.

-- ── Standard owner tables (FOR ALL, keyed on user_id) ───────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'streaks','diagnostic_attempts','question_attempts',
    'flashcard_review_log','scenario_attempts','mock_exam_attempts','study_sessions',
    'study_plans','readiness_history','user_procedure_progress','tutor_conversations',
    'notifications'
  ]
  loop
    execute format('drop policy if exists "own_%1$s" on public.%1$I;', t);
    execute format(
      $p$create policy "own_%1$s" on public.%1$I for all
        using ((select auth.uid()) = user_id)
        with check ((select auth.uid()) = user_id);$p$,
      t
    );
  end loop;
end $$;

-- ── profiles: keyed on id = auth.uid() ──────────────────────────────────────
drop policy if exists "own_profile" on public.profiles;
create policy "own_profile" on public.profiles for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ── subscriptions: SELECT-only for clients (writes are service-role, 0004) ──
drop policy if exists "read_own_subscriptions" on public.subscriptions;
create policy "read_own_subscriptions" on public.subscriptions for select
  using ((select auth.uid()) = user_id);

-- ── Child tables: ownership checked through the parent ──────────────────────
drop policy if exists "own_diag_responses" on public.diagnostic_responses;
create policy "own_diag_responses" on public.diagnostic_responses for all
  using (exists (select 1 from public.diagnostic_attempts d where d.id = diagnostic_attempt_id and d.user_id = (select auth.uid())))
  with check (exists (select 1 from public.diagnostic_attempts d where d.id = diagnostic_attempt_id and d.user_id = (select auth.uid())));

drop policy if exists "own_mock_responses" on public.mock_exam_responses;
create policy "own_mock_responses" on public.mock_exam_responses for all
  using (exists (select 1 from public.mock_exam_attempts m where m.id = mock_exam_attempt_id and m.user_id = (select auth.uid())))
  with check (exists (select 1 from public.mock_exam_attempts m where m.id = mock_exam_attempt_id and m.user_id = (select auth.uid())));

drop policy if exists "own_tutor_messages" on public.tutor_messages;
create policy "own_tutor_messages" on public.tutor_messages for all
  using (exists (select 1 from public.tutor_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.tutor_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
