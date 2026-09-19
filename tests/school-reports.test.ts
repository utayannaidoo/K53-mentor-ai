import { describe, expect, it } from "vitest";
import { lessonStats, mondayOf, percent, type LessonFact } from "@/lib/schools/reports";

const fact = (over: Partial<LessonFact>): LessonFact => ({
  instructor_id: "i",
  learner_id: "l",
  status: "completed",
  kind: "lesson",
  starts_at: "2026-09-15T08:00:00Z",
  ...over,
});

describe("lessonStats", () => {
  const from = "2026-09-14T00:00:00Z";
  const to = "2026-09-21T00:00:00Z";

  it("counts a no-show rate out of lessons that were due to happen", () => {
    const stats = lessonStats(
      [
        fact({ status: "completed" }),
        fact({ status: "completed" }),
        fact({ status: "completed" }),
        fact({ status: "no_show" }),
        fact({ status: "cancelled_learner" }),
        fact({ status: "scheduled" }),
      ],
      from,
      to,
    );
    expect(stats).toEqual({ taught: 3, noShows: 1, cancelled: 1, booked: 1, noShowRate: 0.25 });
  });

  it("never lets blocked time or the edges of the window in", () => {
    const stats = lessonStats(
      [
        fact({ kind: "block", status: "completed" }),
        fact({ starts_at: "2026-09-13T23:59:59Z" }), // just before
        fact({ starts_at: "2026-09-21T00:00:00Z" }), // exactly the end, which is excluded
        fact({ starts_at: "2026-09-14T00:00:00Z" }), // exactly the start, which is included
      ],
      from,
      to,
    );
    expect(stats.taught).toBe(1);
  });

  it("has no rate — not 0% — when no lesson was due", () => {
    expect(lessonStats([fact({ status: "scheduled" })], from, to).noShowRate).toBeNull();
  });
});

describe("mondayOf", () => {
  it("finds the Monday of the week, whichever day it is", () => {
    expect(mondayOf("2026-09-14")).toBe("2026-09-14"); // Monday
    expect(mondayOf("2026-09-18")).toBe("2026-09-14"); // Friday
    expect(mondayOf("2026-09-20")).toBe("2026-09-14"); // Sunday
    expect(mondayOf("2026-01-01")).toBe("2025-12-29"); // across a year
  });
});

describe("percent", () => {
  it("rounds a rate and shows a dash for nothing", () => {
    expect(percent(0.25)).toBe("25%");
    expect(percent(1 / 3)).toBe("33%");
    expect(percent(null)).toBe("—");
  });
});
