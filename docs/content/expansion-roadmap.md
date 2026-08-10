# Content & Feature Expansion Roadmap

_Research date: July 2026. Sources listed at the bottom; verify regulated facts (fines, AARTO dates) before publishing content built on them._

> **Status, updated 19 July 2026.** P0 (volume) is **done and exceeded** — the bank is at 792 questions against a 600 target, and supports ~10 non-repeating mocks against a target of 8+. Section 1 below is kept as the historical baseline; the current numbers come from `node scripts/content-stats.mjs`, which reads the real exports and is the only figure worth trusting. Live priorities are in section 4.

## 1. Where the bank stood when this was written (July 2026 baseline)

| Category | Questions | Flashcards |
|---|---|---|
| signs | 65 | 42 |
| rules | 73 | 39 |
| controls | 55 | 37 |
| hazard_awareness | 44 | 23 |
| intersections | 21 | 13 |
| parking | 17 | 12 |
| following_distance | 19 | 11 |
| **Total** | **294** | **177** |

The official exam draws 28 signs + 28 rules-group + 8 controls per paper, so the **smallest section** caps how many distinct papers exist — it is easy to grow the wrong pool and gain nothing. At the time of writing the signs pool (65) supported barely two full mocks. It now supports ~10; `scripts/content-stats.mjs` prints the limiting section per licence code.

## 2. What the research says the test actually needs

- **Exam structure** (confirmed): 64 questions / 60 min; pass marks per section — controls 6/8, signs 23/28, rules 22/28; failing any one section fails the exam. Our mock already mirrors this; content depth per section doesn't yet.
- **Sign taxonomy**: SADC-RTSM defines regulatory, warning, guidance, information and **temporary (yellow-background)** classes. We have almost no temporary-sign or road-marking items — both are heavily examined.
- **Rules specifics with hard numbers** (high-yield, easy to test): speed limits 60/100/120 km/h; BAC < 0.05 g/100 ml (0.02 professional), breath < 0.24 mg/1000 ml; learner age 17, licence 18; following distance 2s (4s in rain).
- **AARTO demerits** (national rollout completing 2026; points from 1 Sept 2026): learner threshold **6 points** vs 15 for licensed drivers; 1 point expires per 3 months. This is new, exam-adjacent, and no competitor teaches it well — a differentiator for a "rules" sub-topic and a guide.
- **Yard test**: turn-in-road, alley docking, parallel parking, incline start; whole yard test ≤ 20:59; observation sequences scored per movement. Our Premium-Plus driver modules cover this — content is thinner than the learner side.

## 3. Competitor gap analysis (Play Store K53 apps)

What users praise elsewhere: questions "very similar to the real test", per-section tests, 1000+ banks, answer review after tests. What they hate: ads mid-test, no post-test mistake review, pixelated sign images, offline failures. **We already win on**: no ads, mistake review with AI second opinion, real sign images, PWA offline. **We lose on**: raw volume and per-section drill tests.

## 4. Prioritized roadmap

### P0 — Volume — ✅ done, exceeded
1. ~~Grow signs to 150+ and rules to 120+; target 600 questions / 350 flashcards, 8+ non-repeating mocks.~~ **Done.** 792 questions / 394 flashcards / 62 scenarios, ~10 non-repeating mocks per code. Signs is 332, rules-group 280.
2. ~~Balance thin categories: parking, following_distance, intersections.~~ **Done**, for scenarios too — every category now has at least four scenarios for every licence code, enforced by `tests/scenario-content.test.ts`.

**What limits the mock count now:** all three sections are close together (code 08: controls 80, rules 280, signs 332 ÷ their per-paper draw). Lifting it further needs *all three* to grow — adding to one alone buys nothing. Run `node scripts/content-stats.mjs` before starting; it names the limiting section.

**Cheapest remaining lever:** `VERIFIED_NAME_IDS` in `src/lib/content/signs.ts`. The generated pack quizzes only signs whose name is hand-verified, so each name added yields another question with no code change — 56 of 439 are verified today. Verify against the rendered PNG in `public/signs/`, not the OCR `autoName`, which is often a caption fragment.

**Deliberately not done:** questions turning on a regulated numeric threshold (tread depth, required equipment, reporting deadlines, licence validity). High-yield and heavily examined, but each needs the regulation open beside it — see the header note. Cite via the per-item `source` field.

