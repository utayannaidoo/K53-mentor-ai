import { describe, expect, it } from "vitest";
import {
  AuthApiError,
  AuthRetryableFetchError,
  AuthSessionMissingError,
  type AuthChangeEvent,
} from "@supabase/supabase-js";
import { shouldClearCachedProfile } from "@/lib/auth/session-absent";

const clear = (event: AuthChangeEvent, hasUser: boolean, error?: unknown) =>
  shouldClearCachedProfile({ event, hasUser, error });

describe("clearing a cached profile that outlived its session", () => {
  it("clears when the auth client reports no session at all", () => {
    // The iOS case: tracking prevention evicts the Supabase cookie after ~7
    // days but leaves localStorage alone, so the profile claims a session that
    // no longer exists. supabase-js drops the session itself on this error —
    // we are only keeping the local copy in step with it.
    expect(clear("INITIAL_SESSION", false, new AuthSessionMissingError())).toBe(true);
  });

  it("clears on an explicit sign-out", () => {
    expect(clear("SIGNED_OUT", false)).toBe(true);
    expect(clear("SIGNED_OUT", false, undefined)).toBe(true);
  });

  it("keeps the profile when a spent refresh token loses the Paystack race", () => {
    // Returning from the Paystack redirect, the middleware and this client race
    // for the same single-use refresh token. The loser gets an API error, not a
    // missing session — the session is alive. Clearing here is what once made a
    // plan change look like a sign-out.
    expect(
      clear("INITIAL_SESSION", false, new AuthApiError("Invalid Refresh Token: Already Used", 400, "refresh_token_already_used")),
    ).toBe(false);
  });

  it("keeps the profile when the network is down", () => {
    expect(
      clear("INITIAL_SESSION", false, new AuthRetryableFetchError("Failed to fetch", 0)),
    ).toBe(false);
  });

  it("keeps the profile on any unrecognised failure", () => {
    // The fallback is deliberately the old behaviour: a signal we fail to
    // recognise leaves us where we already were rather than signing someone out.
    expect(clear("INITIAL_SESSION", false, new Error("boom"))).toBe(false);
    expect(clear("INITIAL_SESSION", false, "something odd")).toBe(false);
    expect(clear("INITIAL_SESSION", false, null)).toBe(false);
    expect(clear("INITIAL_SESSION", false)).toBe(false);
    expect(clear("TOKEN_REFRESHED", false)).toBe(false);
  });

  it("never clears while a user is present, whatever else is going on", () => {
    expect(clear("SIGNED_IN", true)).toBe(false);
    expect(clear("SIGNED_OUT", true)).toBe(false);
    expect(clear("INITIAL_SESSION", true, new AuthSessionMissingError())).toBe(false);
  });
});
