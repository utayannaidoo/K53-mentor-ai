import { describe, expect, it } from "vitest";
import { canonicalOrigin, canonicalRedirect } from "@/lib/auth/canonical-host";
import { strandedAuthRedirect } from "@/lib/auth/stranded-callback";

/**
 * Both hosts served the app, which broke Google sign-in: the PKCE verifier was
 * written on `www.`, Supabase refused that un-allowlisted callback and fell
 * back to the Site URL, and the learner was dropped on the apex marketing page
 * with an unusable `?code=`. Clicking Google again — now on the apex host —
 * worked, so it read as "I have to log in twice".
 */

const SITE = "https://k53mentorai.co.za";

const redirect = (from: string, requestHost: string, origin = canonicalOrigin({ siteUrl: SITE, enforce: true })) =>
  canonicalRedirect({ url: new URL(from), requestHost, canonicalOrigin: origin })?.toString() ?? null;

describe("canonicalOrigin", () => {
  it("is the site origin on the production deployment", () => {
    expect(canonicalOrigin({ siteUrl: SITE, enforce: true })).toBe(SITE);
    // A trailing path in the env value must not become part of the origin.
    expect(canonicalOrigin({ siteUrl: `${SITE}/`, enforce: true })).toBe(SITE);
  });

  it("enforces nothing off the production deployment", () => {
    // Previews have no NEXT_PUBLIC_SITE_URL of their own and legitimately live
    // on vercel.app; local dev legitimately lives on localhost.
    expect(canonicalOrigin({ siteUrl: SITE, enforce: false })).toBeNull();
  });

  it("refuses to redirect the live site at localhost or a deploy URL", () => {
    // These are what a missing or mis-set NEXT_PUBLIC_SITE_URL looks like, and
    // acting on one would take the whole site down rather than mislabel it.
    for (const bad of [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://k53-mentor-ai.vercel.app",
      "https://k53-mentor-ai-git-main-someone.vercel.app",
      "not a url",
    ]) {
      expect(canonicalOrigin({ siteUrl: bad, enforce: true }), bad).toBeNull();
    }
  });
});

describe("canonicalRedirect", () => {
  it("moves a www. request to the apex host, path and query intact", () => {
    expect(redirect("https://www.k53mentorai.co.za/login?plan=premium", "www.k53mentorai.co.za")).toBe(
      "https://k53mentorai.co.za/login?plan=premium",
    );
  });

  it("moves the vercel.app deploy alias to the custom domain", () => {
    expect(redirect("https://k53-mentor-ai.vercel.app/dashboard", "k53-mentor-ai.vercel.app")).toBe(
      "https://k53mentorai.co.za/dashboard",
    );
  });

  it("leaves a request already on the canonical host alone", () => {
    // The loop-check: matching hosts must never produce a redirect.
    expect(redirect("https://k53mentorai.co.za/dashboard", "k53mentorai.co.za")).toBeNull();
    expect(redirect("https://k53mentorai.co.za/dashboard", "K53MentorAI.co.za")).toBeNull();
  });

  it("leaves every request alone when there is no origin to enforce", () => {
    expect(redirect("http://localhost:3000/login", "localhost:3000", null)).toBeNull();
  });

  it("serves the request rather than guess when no host header arrived", () => {
    expect(redirect("https://k53mentorai.co.za/login", "")).toBeNull();
  });
});

describe("strandedAuthRedirect", () => {
  it("forwards an auth code that Supabase dumped on the marketing page", () => {
    // The reported bug's landing spot. /continue is restored because the Site
    // URL fallback drops whatever `next` the flow asked for.
    expect(strandedAuthRedirect(new URL(`${SITE}/?code=abc123`))?.toString()).toBe(
      `${SITE}/auth/callback?code=abc123&next=%2Fcontinue`,
    );
  });

  it("forwards a cross-device token_hash link and a provider error", () => {
    expect(strandedAuthRedirect(new URL(`${SITE}/?token_hash=xyz&type=email`))?.pathname).toBe(
      "/auth/callback",
    );
    // Without this the user gets the marketing page and no idea what failed.
    expect(
      strandedAuthRedirect(new URL(`${SITE}/?error=access_denied&error_code=otp_expired`))?.pathname,
    ).toBe("/auth/callback");
  });

  it("keeps a next that the flow did manage to carry through", () => {
    expect(strandedAuthRedirect(new URL(`${SITE}/?code=abc&next=%2Faccount`))?.search).toBe(
      "?code=abc&next=%2Faccount",
    );
  });

  it("replaces a next that safeNextPath rejects", () => {
    // This URL is reachable by anyone, and /auth/callback acts on `next`.
    expect(
      strandedAuthRedirect(new URL(`${SITE}/?code=abc&next=https%3A%2F%2Fevil.com`))?.searchParams.get(
        "next",
      ),
    ).toBe("/continue");
  });

  it("ignores the home page without auth params, and every other path", () => {
    expect(strandedAuthRedirect(new URL(`${SITE}/`))).toBeNull();
    // A bare ?error= is not a Supabase auth failure — don't hijack it.
    expect(strandedAuthRedirect(new URL(`${SITE}/?error=whatever`))).toBeNull();
    // /pricing?code=SAVE20 is a coupon, not a session.
    expect(strandedAuthRedirect(new URL(`${SITE}/pricing?code=SAVE20`))).toBeNull();
    expect(strandedAuthRedirect(new URL(`${SITE}/auth/callback?code=abc`))).toBeNull();
  });
});
