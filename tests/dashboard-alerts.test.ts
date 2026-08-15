import { describe, expect, it } from "vitest";
import { ALERT_PRIORITY, topAlert } from "@/lib/dashboard/alerts";

/**
 * The dashboard used to render its banners as independent siblings, each
 * deciding on its own whether it applied. Nothing stopped four being true at
 * once, and on that day the learner scrolled past four boxes to reach a single
 * thing they could do.
 */

describe("the dashboard interrupts you about one thing", () => {
  it("shows nothing when nothing applies", () => {
    expect(topAlert({})).toBeNull();
    expect(topAlert({ cram: false, comeback: false })).toBeNull();
  });

  it("puts an imminent test above everything else", () => {
    // "Your test is tomorrow" and "take your diagnostic" are advice for two
    // different people. Showing both says neither.
    expect(topAlert({ cram: true, "trial-ended": true, diagnostic: true, comeback: true })).toBe(
      "cram",
    );
  });

  it("falls through the ranking as the urgent ones clear", () => {
    expect(topAlert({ "trial-ended": true, diagnostic: true, comeback: true })).toBe("trial-ended");
    expect(topAlert({ diagnostic: true, comeback: true })).toBe("diagnostic");
    expect(topAlert({ comeback: true })).toBe("comeback");
  });

  it("ranks every alert it knows about, with no duplicates", () => {
    // A sixth banner added without a rank would be silently unreachable.
    expect(new Set(ALERT_PRIORITY).size).toBe(ALERT_PRIORITY.length);
    for (const alert of ALERT_PRIORITY) {
      expect(topAlert({ [alert]: true }), `${alert} must be reachable on its own`).toBe(alert);
    }
  });
});
