"use client";

import * as React from "react";
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, RotateCcw, Ruler, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";
import {
  ACUITY_LEVELS,
  CARD_WIDTH_MM,
  E_ROTATION,
  EYE_STAGES,
  EYE_STAGE_INSTRUCTION,
  EYE_STAGE_LABEL,
  LMV_PASS_INDEX,
  bestAcrossStages,
  ladderBounds,
  lmvVerdict,
  minDistanceMmFor,
  minOptotypePx,
  optotypeHeightPx,
  pxPerMmFromCardWidth,
  reaches,
  stageLabel,
  stageResult,
  type EDirection,
  type EyeStage,
  type LevelOutcome,
  type StageResult,
} from "@/lib/vision/acuity";
import {
  PER_LEVEL,
  REQUIRED,
  initialLadder,
  ladderReducer,
  type Trial,
} from "@/lib/vision/ladder";

/** Where the E sits relative to the centre point it orbits, as a fraction of the stage. */
const ORBIT_RADIUS = 0.26;

/**
 * Travel of the calibration slider. The maximum is only the *ceiling*: the step
 * narrows it to whatever the outline's own box can show, so the drawn width and
 * the value driving `pxPerMmFromCardWidth` never disagree. See `CalibrateStep`.
 */
const CARD_MIN_PX = 140;
const CARD_MAX_PX = 640;

/**
 * Last-resort chart height, matching the CSS box's 26rem cap. Only reached when
 * neither the element nor the window reports a size; without it the ladder has
 * no bounds to lock and the reader waits on a blank chart indefinitely.
 */
const FALLBACK_STAGE_PX = 416;

const DISTANCE_MIN_CM = 25;
/**
 * Six metres — the distance a DLTC reads its own Snellen chart from, so the
 * range now covers the real thing rather than stopping short of it. It has to:
 * at four device pixels per stroke a 95 dpi monitor needs about 3.7 m before a
 * 6/6 letter exists, and a slider that capped at 3 m would have recommended a
 * distance that could not deliver what the copy beside it promised.
 */
const DISTANCE_MAX_CM = 600;
const DISTANCE_STEP_CM = 5;

/** Only ever seen if calibration cannot suggest better; the real default is computed. */
const FALLBACK_DISTANCE_CM = 200;

const clampDistance = (cm: number) =>
  Math.min(DISTANCE_MAX_CM, Math.max(DISTANCE_MIN_CM, cm));

/** Round up to a slider stop — rounding *down* would land inside the blur. */
const toStop = (cm: number) => Math.ceil(cm / DISTANCE_STEP_CM) * DISTANCE_STEP_CM;

type Phase = "calibrate" | "distance" | "eye-prompt" | "testing" | "done";

const ARROWS = [
  { dir: "up" as const, Icon: ArrowUp, label: "Bars point up" },
  { dir: "right" as const, Icon: ArrowRight, label: "Bars point right" },
  { dir: "down" as const, Icon: ArrowDown, label: "Bars point down" },
  { dir: "left" as const, Icon: ArrowLeft, label: "Bars point left" },
];

/**
 * A tumbling-E visual acuity screener, modelled on the DLTC's vision screener:
 * a block E is presented at one of four orientations and shrinks as you go, and
 * you report which way its bars point.
 *
 * It follows the real order of events — **left eye, right eye, then both
 * together** — and applies regulation 102's actual rule, which is written per
 * eye: 6/12 in each, or 6/9 in the other where one is under 6/12 or blind.
 *
 * The hard part is not the ladder, it is knowing when the ladder has stopped
 * measuring the reader and started measuring the screen. A display has a
 * smallest line it can draw honestly; past that the dots decide what is legible.
 * So the distance step refuses to pretend — it works out how far back the reader
 * must sit for the Code B line to exist at all — and a ladder that ends at the
 * screen's floor reports "6/24 or better", never "6/24".
 *
 * What it deliberately does **not** attempt is the peripheral-vision check the
 * real machine also runs, where lights flicker at the edges of your field. A
 * phone at arm's length subtends perhaps 30° of that field, so anything built
 * here would look like a test and measure nothing. It is named in the results
 * instead.
 *
 * This is a *screener*, not a medical test and not the DLTC's own test. The
 * copy says so; do not let that slip out of the UI.
 */
