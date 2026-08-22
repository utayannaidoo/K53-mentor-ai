import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * The redirects `updateSession` actually emits, as opposed to the pure
 * destination helper next to it.
 *
 * This is the one hop in the ?next= chain that can't be driven from a browser
 * on a dev machine: the "already signed in and landed on an auth page" branch
 * needs a real Supabase session, and there is no .env here to mint one. So the
 * session is stubbed and the Location header asserted directly.
 */

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: () => getUser() } }),
}));

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: true,
  supabaseConfig: { url: "https://stub.supabase.co", anonKey: "stub-anon-key" },
  assertSupabaseConfiguredInProduction: () => {},
  assertSiteUrlConfiguredInProduction: () => {},
}));

const signedIn = { data: { user: { id: "user-1", email: "learner@test.com" } } };
const signedOut = { data: { user: null } };

const go = async (path: string) => {
  const { updateSession } = await import("@/lib/supabase/middleware");
  const res = await updateSession(new NextRequest(`https://k53.test${path}`));
  return { status: res.status, location: res.headers.get("location") };
};

beforeEach(() => vi.clearAllMocks());

describe("middleware redirects", () => {
  it("bounces a signed-out visitor off a protected page, remembering the page", () => {
    getUser.mockResolvedValue(signedOut);
    return expect(go("/licence-prep")).resolves.toEqual({
      status: 307,
      location: "https://k53.test/login?next=%2Flicence-prep",
    });
  });

  it("remembers the query string too, not just the path", () => {
    // A bounce from /study/questions?category=signs that dropped "?category=
    // signs" returned the learner after login to the unfiltered top of the
    // page — whatever they had actually selected was gone.
    getUser.mockResolvedValue(signedOut);
    return expect(go("/study/questions?category=signs")).resolves.toEqual({
      status: 307,
      location: "https://k53.test/login?next=%2Fstudy%2Fquestions%3Fcategory%3Dsigns",
    });
  });

  it("routes a signed-in visitor's ?next= through /continue", async () => {
    // The consistency fix: this used to drop ?next= and send everyone to
    // /dashboard, so the server path silently disagreed with the client one.
    // /continue rather than the page itself, because only /continue can see
    // whether this account has finished onboarding.
    getUser.mockResolvedValue(signedIn);
    await expect(go("/login?next=%2Flicence-prep")).resolves.toEqual({
      status: 307,
      location: "https://k53.test/continue?next=%2Flicence-prep",
    });
  });

  it("still sends a signed-in visitor with no ?next= to the dashboard", async () => {
    getUser.mockResolvedValue(signedIn);
    await expect(go("/login")).resolves.toEqual({
      status: 307,
      location: "https://k53.test/dashboard",
    });
  });

  it("refuses an off-site ?next= at the edge", async () => {
    getUser.mockResolvedValue(signedIn);
    await expect(go("/login?next=%2F%2Fevil.com")).resolves.toEqual({
      status: 307,
      location: "https://k53.test/dashboard",
    });
  });

  it("leaves a signed-out visitor on the auth page", async () => {
    getUser.mockResolvedValue(signedOut);
    await expect(go("/login?next=%2Fdashboard")).resolves.toEqual({
      status: 200,
      location: null,
    });
  });
});
