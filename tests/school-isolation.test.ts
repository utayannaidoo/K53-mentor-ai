import { describe, expect, it } from "vitest";
import { hasPartnerDb, runIsolationScript, schoolDb } from "./school-db";

/**
 * Tenant isolation for the school workspace, run against real Postgres.
 *
 * The checks themselves live in `supabase/tests/school_isolation.sql` so that
 * exactly the same file can be run against production after 0035 is applied —
 * it rolls everything back, pass or fail. This test runs it in-process on
 * every push, so a policy or grant change that lets one school see another
 * fails CI instead of shipping.
 *
 * Skipped only when the PGlite runtime is missing; CI sets
 * PARTNER_SQL_REQUIRED=1, which turns a missing runtime into a hard failure
 * rather than a vacuous pass (see tests/partner-db.ts).
 */
describe.skipIf(!hasPartnerDb)("school workspace isolation (0035)", () => {
  it("keeps every school's data to itself and every role in its lane", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db);
      expect(verdict).toMatch(/^ISOLATION PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("leaves nothing behind, because the script always rolls back", async () => {
    const db = await schoolDb();
    try {
      await runIsolationScript(db);
      const leftovers = await db.query<{ schools: number; users: number }>(
        "select (select count(*)::int from public.schools) as schools, (select count(*)::int from auth.users) as users",
      );
      expect(leftovers.rows[0]).toEqual({ schools: 0, users: 0 });
    } finally {
      await db.close();
    }
  }, 60_000);

  it("keeps the diary free of double-bookings and inside its own school (0036)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_diary.sql");
      expect(verdict).toMatch(/^DIARY PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("lets only the right instructor record a lesson, and keeps the grid on the latest rating (0037)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_lesson_record.sql");
      expect(verdict).toMatch(/^RECORD PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if the progress view stops preferring the latest lesson", async () => {
    // Swap the view for one that takes the EARLIEST rating: the check that an
    // old lesson's edit cannot overwrite a newer rating must then fail.
    const db = await schoolDb();
    try {
      await db.exec(`
        create or replace view public.school_learner_progress with (security_invoker = true) as
        select distinct on (lm.school_id, l.learner_id, lm.module_id)
          lm.school_id, l.learner_id, lm.module_id, lm.rating, lm.faults, lm.lesson_id, l.starts_at as lesson_at
        from public.school_lesson_modules lm
        join public.school_lessons l on l.id = lm.lesson_id and l.school_id = lm.school_id
        where l.status not in ('cancelled_learner', 'cancelled_school', 'no_show')
        order by lm.school_id, l.learner_id, lm.module_id, l.starts_at asc, lm.assessed_at asc;
      `);
      const verdict = await runIsolationScript(db, "supabase/tests/school_lesson_record.sql");
      expect(verdict).toMatch(/^RECORD FAILED: .*alley docking/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("keeps payments append-only and packages with their own learner (0038)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_money.sql");
      expect(verdict).toMatch(/^MONEY PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if a signed-in user is ever allowed to edit a payment", async () => {
    const db = await schoolDb();
    try {
      await db.exec("grant update (amount_cents) on public.school_payments to authenticated");
      await db.exec(`create policy school_payments_update on public.school_payments for update
        using (school_id in (select public.my_school_ids()))`);
      const verdict = await runIsolationScript(db, "supabase/tests/school_money.sql");
      expect(verdict).toMatch(/^MONEY FAILED: .*payment amount was edited/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("keeps enquiries and test results inside their school, and results uneditable by instructors (0039)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_enquiries_tests.sql");
      expect(verdict).toMatch(/^ENQUIRY PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("keeps a paid school writable exactly as long as it is paid for (0040)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_billing_periods.sql");
      expect(verdict).toMatch(/^PERIODS PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if the paid-period rule is ever reverted to status alone", async () => {
    // 0035's original helper looked only at status; a cancelled school then
    // stayed writable forever. Put it back and the period checks must fail.
    const db = await schoolDb();
    try {
      await db.exec(`
        create or replace function public.my_writable_school_ids() returns setof uuid
        language sql stable security definer set search_path = public as $$
          select m.school_id from public.school_members m
          join public.school_subscriptions s on s.school_id = m.school_id
          where m.user_id = (select auth.uid()) and m.status = 'active'
            and (s.status in ('active','past_due') or (s.status = 'trialing' and s.trial_ends_at > now()))
        $$;
      `);
      const verdict = await runIsolationScript(db, "supabase/tests/school_billing_periods.sql");
      expect(verdict).toMatch(/^PERIODS FAILED: .*after its period ended/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("lets an instructor delete their account and keeps everything they did with the school (0041)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_account_deletion.sql");
      expect(verdict).toMatch(/^ERASURE PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if a school table ever blocks deleting a user again", async () => {
    // The shape 0035–0039 shipped with: a bare `references auth.users`. Put one
    // back and both the structural check and the real delete must object.
    const db = await schoolDb();
    try {
      await db.exec(`
        alter table public.school_payments drop constraint school_payments_received_by_fkey,
          add constraint school_payments_received_by_fkey foreign key (received_by) references auth.users;
      `);
      const verdict = await runIsolationScript(db, "supabase/tests/school_account_deletion.sql");
      expect(verdict).toMatch(/^ERASURE FAILED: .*block account deletion: school_payments/);
      expect(verdict).toMatch(/could not delete their account/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if an owner can ever be erased out from under their school", async () => {
    const db = await schoolDb();
    try {
      await db.exec("drop trigger school_members_detached on public.school_members");
      const verdict = await runIsolationScript(db, "supabase/tests/school_account_deletion.sql");
      expect(verdict).toMatch(/^ERASURE FAILED: .*owner was erased out from under their school/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("settles commission into credit once, spends it only on the school's own bill, and keeps the books (0042)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_commission_credit.sql");
      expect(verdict).toMatch(/^CREDIT PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if credit could ever pay for the same charge twice", async () => {
    // Take out the double-spend guard and the check must notice.
    const db = await schoolDb();
    try {
      const fn = await db.query<{ src: string }>(
        "select pg_get_functiondef('public.redeem_school_credit(uuid,text,int,text)'::regprocedure) as src",
      );
      const loosened = fn.rows[0].src.replace(
        "raise exception 'That charge has already been paid for with credit';",
        "null;",
      );
      expect(loosened).not.toBe(fn.rows[0].src);
      await db.exec(loosened);
      const verdict = await runIsolationScript(db, "supabase/tests/school_commission_credit.sql");
      expect(verdict).toMatch(/^CREDIT FAILED: .*paid for with credit twice/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("lets only the learner connect their account, and shows the school only readiness and strengths (0043)", async () => {
    const db = await schoolDb();
    try {
      const verdict = await runIsolationScript(db, "supabase/tests/school_learner_link.sql");
      expect(verdict).toMatch(/^LINK PASSED: \d+ checks \(rolled back\)$/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if a school can ever insert a learner already linked to someone", async () => {
    // Put back 0036's table-wide INSERT grant: forging a consented link must
    // then be caught.
    const db = await schoolDb();
    try {
      await db.exec("grant insert on public.school_learners to authenticated");
      const verdict = await runIsolationScript(db, "supabase/tests/school_learner_link.sql");
      expect(verdict).toMatch(/^LINK FAILED: .*inserted a learner already linked/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if the summary ever carries more than readiness and strengths", async () => {
    const db = await schoolDb();
    try {
      const fn = await db.query<{ src: string }>(
        "select pg_get_functiondef('public.school_learner_progress_summary(uuid,uuid)'::regprocedure) as src",
      );
      const widened = fn.rows[0].src.replace(
        "'readiness_day', ready_day,",
        "'readiness_day', ready_day, 'email', (select email from auth.users where id = linked),",
      );
      expect(widened).not.toBe(fn.rows[0].src);
      await db.exec(widened);
      const verdict = await runIsolationScript(db, "supabase/tests/school_learner_link.sql");
      expect(verdict).toMatch(/^LINK FAILED: .*more than readiness and strengths/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if the double-booking guard is ever dropped", async () => {
    // The diary check passing on its first run proves nothing on its own; this
    // proves it is watching. Remove the constraint and the verdict must flip.
    const db = await schoolDb();
    try {
      await db.exec(
        "alter table public.school_lessons drop constraint school_lessons_no_instructor_overlap",
      );
      const verdict = await runIsolationScript(db, "supabase/tests/school_diary.sql");
      expect(verdict).toMatch(/^DIARY FAILED: .*same instructor was booked twice/);
    } finally {
      await db.close();
    }
  }, 60_000);

  it("fails loudly if 0035 stops revoking Supabase's default grants", async () => {
    // Proves the check has teeth: hand a signed-in user the TRUNCATE that
    // Supabase's defaults would have given them, and the verdict must flip.
    const db = await schoolDb();
    try {
      await db.exec("grant truncate on public.school_members to authenticated");
      const verdict = await runIsolationScript(db);
      expect(verdict).toMatch(/^ISOLATION FAILED: .*TRUNCATE/);
    } finally {
      await db.close();
    }
  }, 60_000);
});
