import { describe, expect, it } from "vitest";
import { shouldShowSessionDisagreement } from "@/lib/auth/session-disagreement";

describe("shouldShowSessionDisagreement", () => {
  it("fires when a bounced visitor holds a local session in production", () => {
    // The regression: sign in, land back on /login, bare form, no explanation.
    // A ?next= proves the middleware bounced here; a local session proves this
    // browser just signed in — so the session isn't reaching the server.
    expect(
      shouldShowSessionDisagreement({
        supabaseConfigured: true,
        hasNext: true,
        hasLocalSession: true,
      }),
    ).toBe(true);
  });

  it("stays silent on a plain /login visit, even with a session around", () => {
    // Without a bounce there is nothing to explain — and this also keeps the
    // middleware-timeout fail-open case (valid session, served form) quiet
    // until a real bounce happens.
    expect(
      shouldShowSessionDisagreement({
        supabaseConfigured: true,
        hasNext: false,
        hasLocalSession: true,
      }),
    ).toBe(false);
  });

  it("stays silent for a genuinely signed-out bounce", () => {
    // Expired session, shared device, first visit via a bookmarked ?next= URL:
    // no local session means re-authenticating is the whole answer, and the
    // plain form already says that.
    expect(
      shouldShowSessionDisagreement({
        supabaseConfigured: true,
        hasNext: true,
        hasLocalSession: false,
      }),
    ).toBe(false);
  });

  it("never fires in demo mode, where no server session exists to disagree with", () => {
    expect(
      shouldShowSessionDisagreement({
        supabaseConfigured: false,
        hasNext: true,
        hasLocalSession: true,
      }),
    ).toBe(false);
  });
});
