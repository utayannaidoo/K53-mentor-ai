import { describe, expect, it } from "vitest";
import { isDueToday, isTestDocument, passRate, type Enquiry, type TestResult } from "@/lib/schools/test-day";

const enquiry = (over: Partial<Enquiry>): Enquiry => ({
  id: "e",
  name: "Lindiwe",
  phone: null,
  email: null,
  source: "whatsapp",
  licence_code: null,
  message: null,
  status: "new",
  next_follow_up_on: null,
  converted_learner_id: null,
  created_at: "2026-09-17T08:00:00Z",
  ...over,
});

const result = (over: Partial<TestResult>): TestResult => ({
  id: "r",
  learner_id: "l",
  test_type: "drivers",
  taken_on: "2026-09-01",
  centre: null,
  result: "passed",
  instructor_id: null,
  notes: null,
  ...over,
});

describe("who to call back today", () => {
  const today = "2026-09-18";

  it("puts every new enquiry on today's list", () => {
    expect(isDueToday(enquiry({ status: "new" }), today)).toBe(true);
  });

  it("brings a contacted enquiry back on its follow-up date, not before", () => {
    expect(isDueToday(enquiry({ status: "contacted", next_follow_up_on: "2026-09-18" }), today)).toBe(true);
    expect(isDueToday(enquiry({ status: "contacted", next_follow_up_on: "2026-09-10" }), today)).toBe(true);
    expect(isDueToday(enquiry({ status: "contacted", next_follow_up_on: "2026-09-25" }), today)).toBe(false);
    // Contacted with no date set is a loose end — show it rather than lose it.
    expect(isDueToday(enquiry({ status: "contacted", next_follow_up_on: null }), today)).toBe(true);
  });

  it("drops an enquiry once it's booked or lost", () => {
    expect(isDueToday(enquiry({ status: "booked" }), today)).toBe(false);
    expect(isDueToday(enquiry({ status: "lost" }), today)).toBe(false);
  });
});

describe("pass rate", () => {
  it("counts every attempt, so two fails and a pass is one in three", () => {
    const results = [
      result({ id: "1", result: "failed", taken_on: "2026-08-01" }),
      result({ id: "2", result: "failed", taken_on: "2026-08-15" }),
      result({ id: "3", result: "passed", taken_on: "2026-09-01" }),
    ];
    const rate = passRate(results, "2026-06-01");
    expect(rate.passed).toBe(1);
    expect(rate.attempts).toBe(3);
    expect(rate.rate).toBeCloseTo(1 / 3);
  });

  it("only counts the window and the test asked for", () => {
    const results = [
      result({ id: "old", result: "failed", taken_on: "2026-01-01" }),
      result({ id: "learners", test_type: "learners", result: "failed", taken_on: "2026-09-01" }),
      result({ id: "recent", result: "passed", taken_on: "2026-09-02" }),
    ];
    expect(passRate(results, "2026-06-01")).toEqual({ passed: 1, attempts: 1, rate: 1 });
    expect(passRate(results, "2026-06-01", "learners")).toEqual({ passed: 0, attempts: 1, rate: 0 });
  });

  it("has no rate — not 0% — when nobody has tested yet", () => {
    expect(passRate([], "2026-06-01").rate).toBeNull();
  });
});

describe("test-day documents", () => {
  it("accepts only the fixed checklist the database allows", () => {
    expect(isTestDocument("eye_test")).toBe(true);
    expect(isTestDocument("passport")).toBe(false);
  });
});
