import { describe, expect, it } from "vitest";
import {
  clockTime,
  dayBounds,
  isClockTime,
  isIsoDay,
  offsetMinutes,
  schoolDay,
  shiftDay,
  zonedInstant,
} from "@/lib/schools/time";

/**
 * The server renders in UTC; the school lives in UTC+2. Each case here is a
 * way the diary would be quietly wrong for two hours a day.
 */
describe("school time", () => {
  it("knows Johannesburg is two hours ahead", () => {
    expect(offsetMinutes(new Date("2026-09-18T12:00:00Z"), "Africa/Johannesburg")).toBe(120);
  });

  it("rolls 'today' over at the school's midnight, not the server's", () => {
    // 23:30 UTC on the 17th is already 01:30 on the 18th in Johannesburg.
    expect(schoolDay(new Date("2026-09-17T23:30:00Z"))).toBe("2026-09-18");
    expect(schoolDay(new Date("2026-09-17T21:30:00Z"))).toBe("2026-09-17");
  });

  it("turns a wall-clock booking into the right instant", () => {
    expect(zonedInstant("2026-09-18", "14:00").toISOString()).toBe("2026-09-18T12:00:00.000Z");
    expect(zonedInstant("2026-09-18", "00:30").toISOString()).toBe("2026-09-17T22:30:00.000Z");
  });

  it("stays correct in a timezone with daylight saving", () => {
    // London, the day the clocks go forward: 09:00 is BST (UTC+1).
    expect(zonedInstant("2026-03-29", "09:00", "Europe/London").toISOString()).toBe(
      "2026-03-29T08:00:00.000Z",
    );
  });

  it("bounds a school day by its own midnights", () => {
    const { start, end } = dayBounds("2026-09-18");
    expect(start.toISOString()).toBe("2026-09-17T22:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-18T22:00:00.000Z");
  });

  it("shows a stored instant on the school's clock", () => {
    expect(clockTime("2026-09-18T12:00:00Z")).toBe("14:00");
    expect(clockTime("2026-09-17T22:15:00Z")).toBe("00:15");
  });

  it("walks the calendar across month and year ends", () => {
    expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("rejects days and times that do not exist", () => {
    expect(isIsoDay("2026-09-18")).toBe(true);
    expect(isIsoDay("2026-02-30")).toBe(false);
    expect(isIsoDay("18/09/2026")).toBe(false);
    expect(isIsoDay(null)).toBe(false);
    expect(isClockTime("09:30")).toBe(true);
    expect(isClockTime("24:00")).toBe(false);
    expect(isClockTime("9:30")).toBe(false);
  });
});

describe("longDay", () => {
  it("reads the way a person writes a date: no padded day, with a comma", async () => {
    const { longDay } = await import("@/lib/schools/time");
    expect(longDay("2026-09-18")).toBe("Friday, 18 September");
    expect(longDay("2020-01-01")).toBe("Wednesday, 1 January");
  });
});
