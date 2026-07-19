// Content inventory report: counts per category / difficulty / item kind.
// Usage: node scripts/content-stats.mjs
//
// Loads the real exported arrays rather than scanning source text. That matters
// because not all content is a literal any more: the generated signs pack is
// derived from the road-sign catalogue when the module evaluates, so a
// regex-based scanner counted zero of it and silently under-reported the bank
// by 132 questions. Anything future packs derive at runtime is counted here for
// free, which a text scan could never promise.
//
// Uses Vite's SSR loader (already a dependency via vitest) so the TypeScript and
// the "@/" alias resolve without a build step or an extra dev dependency.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const server = await createServer({
  root,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
  // Mirrors the aliases in vitest.config.ts.
  resolve: {
    alias: {
      "server-only": path.resolve(root, "tests/stubs/server-only.ts"),
      "@": path.resolve(root, "src"),
    },
  },
  logLevel: "error",
});

/** Group items by a field, returning a plain object sorted by count desc. */
function tally(items, key) {
  const counts = {};
  for (const item of items) {
    const k = item[key] ?? "?";
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

function report(label, items) {
  console.log(`\n${label}: ${items.length}`);
  console.log("  by category:", tally(items, "categoryId"));
  const byDifficulty = tally(items, "difficulty");
  if (Object.keys(byDifficulty).length > 1) console.log("  by difficulty:", byDifficulty);
}

try {
  const [{ QUESTIONS }, { FLASHCARDS }, { SCENARIOS }, { GENERATED_SIGN_QUESTIONS }] =
    await Promise.all([
      server.ssrLoadModule("/src/lib/content/questions.ts"),
      server.ssrLoadModule("/src/lib/content/flashcards.ts"),
      server.ssrLoadModule("/src/lib/content/scenarios.ts"),
      server.ssrLoadModule("/src/lib/content/signs-generated.ts"),
    ]);

  report("QUESTIONS", QUESTIONS);
  console.log(
    `  of which derived from the sign catalogue: ${GENERATED_SIGN_QUESTIONS.length}` +
      ` (hand-authored: ${QUESTIONS.length - GENERATED_SIGN_QUESTIONS.length})`,
  );
  report("FLASHCARDS", FLASHCARDS);
  report("SCENARIOS", SCENARIOS);

  // How many distinct mock papers the bank supports, per licence code. This is
  // the number that actually limits a committed learner, and it is set by the
  // *smallest* section — so it is easy to grow the wrong pool and gain nothing.
  const { forCode } = await server.ssrLoadModule("/src/lib/content/vehicle.ts");
  const { SECTION_OF } = await server.ssrLoadModule("/src/lib/diagnostic/select.ts");
  const { EXAM_FORMAT } = await server.ssrLoadModule("/src/lib/constants.ts");
  const sections = Object.keys(EXAM_FORMAT.sections);

  console.log("\nDISTINCT MOCK PAPERS (limited by the smallest section)");
  for (const code of ["8", "A", "14"]) {
    const bank = forCode(QUESTIONS, code);
    const perSection = sections.map((section) => {
      const pool = bank.filter((q) => SECTION_OF[q.categoryId] === section).length;
      return { section, pool, papers: pool / EXAM_FORMAT.sections[section].questions };
    });
    const limiting = perSection.reduce((a, b) => (a.papers < b.papers ? a : b));
    const detail = perSection.map((s) => `${s.section} ${s.pool}`).join(", ");
    console.log(
      `  code ${code.padEnd(2)} ${limiting.papers.toFixed(1).padStart(4)}` +
        `  (limited by ${limiting.section}; ${detail})`,
    );
  }
} finally {
  await server.close();
}
