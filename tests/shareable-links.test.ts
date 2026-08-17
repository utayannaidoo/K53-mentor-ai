import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SITE_DOMAIN, SITE_URL } from "@/lib/constants";
import { buildPassport } from "@/lib/share/passport";
import { computeReadiness } from "@/lib/diagnostic/scoring";
import { defaultUserState } from "@/lib/store/local-store";

const ROOT = path.resolve(__dirname, "..");

/**
 * Links meant to leave the app must name the canonical site.
 *
 * Anything a learner copies into WhatsApp outlives the session that produced
 * it, so it cannot be built from `window.location.origin`: that resolves to
 * whatever host the sharer happened to be on. On a Vercel preview it is a
 * deploy-scoped URL that dies with the branch — the invite card shipped exactly
 * that, handing friends a link to `k53-mentor-ai-git-claude-sha-398cfd-…`.
 *
 * This is a source scan rather than a render test because the failure is in how
 * the string is *built*, and it typechecks, renders and works perfectly for
 * whoever wrote it — they were on the right host at the time.
 *
 * Auth redirects are deliberately not covered. `auth-form.tsx` and
 * `reset-password/page.tsx` must keep using the live origin: an OAuth callback
 * has to return to the host the user is actually on, and Supabase allowlists
 * those per environment.
 */
const OUTBOUND_SOURCES = ["src/components/account/invite-card.tsx"];

describe("links that leave the app", () => {
  for (const file of OUTBOUND_SOURCES) {
    it(`${file} builds its link from the canonical site, not the current origin`, () => {
      const source = readFileSync(path.join(ROOT, file), "utf8");
      const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
      expect(code).not.toContain("location.origin");
      expect(code).toContain("SITE_URL");
    });
  }

  it("the passport prints the canonical domain, with and without a referral code", () => {
    const state = defaultUserState();
    const readiness = computeReadiness(state);

    const plain = buildPassport(state, readiness, {});
    expect(plain.link).toBe(SITE_DOMAIN);

    const referred = buildPassport(state, readiness, { referralCode: "AB12" });
    expect(referred.link).toBe(`${SITE_DOMAIN}/signup?ref=AB12`);
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
