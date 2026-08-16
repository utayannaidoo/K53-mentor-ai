/**
 * Snellen acuity maths for the tumbling-E screening test.
 *
 * The ladder and the visual-acuity-loss column are the ones printed on the eye
 * test chart in the Official Motus/Safeways K53 Learner's & Driver's Manual
 * (11th ed., p.96), which instructs the reader to stand 3 m from the page.
 *
 * The pass rule is not the manual's, though — it is regulation 102 of the
 * National Road Traffic Act, which is what the DLTC actually applies.
 *
 * A screen is not a printed chart: the same pixel height is a different
 * angular size on every device, at every viewing distance. So nothing here
 * works in pixels — sizes are derived from the physical geometry, and the
 * caller supplies the two measurements that pin it down (px per mm, from the
 * bank-card calibration, and the viewing distance). Without both, the numbers
 * on screen would be decoration.
 *
 * The other thing a screen has that paper does not is a resolution floor. Ink
 * has no smallest line; a display does, and near it the dots decide what the
 * reader can resolve. Everything below therefore distinguishes an acuity the
 * reader was *measured* at from one the screen merely could not go past —
 * `StageResult`, and the reason this module is more than a few multiplications.
 */

/** ISO/IEC 7810 ID-1 — every bank/ID card in the world is this wide. */
export const CARD_WIDTH_MM = 85.6;

export interface AcuityLevel {
  /** Denominator D in the 6/D Snellen fraction. */
  denominator: number;
  /** "6/12" — how the DLTC and the manual write it. */
  label: string;
  /** Visual-acuity-loss column from the manual's chart, where printed. */
  lossPercent: number | null;
}

/** Largest first, exactly as the manual's chart reads top to bottom. */
export const ACUITY_LEVELS: readonly AcuityLevel[] = [
  { denominator: 60, label: "6/60", lossPercent: 80 },
  { denominator: 36, label: "6/36", lossPercent: 55 },
  { denominator: 24, label: "6/24", lossPercent: 40 },
  { denominator: 18, label: "6/18", lossPercent: 30 },
  { denominator: 12, label: "6/12", lossPercent: 15 },
  { denominator: 9, label: "6/9", lossPercent: 10 },
  { denominator: 6, label: "6/6", lossPercent: 0 },
  { denominator: 5, label: "6/5", lossPercent: null },
];

/**
 * The light-motor-vehicle threshold (codes A1, A, B, EB), from regulation 102
 * of the National Road Traffic Act: at least **6/12 in each eye**, or — where
 * one eye is under 6/12 or blind — at least **6/9 in the other**. With or
 * without glasses or contact lenses. Indices into ACUITY_LEVELS, so "at least
 * as good as" is `>=`.
 *
 * Note what the regulation does *not* say: "6/12 in one eye, or both eyes
 * together". That looser reading is widely repeated and it used to be the rule
 * implemented here, and the difference is not academic — a reader with 6/6 on
 * the left and 6/36 on the right satisfies it and fails the actual standard,
 * because a left eye carrying a right one has to reach 6/9, not 6/12. Telling
 * that reader they are fine is the one mistake this screener must not make.
 */
export const LMV_PASS_INDEX = ACUITY_LEVELS.findIndex((l) => l.denominator === 12);
export const LMV_CARRY_INDEX = ACUITY_LEVELS.findIndex((l) => l.denominator === 9);

/**
 * The DLTC screener tests each eye on its own and then both together, in that
 * order. The regulation is written per eye, so the verdict turns on the first
 * two; the binocular reading is kept because it is what most people remember
 * being asked for, and because a binocular figure alone would hide exactly the
 * case the standard is written around — one strong eye carrying one weak one.
 */
export const EYE_STAGES = ["left", "right", "both"] as const;
export type EyeStage = (typeof EYE_STAGES)[number];

export const EYE_STAGE_LABEL: Record<EyeStage, string> = {
  left: "Left eye",
  right: "Right eye",
  both: "Both eyes",
};

