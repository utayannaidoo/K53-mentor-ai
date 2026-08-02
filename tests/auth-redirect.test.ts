import { describe, expect, it } from "vitest";
import { signedInAuthPageDest } from "@/lib/supabase/middleware";
import { shouldAuthPageSelfRedirect } from "@/lib/auth/auth-page-redirect";

const dest = (qs: string) => signedInAuthPageDest(new URLSearchParams(qs));

describe("signed-in user on an auth page", () => {
  it("carries a pricing CTA through to checkout instead of the dashboard", () => {
    // The landing/pricing cards are statically rendered, so they always link to
    // /signup?plan=… — even for someone already signed in. Losing the plan here
    // means the warmest possible buyer lands on a page that can't sell to them.
    expect(dest("plan=premium&cycle=monthly")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
    expect(dest("plan=premium_plus&cycle=annual")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium_plus&cycle=annual",
    });
  });

  it("defaults the cycle to monthly when it is missing or junk", () => {
    expect(dest("plan=premium")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
    expect(dest("plan=premium&cycle=weekly")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
  });

  it("ignores an unknown plan rather than sending it to checkout", () => {
    expect(dest("plan=enterprise")).toEqual({ pathname: "/dashboard", search: "" });
    expect(dest("plan=free")).toEqual({ pathname: "/dashboard", search: "" });
  });

  it("sends an ordinary signed-in visitor to the dashboard with a clean URL", () => {
    expect(dest("")).toEqual({ pathname: "/dashboard", search: "" });
    expect(dest("next=/study/mock-exam&ref=abc")).toEqual({ pathname: "/dashboard", search: "" });
  });
});

describe("auth page self-redirect", () => {
  it("never fires in production, however signed-in the local store looks", () => {
    // The regression this guards: a stale localStorage profile with no Supabase
    // cookie (iOS Safari evicts the cookie after ~7 days, ITP) sent /login to
    // /continue, which sent /dashboard, which the middleware sent back to
    // /login — ~180 history.replaceState calls a second. WebKit throws past 100
    // per 10s, so the phone landed on Next's client-exception screen.
    expect(
      shouldAuthPageSelfRedirect({ ready: true, isAuthed: true, supabaseConfigured: true }),
    ).toBe(false);
  });

  it("still fires in demo mode, where no middleware can do it instead", () => {
    expect(
      shouldAuthPageSelfRedirect({ ready: true, isAuthed: true, supabaseConfigured: false }),
    ).toBe(true);
  });

  it("waits for the local store before deciding anything", () => {
    // Pre-hydration `isAuthed` is false for everyone, so redirecting on it
    // would be a guess rather than a fact.
    expect(
      shouldAuthPageSelfRedirect({ ready: false, isAuthed: true, supabaseConfigured: false }),
    ).toBe(false);
  });

  it("leaves a signed-out visitor on the form", () => {
    expect(
      shouldAuthPageSelfRedirect({ ready: true, isAuthed: false, supabaseConfigured: false }),
    ).toBe(false);
    expect(
      shouldAuthPageSelfRedirect({ ready: true, isAuthed: false, supabaseConfigured: true }),
    ).toBe(false);
  });
});
