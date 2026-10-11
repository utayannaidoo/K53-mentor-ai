import { describe, expect, it } from "vitest";
import { SITE_DOMAIN, SITE_URL } from "@/lib/constants";
import { buildPassport } from "@/lib/share/passport";
import { computeReadiness } from "@/lib/diagnostic/scoring";
import { defaultUserState } from "@/lib/store/local-store";

/**
 * Links meant to leave the app must name the canonical site.
 *
 * Anything a learner copies into WhatsApp outlives the session that produced
 * it, so it cannot be built from `window.location.origin`: that resolves to
 * whatever host the sharer happened to be on, and on a Vercel preview that is
 * a deploy-scoped URL that dies with the branch.
 */
describe("links that leave the app", () => {
  it("the passport prints the canonical domain", () => {
    const state = defaultUserState();
    const readiness = computeReadiness(state);

    const plain = buildPassport(state, readiness, {});
    expect(plain.link).toBe(SITE_DOMAIN);
  });

  it("keeps the bare domain and the full URL in step", () => {
    // SITE_DOMAIN is derived from SITE_URL rather than written out twice — the
    // hardcoded version drifted once already, and the share image spent months
    // pointing at a domain the project does not own.
    expect(SITE_URL).toContain(SITE_DOMAIN);
    expect(SITE_DOMAIN).not.toMatch(/^https?:\/\//);
    expect(SITE_DOMAIN).not.toMatch(/\/$/);
  });
});
