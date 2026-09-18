import { describe, expect, it } from "vitest";
import { classifyDiaryError, diaryErrorMessage } from "@/lib/schools/diary-errors";
import { nextLesson, whatsappLink, type DiaryEntry } from "@/lib/schools/diary-types";

/**
 * The diary's pure logic. The database rules themselves are proven in
 * tests/school-isolation.test.ts against real Postgres; this covers what the
 * app layer does with the database's answers.
 */

describe("diary errors", () => {
  it("tells an instructor clash from a car clash by the constraint that fired", () => {
    expect(
      classifyDiaryError({
        code: "23P01",
        message: 'conflicting key value violates exclusion constraint "school_lessons_no_instructor_overlap"',
      }),
    ).toBe("instructor_clash");
    expect(
      classifyDiaryError({
        code: "23P01",
        message: 'conflicting key value violates exclusion constraint "school_lessons_no_vehicle_overlap"',
      }),
    ).toBe("vehicle_clash");
  });

  it("names each refusal in words an instructor can act on", () => {
    expect(diaryErrorMessage({ code: "42501", message: "new row violates row-level security policy" }, "x")).toMatch(
      /isn't allowed/,
    );
    expect(diaryErrorMessage({ code: "23503", message: "violates foreign key" }, "x")).toMatch(
      /isn't part of your school/,
    );
    expect(diaryErrorMessage({ code: "23P01", message: "no_vehicle_overlap" }, "x")).toMatch(
      /vehicle is already booked/,
    );
  });

  it("never shows Postgres text for an error it does not recognise", () => {
    expect(diaryErrorMessage({ code: "XX000", message: "internal error in relation 12345" }, "Could not book that lesson.")).toBe(
      "Could not book that lesson.",
    );
    expect(diaryErrorMessage(null, "fallback")).toBe("fallback");
  });
});

describe("whatsappLink", () => {
  it("turns a local SA number into the international form wa.me needs", () => {
    expect(whatsappLink("082 123 4567", "Hi")).toBe("https://wa.me/27821234567?text=Hi");
    expect(whatsappLink("+27 82 123 4567", "Hi")).toBe("https://wa.me/27821234567?text=Hi");
  });

  it("encodes the prefilled message", () => {
    expect(whatsappLink("0821234567", "Lesson at 14:00 & bring ID")).toBe(
      "https://wa.me/27821234567?text=Lesson%20at%2014%3A00%20%26%20bring%20ID",
    );
  });

  it("offers nothing rather than a broken link for a missing or short number", () => {
    expect(whatsappLink(null, "Hi")).toBeNull();
    expect(whatsappLink("12345", "Hi")).toBeNull();
  });
});

describe("nextLesson", () => {
  const entry = (id: string, starts: string, ends: string, status: DiaryEntry["status"] = "scheduled"): DiaryEntry => ({
    id,
    learner_id: "l",
    instructor_id: "i",
    vehicle_id: null,
    starts_at: starts,
    ends_at: ends,
    kind: "lesson",
    status,
    pickup_address: null,
    package_id: null,
    price_cents: null,
    learnerName: "Thabo",
    learnerPhone: null,
    instructorName: "Sipho",
    vehicleLabel: null,
  });
  const now = new Date("2026-09-18T10:30:00Z");

  it("picks the soonest booking still to come", () => {
    const lessons = [
      entry("later", "2026-09-20T08:00:00Z", "2026-09-20T09:00:00Z"),
      entry("sooner", "2026-09-19T08:00:00Z", "2026-09-19T09:00:00Z"),
    ];
    expect(nextLesson(lessons, now)?.id).toBe("sooner");
  });

  it("counts a lesson already under way until it ends", () => {
    const lessons = [entry("now", "2026-09-18T10:00:00Z", "2026-09-18T11:00:00Z")];
    expect(nextLesson(lessons, now)?.id).toBe("now");
  });

  it("ignores what already happened or was called off", () => {
    const lessons = [
      entry("past", "2026-09-17T08:00:00Z", "2026-09-17T09:00:00Z"),
      entry("cancelled", "2026-09-19T08:00:00Z", "2026-09-19T09:00:00Z", "cancelled_school"),
      entry("done", "2026-09-19T10:00:00Z", "2026-09-19T11:00:00Z", "completed"),
    ];
    expect(nextLesson(lessons, now)).toBeNull();
  });
});
