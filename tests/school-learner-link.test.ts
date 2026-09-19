import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The learner link (0043), on the TypeScript side.
 *
 * The database proves who may link and what the summary function returns
 * (supabase/tests/school_learner_link.sql). What only this side can get wrong
 * is the school -> learner view: it is assembled with the service role, so
 * RLS protects nothing there. These tests pin what it reads — only notes the
 * instructor chose to share, and none of the cash book's references, notes or
 * who took the money — and the shape it hands the learner app.
 */

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => null }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => null }));

import { linkedSchoolsFor, parseLinkSummary, pickLatestFocus } from "@/lib/schools/learner-link";

type Call = { table: string; columns: string; filters: [string, string, unknown][] };

function recordingAdmin(tables: Record<string, { data: unknown; error?: { code?: string; message: string } | null }>) {
  const calls: Call[] = [];
  const admin = {
    rpc: vi.fn(),
    from(table: string) {
      const call: Call = { table, columns: "", filters: [] };
      calls.push(call);
      const result = () => {
        const t = tables[table];
        return { data: t?.data ?? [], error: t?.error ?? null };
      };
      const builder: Record<string, unknown> = {};
      const filter = (op: string) => (col: string, val: unknown) => (call.filters.push([op, col, val]), builder);
      builder.select = (columns: string) => ((call.columns = columns), builder);
      for (const op of ["eq", "in", "gt", "lte", "is", "not"]) builder[op] = filter(op);
      builder.or = (expr: string) => (call.filters.push(["or", expr, null]), builder);
      builder.order = () => builder;
      builder.limit = () => builder;
      builder.maybeSingle = async () => {
        const r = result();
        return { data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data, error: r.error };
      };
      builder.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
        Promise.resolve(result()).then(resolve, reject);
      return builder;
    },
  };
  return { admin: admin as unknown as SupabaseClient, calls };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {}).mockClear();
});

describe("parseLinkSummary", () => {
  it("names each category and puts the weakest judged one first", () => {
    const summary = parseLinkSummary({
      readiness: 64,
      readiness_day: "2026-09-12",
      categories: [
        { category_id: "signs", strength: 88, enough: true },
        { category_id: "rules", strength: 52, enough: true },
        { category_id: "controls", strength: 20, enough: false },
      ],
    });
    expect(summary?.readiness).toBe(64);
    expect(summary?.readinessDay).toBe("2026-09-12");
    expect(summary?.categories.map((c) => [c.name, c.strength])).toEqual([
      ["Rules of the road", 52],
      ["Road signs", 88],
      ["Vehicle controls", 20],
    ]);
  });

  it("drops anything malformed and answers null for nothing", () => {
    expect(parseLinkSummary(null)).toBeNull();
    const summary = parseLinkSummary({ readiness: null, categories: [{ category_id: 5 }, { strength: 40 }] });
    expect(summary).toEqual({ readiness: null, readinessDay: null, categories: [] });
  });
});

describe("pickLatestFocus", () => {
  it("takes the next focus from the most recent lesson that has one", () => {
    const lessons = [
      { id: "old", starts_at: "2026-09-01T08:00:00Z" },
      { id: "new", starts_at: "2026-09-10T08:00:00Z" },
    ];
    expect(
      pickLatestFocus(lessons, [
        { lesson_id: "old", next_focus: "Hill start" },
        { lesson_id: "new", next_focus: "  Parallel parking  " },
        { lesson_id: "stranger", next_focus: "Not this learner's" },
      ]),
    ).toEqual({ text: "Parallel parking", lessonAt: "2026-09-10T08:00:00Z" });
    expect(pickLatestFocus(lessons, [{ lesson_id: "new", next_focus: "   " }])).toBeNull();
  });
});

describe("linkedSchoolsFor", () => {
  const roster = {
    id: "roster-1",
    school_id: "school-1",
    licence_code: "8",
    assigned_instructor_id: "m-sipho",
    link_consent_at: "2026-09-05T09:00:00Z",
  };

  it("reads only shared notes, and never the cash book's references, notes or takers", async () => {
    const { admin, calls } = recordingAdmin({
      school_learners: { data: [roster] },
      schools: { data: [{ name: "Sipho's Driving School", timezone: "Africa/Johannesburg" }] },
      school_members: { data: [{ id: "m-sipho", display_name: "Sipho" }] },
      school_lessons: { data: [{ id: "l1", starts_at: "2026-09-10T08:00:00Z" }] },
      school_lesson_notes: { data: [{ lesson_id: "l1", next_focus: "Alley docking" }] },
      school_payments: { data: [{ learner_id: "roster-1", amount_cents: 20000, voided_at: null }] },
      school_packages: { data: [{ learner_id: "roster-1", price_cents: 50000, status: "active" }] },
    });

    const [view] = await linkedSchoolsFor(admin, "learner-user");

    const notes = calls.find((c) => c.table === "school_lesson_notes");
    expect(notes?.filters).toContainEqual(["eq", "learner_visible", true]);
    expect(notes?.columns).toBe("lesson_id, next_focus");
    for (const payments of calls.filter((c) => c.table === "school_payments")) {
      expect(payments.columns).not.toMatch(/reference|note|received_by|method/);
    }
    // Every school read is pinned to this learner's own roster row.
    for (const call of calls.filter((c) => ["school_lessons", "school_payments", "school_packages", "school_learner_progress"].includes(c.table))) {
      expect(call.filters).toContainEqual(["eq", "learner_id", "roster-1"]);
      expect(call.filters).toContainEqual(["eq", "school_id", "school-1"]);
    }

    expect(view).toMatchObject({
      rosterId: "roster-1",
      schoolName: "Sipho's Driving School",
      instructorName: "Sipho",
      nextFocus: { text: "Alley docking" },
      balanceCents: 30000,
    });
    expect(Object.keys(view).sort()).toEqual(
      [
        "balanceCents",
        "connectedAt",
        "instructorName",
        "manoeuvres",
        "nextFocus",
        "nextLesson",
        "rosterId",
        "schoolName",
        "timezone",
        "totalManoeuvres",
      ].sort(),
    );
  });

  it("only ever looks up roster rows linked to the signed-in user", async () => {
    const { admin, calls } = recordingAdmin({ school_learners: { data: [] } });
    expect(await linkedSchoolsFor(admin, "learner-user")).toEqual([]);
    expect(calls[0]).toMatchObject({ table: "school_learners" });
    expect(calls[0].filters).toEqual([["eq", "linked_user_id", "learner-user"]]);
  });

  it("reads as no school, quietly, before the link columns exist", async () => {
    for (const code of ["42703", "42P01", "PGRST205"]) {
      const { admin } = recordingAdmin({ school_learners: { data: null, error: { code, message: "missing" } } });
      expect(await linkedSchoolsFor(admin, "learner-user")).toEqual([]);
    }
    expect(console.error).not.toHaveBeenCalled();
  });
});
