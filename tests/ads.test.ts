import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { publicVisitorSeesAds, shellPlacesAd } from "@/lib/ads";

const ROOT = path.resolve(__dirname, "..");
const source = (file: string) => readFileSync(path.join(ROOT, file), "utf8");

describe("shellPlacesAd", () => {
  it("covers the busiest app pages that have no slot of their own", () => {
    for (const route of [
      "/dashboard",
      "/dashboard/progress",
      "/study",
      "/study/signs",
      "/study/controls",
      "/licence-prep",
      "/licence-prep/yard-test",
    ]) {
      expect(shellPlacesAd(route), route).toBe(true);
    }
  });

  it("leaves the funnel, the tutor and billing alone", () => {
    for (const route of [
      "/tutor",
      "/account",
      "/account/billing",
      "/onboarding",
      "/welcome",
      "/continue",
      "/eye-test",
    ]) {
      expect(shellPlacesAd(route), route).toBe(false);
    }
  });

  it("leaves session screens to place their own, including mock results", () => {
    for (const route of [
      "/study/questions",
      "/study/flashcards",
      "/study/scenarios",
      "/study/mock-exam",
    ]) {
      expect(shellPlacesAd(route), route).toBe(false);
    }
  });

  it("matches whole path segments, not prefixes of a word", () => {
    expect(shellPlacesAd("/accounting")).toBe(true);
  });
});

/**
 * A page can lose its ad in complete silence: nothing else fails, and the money
 * just stops. Each entry here is a page learners use most (PostHog pageviews,
 * Nov 2026) or a screen standing in for one.
 */
describe("the most-used pages keep a placement", () => {
  it.each([
    ["src/app/(app)/study/page.tsx", "AdSlot"],
    ["src/components/app/app-shell.tsx", "AdSlot"],
    ["src/components/study/question-practice.tsx", "AdSlot"],
    ["src/components/study/flashcard-deck.tsx", "AdSlot"],
    ["src/components/study/scenario-player.tsx", "AdSlot"],
    ["src/components/study/mock-exam.tsx", "AdSlot"],
    ["src/app/page.tsx", "PublicAdSlot"],
    ["src/components/landing/legal-page.tsx", "PublicAdSlot"],
    ["src/app/road-signs/page.tsx", "PublicAdSlot"],
    ["src/app/k53-questions/[category]/page.tsx", "PublicAdSlot"],
  ])("%s renders %s", (file, slot) => {
    expect(source(file)).toContain(`<${slot}`);
  });

  it("keeps ads off the templated single-sign pages", () => {
    // 151 pages from one template, each mostly shared text. AdSense's guidance
    // is no ad code on auto-generated pages with little original content, and
    // its crawler reads these whether or not they say noindex. The library at
    // /road-signs keeps its slot. Put one back here only once each sign page
    // stands on its own content.
    expect(source("src/app/road-signs/[slug]/page.tsx")).not.toContain("PublicAdSlot");
  });

  it("gives each route its own shell ad, so moving around a section earns a new one", () => {
    expect(source("src/components/app/app-shell.tsx")).toContain("<AdSlot key={pathname}");
  });

  it("keeps the study store out of what public pages import", () => {
    for (const file of ["src/components/ads/ad-unit.tsx", "src/components/ads/public-ad-slot.tsx"]) {
      expect(source(file), file).not.toContain("use-study-store");
    }
  });
});

describe("publicVisitorSeesAds", () => {
  const blob = (tier: string) => JSON.stringify({ tier, profile: { id: "u1" } });

  it("shows ads to a stranger", () => {
    expect(publicVisitorSeesAds(null, "")).toBe(true);
    expect(publicVisitorSeesAds(null, "ph_session=abc; theme=dark")).toBe(true);
  });

  it("follows the plan this browser has cached", () => {
    expect(publicVisitorSeesAds(blob("free"), "")).toBe(true);
    expect(publicVisitorSeesAds(blob("premium"), "")).toBe(false);
    expect(publicVisitorSeesAds(blob("premium_plus"), "")).toBe(false);
  });

  it("trusts a cached plan over the session cookie", () => {
    expect(publicVisitorSeesAds(blob("free"), "sb-abc-auth-token=x")).toBe(true);
    expect(publicVisitorSeesAds(blob("premium"), "sb-abc-auth-token=x")).toBe(false);
  });

  it("shows nothing to someone signed in whose plan this browser has not seen", () => {
    expect(publicVisitorSeesAds(null, "sb-abc-auth-token=x")).toBe(false);
    expect(publicVisitorSeesAds(null, "theme=dark; sb-abc-auth-token.0=x; sb-abc-auth-token.1=y")).toBe(
      false,
    );
  });

  it("does not mistake a half-finished sign-in for a session", () => {
    expect(publicVisitorSeesAds(null, "sb-abc-auth-token-code-verifier=x")).toBe(true);
  });

  it("survives a corrupt or foreign state blob", () => {
    for (const bad of ["{not json", "null", "[]", '{"tier":"gold"}', '{"tier":7}']) {
      expect(publicVisitorSeesAds(bad, ""), bad).toBe(true);
      expect(publicVisitorSeesAds(bad, "sb-abc-auth-token=x"), bad).toBe(false);
    }
  });
});
