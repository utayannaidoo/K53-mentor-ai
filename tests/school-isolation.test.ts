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
