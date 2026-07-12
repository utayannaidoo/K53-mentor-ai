// Content inventory report: counts per category / difficulty / vehicle code.
// Usage: node scripts/content-stats.mjs   (regex-based so it needs no TS build)
import { readFileSync } from "node:fs";

const QUESTION_FILES = [
  "questions.ts",
  "questions.extra.ts",
  "questions.vehicle.ts",
  "vehicle-extra.ts",
  "signs-pack.ts",
];
const FLASHCARD_FILES = [
  "flashcards.ts",
  "flashcards.extra.ts",
  "flashcards.vehicle.ts",
  "vehicle-extra.ts",
  "signs-pack.ts",
];

function tally(files, idPrefix) {
  const byCat = {};
  const byDiff = {};
  let total = 0;
  for (const f of files) {
    const t = readFileSync(new URL(`../src/lib/content/${f}`, import.meta.url), "utf8");
    // Item blocks: match id + categoryId + difficulty in proximity.
    for (const m of t.matchAll(
      new RegExp(`id: "(${idPrefix}[\\w]*)"[\\s\\S]{0,2000}?categoryId: "(\\w+)"[\\s\\S]{0,2000}?difficulty: (\\d)`, "g"),
    )) {
      total++;
      byCat[m[2]] = (byCat[m[2]] ?? 0) + 1;
      byDiff[m[3]] = (byDiff[m[3]] ?? 0) + 1;
    }
  }
  return { total, byCat, byDiff };
}

const q = tally(QUESTION_FILES, "q");
const f = tally(FLASHCARD_FILES, "fc");
console.log("QUESTIONS", q.total, q.byCat, "difficulty:", q.byDiff);
console.log("FLASHCARDS", f.total, f.byCat, "difficulty:", f.byDiff);
