// Accessibility check over the pages `next build` prerendered.
// Usage: npm run test:a11y   (after npm run build)
//
// Runs axe-core against the real emitted markup in jsdom. No browser, so it
// adds seconds to CI rather than a Playwright download — the trade is that
// rules needing layout or computed styles cannot run (see DISABLED below).
// What it does catch is the class of bug that actually ships here: an input
// with no label, a button whose only content is an icon, a broken heading
// order, a missing lang or main landmark.
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const appDir = path.join(root, ".next/server/app");

/**
 * Rules that need a rendered page, not a string of HTML.
 *
 * - colour contrast is computed from CSS this DOM never loads (Tailwind ships
 *   in an external stylesheet), so every result would be a guess. It is
 *   covered instead by tests/contrast.test.ts, which checks the tokens.
 * - the rest depend on layout, scroll or viewport metrics jsdom does not
 *   implement, and report false positives without them.
 */
const DISABLED = [
  "color-contrast",
  "color-contrast-enhanced",
  "target-size",
  "scrollable-region-focusable",
  "meta-viewport",
];

/** Fail the build on these; anything lighter is printed but tolerated. */
const FAILING_IMPACTS = new Set(["critical", "serious"]);

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

async function auditFile(file) {
  const html = readFileSync(file, "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  // axe reads globals off the window it runs in.
  window.eval(axe.source);
  const results = await window.axe.run(window.document, {
    resultTypes: ["violations"],
    rules: Object.fromEntries(DISABLED.map((id) => [id, { enabled: false }])),
  });
  dom.window.close();
  return results.violations;
}

const files = (() => {
  try {
    return htmlFiles(appDir);
  } catch {
    return [];
  }
})();

if (files.length === 0) {
  console.error(
    `No prerendered pages under ${path.relative(root, appDir)} — run \`npm run build\` first.`,
  );
  process.exit(1);
}

let failures = 0;
let advisories = 0;

for (const file of files.sort()) {
  const route = "/" + path.relative(appDir, file).replace(/\\/g, "/").replace(/\.html$/, "");
  const violations = await auditFile(file);
  if (violations.length === 0) continue;

  for (const v of violations) {
    const failing = FAILING_IMPACTS.has(v.impact);
    if (failing) failures += 1;
    else advisories += 1;
    const nodes = v.nodes.slice(0, 3).map((n) => `      ${n.html.slice(0, 140)}`);
    console.log(
      `${failing ? "FAIL" : "note"}  ${route}  [${v.impact}] ${v.id}: ${v.help}\n` +
        `${nodes.join("\n")}${v.nodes.length > 3 ? `\n      …and ${v.nodes.length - 3} more` : ""}`,
    );
  }
}

console.log(
  `\naxe: ${files.length} prerendered pages, ${failures} serious/critical, ${advisories} minor/moderate.`,
);
process.exit(failures > 0 ? 1 : 0);