/** What the reader covers during each stage. `both` covers nothing. */
export const EYE_STAGE_INSTRUCTION: Record<EyeStage, string> = {
  left: "Cover your right eye — do not press on it — and read with your left.",
  right: "Now cover your left eye and read with your right.",
  both: "Uncover both eyes and read with them together.",
};

/**
 * Height in millimetres of a Snellen optotype of the given acuity, viewed from
 * `distanceMm`.
 *
 * A 6/6 optotype subtends 5 arcminutes overall (each of its five strokes 1
 * arcmin) at the test distance; a 6/D optotype subtends 5 × D/6 arcminutes.
 */
export function optotypeHeightMm(denominator: number, distanceMm: number): number {
  const arcminutes = 5 * (denominator / 6);
  const radians = (arcminutes / 60) * (Math.PI / 180);
  return 2 * distanceMm * Math.tan(radians / 2);
}

/** Same thing in CSS pixels, given the calibration. */
export function optotypeHeightPx(
  denominator: number,
  distanceMm: number,
  pxPerMm: number,
): number {
  return optotypeHeightMm(denominator, distanceMm) * pxPerMm;
}

/** px per mm implied by sizing an on-screen outline to a real bank card. */
export function pxPerMmFromCardWidth(cardWidthPx: number): number {
  return cardWidthPx / CARD_WIDTH_MM;
}

/**
 * The smallest optotype a display can honestly draw.
 *
 * A Snellen E is five stroke-widths tall, so the detail the reader actually has
 * to resolve is one fifth of its height. Below some number of device pixels per
 * stroke it is the *display* deciding whether the gaps between the bars are
 * visible, not the eye, and the ladder has stopped measuring sight.
 *
 * Device pixels rather than CSS pixels, because the physical dot grid is what
 * imposes the limit: one CSS pixel is three dots on a phone and one on a 95 dpi
 * desktop monitor, which is why the same test at the same distance can run all
 * the way to 6/5 on the phone and stall three rungs short on the desk.
 *
 * Four, not two, and the difference is not a safety margin — it is where the
 * letter survives being *positioned*. Measured by rasterising this exact glyph
 * in a browser at each size and sweeping its sub-pixel offset (a canvas job, so
 * it cannot live in the jsdom suite; the method is written up on the PR that
 * changed this constant from 2):
 *
 *     stroke   worst-case Michelson contrast across sub-pixel phase
 *       1 px   -0.08   gaps render darker than the bars; a uniform grey square
 *       2 px    0.33   crisp when it lands on the grid, a grey smear when it
 *                      lands half a pixel off — and it is the same letter
 *       4 px    0.61   solid bars and white gaps at every offset
 *
 * At two pixels per stroke the answer depends on where the letter happens to
 * fall, and this test *moves the letter on every trial* to stop it being
 * memorised — so the phase is effectively random and the bottom rung alternates
 * between legible and mush. That is noise injected into precisely the rung that
 * decides the result. Four costs distance (every threshold doubles) and buys a
 * letter that renders the same wherever it lands.
 *
 * Raising this is only safe because a truncated ladder now reports "6/24 or
 * better" rather than "6/24": a screen that can no longer reach 6/6 says so
 * instead of inventing a number. See `StageResult`.
 */
export const STROKES_PER_OPTOTYPE = 5;
export const DEVICE_PX_PER_STROKE = 4;

export function minOptotypePx(devicePixelRatio = 1): number {
  return (STROKES_PER_OPTOTYPE * DEVICE_PX_PER_STROKE) / Math.max(devicePixelRatio, 1);
}

/**
 * The closest a reader may sit and still have `denominator` drawn honestly.
 *
 * Optotype height is linear in viewing distance, so this inverts
 * `optotypeHeightPx` directly: measure the height at 1 mm, divide the floor by
 * it. Moving back is the only lever a reader has — a screen cannot grow dots,
 * but doubling the distance halves the angular size of every pixel.
 */
export function minDistanceMmFor(denominator: number, pxPerMm: number, minPx: number): number {
  const pxPerMmOfDistance = optotypeHeightPx(denominator, 1, pxPerMm);
  return pxPerMmOfDistance > 0 ? minPx / pxPerMmOfDistance : Number.POSITIVE_INFINITY;
}

