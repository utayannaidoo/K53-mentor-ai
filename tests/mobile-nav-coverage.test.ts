import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Every section in the app shell's nav must be reachable on a phone.
 *
 * The sidebar that renders `NAV` is `hidden md:flex`, so on mobile the bottom
 * bar is the *only* nav. It used to render a hand-filtered subset, which left
 * `/licence-prep` — and `/eye-test`, which is only ever linked from it — with
 * no entry point at all below 768px: the links existed in the DOM but inside a
 * `display: none` sidebar.
 *
 * This regresses silently. Both navs typecheck, both render, and anyone
 * reviewing on a laptop sees the full list.
 */

const SHELL = path.resolve(__dirname, "../src/components/app/app-shell.tsx");
const src = readFileSync(SHELL, "utf8");

/** The nav list itself, so a renamed or added section is covered automatically. */
function navHrefs(): string[] {
  const block = src.match(/const NAV: NavItem\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
  return [...block.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** The identifier the mobile bar (`md:hidden`) maps over. */
function mobileSource(): string | undefined {
  const bar = src.slice(src.indexOf("md:hidden"));
  return bar.match(/\{(\w+)\.map\(/)?.[1];
}

describe("mobile bottom nav covers every section", () => {
  it("reads a nav list with the known sections", () => {
    const hrefs = navHrefs();
    expect(hrefs.length).toBeGreaterThanOrEqual(6);
    expect(hrefs).toContain("/licence-prep");
  });

  it("renders the whole list, not a subset", () => {
    expect(
      mobileSource(),
      "The mobile bar must map NAV. Mapping a filtered subset strands whatever " +
        "it drops — the sidebar is display:none on mobile, so there is no other way in.",
    ).toBe("NAV");
  });

  it("keeps no filtered copy of the nav around", () => {
    const filtered = [...src.matchAll(/const (\w+)\s*=\s*NAV\.filter\(/g)].map((m) => m[1]);
    expect(
      filtered,
      `Filtered nav lists drop sections silently: ${filtered.join(", ")}`,
    ).toEqual([]);
  });

  it("gives every section a label that fits a six-cell bar", () => {
    const block = src.match(/const NAV: NavItem\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
    const tooLong: string[] = [];
    for (const line of block.split("\n")) {
      const label = line.match(/\bshortLabel:\s*"([^"]+)"/)?.[1] ?? line.match(/\blabel:\s*"([^"]+)"/)?.[1];
      // ~8 characters is what a 53px cell holds at 12px — the width each of six
      // tabs gets on a 320px phone.
      if (label && label.length > 8) tooLong.push(label);
    }
    expect(
      tooLong,
      `These ellipsize on a narrow phone — give them a shortLabel: ${tooLong.join(", ")}`,
    ).toEqual([]);
  });
});