### P1 — Exam-fidelity features
3. **Per-section test mode**: "Signs only" / "Rules only" / "Controls only" timed drills matching real section pass marks (reuses mini-mock machinery; competitors' most-loved feature).
4. **Road markings + traffic signals content pack** (currently folded into signs; the manual treats them as their own study units).
5. **Temporary/yellow sign pack** with real images.

### P2 — Differentiators
6. **AARTO demerit guide + quiz pack** (launch-timed to Sept 2026 demerit go-live; strong SEO too).
7. **Sign-of-the-day push/notification** reusing the PWA + email infra.
8. **Voice-read questions** (accessibility + studying in taxis; Web Speech API already used for flashcard recall).
9. Driver's-side expansion: per-manoeuvre penalty-point tables and observation-sequence checklists in the yard-test modules.

## 4b. Sprint log

| Sprint | Result |
|---|---|
| Signs — naming sweep of the remaining catalogue (batch 9 in `signs.ts`) | +31 questions / +23 flashcards, entirely from **31 new verified names** — no new hand-authored pack. Bank **1 265 → 1 296 Q / 951 → 974 FC**; signs 467 → **498**, generated pool 224 → **255**. Ceiling: code 08 16.5 → **17.0**, A 16.5 → **17.6**, code 14 16.6 → **17.7**. The block that mattered was **road markings**, the largest untouched part of the catalogue: their captions already read as names ("Stop line:", "Box junction:") but the trailing colon fails the meaning gate, so before this batch not a single road marking could be quizzed. 25 markings named, plus the three comprehensive signs (residential area, dual- and single-carriage freeway begins) and three information plates. Verified names 123 → **154** of 239 quizzable signs; unnamed 111 → **80**, and the remainder are now almost entirely *principled* exclusions rather than unexamined ones — each documented inline in `signs.ts`. The largest remaining block is the 21 selective-restriction plates, which are modifiers rather than standalone signs (12 of them already carry `signImg` keys and are quizzed by `motus-signs-pack.ts` as sign-plus-plate combinations, which is the useful framing); then 28 markings and 12 traffic signals held back for the reasons recorded above. **Two more composite images found and one was live** — see below. |
| Rules — duties, freeway law, towing, lights, accidents (`motus-rules-pack.ts`) | +63 questions / +46 flashcards. Bank **1 202 → 1 265 Q / 905 → 951 FC**; rules 170 → **228**, hazard 83 → 85, parking 77 → 80. **The biggest ceiling gain of any sprint so far: code 08 14.8 → 16.5, A 15.8 → 16.5, code 14 15.6 → 16.6** — because `rules` is a *section*, not a category (SECTION_OF pools rules + intersections + parking + following_distance + hazard_awareness into the 28 a paper draws), so every universal item lifts all three codes at once. Material from `motus-manual-11ed.md` pp. 61–66, most of which nothing quizzed: the **general duties of drivers** (engine running while unattended or refuelling, people on the roof, body protruding, entering a moving vehicle, letting someone else steer, smoke, refuse, sidewalk driving), **freeway law** (the eight classes barred, the three lawful reasons to stop, no hand signals, and the learner-with-supervision rule), **towing** (3,5 m, tow-bar above 30 km/h, no passengers), **lights** (45 m dipped / 100 m main, parking lights beyond 12 m from a streetlight, spotlights restricted to doctors/vets/breakdowns/official vehicles), **abandoned vehicles** (24 h rural / 7 days urban), the **accident procedure**, and the tyre standards including the 80% rule for ≤50 cc motorcycles and the retread ban. The cap is back on **signs** for all three codes. |
| Signs — qualifier plates, sign classes, +23 verified names (`motus-signs-pack.ts`) | +49 signs questions / +37 flashcards. Bank **1 153 → 1 202 Q / 868 → 905 FC**; signs 436 → **467**, flashcards 314 → **351**. Two halves. (1) **23 new verified names** in `CURATED` — the animal and junction-layout warnings, and the stop/command regulatory signs — each confirmed against the rendered PNG rather than the OCR meaning, lifting the generated pool 206 → 224. (2) A hand-authored pack covering what a generator structurally cannot teach: the **selective-restriction (qualifier) plate system**, which is 21 catalogue entries and was quizzed by *nothing*, plus the blue-disc-commands / red-ring-prohibits distinction and the minimum-vs-maximum speed trap that follows from it. Ceiling: code 08 14.7 → **14.8**, A 14.8 → **15.8**, code 14 14.9 → **15.6** — and all three are **rules-limited again**, so the next ceiling sprint is rules. **A live defect was found and fixed** — see below. Names deliberately withheld: the 022/023 traffic-signal series (caption-fragment meanings, near-identical images), the 036-01/02 mirror pair, and regulatory-007-05 (catalogue meaning says "two-way traffic", pictogram is yield-to-oncoming — opposite obligations, needs a source check). |
| Controls + parking — the K53 *score sheet* (`motus-yard-pack.ts`) | +93 questions (79 controls, 14 parking) and +70 flashcards (34 hand-authored, 36 auto-derived). Bank **1 060 → 1 153 Q / 798 → 868 FC**. Controls 184 → **263**, parking 63 → **77**. First sprint written from the owner's scanned [Official Motus/Safeways K53 manual, 11th ed.](./facts/motus-manual-11ed.md), which prints the examiner's actual yard- and road-test sheets — so this is the first content in the bank that teaches *what each fault costs* rather than only what the manoeuvre is: the 50-point yard total, black-box instant fails, the SIM sequence, the pre-trip inspection's anti-clockwise order and its four spoken declarations, manoeuvre geometry (two attempts, ½ m from the poles, pole B in line with your head, the white dot at your shoulder), and the road-test penalties (mirror every 5–8 s at 5 points, eyes-down 5, cornering gear change 4, gear coasting 3). Ceiling: code 08 14.3 → **14.7**, and **the cap moved off rules onto signs** — code 08 is now signs-limited for the first time, so the next ceiling work is a signs sprint. "Controls only" drill pool 143 → **222**. `scripts/gen-content-meta.mjs` had to be re-run (`tests/content-meta.test.ts` catches the drift). Two figures were deliberately left un-authored because sources disagree — see the fact file's "Conflicts to resolve". |
| Controls + rules + signs (all three) | +104 (37 controls, 39 rules-group, 16 signs, plus 15 auto-generated from 16 newly verified names). Bank passes **1 000** at 1 060. Ceiling: code 08 12.9 → **14.3**, A 13.7 → **14.8**, code 14 13.8 → **14.9**. Controls was requested but had stopped being a constraint — it was written for the "Controls only" section drill instead (code 08: 13.5 → 17.9 distinct drills), and that reason is recorded in the pack header so it is not mistaken for ceiling work later. |
| Rules — offence principles, plus a controls top-up | +55 (42 rules-group, 12 controls, 1 removed as a duplicate). Rules 131 → 149. Ceiling: code 08 11.4 → **12.9**, A 12.4 → 13.7, code 14 12.3 → 13.8. Controls was included because the rules work pushed past it and it became the cap at exactly 12.00 for code 08. The duplicate-prompt gate caught a restatement of an existing stopping-distance question; it was removed rather than reworded. |
| Signs — junctions, restriction warnings, temporary twins, reservations | +55 signs (27 hand-authored + 28 auto-generated from newly verified names). Signs 332 → 387; verified sign names 56 → 84 of 439. Mock ceiling: code A 11.7 → 12.4, code 14 11.8 → 12.3. **Code 08 unchanged at 11.4 — it is rules-capped**, so the next signs sprint gains it nothing until rules grows. |
| Flashcards ← question bank (derived) | +404 flashcards, **394 → 798** (≈75% of the 1 060-question bank, up from 37%), via `flashcards-derived.ts` — a deterministic, de-duplicated derivation, not a new fact source (each card seeds from a question's vetted answer + explanation, so provenance is unchanged). Per-category top-up to ~75% coverage: signs **93 → 314** (was only 22% covered), controls 73 → 138, rules 82 → 128, intersections 42 → 65, hazard 45 → 63, parking 31 → 48, following 28 → 42. Questions needing their options to be answerable are skipped; a sign already carried by a hand-authored card, or a fact already covered, is never duplicated. Ratchet minimums in `tests/content-coverage.test.ts` bumped to the new counts. |

### A saturated topic (rules sprint)

The duplicate-prompt gate rejected "Another vehicle is overtaking you. You should:" against
`q_rules_being_overtaken`. Checking why turned up **four** existing questions on that single
fact — in `questions.ts`, `rules-pack.ts`, `rules-lane-pack.ts` and `rules-lift-pack.ts`.

Removed rather than reworded, per the precedent below: a fifth phrasing of one fact is worse
for a learner drilling than no new question at all. Worth a future pass to find other
over-covered facts — the gate only catches near-identical *prompts*, not four different
prompts teaching the same thing.

---

### Sign images that need reading, not just recognising (signs sprint)

The qualifier-plate questions exposed a limit in `SignVisual`: it renders every sign into a
fixed 80px square with `object-contain`. That is right for a symbol in a disc or a triangle,
and wrong for a sign shown *with its plate* — "06:30–09:00", "For 2km", "15 MAX" — which
comes out at about **14% of full size**, putting the plate text a couple of pixels high. The
questions would have been unanswerable rather than merely hard.

Fixed with an opt-in `Question.imageDetail` flag, passed through to `SignVisual` by the
three question surfaces (practice, mock, guided session). It swaps the square box for
`h-40 sm:h-52 w-auto`, taking the render to **41%**.

Opt-in per question rather than inferred from the image, which was the first attempt and is
wrong in both directions: a 1.35 aspect-ratio threshold caught 94 of 239 quizzable signs
(changing the look of many that were perfectly legible), while *missing* the "15 MAX" and
"and Local Access Only" plates, which are nearly square and still unreadable at 80px. The
deciding factor is whether the question asks the reader to read the sign — which only the
question knows.

`SignVisual` also now passes each crop's true intrinsic dimensions to `next/image` instead
of a hardcoded 160×160.

---

### Composite sign images — a live defect, found and fixed (signs sprint)

`scripts/extract_signs.py` slices sign images out of the manual's page scans by bounding
box. Where the manual stacks two or three related signs in one column, the slicer took them
as **a single image**, and the catalogue then paired that multi-sign picture with only one
of their meanings.

**Five questions were shipping this way** — asking "what does this sign mean?" over a
picture of two or three different signs:

| Sign | Image actually contains | Stated meaning |
|---|---|---|
| `warning-027-06` | steep descent **+** level crossing | "Slow moving vehicles ahead" — **belongs to neither** |
| `warning-030-05` | crosswind **+** low-flying aircraft **+** electric hazard | "Strong crosswinds can be expected ahead" |
| `warning-031-06` | height restriction **+** queuing traffic | "Height restriction ahead (temporary)" |

Three more (`warning-036-03`, `warning-039-04`, `marking-089-04`) were composites that
happened to escape the quiz only because their meanings failed an unrelated length gate.

**A second sweep during the batch-9 naming pass found two more**, by looking at every
remaining unnamed image rather than only the tall ones:

| Sign | Image actually contains | Live? |
|---|---|---|
| `information-043-04` | two no-through-road signs, left variant **+** right variant | **Yes** — was generating a meaning question |
| `information-044-02` | a "3 PHASE" signal sign **+** the park-and-ride sign | No |

Total across both sweeps: **eight composite images, six live questions**. The lesson for
next time is that aspect ratio was a poor detector — it found the first batch but missed
these two, which are wide rather than tall. The reliable method is to render every candidate
onto a contact sheet and look, which is cheap enough to be the default.

Fixed by quarantining all six in `COMPOSITE_IMAGE_IDS` (`signs.ts`), which
`signs-generated.ts` now excludes. `tests/signs-generated.test.ts` asserts that **no
question in the bank** — generated or hand-authored — points at one of those images; the
test was confirmed non-vacuous by reverting the guard and watching it name all five.

They were found by rendering every quizzable image with an unusual aspect ratio onto a
contact sheet and looking at it. Aspect ratio alone is not the test: plenty of legitimate
signs (road-marking strips, traffic-signal heads) are tall and narrow, so the shortlist has
to be eyeballed.

**Follow-up, not done here:** the real fix is re-extracting those six from the source pages,
which is `extract_signs.py` work. Until then they remain in the sign *library* with a
misleading caption — visible when browsing, just never asked about.

---

Two guards fired during this sprint and both were fixed rather than relaxed:
- The generated pack's difficulty had drifted to 83% "easy", because difficulty keyed off *"has a verified name"* as a proxy for *"is a common sign"*. Verifying the long tail broke the proxy. Difficulty now keys off an explicit core-sign set, independent of naming progress (23/31/46 across the three bands).
- The answer-position test counted questions served only once in its denominator, so its pass rate fell as the bank grew. Among questions actually served twice, slot variety is 93%.

## 5. Content pipeline — how we out-volume competitors (target: 900+ questions, 500+ flashcards, 60+ scenarios)

Competitors advertise "1000+ questions" but they're shallow rewrites of each other. Our edge: generate from **primary sources**, which are structured and enumerable.

### Step 1 — Build fact bases from primary sources (one-time deep research, ~1 session each)
For each category, produce a cited fact file at `docs/content/facts/<category>.md`. All items are then written ONLY from these files — no fact enters the bank without a source line.
1. **Signs (biggest win)**: the SARTSM volumes on transport.gov.za are a *catalogue* — every regulatory (R-series), warning (W-series), guidance and temporary sign has a code, name and meaning. Fetch the chapter PDFs, extract the sign inventory into a table. Each sign mechanically yields 1 flashcard + 1–2 questions (meaning, action required, common confusion pair). ~200 signs → ~350 items from one source.
2. **Rules**: National Road Traffic Act + Regulations (full text online) — enumerate the testable clauses (speeds, distances, loads, lights, licences, towing, pedestrians). Cross-check against the SA Learner Driver Manual "Rules of the Road" module.
3. **Controls / yard test**: the official K53 practical-test documents on arrivealive.co.za specify every pre-trip inspection item, manoeuvre and penalty — enumerable into controls questions and driver-module content.
4. **AARTO**: the schedule of offences with fine amounts and demerit points is a published table — a unique, current-events pack no competitor has.

### Step 2 — Category sprints (repeatable, ~1 per session)
Sprint = pick category → verify/refresh its fact file (WebSearch for changes) → write 60–100 items with difficulty spread and per-code variants → run gates → merge. Order by gap: signs → rules → road markings (new sub-pack) → temporary signs → intersections → controls → hazard/parking/following top-ups → bike/heavy depth (competitors are car-only — our A/10/14 tracks can be a moat).

### Step 3 — Quality gates (automate once, reuse every sprint)
- CI test asserting per-category minimum counts (prevents regressions, tracks growth).
- ID-uniqueness + near-duplicate prompt check (string-similarity script) so volume never becomes repetition.
- Every numeric fact carries `source`; batch review = grep all numbers, check against fact file.
- Sign images: extend the existing manual-extraction script to the full R/W/temporary sets so new sign items ship with real images (competitors' pixelated images are a top complaint).

### Targets (runtime counts; enforced as minimums by tests/content-coverage.test.ts)

> **Historical.** Every target in this table has been met or passed — as of the
> `motus-yard-pack.ts` sprint, controls is at 263 against a target of 120 and parking at 77
> against 80, and the bank is at 1 153 Q / 868 FC against ~900 / ~500. Trust
> `node scripts/content-stats.mjs`, not the "Now" column below. What limits the product now
> is the mock-paper ceiling and the per-section drill pools, not these category totals.

| Category | Now (Q) | Target | Category | Now (Q) | Target |
|---|---|---|---|---|---|
| signs | 98 | 220 | intersections | 31 | 100 |
| rules | 75 | 200 | parking | 29 | 80 |
| controls | 52 | 120 | following_distance | 28 | 60 |
| hazard_awareness | 39 | 120 | **Total** | **352 Q / 240 FC** | **~900 / ~500** |

_Sprint 1 (signs) shipped: +33 questions / +30 flashcards (`signs-pack.ts`). Sprint 2 (rules) shipped: +23 questions / +20 flashcards (`rules-pack.ts`). Sprint 3 (road markings + temporary signs) shipped: +21 questions / +20 flashcards (`markings-pack.ts`) — double/barrier lines, edge lines & road studs, box junctions, keep-clear, lane-reduction arrows, speed-hump & kerb markings, and a full temporary-sign set (yellow = enforceable, flag person STOP/GO, temporary speed zones, cones/detours, temporary-overrides-permanent). Sprint 4 (intersections) shipped: +20 questions / +20 flashcards (`intersections-pack.ts`) — right-of-way-is-given principle, stop-street vs yield behaviour, uncontrolled give-way-to-right, minor/through-road priority, stale green, turning-right without a filter arrow, twin-lane turn discipline, circle signalling/entry rules, zip merges, blind-junction creeping. Sprint 5 (controls/yard test) shipped: +20 questions / +20 flashcards (`controls-pack.ts`) — two-part practical structure, the four yard manoeuvres, incline roll-back & pole-contact fails, observation-before-every-movement, pull–push steering, cockpit drill & pre-trip walk-around, clutch/reverse/gear discipline, covering the brake, stall recovery, progressive braking. Sprint 6 (hazard + parking + following top-up) shipped: +25 questions / +22 flashcards (`hpf-pack.ts`) — hazard: forward scanning, space cushion, crosswind, smoke, stray animals, road rage, medication, stopped buses, debris-vs-swerve; parking: hill-with-no-kerb, securing on a steep slope, leaving a bay, dooring, pavement, bends/crests, angled-bay exit; following: towing, erratic drivers, loaded car, side buffer, why-seconds, helps-the-driver-behind, approaching queues, new-driver gap. Sprint 7 (bike/heavy depth) shipped: +23 questions / +21 flashcards (`bike-heavy-pack.ts`), all code-gated. Motorcycle (A/A1): countersteering, lane positioning, slow-look-lean-roll cornering, both-brakes, SMIDSY conspicuity, gravel, pre-ride check, stop-in-gear, look-where-you-go, truck wind blast, pillion. Heavy (10/14): low-air warning, rollover risk, off-tracking/cut-in, fifth-wheel coupling & tug test, reversing an artic, axle load distribution, overloading effects, dangerous-goods placards/PrDP, dual-tyre check, uncoupling order, brake fade. Bank: **483 Q / 363 FC** (car learners see 377 Q; bike/heavy 424 — coded items surface only for their group). Roadmap categories complete._

_**P1/P2 features shipped** (post-sprint): (1) **Per-section timed drill mode** — "Signs only / Rules only / Controls only" at the real section pass marks (controls 6/8, signs 23/28, rules 22/28) and a proportional slice of the 60-min clock; reuses the mock-exam component (`?mode=drill&section=`), `sampleSectionDrill` + `SECTION_DRILL` in `select.ts`, and a new `sectionDrills` plan allowance (free 1 lifetime / premium 5-day / plus unlimited, `drillsRemaining`), with a study-hub card + `drill_started`/`drill_completed` analytics and migration `0012_mock_drill_flag.sql`. (2) **Flashcard↔question conversion pack** (`converted-pack.ts`, +13 Q / +19 FC) — Q→FC cards for the thin categories and FC→Q questions with hand-written distractors. (3) **Voice-read questions** — `use-speech-output.ts` (Web Speech `speechSynthesis`, en-ZA voice) + a `SpeakButton` on the practice-question and flashcard surfaces; local, zero-cost, `tts_used` analytics. (4) **AARTO demerit guide + quiz pack** (`aarto-pack.ts`, +14 Q / +12 FC under `rules` with AARTO source overrides) + `/guides/aarto-demerit-points` SEO page, timed to the 1 Sept 2026 demerit go-live. Bank now **510 Q / 394 FC**. Remaining/deferred: sign-of-the-day notifications._

## 6. Content quality rules (standing)
- Every item states a verifiable K53/NRTA fact; no invented regulation numbers.
- Numbers (speeds, BAC, distances, demerits) must match the sources below; re-verify before each content batch.
- Explanations teach the *why*, provenance via the existing `sourceFor` line.

## Next-sprint sources (researched July 2026 — mine these for sprints 8+)

In yield order; each verified reachable at research time. All items written from these must still flow through the fact-file pipeline (§5).

1. **SARTSM sign catalogue** (sprint 8 — signs 119→220): [V1C1](https://www.transport.gov.za/wp-content/uploads/2023/02/V1C1.pdf), [V2C1](https://www.transport.gov.za/wp-content/uploads/2023/02/V2C1.pdf), [V4C1](https://www.transport.gov.za/wp-content/uploads/2023/02/V4C1.pdf) — the full R/W/GS/temporary inventory with codes+meanings; extend `scripts/extract_signs.py` to the remaining sets so every new item ships with a real image.
2. **Official practical-test doc** (controls/yard depth + per-manoeuvre penalty tables): [Dept of Transport K53 light motor vehicles code A part 1](https://www.arrivealive.co.za/documents/k53/k53%20light%20motor%20vehicles%20code%20a%20part%201.pdf); supporting guides: [k53sim.co.za manoeuvres](https://k53sim.co.za/k53-yard-test-manoeuvres-parallel-parking-alley-docking-incline-start/), [k53.elidge.com yard test](https://k53.elidge.com/category/k53-guide/k53-driving-licence-test/the-yard-test-for-the-k53-driving-licence-test/).
3. **Bike/heavy moat** (code-gated depth 2): [toda.co.za code 10/14 questions](https://toda.co.za/learners-test-for-trucks), [k53test.co.za vehicle codes](https://k53test.co.za/vehicle-codes) (Code 10 ≤16 t GVM; Code 14 >16 t / articulated; written test shared, controls differ per code).
4. **Coverage comparison** (check our blind spots against what competitors drill): [testprep.co.za](https://www.testprep.co.za/) (850+ Q), [k53learnerstest.co.za](https://k53learnerstest.co.za/), [k53learnersapp.co.za](https://k53learnersapp.co.za/k53-learners-test), [testmocks.com](https://testmocks.com/exams/k53-rsa-learners-licence/), [officialmotusk53.co.za](https://www.officialmotusk53.co.za/motus-k53-online-test/), [k53online.co.za](https://k53online.co.za/), [freek53.xyz](https://www.freek53.xyz/).
5. **Study-guide PDFs** (secondary cross-checks): [k-53.co.za study guide 2026](https://www.k-53.co.za/assets/k53-study-guide-2026.pdf), [iDriving School K53 manual](https://idrivingschool.co.za/wp-content/uploads/2024/08/iDriving-School-K53_optimized.pdf).
6. **AARTO refresh**: re-verify fines/dates at [aboutaarto.co.za](https://www.aboutaarto.co.za/demerits) close to the 1 Sept 2026 demerit go-live before publishing any new AARTO batch.

## Sources
- Test structure & pass marks: [k53-test.co.za](https://www.k53-test.co.za/writing-the-learners-licence-test), [nasi-ispani.co.za](https://www.nasi-ispani.co.za/the-k53-learners-test-basics-to-help-you-pass/)
- Sign taxonomy: [Dept of Transport SARTSM](https://www.transport.gov.za/wp-content/uploads/2023/02/V2C3.pdf), [Arrive Alive](https://www.arrivealive.mobi/traffic-signs-of-south-africa), [Wikipedia — Road signs in South Africa](https://en.wikipedia.org/wiki/Road_signs_in_South_Africa)
- AARTO: [Moneyweb](https://www.moneyweb.co.za/news/south-africa/driving-licence-demerit-point-system-set-to-start-on-1-september-2026/), [Daily Maverick](https://www.dailymaverick.co.za/article/2026-06-29-new-demerit-system-what-south-african-motorists-need-to-know/), [aboutaarto.co.za](https://www.aboutaarto.co.za/demerits)
- Rules numbers: [Arrive Alive — drunk driving](https://www.arrivealive.mobi/drunk-driving-and-road-safety), [Drive South Africa](https://www.drivesouthafrica.com/en/blog/drunk-driving-in-south-africa-laws), [SA Learner Driver Manual (Rules of the Road)](https://drivecodrivingschool.co.za/assets/files/1_Rules_of_the_Road_draft1.pdf)
- Yard test: [Dept of Transport K53 practical test](https://www.arrivealive.co.za/documents/k53/k53%20light%20motor%20vehicles%20code%20a%20part%201.pdf), [k53sim.co.za](https://k53sim.co.za/k53-yard-test-manoeuvres-parallel-parking-alley-docking-incline-start/)
- Competitor reviews: [K53 Tests (Play)](https://play.google.com/store/apps/details?id=com.nhlakaniphonkosi.k53tests), [K53 RSA Learners License (Play)](https://play.google.com/store/apps/details?id=com.learnersandlicense)