/**
 * The largest level whose optotype still fits on screen. Deeper levels are
 * unreachable rather than wrong — on a phone at 40 cm, 6/60 is taller than the
 * viewport, so the test has to start further down the chart and say so.
 */
export function firstRenderableIndex(
  distanceMm: number,
  pxPerMm: number,
  availablePx: number,
): number {
  const i = ACUITY_LEVELS.findIndex(
    (l) => optotypeHeightPx(l.denominator, distanceMm, pxPerMm) <= availablePx,
  );
  return i === -1 ? ACUITY_LEVELS.length - 1 : i;
}

/**
 * The rungs a ladder may use on a chart `availablePx` tall.
 *
 * `start` is the largest optotype that fits in half the chart; `max` is the
 * last one this screen can still draw honestly. Both come from one call so they
 * cannot be derived from different measurements — the eyes disagreeing about
 * how many letters they were shown was exactly that, one eye sized against an
 * unmeasured chart and the next two against a measured one.
 *
 * `max` is a property of the *screen*, never of the reader, and every consumer
 * has to keep that straight: a ladder that ends there has run out of rungs, and
 * saying so is the difference between "your acuity is 6/24" and "6/24 was the
 * smallest line this screen could show you, and you read all of it".
 */
export function ladderBounds(
  distanceMm: number,
  pxPerMm: number,
  availablePx: number,
  minOptotypePx: number,
): { startIndex: number; maxIndex: number } {
  const startIndex = firstRenderableIndex(distanceMm, pxPerMm, availablePx * 0.5);
  let maxIndex = startIndex;
  for (let i = startIndex; i < ACUITY_LEVELS.length; i++) {
    if (optotypeHeightPx(ACUITY_LEVELS[i].denominator, distanceMm, pxPerMm) < minOptotypePx) break;
    maxIndex = i;
  }
  return { startIndex, maxIndex };
}

/** The four orientations an E can take; the value is the direction its bars point. */
export const E_DIRECTIONS = ["right", "down", "left", "up"] as const;
export type EDirection = (typeof E_DIRECTIONS)[number];

/** Clockwise degrees to rotate a right-facing E so its bars point `dir`. */
export const E_ROTATION: Record<EDirection, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

export interface LevelOutcome {
  index: number;
  correct: number;
  asked: number;
}

/**
 * A level is passed when the reader gets most of its letters right. Optometric
 * practice is a majority of the line; with 4 alternatives, guessing alone
 * scores 25%, so 3 of 4 keeps a lucky run from promoting someone.
 */
export function levelPassed(outcome: LevelOutcome, required: number): boolean {
  return outcome.correct >= required;
}

/**
 * The deepest level the reader actually passed.
 * Returns null when they failed even the first level presented.
 */
export function bestPassedIndex(outcomes: readonly LevelOutcome[], required: number): number | null {
  const passed = outcomes.filter((o) => levelPassed(o, required)).map((o) => o.index);
  return passed.length ? Math.max(...passed) : null;
}

/**
 * What one eye's ladder established — which is not always a number.
 *
 * A threshold test measures by bracketing: you know someone's acuity is 6/12
 * because they read 6/12 and failed 6/9. A ladder that simply runs out of rungs
 * has bracketed nothing from above, and reporting its last rung as the answer
 * is how a reader who got every single letter right was told "6/24 — about 40%
 * visual acuity loss". The test stopped at 6/24 because the next line would
 * have been six pixels tall, not because they misread anything.
 *
 * So the result is a bracket, and the three ways a ladder ends are three
 * different facts:
 *
 * - `measured` — they failed a line, so their acuity is that line. A number.
 * - `atLeast`  — they cleared the smallest line this screen can draw. A floor,
 *                with nothing above it. "6/24 or better", never "6/24".
 * - `belowChart` — they failed the *largest* line shown, so they are worse than
 *                it and how much worse is unknown.
 */
export type StageResult =
  | { kind: "untested" }
  | { kind: "belowChart"; startIndex: number }
  | { kind: "measured"; index: number }
  | { kind: "atLeast"; index: number };

