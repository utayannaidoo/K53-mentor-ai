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
import { createHash } from "node:crypto";
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

/** An item with no `codes` applies to every licence code — see forCode(). */
const isUniversal = (item) => codesOf(item) === undefined;

/**
 * What a question is *about*, for the purpose of not asking it twice. Mirrors
 * subjectOf() in src/lib/diagnostic/select.ts — several questions can target the
 * same road sign, and a paper that shows the same sign twice feels shallow.
 */
const subjectOf = (q) => q.image ?? (q.sign ? `sign:${q.sign}` : `id:${q.id}`);

/** Deterministic PRNG, so the starter pack is identical on every build. */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, rand) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(rand() * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
}

/**
 * How much of each category the bundled starter pack carries.
 *
 * Sized to satisfy BOTH consumers at once, with rotation headroom on top:
 *  - the 15-question diagnostic, which needs all 7 categories (DIAGNOSTIC_PLAN)
 *  - a section drill at real exam size (EXAM_FORMAT: signs 28, rules 28,
 *    controls 8) — the "rules" section is rules + intersections + parking +
 *    following_distance + hazard_awareness, so 80 here against a need of 28.
 *
 * A free learner's lifetime allowance is ~15 practice questions, one 15-question
 * mini mock and one drill, so this is several times what they can consume — the
 * headroom is what stops the same questions recurring across those three.
 */
const STARTER_QUESTIONS_BY_CATEGORY = {
  signs: 60,
  rules: 30,
  controls: 25,
  intersections: 15,
  hazard_awareness: 15,
  parking: 10,
  following_distance: 10,
};

const STARTER_FLASHCARDS_BY_CATEGORY = {
  signs: 22,
  rules: 8,
  controls: 8,
  intersections: 7,
  hazard_awareness: 5,
  parking: 5,
  following_distance: 5,
};

/**
 * Pick `n` items from one category for the starter pack.
 *
 * Universal-only: 948 of the 1,060 questions carry no `codes`, which is more
 * than enough everywhere, so every licence code sees the identical pack and
 * forCode() is a no-op over it. Picking code-specific items instead would mean
 * separately guaranteeing each of 8 / A / 14 had a full-sized pack.
 *
 * Prefers distinct subjects so a 28-question signs drill drawn from these 60
 * isn't the same handful of road signs asked four ways.
 */
function pickStarter(items, categoryId, n, rand) {
  const pool = seededShuffle(
    items.filter((i) => i.categoryId === categoryId && isUniversal(i)).sort((a, b) => (a.id < b.id ? -1 : 1)),
    rand,
  );
  const picked = [];
  const spare = [];
  const seen = new Set();
  for (const item of pool) {
    if (picked.length === n) break;
    const key = subjectOf(item);
    if (seen.has(key)) {
      spare.push(item);
      continue;
    }
    seen.add(key);
    picked.push(item);
  }
  // Only reached if a category has fewer distinct subjects than requested.
  if (picked.length < n) picked.push(...spare.slice(0, n - picked.length));
  return picked;
}

const j = JSON.stringify;

try {
  const [{ QUESTIONS }, { FLASHCARDS }, { SCENARIOS }] = await Promise.all([
    server.ssrLoadModule("/src/lib/content/questions.ts"),
    server.ssrLoadModule("/src/lib/content/flashcards.ts"),
    server.ssrLoadModule("/src/lib/content/scenarios.ts"),
  ]);

  // Fingerprint the bank itself (not the generated output) so the version moves
  // exactly when the content does.
  const contentVersion = createHash("sha256")
    .update(j([QUESTIONS, FLASHCARDS, SCENARIOS]))
    .digest("hex")
    .slice(0, 12);

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

/**
 * Fingerprint of the full content bank.
 *
 * The cache key for a synced pack. It ships in the bundle, so a client always
 * knows which version it *should* have and can tell that its cached copy is
 * stale — which is what stops a content sprint being invisible to everyone who
 * synced before it.
 */
export const CONTENT_VERSION = ${j(contentVersion)};
`;

  const dest = path.join(root, "src/lib/content/meta.ts");
  writeFileSync(dest, out, "utf8");
  console.log(
    `meta.ts written: ${QUESTIONS.length} questions, ${FLASHCARDS.length} flashcards, ` +
      `${SCENARIOS.length} scenarios, version ${contentVersion} (${Math.round(out.length / 1024)}KB)`,
  );

  // ── The bundled starter pack ───────────────────────────────────────────────
  const rand = mulberry32(0x4b3533); // "K53" — fixed, so builds are reproducible
  const starterQuestions = Object.entries(STARTER_QUESTIONS_BY_CATEGORY).flatMap(([cat, n]) =>
    pickStarter(QUESTIONS, cat, n, rand),
  );
  const starterFlashcards = Object.entries(STARTER_FLASHCARDS_BY_CATEGORY).flatMap(([cat, n]) =>
    pickStarter(FLASHCARDS, cat, n, rand),
  );

  for (const [cat, n] of Object.entries(STARTER_QUESTIONS_BY_CATEGORY)) {
    const got = starterQuestions.filter((q) => q.categoryId === cat).length;
    if (got < n) throw new Error(`starter pack: ${cat} wanted ${n} questions, got ${got}`);
  }

  const starter = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-content-meta.mjs
// Kept honest by tests/starter-pack.test.ts.
//
// The bundled starter pack: the only content that ships to the browser without
// a paid entitlement. Everything else is served by /api/content/pack and cached
// on the device.
//
// Sized so the free tier never notices the difference — a free learner's
// lifetime allowance is one diagnostic, ~15 practice questions, one mini mock
// and one section drill, all of which draw from this pack with room to rotate.
// It is also what keeps the free tier working offline and zero-config demo mode
// intact (CLAUDE.md rule 1).
//
// Every item here is universal (no \`codes\`), so each licence code sees the same
// pack and forCode() is a no-op over it.
import type { Flashcard, Question, Scenario } from "@/types";

export const STARTER_QUESTIONS: Question[] = ${j(starterQuestions, null, 2)};

export const STARTER_FLASHCARDS: Flashcard[] = ${j(starterFlashcards, null, 2)};

/** Scenarios are a paid feature (PlanLimits.scenarios is false on free). */
export const STARTER_SCENARIOS: Scenario[] = [];
`;

  const starterDest = path.join(root, "src/lib/content/starter.ts");
  writeFileSync(starterDest, starter, "utf8");
  console.log(
    `starter.ts written: ${starterQuestions.length} questions, ` +
      `${starterFlashcards.length} flashcards (${Math.round(starter.length / 1024)}KB)`,
  );
} finally {
  await server.close();
}
