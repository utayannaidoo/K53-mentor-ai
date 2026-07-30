// Regenerate src/lib/content/meta.ts — the planning index.
// Usage: node scripts/gen-content-meta.mjs
//
// Planning, scoring and CP only ever need to know that an item EXISTS, which
// category and licence codes it belongs to, and how hard it is. They never need
// its prompt, its options, its correct answer or its explanation. Importing the
// full bank to answer "how many cards are due?" is what put 645KB of questions —
// answers included — into the study store's chunk, and therefore into every
// route that mounts the store.
//
// So this emits the narrow projection instead. Scenario titles are included
// because generateTodayPlan shows one as a task subtitle; they are labels, not
// answers.
//
// Uses Vite's SSR loader (already a dependency via vitest) so TypeScript and the
// "@/" alias resolve without a build step — same approach as content-stats.mjs,
// and for the same reason: some packs are derived at module-evaluation time, so
// a regex scan of the source would silently miss them.
import path from "node:path";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

/** Only emit `codes` when the item actually narrows to specific licence codes. */
function codesOf(item) {
  return Array.isArray(item.codes) && item.codes.length ? item.codes : undefined;
}

const j = JSON.stringify;

try {
  const [{ QUESTIONS }, { FLASHCARDS }, { SCENARIOS }] = await Promise.all([
    server.ssrLoadModule("/src/lib/content/questions.ts"),
    server.ssrLoadModule("/src/lib/content/flashcards.ts"),
    server.ssrLoadModule("/src/lib/content/scenarios.ts"),
  ]);

  const questionLines = QUESTIONS.map((q) => `  ${j(q.id)}: ${q.difficulty ?? 1},`).join("\n");

  const metaLine = (item, extra = "") => {
    const codes = codesOf(item);
    return (
      `  { id: ${j(item.id)}, categoryId: ${j(item.categoryId)}${extra}` +
      (codes ? `, codes: ${j(codes)}` : "") +
      " },"
    );
  };

  const flashcardLines = FLASHCARDS.map((f) => metaLine(f)).join("\n");
  const scenarioLines = SCENARIOS.map((s) => metaLine(s, `, title: ${j(s.title)}`)).join("\n");

  const out = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-content-meta.mjs
// Kept honest by tests/content-meta.test.ts, which fails if this drifts from
// the real content bank.
//
// The planning index: what the study store needs to size a session, count what
// is due and award CP, with none of the material a learner is paying to see.
// Importing the full bank for this is what shipped every question and answer to
// every route that mounts the store.
import type { CategoryId, VehicleCode } from "@/types";

export interface ContentMeta {
  id: string;
  categoryId: CategoryId;
  /** Absent means "applies to every licence code" — see forCode(). */
  codes?: VehicleCode[];
}

/** Scenario tasks surface their title as the plan subtitle, so labels ride along. */
export interface ScenarioMeta extends ContentMeta {
  title: string;
}

/** Question id -> difficulty (1-3). The only question field CP scoring reads. */
export const QUESTION_DIFFICULTY: Record<string, number> = {
${questionLines}
};

export const FLASHCARD_META: ContentMeta[] = [
${flashcardLines}
];

export const SCENARIO_META: ScenarioMeta[] = [
${scenarioLines}
];
`;

  const dest = path.join(root, "src/lib/content/meta.ts");
  writeFileSync(dest, out, "utf8");
  console.log(
    `meta.ts written: ${QUESTIONS.length} questions, ${FLASHCARDS.length} flashcards, ` +
      `${SCENARIOS.length} scenarios (${Math.round(out.length / 1024)}KB)`,
  );
} finally {
  await server.close();
}
