import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SIGN_PAGES } from "@/lib/content/sign-pages";
import {
  INFORMATION_GROUP,
  signCategoryPageBySlug,
  signRedirects,
  signsInGroup,
} from "@/lib/content/sign-category-pages";
import nextConfig from "../next.config.mjs";

const ROOT = path.resolve(__dirname, "..");
const committed: Record<string, string> = JSON.parse(
  readFileSync(path.join(ROOT, "src/lib/content/sign-redirects.json"), "utf8"),
);

/**
 * The 151 retired single-sign URLs, /road-signs/<slug>.
 *
 * next.config.mjs redirects them from a generated JSON file, because a config
 * file cannot import the TypeScript that knows where each sign now lives. If
 * the two drift, a sign's old URL 404s (sign added or renamed) or lands on an
 * anchor that isn't there (sign moved). Either fails quietly in production.
 */
describe("retired single-sign URLs", () => {
  it("sign-redirects.json matches the signs (fix: node scripts/sign-redirects.mjs)", () => {
    expect(committed).toEqual(signRedirects());
  });

  it("covers every verified sign", () => {
    expect(Object.keys(committed).sort()).toEqual(SIGN_PAGES.map((p) => p.slug).sort());
  });

  it("each lands on an anchor that its page renders", () => {
    for (const [slug, destination] of Object.entries(committed)) {
      const [pathname, anchor] = destination.split("#");
      expect(anchor, destination).toBe(slug);
      const group =
        pathname === "/road-signs"
          ? INFORMATION_GROUP
          : signCategoryPageBySlug(pathname.replace("/road-signs/", ""));
      expect(group, destination).toBeDefined();
      const shown = signsInGroup(group!).flatMap((g) => g.signs.map((s) => s.slug));
      expect(shown, destination).toContain(slug);
    }
  });

  it("next.config.mjs redirects each one permanently", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const bySource = new Map(redirects.map((r) => [r.source, r]));
    for (const [slug, destination] of Object.entries(committed)) {
      const rule = bySource.get(`/road-signs/${slug}`);
      expect(rule, slug).toMatchObject({ destination, permanent: true });
    }
  });
});
