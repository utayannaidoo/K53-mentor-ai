---
name: k53-content-sprint
description: Run a question-bank content sprint — grow one category by 60–100 cited items (questions + flashcards) using the fact-file pipeline and quality gates. Use when adding questions, flashcards, scenarios, or a new content pack.
---

# K53 Content Sprint

The proven loop that grew the bank from 294 → 510+ questions. One sprint = one category (or one themed pack), ~1 session.

## Non-negotiable rules
1. **No fact enters the bank without a source.** Every item is written ONLY from the category's fact file at `docs/content/facts/<category>.md` (cited from primary sources). If the fact isn't there, research it, add it with a source line, then write the item.
2. **Never invent regulation numbers, fines, speeds, or dates.** Numbers (speed limits 60/100/120, BAC 0.05/0.02, breath 0.24, learner age 17, following 2s/4s rain, AARTO learner threshold 6 points) must match the fact files; re-verify with WebSearch before each batch.
3. Explanations teach the *why*; provenance via the existing `sourceFor` pattern in `src/lib/content/provenance.ts`.

## Sprint loop
1. **Pick the category** with the biggest gap vs targets (roadmap §Targets): signs→220, rules→200, controls→120, hazard→120, intersections→100, parking→80, following→60. Check live counts: `node scripts/content-stats.mjs`.
2. **Refresh the fact file** — WebSearch for regulatory changes (AARTO dates, fines, speed law) since the file's research date; update citations.
3. **Write the pack** as a new `src/lib/content/<name>-pack.ts` exporting typed `Question[]` / `Flashcard[]` arrays (types in `src/types/index.ts`), then aggregate into `QUESTIONS`/`FLASHCARDS` where existing packs are combined (see `questions.ts`/`flashcards.ts` imports).
   - Difficulty spread across 1–3; unique kebab-case `id`s with a pack prefix.
   - Vehicle-code items (`scope`/code gating) surface only for A/10/14 tracks — see `bike-heavy-pack.ts` for the pattern.
   - Sign items use real images: `signImg()` + `signs.catalog.json`; extend `scripts/extract_signs.py` if new signs need extraction (pixelated images are competitors' top complaint).
4. **Run the gates**:
   - `npx vitest run tests/content-coverage.test.ts` — bump the per-category ratchet minimums to the new counts (never lower them).
   - The test also enforces ID uniqueness and near-duplicate prompt detection — fix collisions, don't weaken the test.
   - Grep every numeric fact in the new pack and check against the fact file.
5. **Update the roadmap** — append the sprint result to `docs/content/expansion-roadmap.md` (counts table + sprint log line) and update `scripts/content-stats.mjs` if it globs files explicitly.
6. Full verify: `npm run typecheck && npm run test && npm run build`.

## Primary sources (in yield order)
- **SARTSM sign catalogue** (transport.gov.za `V1C1.pdf`, `V2C1.pdf`, `V4C1.pdf`) — every R/W/GS/temporary sign has code+name+meaning; each sign → 1 flashcard + 1–2 questions.
- **Official K53 practical test** — arrivealive.co.za "k53 light motor vehicles code a part 1.pdf" — per-manoeuvre penalties for controls/yard depth.
- **National Road Traffic Act + Regulations** — testable clauses for rules.
- **AARTO schedule of offences** (aboutaarto.co.za) — fines + demerit points table.
- Bike/heavy: toda.co.za code-10/14 sets; k53test.co.za/vehicle-codes.
- Exam structure (verified): 64 Q / 60 min; pass controls 6/8, signs 23/28, rules 22/28; failing any section fails the exam.
