/**
 * Snellen acuity maths for the tumbling-E screening test.
 *
 * The ladder and the visual-acuity-loss column are the ones printed on the eye
 * test chart in the Official Motus/Safeways K53 Learner's & Driver's Manual
 * (11th ed., p.96), which instructs the reader to stand 3 m from the page.
 *
 * A screen is not a printed chart: the same pixel height is a different
 * angular size on every device, at every viewing distance. So nothing here
 * works in pixels — sizes are derived from the physical geometry, and the
 * caller supplies the two measurements that pin it down (px per mm, from the
 * bank-card calibration, and the viewing distance). Without both, the numbers
 * on screen would be decoration.
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
 * The threshold for a light motor vehicle (Code B/EB): **6/12 or better in one
 * eye, or both eyes together** — with or without glasses or contact lenses.
 * Index into ACUITY_LEVELS, so "at least as good as".
 */
export const LMV_PASS_INDEX = ACUITY_LEVELS.findIndex((l) => l.denominator === 12);

/**
 * The DLTC screener tests each eye on its own and then both together, in that
 * order, and the pass rule reads across all three. Reproduced here because a
 * single binocular number would hide exactly the case the real test is looking
 * for — one strong eye carrying one weak one.
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
 * Whether a set of per-stage results meets the Code B standard.
 *
 * "6/12 in one eye, **or** both eyes together" — so the best of the three
 * stages decides it. A null stage (failed even the largest line shown) simply
 * cannot be the one that carries the pass.
 */
export function meetsLmvStandard(results: Partial<Record<EyeStage, number | null>>): boolean {
  return EYE_STAGES.some((stage) => {
    const idx = results[stage];
    return idx !== null && idx !== undefined && idx >= LMV_PASS_INDEX;
  });
}

/** The deepest level reached across all stages, or null if none was passed. */
export function bestAcrossStages(
  results: Partial<Record<EyeStage, number | null>>,
): number | null {
  const found = EYE_STAGES.map((s) => results[s]).filter(
    (v): v is number => v !== null && v !== undefined,
  );
  return found.length ? Math.max(...found) : null;
}

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
 * The reported result: the deepest level the reader actually passed.
 * Returns null when they failed even the first level presented.
 */
export function bestPassedIndex(outcomes: readonly LevelOutcome[], required: number): number | null {
  const passed = outcomes.filter((o) => levelPassed(o, required)).map((o) => o.index);
  return passed.length ? Math.max(...passed) : null;
}