export function TumblingETest() {
  const [phase, setPhase] = React.useState<Phase>("calibrate");

  // Calibration: the user sizes an on-screen outline to a real bank card.
  const [cardWidthPx, setCardWidthPx] = React.useState(320);
  const [distanceCm, setDistanceCm] = React.useState(FALLBACK_DISTANCE_CM);
  // Once the reader moves the slider it is theirs; the suggestion stops fighting it.
  const [distanceChosen, setDistanceChosen] = React.useState(false);

  const [stagePx, setStagePx] = React.useState(0);
  const stageRef = React.useRef<HTMLDivElement>(null);

  /**
   * Mirrors the chart's own CSS box, measured from the window rather than the
   * element so it exists before the chart is ever mounted, plus the dot density
   * that decides how small a letter may honestly get. Both move together: a
   * browser zoom or a drag to a second monitor changes each of them.
   */
  const [screen, setScreen] = React.useState({ viewportPx: 0, dpr: 1 });
  React.useEffect(() => {
    const compute = () =>
      setScreen({
        viewportPx: Math.min(window.innerHeight * 0.58, 26 * 16),
        dpr: window.devicePixelRatio || 1,
      });
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // The whole ladder is one machine — see lib/vision/ladder.ts for why.
  const [ladder, dispatch] = React.useReducer(ladderReducer, undefined, () =>
    initialLadder(),
  );
  const { trial, levelIndex, asked: askedThisLevel, stageIndex, stageOutcomes } = ladder;

  const stage = EYE_STAGES[stageIndex];

  const pxPerMm = pxPerMmFromCardWidth(cardWidthPx);
  const distanceMm = distanceCm * 10;
  const minPx = minOptotypePx(screen.dpr);

  // Measure the stage so we never present a letter taller than the box.
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStagePx(Math.min(el.clientWidth, el.clientHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [phase]);

  /** What the distance step previews. The authoritative pair is read below. */
  const preview = React.useMemo(
    () =>
      ladderBounds(
        distanceMm,
        pxPerMm,
        stagePx || screen.viewportPx || FALLBACK_STAGE_PX,
        minPx,
      ),
    [distanceMm, pxPerMm, stagePx, screen.viewportPx, minPx],
  );

  /**
   * How far back the reader has to sit, on this screen, for the Code B line to
   * be drawable at all — and for the whole chart down to 6/6 to be.
   *
   * This is the number the test never used to compute, and not computing it is
   * what let someone sit 40 cm from a 95 dpi monitor, where a 6/12 letter is
   * four pixels tall, answer every letter correctly, and be told they had 40%
   * visual acuity loss.
   */
  const minCmForStandard = clampDistance(
    toStop(minDistanceMmFor(ACUITY_LEVELS[LMV_PASS_INDEX].denominator, pxPerMm, minPx) / 10),
  );
  const cmFor66 = toStop(minDistanceMmFor(6, pxPerMm, minPx) / 10);
  const recommendedCm = clampDistance(cmFor66);
  /**
   * Both of the numbers above are clamped to the slider, so on a coarse screen
   * they can come back as the maximum without actually reaching the line they
   * are named for. Offering "or 600 cm to reach 6/6" when 600 cm does not reach
   * 6/6 is the same species of mistake as reporting a screen's floor as an
   * acuity, so the copy checks before it promises.
   */
  const canReach66 = cmFor66 <= DISTANCE_MAX_CM;

  /**
   * Show the chart, then start the ladder once it has been measured.
   *
   * Two steps rather than one because the chart is only in the tree during
   * `testing`, so there is nothing to measure until after the phase flips.
   * `armed` is what says "the reader pressed Start", and it matters: keying the
   * effect off the phase alone made it fire again on the last letter of every
   * eye, when the ladder had gone `stage-done` while the phase was still
   * `testing`, silently restarting a stage that had just been banked.
   */
  const [armed, setArmed] = React.useState(false);
  const beginStage = React.useCallback(() => {
    setArmed(true);
    setPhase("testing");
  }, []);

  React.useEffect(() => {
    if (!armed || phase !== "testing") return;
    // Measure the chart *here*, not from the render that scheduled this. The
    // measuring effect above runs in the same commit, so its setState has not
    // landed yet and `stagePx` would still read 0 on the first eye — which is
    // the whole bug, reintroduced one layer down. The ref is current.
    const el = stageRef.current;
    const measured = el ? Math.min(el.clientWidth, el.clientHeight) : 0;
    const available = measured || screen.viewportPx || FALLBACK_STAGE_PX;
    dispatch({
      type: "start-stage",
      ...ladderBounds(distanceMm, pxPerMm, available, minPx),
    });
    setArmed(false);
  }, [armed, phase, distanceMm, pxPerMm, screen.viewportPx, minPx]);

  /** Begin the whole test from the first eye. */
  const begin = React.useCallback(() => {
    dispatch({ type: "reset", seed: (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 });
    setPhase("eye-prompt");
  }, []);

  // No per-letter feedback, deliberately: telling the reader they were wrong
  // teaches them the letter set instead of measuring their sight.
  //
  // Every answer is one dispatch, so two of them arriving in the same frame —
  // a double-tap, or an arrow key auto-repeating — are applied one after the
  // other instead of both reading the same stale count. That is what used to
  // make a level quietly ask fewer than PER_LEVEL letters.
  const answer = React.useCallback((dir: EDirection) => dispatch({ type: "answer", dir }), []);

  // The ladder decides when an eye is finished; the phase follows it.
  React.useEffect(() => {
    if (ladder.status === "stage-done") setPhase("eye-prompt");
    else if (ladder.status === "done") setPhase("done");
  }, [ladder.status]);

  // Arrow keys mirror the on-screen buttons.
  React.useEffect(() => {
    if (phase !== "testing") return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, EDirection> = {
        ArrowUp: "up",
        ArrowRight: "right",
        ArrowDown: "down",
        ArrowLeft: "left",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      answer(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  const heightPx = trial
    ? optotypeHeightPx(ACUITY_LEVELS[trial.levelIndex].denominator, distanceMm, pxPerMm)
    : 0;

  // "Line 3 of 6" — the one number during the test that moves the way the
  // reader expects. The acuity label beside it shrinks as they do well, which
  // reads as a score going backwards unless something else is counting up.
  const lineNo = levelIndex - ladder.startIndex + 1;
  const lineTotal = ladder.maxIndex - ladder.startIndex + 1;

  /**
   * The counters belong to a stage that is actually under way. Between the
   * commit that banks an eye and the effect that leaves the testing phase — and
   * again between pressing Start and the effect that measures the chart — the
   * card is on screen holding the *previous* stage's numbers, which is how it
   * came to flash "Letter 5 of 4" at the end of every eye. Blank is honest
   * there; a stale count is not, and a counter that visibly misbehaves is
   * exactly what makes a reader distrust the score at the end.
   */
  const running = ladder.status === "running";

  return (
    <div className="space-y-6">
      {phase === "calibrate" && (
        <CalibrateStep
          cardWidthPx={cardWidthPx}
          onChange={setCardWidthPx}
          onNext={() => {
            if (!distanceChosen) setDistanceCm(recommendedCm);
            setPhase("distance");
          }}
        />
      )}

      {phase === "distance" && (
        <DistanceStep
          distanceCm={distanceCm}
          onChange={(cm) => {
            setDistanceChosen(true);
            setDistanceCm(cm);
          }}
          onBack={() => setPhase("calibrate")}
          onNext={begin}
          startLabel={ACUITY_LEVELS[preview.startIndex]?.label}
          floorLabel={ACUITY_LEVELS[preview.maxIndex]?.label}
          reachesStandard={preview.maxIndex >= LMV_PASS_INDEX}
          minCmForStandard={minCmForStandard}
          recommendedCm={recommendedCm}
          canReach66={canReach66}
        />
      )}

      {phase === "eye-prompt" && (
        <EyePromptStep
          stage={stage}
          stageNumber={stageIndex + 1}
          total={EYE_STAGES.length}
          onNext={beginStage}
        />
      )}

      {phase === "done" && (
        <Card className={cn(glassFloat, "p-0")}>
          <div className="flex items-center gap-2 border-b border-border/50 px-5 py-3 text-sm">
            <Eye className="h-4 w-4 text-primary" />
            <span className="font-medium">Result</span>
          </div>
          <ResultPanel
            stageOutcomes={stageOutcomes}
            bounds={{ startIndex: ladder.startIndex, maxIndex: ladder.maxIndex }}
            distanceCm={distanceCm}
            minCmForStandard={minCmForStandard}
            onRestart={() => setPhase("calibrate")}
          />
        </Card>
      )}

      {phase === "testing" && (
        <Card className={cn(glassFloat, "overflow-hidden p-0")}>
          <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-primary" />
              <span className="font-medium">{EYE_STAGE_LABEL[stage]}</span>
              {running && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="tabular-nums text-muted-foreground">
                    line {lineNo} of {lineTotal}
                  </span>
                </>
              )}
            </div>
            {running && (
              <span className="text-xs tabular-nums text-muted-foreground">
                Letter {askedThisLevel + 1} of {PER_LEVEL}
              </span>
            )}
          </div>

          {/* Counts up as the letters shrink, so "further down the chart" is
              visible as progress rather than only as a smaller number. */}
          <Progress
            value={running ? (lineNo / Math.max(lineTotal, 1)) * 100 : 0}
            className="h-1 rounded-none"
          />

          {/*
            The chart is deliberately fixed to black-on-white in both themes,
            which is why it sits in its own element rather than sharing the
            result surface. An optotype's measured acuity depends on its
            contrast polarity — a light letter on a dark field reads
            differently from the dark letter on white that every Snellen chart
            and every DLTC screening machine uses. Theming this surface would
            quietly change the number it reports, so it opts out of the palette.
          */}
          <div
            ref={stageRef}
            className="relative grid h-[min(58vh,26rem)] place-items-center bg-white text-neutral-900"
          >
            {trial && stagePx > 0 && (
              <TumblingE trial={trial} heightPx={heightPx} orbitPx={stagePx * ORBIT_RADIUS} />
            )}
          </div>

          <div className="border-t border-border/50 p-4">
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Which way do the three bars of the E point?
              </p>
              <div className="mx-auto grid max-w-xs grid-cols-4 gap-2">
                {ARROWS.map(({ dir, Icon, label }) => (
                  <button
                    key={dir}
                    type="button"
                    aria-label={label}
                    onClick={() => answer(dir)}
                    className={cn(
                      glassSubtle,
                      "press hover-elevate flex h-14 items-center justify-center rounded-xl border",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-2xs text-muted-foreground">
                Arrow keys work too. Guess if you are unsure — that is how the real test runs.
              </p>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * The optotype. Position, rotation and scale are all set from state rather
 * than animated into place, so the letter is always at its true size in the
 * DOM even if transitions never run (reduced motion, background tab, a
 * headless browser). The transition is decoration on top of a correct frame.
 */
function TumblingE({
  trial,
  heightPx,
  orbitPx,
}: {
  trial: Trial;
  heightPx: number;
  orbitPx: number;
}) {
  const rad = (trial.orbitAngle * Math.PI) / 180;
  const x = Math.cos(rad) * orbitPx;
  const y = Math.sin(rad) * orbitPx;

  return (
    <div
      data-testid="optotype"
      data-direction={trial.direction}
      data-level={ACUITY_LEVELS[trial.levelIndex].label}
      data-height-px={Math.round(heightPx * 100) / 100}
      className={cn(
        // Transform only — never `transition-all`, which would also animate
        // `color` and leave the letter part-way between two shades whenever
        // the theme changes mid-test.
        "absolute transition-transform duration-500 ease-glass motion-reduce:transition-none",
      )}
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${E_ROTATION[trial.direction]}deg)`,
        width: heightPx,
        height: heightPx,
      }}
      aria-hidden="true"
    >
      {/*
        A Snellen E on a 5×5 grid: three horizontal bars, each one unit thick
        and the full five units long, separated by one-unit gaps and joined by
        a spine down the left. Equal-length arms matter — a short middle arm is
        a different letter, and an easier one, because the reader can identify
        it without ever resolving the gaps that the acuity is defined by.

        Rendered with `geometricPrecision` rather than `crispEdges`. Snapping
        edges to whole pixels sounds like the careful choice and is the opposite
        of it: near the bottom of the ladder a stroke is a pixel and a half, and
        quantising it to one or two changes the size of the thing being measured
        by a quarter. Antialiasing keeps the letter at its true size and lets
        the greyscale carry the sub-pixel detail, which is what the eye
        integrates anyway.
      */}
      <svg viewBox="0 0 5 5" width="100%" height="100%" shapeRendering="geometricPrecision">
        <path d="M0 0h5v1H1v1h4v1H1v1h4v1H0z" fill="currentColor" />
      </svg>
    </div>
  );
}

function CalibrateStep({
  cardWidthPx,
  onChange,
  onNext,
}: {
  cardWidthPx: number;
  onChange: (px: number) => void;
  onNext: () => void;
}) {
  /**
   * The outline is sized in raw pixels, so on a phone it used to run straight
   * off the side: the 320px default already overflowed a 320px viewport, and
   * dragging to the 640px maximum pushed the page 297px wide at every phone
   * size. Nothing clipped it, so the whole document scrolled sideways.
   *
   * The ceiling is therefore the box the outline actually sits in, not a
   * constant. It is a hard clamp on the *state* rather than a `max-width` on
   * the element on purpose: `pxPerMm` is derived from `cardWidthPx`, so an
   * outline drawn narrower than the number it reports would silently turn every
   * letter size below into a lie. Visual width and the value must stay equal.
   */
  const boxRef = React.useRef<HTMLDivElement>(null);
  const [boxPx, setBoxPx] = React.useState(0);
  React.useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBoxPx(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cardMax = boxPx ? Math.max(CARD_MIN_PX, Math.min(CARD_MAX_PX, boxPx)) : CARD_MAX_PX;

  // A viewport that shrinks under the current value (rotation, a resize) has to
  // pull it down with it, or the outline overflows again on the next frame.
  React.useEffect(() => {
    if (cardWidthPx > cardMax) onChange(cardMax);
  }, [cardMax, cardWidthPx, onChange]);

  const shown = Math.min(cardWidthPx, cardMax);

  return (
    <Card className={cn(glass, "p-5")}>
      <div className="flex items-center gap-2">
        <Ruler className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Step 1 — calibrate your screen
        </h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Hold any bank or ID card against the screen and resize the outline until it matches
        exactly. Every such card is {CARD_WIDTH_MM} mm wide, which is what turns pixels into
        millimetres — without this the letter sizes below would mean nothing.
      </p>

      <div ref={boxRef} className="mt-5 grid place-items-center">
        <div
          className="rounded-xl border-2 border-dashed border-primary/60 bg-primary/[0.06]"
          style={{ width: shown, height: shown * (53.98 / CARD_WIDTH_MM) }}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-muted-foreground">Card width</span>
        <input
          type="range"
          min={CARD_MIN_PX}
          max={cardMax}
          step={1}
          value={shown}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </label>

      <div className="mt-5 flex justify-end">
        <Button onClick={onNext}>Next</Button>
      </div>
    </Card>
  );
}

/**
 * Step 2 is where the test is won or lost, because distance is the only lever a
 * reader has over resolution. A screen cannot draw a smaller dot, but sitting
 * twice as far away halves the angle every dot subtends — so the same monitor
 * that bottoms out at 6/24 across a desk reaches 6/6 across a room.
 */
function DistanceStep({
  distanceCm,
  onChange,
  onBack,
  onNext,
  startLabel,
  floorLabel,
  reachesStandard,
  minCmForStandard,
  recommendedCm,
  canReach66,
}: {
  distanceCm: number;
  onChange: (cm: number) => void;
  onBack: () => void;
  onNext: () => void;
  startLabel?: string;
  floorLabel?: string;
  reachesStandard: boolean;
  minCmForStandard: number;
  recommendedCm: number;
  canReach66: boolean;
}) {
  return (
    <Card className={cn(glass, "p-5")}>
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Step 2 — how far from the screen?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Further than feels natural. The DLTC reads its chart at 6 m and the K53 manual prints
        one for 3 m, because a letter this small only exists as a shape when it is far enough
        away that your screen&apos;s pixels stop being the limit. Measure the distance once and
        stay there.
      </p>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-muted-foreground">
          Viewing distance —{" "}
          <span className="tabular-nums text-foreground">{distanceCm} cm</span>
        </span>
        <input
          type="range"
          min={DISTANCE_MIN_CM}
          max={DISTANCE_MAX_CM}
          step={DISTANCE_STEP_CM}
          value={distanceCm}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </label>

      {reachesStandard ? (
        <p className="mt-4 text-xs text-muted-foreground">
          At {distanceCm} cm this screen runs from{" "}
          <span className="font-medium text-foreground">{startLabel}</span> down to{" "}
          <span className="font-medium text-foreground">{floorLabel}</span> — past the 6/12
          Code B line, so the test can settle it.
        </p>
      ) : (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/[0.08] px-4 py-2.5 text-xs text-warning">
          At {distanceCm} cm the smallest letter this screen can draw honestly is{" "}
          <strong className="font-semibold">{floorLabel}</strong>, which is bigger than the 6/12
          Code B line — so the test cannot reach the standard and will not be able to tell you
          whether you meet it. Move back to at least{" "}
          <strong className="font-semibold tabular-nums">{minCmForStandard} cm</strong>
          {canReach66 && recommendedCm > minCmForStandard && (
            <>
              , or <strong className="font-semibold tabular-nums">{recommendedCm} cm</strong> to
              reach 6/6
            </>
          )}
          .
        </div>
      )}

      <p className="mt-3 text-2xs leading-relaxed text-muted-foreground">
        Too far to reach the keyboard? Have someone press the arrows while you call out each
        answer — at the DLTC the examiner drives the machine for exactly that reason.
      </p>

      <div className="mt-5 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Start test</Button>
      </div>
    </Card>
  );
}

function EyePromptStep({
  stage,
  stageNumber,
  total,
  onNext,
}: {
  stage: EyeStage;
  stageNumber: number;
  total: number;
  onNext: () => void;
}) {
  return (
    <Card className={cn(glass, "p-5")}>
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {EYE_STAGE_LABEL[stage]}
        </h2>
        <Badge variant="secondary" className="ml-auto tabular-nums">
          {stageNumber} of {total}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{EYE_STAGE_INSTRUCTION[stage]}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Use a cupped hand or a card — pressing on the eye blurs it for a while afterwards and
        will skew the next reading. Keep your glasses or contacts on if you wear them for
        driving; the standard is met with or without them.
      </p>
      {stageNumber === 1 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Four letters per line, then the line gets smaller. Getting further down the chart is
          the good outcome — the counter in the corner is which line you have reached, not a
          score, so watch that rather than the shrinking letters.
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <Button onClick={onNext}>Start</Button>
      </div>
    </Card>
  );
}

/** The headline figure: a label, plus whether it is a ceiling rather than a reading. */
function HeadlineAcuity({ result }: { result: StageResult }) {
  if (result.kind === "measured" || result.kind === "atLeast") {
    return (
      <p className="font-display text-4xl font-semibold tabular-nums tracking-tight">
        {ACUITY_LEVELS[result.index].label}
        {/* A real space, not just a margin — otherwise a screen reader and
            anything copying the text both get "6/36or better". */}
        {result.kind === "atLeast" && (
          <>
            {" "}
            <span className="align-middle text-base font-medium tracking-normal text-muted-foreground">
              or better
            </span>
          </>
        )}
      </p>
    );
  }
  return <p className="font-display text-4xl font-semibold tracking-tight">—</p>;
}

function ResultPanel({
  stageOutcomes,
  bounds,
  distanceCm,
  minCmForStandard,
  onRestart,
}: {
  stageOutcomes: Partial<Record<EyeStage, LevelOutcome[]>>;
  bounds: { startIndex: number; maxIndex: number };
  distanceCm: number;
  minCmForStandard: number;
  onRestart: () => void;
}) {
  const perStage = Object.fromEntries(
    EYE_STAGES.map((s) => [s, stageResult(stageOutcomes[s] ?? [], REQUIRED, bounds)]),
  ) as Record<EyeStage, StageResult>;

  // Regulation 102 is written per eye; the binocular stage is context.
  const verdict = lmvVerdict(perStage.left, perStage.right);
  const best = bestAcrossStages(perStage);
  const bestLevel = best.kind === "measured" || best.kind === "atLeast" ? ACUITY_LEVELS[best.index] : null;

  // A loss percentage off the manual's chart is a claim about a *measured*
  // acuity. Against a screen's floor it would be a claim about the screen.
  const lossNote =
    best.kind === "measured" && bestLevel
      ? bestLevel.lossPercent === null || bestLevel.lossPercent === 0
        ? "Your best reading — no visual acuity loss on the manual's chart."
        : `Your best reading — about ${bestLevel.lossPercent}% visual acuity loss on the manual's chart.`
      : best.kind === "atLeast" && bestLevel
        ? `You read every line this screen could show, down to ${bestLevel.label}. Your sight may well be sharper — the chart ran out, not you.`
        : "You did not clear the largest line this screen could show, with either eye.";

  const badge = {
    yes: { variant: "success" as const, text: "Meets the Code B standard" },
    no: { variant: "warning" as const, text: "Below the Code B standard" },
    unknown: { variant: "secondary" as const, text: "Not enough to say" },
  }[verdict];

  return (
    <div className="p-6">
      <div className="text-center">
        <Badge variant={badge.variant} className="mb-3">
          {badge.text}
        </Badge>
        <HeadlineAcuity result={best} />
        <p className="mt-2 text-sm text-muted-foreground">{lossNote}</p>
      </div>

      <div className="mt-5 space-y-2">
        {EYE_STAGES.map((s) => {
          const result = perStage[s];
          const clears = reaches(result, LMV_PASS_INDEX);
          const index = result.kind === "measured" || result.kind === "atLeast" ? result.index : null;
          return (
            <div key={s} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{EYE_STAGE_LABEL[s]}</span>
              <span
                className={cn(
                  "w-28 shrink-0 tabular-nums font-medium",
                  clears === "yes" ? "text-success" : "text-foreground",
                )}
              >
                {result.kind === "atLeast" ? (
                  <>
                    {ACUITY_LEVELS[result.index].label}{" "}
                    <span className="text-2xs font-normal text-muted-foreground">or better</span>
                  </>
                ) : (
                  (stageLabel(result) ?? "—")
                )}
              </span>
              <Progress
                value={index === null ? 0 : ((index + 1) / ACUITY_LEVELS.length) * 100}
                tone={clears === "yes" ? "success" : clears === "no" ? "warning" : "primary"}
                className="flex-1"
              />
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        The Code B standard is{" "}
        <strong className="text-foreground">
          6/12 or better in each eye — or 6/9 in the other, if one eye is below 6/12 or blind
        </strong>{" "}
        — with or without glasses or contact lenses. It is written per eye, which is why the
        both-eyes reading above is shown but cannot carry a failing one. If you need lenses to
        reach the standard, that is recorded on your licence as a restriction, not a refusal.
      </p>

      {verdict === "unknown" && (
        <div className="mt-4 rounded-lg border border-warning/30 bg-warning/[0.08] px-4 py-2.5 text-xs text-warning">
          At {distanceCm} cm, {ACUITY_LEVELS[bounds.maxIndex].label} was the smallest line this
          screen could draw honestly — so a reader who clears it might be 6/12, or 6/6, and this
          test cannot tell which. That is a limit of the screen, not a finding about your sight.
          Run it again from at least{" "}
          <strong className="font-semibold tabular-nums">{minCmForStandard} cm</strong> for a
          verdict.
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-3">
        <p className="text-xs font-medium text-foreground">What this cannot check</p>
        <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
          The DLTC screener also tests your <strong>peripheral vision</strong> — you need 70°
          temporal in each eye, tested with lights flickering at the edges of your field — and on
          some machines depth perception and the traffic-light colours. A phone or laptop covers
          far too little of your visual field to imitate that, so nothing here attempts it. You
          can also take an optometrist&apos;s certificate to the DLTC instead of using their
          machine, provided it is no more than 90 days old on the day you apply.
        </p>
      </div>

      <p className="mt-4 text-center text-2xs leading-relaxed text-muted-foreground">
        A screening exercise only. It is not the DLTC&apos;s eye test and not a medical
        assessment — screen brightness, glare and an imperfect distance measurement all move the
        result. If anything here surprises you, see an optometrist.
      </p>

      <div className="mt-4 flex justify-center">
        <Button variant="secondary" onClick={onRestart}>
          <RotateCcw /> Test again
        </Button>
      </div>
    </div>
  );
}
