// Content inventory report: counts per category / difficulty / item kind.
// Usage: node scripts/content-stats.mjs   (regex-based so it needs no TS build)
//
// Scans EVERY file in src/lib/content so new packs are counted automatically.
// An item is classified by its fields: `options:` → question, `front:` →
// flashcard (scenarios use `choices:` and are reported separately). Items
// without a categoryId (module steps, sign catalog entries) are ignored.
import { readFileSync, readdirSync } from "node:fs";

const CONTENT_DIR = new URL("../src/lib/content/", import.meta.url);

const questions = { total: 0, byCat: {}, byDiff: {} };
const flashcards = { total: 0, byCat: {}, byDiff: {} };
let scenarios = 0;

for (const file of readdirSync(CONTENT_DIR)) {
  if (!file.endsWith(".ts")) continue;
  const src = readFileSync(new URL(file, CONTENT_DIR), "utf8");
  const ids = [...src.matchAll(/\bid: "([^"]+)"/g)];
  for (let i = 0; i < ids.length; i++) {
    const seg = src.slice(ids[i].index, ids[i + 1]?.index ?? src.length);
    const cat = /categoryId: "(\w+)"/.exec(seg)?.[1];
    if (!cat) continue;
    const diff = /difficulty: (\d)/.exec(seg)?.[1] ?? "?";
    let bucket = null;
    if (/\boptions:\s*\[/.test(seg)) bucket = questions;
    else if (/\bfront:/.test(seg)) bucket = flashcards;
    else if (/\bchoices:\s*\[/.test(seg)) {
      scenarios++;
      continue;
    } else continue;
    bucket.total++;
    bucket.byCat[cat] = (bucket.byCat[cat] ?? 0) + 1;
    bucket.byDiff[diff] = (bucket.byDiff[diff] ?? 0) + 1;
  }
}

console.log("QUESTIONS", questions.total, questions.byCat, "difficulty:", questions.byDiff);
console.log("FLASHCARDS", flashcards.total, flashcards.byCat, "difficulty:", flashcards.byDiff);
console.log("SCENARIOS", scenarios);