export function stageResult(
  outcomes: readonly LevelOutcome[],
  required: number,
  bounds: { startIndex: number; maxIndex: number },
): StageResult {
  if (!outcomes.length) return { kind: "untested" };
  const best = bestPassedIndex(outcomes, required);
  if (best === null) return { kind: "belowChart", startIndex: bounds.startIndex };
  return best >= bounds.maxIndex
    ? { kind: "atLeast", index: best }
    : { kind: "measured", index: best };
}

/** The line to print for a stage, or null if it never produced one. */
export function stageLabel(result: StageResult): string | null {
  switch (result.kind) {
    case "untested":
      return null;
    case "belowChart":
      return `worse than ${ACUITY_LEVELS[result.startIndex].label}`;
    case "measured":
      return ACUITY_LEVELS[result.index].label;
    case "atLeast":
      return `${ACUITY_LEVELS[result.index].label} or better`;
  }
}

/**
 * Three-valued on purpose: "we could not tell" is a real outcome of a screening
 * test on a screen, and collapsing it into "no" is what turned a perfect run
 * into "Worth getting checked".
 */
export type Tri = "yes" | "no" | "unknown";

/** Whether a stage result clears `targetIndex` — or whether the test can say. */
export function reaches(result: StageResult, targetIndex: number): Tri {
  switch (result.kind) {
    case "untested":
      return "unknown";
    // Failed the largest line the screen could draw. That settles the question
    // only if the target was actually on the chart: where the screen could not
    // even draw the target line, failing something smaller says nothing.
    case "belowChart":
      return result.startIndex <= targetIndex ? "no" : "unknown";
    case "measured":
      return result.index >= targetIndex ? "yes" : "no";
    // Bounded below and open above: clearing the floor proves the target only
    // when the floor is already at or past it.
    case "atLeast":
      return result.index >= targetIndex ? "yes" : "unknown";
  }
}

const triAnd = (a: Tri, b: Tri): Tri =>
  a === "no" || b === "no" ? "no" : a === "yes" && b === "yes" ? "yes" : "unknown";
const triOr = (a: Tri, b: Tri): Tri =>
  a === "yes" || b === "yes" ? "yes" : a === "no" && b === "no" ? "no" : "unknown";
const triNot = (a: Tri): Tri => (a === "yes" ? "no" : a === "no" ? "yes" : "unknown");

/**
 * Regulation 102, transcribed: "6/12 for each eye, or where the visual acuity
 * of one eye is less than 6/12 or where one eye is blind, a minimum visual
 * acuity for the other eye of 6/9."
 *
 * The binocular stage is deliberately not an input. It is worth showing and
 * worth reading, but the regulation is written per eye, and letting a good
 * binocular figure carry a failing eye is the looser rule this used to apply.
 */
export function lmvVerdict(left: StageResult, right: StageResult): Tri {
  const leftClears = reaches(left, LMV_PASS_INDEX);
  const rightClears = reaches(right, LMV_PASS_INDEX);

  // "6/12 for each eye..."
  const bothClear = triAnd(leftClears, rightClears);
  // "...or, where one eye is under 6/12, 6/9 in the other."
  const carried = triOr(
    triAnd(triNot(rightClears), reaches(left, LMV_CARRY_INDEX)),
    triAnd(triNot(leftClears), reaches(right, LMV_CARRY_INDEX)),
  );
  return triOr(bothClear, carried);
}

/**
 * The deepest line anyone cleared, for the headline figure.
 *
 * `belowChart` outranks `untested` without carrying an index: an eye that read
 * nothing is still a result, and the headline has to be able to say so rather
 * than showing a dash as though the test never ran.
 */
export function bestAcrossStages(
  results: Partial<Record<EyeStage, StageResult>>,
): StageResult {
  const rank = (r: StageResult) => {
    if (r.kind === "measured" || r.kind === "atLeast") return r.index;
    return r.kind === "belowChart" ? -1 : -2;
  };
  let best: StageResult = { kind: "untested" };
  for (const stage of EYE_STAGES) {
    const result = results[stage];
    if (result && rank(result) > rank(best)) best = result;
  }
  return best;
}
