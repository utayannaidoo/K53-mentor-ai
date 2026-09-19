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
    expect(dest("ref=abc")).toEqual({ pathname: "/dashboard", search: "" });
  });

  it("carries a ?next= through /continue rather than straight to the page", () => {
    // Someone bounced off a protected page, who then signed in elsewhere and
    // reloaded the bounced URL, still asked for that page. It routes via
    // /continue because the middleware runs server-side and cannot see whether
    // this account has finished onboarding — /continue can, and gates it the
    // same way the password and OAuth paths are gated.
    expect(dest("next=/study/mock-exam&ref=abc")).toEqual({
      pathname: "/continue",
      search: "?next=%2Fstudy%2Fmock-exam",
    });
    expect(dest("next=/licence-prep")).toEqual({
      pathname: "/continue",
      search: "?next=%2Flicence-prep",
    });
  });

  it("sends a school workspace ?next= straight there, not through learner onboarding", () => {
    // /continue gates on learner onboarding. A driving-school owner has no
    // reason to finish learner onboarding, and the school area has its own
    // membership gate, so routing them via /continue would strand them.
    expect(dest("next=/schools")).toEqual({ pathname: "/schools", search: "" });
    expect(dest("next=/schools/settings")).toEqual({
      pathname: "/schools/settings",
      search: "",
    });
    // The query string must land in `search`, never inside `pathname`, or the
    // redirect URL gets its `?` percent-encoded into the path.
    expect(dest("next=%2Fschools%2Fdiary%3Fday%3D2026-09-18")).toEqual({
      pathname: "/schools/diary",
      search: "?day=2026-09-18",
    });
  });

  it("does not treat a path that merely starts with the letters 'schools' as the workspace", () => {
    // `/schoolsfoo` is not `/schools/...` — it must take the ordinary route.
    expect(dest("next=/schoolsfoo")).toEqual({
      pathname: "/continue",
      search: "?next=%2Fschoolsfoo",
    });
  });

  it("still prefers a purchase intent over wherever they were bounced from", () => {
    expect(dest("plan=premium&next=/study/mock-exam")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
  });

  it("refuses a ?next= that would send them off-site", () => {
    expect(dest("next=//evil.com")).toEqual({ pathname: "/dashboard", search: "" });
    expect(dest("next=https://evil.com")).toEqual({ pathname: "/dashboard", search: "" });
    expect(dest("next=/\\evil.com")).toEqual({ pathname: "/dashboard", search: "" });
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
