import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-next";

describe("?next= validation", () => {
  it("accepts the same-site paths the middleware actually sets", () => {
    // updateSession bounces protected routes with ?next=<pathname>.
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/licence-prep")).toBe("/licence-prep");
    expect(safeNextPath("/study/mock-exam")).toBe("/study/mock-exam");
    expect(safeNextPath("/account/billing")).toBe("/account/billing");
  });

  it("keeps a query string and fragment on the way through", () => {
    expect(safeNextPath("/study/questions?category=signs")).toBe(
      "/study/questions?category=signs",
    );
    expect(safeNextPath("/dashboard#today")).toBe("/dashboard#today");
  });

  it("refuses anything that could leave the site", () => {
    // The open-redirect cases. "//evil.com" is the dangerous one — browsers
    // resolve it against the current scheme and send the user off-site.
    expect(safeNextPath("//evil.com")).toBe(null);
    expect(safeNextPath("///evil.com")).toBe(null);
    expect(safeNextPath("https://evil.com")).toBe(null);
    expect(safeNextPath("http://evil.com")).toBe(null);
    expect(safeNextPath("javascript:alert(1)")).toBe(null);
    // Backslash variants, which some browsers normalise into "//".
    expect(safeNextPath("/\\evil.com")).toBe(null);
    expect(safeNextPath("\\\\evil.com")).toBe(null);
  });

  it("refuses a path that is not relative at all", () => {
    expect(safeNextPath("dashboard")).toBe(null);
    expect(safeNextPath("")).toBe(null);
    expect(safeNextPath(null)).toBe(null);
    expect(safeNextPath(undefined)).toBe(null);
  });

  it("refuses auth pages, which are never a post-auth destination", () => {
    // Sending a freshly signed-in user to /login just bounces them off the
    // middleware again.
    expect(safeNextPath("/login")).toBe(null);
    expect(safeNextPath("/signup")).toBe(null);
    expect(safeNextPath("/login?next=/dashboard")).toBe(null);
    // Not a blanket prefix ban — these are real pages.
    expect(safeNextPath("/login-help")).toBe("/login-help");
  });
});
