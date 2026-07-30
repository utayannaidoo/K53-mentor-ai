import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/**
 * No client component may import the content bank.
 *
 * This is the invariant the whole split exists to hold, and it regresses in
 * complete silence — a stray import typechecks, tests pass, the app works, and
 * 645KB of questions with their answers quietly reappears in the browser
 * bundle. It is not hypothetical: /tutor was still shipping the entire bank
 * after every study surface had been migrated, because tutor-prompt.ts looks
 * items up by id and two client files imported it for a label and a
 * placeholder string.
 *
 * Server code is unrestricted — /api/content/pack and /api/tutor both need the
 * real thing.
 */

const ROOT = path.resolve(__dirname, "..");
const SCANNED = ["src/components", "src/app", "src/hooks"];

/**
 * Modules that pull in the full bank, directly or transitively.
 *
 * `@/lib/diagnostic/select` is deliberately absent: its samplers take the pool
 * as an argument now, so it holds no content of its own and client components
 * are meant to use it.
 */
const FORBIDDEN = [
  "@/lib/content/questions",
  "@/lib/content/flashcards",
  "@/lib/content/scenarios",
  "@/lib/content/driver-modules",
  "@/lib/ai/tutor-prompt", // resolves ids against QUESTIONS_BY_ID / FLASHCARDS_BY_ID
  "@/lib/ai/retrieve",
];

/**
 * No known gaps. Licence-prep was the last one: its list page renders from the
 * bundled MODULE_META (names, difficulty, step counts — the pitch) while the
 * steps and common faults arrive with the content pack.
 */
const KNOWN_GAPS: string[] = [];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const files = SCANNED.flatMap((d) => walk(path.join(ROOT, d)));

/** A file is client-side if it declares "use client" in its opening lines. */
function isClient(source: string): boolean {
  return /^\s*["']use client["']/m.test(source.split("\n").slice(0, 5).join("\n"));
}

describe("client / content boundary", () => {
  it("finds files to scan", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("no client component imports the content bank", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf8");
      if (!isClient(src)) continue;
      for (const mod of FORBIDDEN) {
        const re = new RegExp(`from\\s+["']${mod.replace(/[/\\]/g, "\\$&")}["']`);
        if (re.test(src)) {
          offenders.push(`${path.relative(ROOT, file).replace(/\\/g, "/")} → ${mod}`);
        }
      }
    }

    const unexpected = offenders.filter((o) => !KNOWN_GAPS.includes(o));
    expect(
      unexpected,
      `These client files would ship content to the browser.\n` +
        `Take the items from useContentPool() instead:\n  ${unexpected.join("\n  ")}`,
    ).toEqual([]);

    // And the tracked debt must not quietly grow or vanish unnoticed.
    expect(offenders.filter((o) => KNOWN_GAPS.includes(o)).sort()).toEqual([...KNOWN_GAPS].sort());
  });

  it("the starter pack is the only content a client component may import", () => {
    // Positive control: the provider is expected to import it, and nothing else
    // should need to.
    const importers = files.filter((f) => {
      const src = readFileSync(f, "utf8");
      return isClient(src) && /from\s+["']@\/lib\/content\/starter["']/.test(src);
    });
    expect(importers.map((f) => path.basename(f))).toEqual(["content-provider.tsx"]);
  });
});
