# Content & Feature Expansion Roadmap

_Research date: July 2026. Sources listed at the bottom; verify regulated facts (fines, AARTO dates) before publishing content built on them._

## 1. Where the bank stands today

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

The official exam draws 28 signs + 28 rules-group + 8 controls per paper. Our signs pool (65) supports barely two full mocks without repeats; leading competitor apps advertise **1 000+ questions**. Volume is the #1 gap.

## 2. What the research says the test actually needs

- **Exam structure** (confirmed): 64 questions / 60 min; pass marks per section — controls 6/8, signs 23/28, rules 22/28; failing any one section fails the exam. Our mock already mirrors this; content depth per section doesn't yet.
- **Sign taxonomy**: SADC-RTSM defines regulatory, warning, guidance, information and **temporary (yellow-background)** classes. We have almost no temporary-sign or road-marking items — both are heavily examined.
- **Rules specifics with hard numbers** (high-yield, easy to test): speed limits 60/100/120 km/h; BAC < 0.05 g/100 ml (0.02 professional), breath < 0.24 mg/1000 ml; learner age 17, licence 18; following distance 2s (4s in rain).
- **AARTO demerits** (national rollout completing 2026; points from 1 Sept 2026): learner threshold **6 points** vs 15 for licensed drivers; 1 point expires per 3 months. This is new, exam-adjacent, and no competitor teaches it well — a differentiator for a "rules" sub-topic and a guide.
- **Yard test**: turn-in-road, alley docking, parallel parking, incline start; whole yard test ≤ 20:59; observation sequences scored per movement. Our Premium-Plus driver modules cover this — content is thinner than the learner side.

## 3. Competitor gap analysis (Play Store K53 apps)

What users praise elsewhere: questions "very similar to the real test", per-section tests, 1000+ banks, answer review after tests. What they hate: ads mid-test, no post-test mistake review, pixelated sign images, offline failures. **We already win on**: no ads, mistake review with AI second opinion, real sign images, PWA offline. **We lose on**: raw volume and per-section drill tests.

## 4. Prioritized roadmap

### P0 — Volume (content only, no code)
1. Grow signs to 150+ questions (regulatory/warning/guidance/temporary/markings sub-coverage) and rules to 120+ with numeric-fact items. Target: **600 questions / 350 flashcards** total; supports 8+ non-repeating mocks.
2. Balance thin categories first: parking, following_distance, intersections (each < 22 today). _First batch shipped alongside this doc: +40 questions, +20 flashcards._

