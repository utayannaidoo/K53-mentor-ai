// Content QA audit: duplicates, invalid references, missing sign assets, thin
// explanations. Complements the ratchet in tests/content-coverage.test.ts with
// a human-readable report of *everything found*, not just pass/fail.
// Usage: node scripts/content-audit.mjs
//
// Duplicate semantics match the coverage test: two items collide only when
// their text matches AND they show the same visual (or neither shows one).
// Templated sign items ("What does this sign mean?") differ by their sign and
// are distinct by design.
//
// Uses Vite's SSR loader (same trick as content-stats.mjs) so the TypeScript
// and the "@/" alias resolve without a build step or an extra dev dependency.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { createServer } from "vite";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const server = await createServer({
  root,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
  resolve: {
    alias: {
      "server-only": path.resolve(root, "tests/stubs/server-only.ts"),
      "@": path.resolve(root, "src"),
    },
  },
  logLevel: "error",
});

const norm = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

/** First-seen duplicate report keyed on text + visual + correct answer. */
function findDuplicates(items, idKey, textKey, label, catIds, answerKey) {
  const seen = new Map();
  const dups = [];
  let badCats = 0;
  for (const item of items) {
    if (!catIds.has(item.categoryId)) {
      badCats++;
      if (badCats <= 5) console.log(`  ${item.id} → unknown category "${item.categoryId}"`);
    }
    const answer = answerKey
      ? norm(answerKey === "correctOption" ? (item.options?.[item.correctIndex] ?? "") : (item[answerKey] ?? ""))
      : "";
    const key = `${norm(item[textKey])}|${item.sign ?? ""}|${answer}`;
    if (!norm(item[textKey])) continue;
    if (seen.has(key)) dups.push(`${item[idKey]} ≈ ${seen.get(key)}${item.sign ? ` (sign ${item.sign})` : ""}`);
    else seen.set(key, item.id);
  }
  if (dups.length > 0) {
    console.log(`\n${label}: ${dups.length} duplicate(s)`);
    for (const d of dups.slice(0, 10)) console.log(`  ${d}`);
    if (dups.length > 10) console.log(`  … and ${dups.length - 10} more`);
  }
  return { dups: dups.length, badCats };
}

function checkSignImages(items, label) {
  let missing = 0;
  for (const item of items) {
    if (!item.sign) continue;
    // Signs are referenced by catalogue key; the SVG lives at /public/signs/<key>.svg.
    if (!existsSync(path.join(root, "public", "signs", `${item.sign}.svg`))) {
      missing++;
      if (missing <= 5) console.log(`  ${item.id} → /signs/${item.sign}.svg does not exist`);
    }
  }
  if (missing > 0) {
    console.log(`\n${label}: ${missing} missing sign image(s)`);
    for (const item of items.filter((i) => i.sign && !existsSync(path.join(root, "public", "signs", `${i.sign}.svg`))).slice(0, 5))
      console.log(`  ${item.id} → ${item.sign}`);
  }
  return missing;
}

try {
  const [{ QUESTIONS }, { FLASHCARDS }, { SCENARIOS }, { CATEGORIES }] = await Promise.all([
    server.ssrLoadModule("/src/lib/content/questions.ts"),
    server.ssrLoadModule("/src/lib/content/flashcards.ts"),
    server.ssrLoadModule("/src/lib/content/scenarios.ts"),
    server.ssrLoadModule("/src/lib/content/categories.ts"),
  ]);

  const catIds = new Set(CATEGORIES.map((c) => c.id));

  console.log(
    `BANK — questions: ${QUESTIONS.length}, flashcards: ${FLASHCARDS.length}, scenarios: ${SCENARIOS.length}`,
  );

  const q = findDuplicates(QUESTIONS, "id", "prompt", "DUPLICATE question prompts", catIds, "correctOption");
  const f = findDuplicates(FLASHCARDS, "id", "front", "DUPLICATE flashcard fronts", catIds, "back");
  const s = findDuplicates(SCENARIOS, "id", "title", "DUPLICATE scenario titles", catIds);

  const missingImgs =
    checkSignImages(QUESTIONS, "QUESTIONS") + checkSignImages(FLASHCARDS, "FLASHCARDS");

  // Explanations are the teaching moment; empty ones are content bugs.
  const thinItems = QUESTIONS.filter((q2) => !q2.explanation || q2.explanation.trim().length < 15);
  if (thinItems.length > 0) {
    console.log(`\nQUESTIONS: ${thinItems.length} thin/empty explanation(s)`);
    for (const item of thinItems.slice(0, 5)) console.log(`  ${item.id}`);
  }

  // Options sanity: every option non-empty, no exact repeats inside a question,
  // correct_index inside range.
  const badOptions = [];
  for (const item of QUESTIONS) {
    const opts = (item.options ?? []).map(norm);
    if (
      opts.some((o) => !o) ||
      new Set(opts).size !== opts.length ||
      item.correctIndex == null ||
      item.correctIndex < 0 ||
      item.correctIndex >= (item.options?.length ?? 0)
    ) {
      badOptions.push(item.id);
      if (badOptions.length <= 5) console.log(`  ${item.id} → empty/duplicated options or out-of-range answer`);
    }
  }
  if (badOptions.length > 0)
    console.log(`\nQUESTIONS: ${badOptions.length} malformed option set(s)`);

  console.log(
    "\nSUMMARY " +
      JSON.stringify(
        {
          questions: QUESTIONS.length,
          flashcards: FLASHCARDS.length,
          scenarios: SCENARIOS.length,
          duplicatePrompts: q.dups,
          duplicateFronts: f.dups,
          duplicateScenarioTitles: s.dups,
          invalidCategoryRefs: q.badCats + f.badCats + s.badCats,
          missingSignImages: missingImgs,
          thinExplanations: thinItems.length,
          malformedOptions: badOptions.length,
        },
        null,
        2,
      ),
  );
} finally {
  await server.close();
}
