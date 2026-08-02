import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * No publicly-reachable page may link into an auth-gated route.
 *
 * A signed-out visitor who taps one gets a blank frame and then a login screen
 * they never asked for — and the worst case is organic search traffic, which
 * lands on a guide, taps the in-body CTA, and bounces straight off an auth wall
 * it had no reason to expect. That is the whole point of the guides.
 *
 * This regresses silently: the link typechecks, renders, and works perfectly
 * for whoever added it, because they were signed in.
 */

const ROOT = path.resolve(__dirname, "..");

/** Everything a signed-out visitor can reach without an account. */
const PUBLIC_SOURCES = [
  "src/app/page.tsx",
  "src/app/not-found.tsx",
  "src/app/guides",
  "src/app/pricing",
  "src/app/privacy",
  "src/app/terms",
  "src/app/refunds",
  "src/app/sources",
  "src/components/landing",
];

function walk(target: string): string[] {
  const full = path.join(ROOT, target);
  if (!statSync(full).isDirectory()) return [full];
  return readdirSync(full).flatMap((entry) => walk(path.join(target, entry)));
}

/** The gated prefixes, read from the middleware so the two can't drift. */
function protectedRoutes(): string[] {
  const mw = readFileSync(path.join(ROOT, "src/lib/supabase/middleware.ts"), "utf8");
  const list = mw.match(/const PROTECTED = \[([^\]]*)\]/)?.[1] ?? "";
  return [...list.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

describe("public pages never link into auth-gated routes", () => {
  const gated = protectedRoutes();
  const files = PUBLIC_SOURCES.flatMap(walk).filter((f) => /\.tsx?$/.test(f));

  it("has routes to check and files to check them in", () => {
    expect(gated.length).toBeGreaterThan(0);
    expect(files.length).toBeGreaterThan(10);
  });

  it("finds no gated hrefs", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      // Both spellings: the JSX attribute `href="/x"` and the data-array
      // property `href: "/x"`. The footer builds its links from an array, so
      // matching only the attribute form silently skipped an entire nav column.
      for (const m of src.matchAll(/href[=:]\s*"(\/[^"]*)"/g)) {
        const href = m[1];
        if (gated.some((p) => href === p || href.startsWith(`${p}/`) || href.startsWith(`${p}?`))) {
          offenders.push(`${path.relative(ROOT, file).replace(/\\/g, "/")} → ${href}`);
        }
      }
    }
    expect(
      offenders,
      "These send signed-out visitors to a login screen.\n" +
        "Link to /onboarding (the public assessment) or /pricing instead:\n  " +
        offenders.join("\n  "),
    ).toEqual([]);
  });
});