### P1 — Exam-fidelity features
3. **Per-section test mode**: "Signs only" / "Rules only" / "Controls only" timed drills matching real section pass marks (reuses mini-mock machinery; competitors' most-loved feature).
4. **Road markings + traffic signals content pack** (currently folded into signs; the manual treats them as their own study units).
5. **Temporary/yellow sign pack** with real images.

### P2 — Differentiators
6. **AARTO demerit guide + quiz pack** (launch-timed to Sept 2026 demerit go-live; strong SEO too).
7. **Sign-of-the-day push/notification** reusing the PWA + email infra.
8. **Voice-read questions** (accessibility + studying in taxis; Web Speech API already used for flashcard recall).
9. Driver's-side expansion: per-manoeuvre penalty-point tables and observation-sequence checklists in the yard-test modules.

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
| Category | Now (Q) | Target | Category | Now (Q) | Target |
|---|---|---|---|---|---|
| signs | 98 | 220 | intersections | 31 | 100 |
| rules | 75 | 200 | parking | 29 | 80 |
| controls | 52 | 120 | following_distance | 28 | 60 |
| hazard_awareness | 39 | 120 | **Total** | **352 Q / 240 FC** | **~900 / ~500** |

_Sprint 1 (signs) shipped: +33 questions / +30 flashcards (`signs-pack.ts`). Sprint 2 (rules) shipped: +23 questions / +20 flashcards (`rules-pack.ts`). Sprint 3 (road markings + temporary signs) shipped: +21 questions / +20 flashcards (`markings-pack.ts`) — double/barrier lines, edge lines & road studs, box junctions, keep-clear, lane-reduction arrows, speed-hump & kerb markings, and a full temporary-sign set (yellow = enforceable, flag person STOP/GO, temporary speed zones, cones/detours, temporary-overrides-permanent). Sprint 4 (intersections) shipped: +20 questions / +20 flashcards (`intersections-pack.ts`) — right-of-way-is-given principle, stop-street vs yield behaviour, uncontrolled give-way-to-right, minor/through-road priority, stale green, turning-right without a filter arrow, twin-lane turn discipline, circle signalling/entry rules, zip merges, blind-junction creeping. Sprint 5 (controls/yard test) shipped: +20 questions / +20 flashcards (`controls-pack.ts`) — two-part practical structure, the four yard manoeuvres, incline roll-back & pole-contact fails, observation-before-every-movement, pull–push steering, cockpit drill & pre-trip walk-around, clutch/reverse/gear discipline, covering the brake, stall recovery, progressive braking. Sprint 6 (hazard + parking + following top-up) shipped: +25 questions / +22 flashcards (`hpf-pack.ts`) — hazard: forward scanning, space cushion, crosswind, smoke, stray animals, road rage, medication, stopped buses, debris-vs-swerve; parking: hill-with-no-kerb, securing on a steep slope, leaving a bay, dooring, pavement, bends/crests, angled-bay exit; following: towing, erratic drivers, loaded car, side buffer, why-seconds, helps-the-driver-behind, approaching queues, new-driver gap. Sprint 7 (bike/heavy depth) shipped: +23 questions / +21 flashcards (`bike-heavy-pack.ts`), all code-gated. Motorcycle (A/A1): countersteering, lane positioning, slow-look-lean-roll cornering, both-brakes, SMIDSY conspicuity, gravel, pre-ride check, stop-in-gear, look-where-you-go, truck wind blast, pillion. Heavy (10/14): low-air warning, rollover risk, off-tracking/cut-in, fifth-wheel coupling & tug test, reversing an artic, axle load distribution, overloading effects, dangerous-goods placards/PrDP, dual-tyre check, uncoupling order, brake fade. Bank: **483 Q / 363 FC** (car learners see 377 Q; bike/heavy 424 — coded items surface only for their group). Roadmap categories complete; future sprints = depth/refresh + the P1/P2 features (per-section drill mode, AARTO pack, voice-read)._

## 6. Content quality rules (standing)
- Every item states a verifiable K53/NRTA fact; no invented regulation numbers.
- Numbers (speeds, BAC, distances, demerits) must match the sources below; re-verify before each content batch.
- Explanations teach the *why*, provenance via the existing `sourceFor` line.

## Sources
- Test structure & pass marks: [k53-test.co.za](https://www.k53-test.co.za/writing-the-learners-licence-test), [nasi-ispani.co.za](https://www.nasi-ispani.co.za/the-k53-learners-test-basics-to-help-you-pass/)
- Sign taxonomy: [Dept of Transport SARTSM](https://www.transport.gov.za/wp-content/uploads/2023/02/V2C3.pdf), [Arrive Alive](https://www.arrivealive.mobi/traffic-signs-of-south-africa), [Wikipedia — Road signs in South Africa](https://en.wikipedia.org/wiki/Road_signs_in_South_Africa)
- AARTO: [Moneyweb](https://www.moneyweb.co.za/news/south-africa/driving-licence-demerit-point-system-set-to-start-on-1-september-2026/), [Daily Maverick](https://www.dailymaverick.co.za/article/2026-06-29-new-demerit-system-what-south-african-motorists-need-to-know/), [aboutaarto.co.za](https://www.aboutaarto.co.za/demerits)
- Rules numbers: [Arrive Alive — drunk driving](https://www.arrivealive.mobi/drunk-driving-and-road-safety), [Drive South Africa](https://www.drivesouthafrica.com/en/blog/drunk-driving-in-south-africa-laws), [SA Learner Driver Manual (Rules of the Road)](https://drivecodrivingschool.co.za/assets/files/1_Rules_of_the_Road_draft1.pdf)
- Yard test: [Dept of Transport K53 practical test](https://www.arrivealive.co.za/documents/k53/k53%20light%20motor%20vehicles%20code%20a%20part%201.pdf), [k53sim.co.za](https://k53sim.co.za/k53-yard-test-manoeuvres-parallel-parking-alley-docking-incline-start/)
- Competitor reviews: [K53 Tests (Play)](https://play.google.com/store/apps/details?id=com.nhlakaniphonkosi.k53tests), [K53 RSA Learners License (Play)](https://play.google.com/store/apps/details?id=com.learnersandlicense)
