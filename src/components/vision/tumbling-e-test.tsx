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
  E_DIRECTIONS,
  E_ROTATION,
  EYE_STAGES,
  EYE_STAGE_INSTRUCTION,
  EYE_STAGE_LABEL,
  LMV_PASS_INDEX,
  bestAcrossStages,
  bestPassedIndex,
  firstRenderableIndex,
  meetsLmvStandard,
  ladderBounds,
  optotypeHeightPx,
  pxPerMmFromCardWidth,
  type EDirection,
  type EyeStage,
  type LevelOutcome,
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
 * The smallest optotype worth presenting. The ladder used to stop only when a
 * level fell under 2px, which is not a letter — it is a smudge nobody could
 * read, so every reader "failed" at the bottom rung regardless of their sight.
 */
const MIN_OPTOTYPE_PX = 8;

/**
 * Last-resort chart height, matching the CSS box's 26rem cap. Only reached when
 * neither the element nor the window reports a size; without it the ladder has
 * no bounds to lock and the reader waits on a blank chart indefinitely.
 */
const FALLBACK_STAGE_PX = 416;

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
 * together** — because the pass rule reads across all three ("6/12 in one eye,
 * or both eyes together"). A single binocular number would hide exactly the
 * case the DLTC is looking for: one strong eye carrying one weak one.
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
  const [distanceCm, setDistanceCm] = React.useState(40);

  const [stagePx, setStagePx] = React.useState(0);
  const stageRef = React.useRef<HTMLDivElement>(null);

  // Mirrors the chart's own CSS box, measured from the window rather than the
  // element so it exists before the chart is ever mounted. Only ever used as
  // the fallback in `bounds` below.
  const [viewportPx, setViewportPx] = React.useState(0);
  React.useEffect(() => {
    const compute = () => setViewportPx(Math.min(window.innerHeight * 0.58, 26 * 16));
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
  const bounds = React.useMemo(
    () => ladderBounds(distanceMm, pxPerMm, stagePx || viewportPx || FALLBACK_STAGE_PX, MIN_OPTOTYPE_PX),
    [distanceMm, pxPerMm, stagePx, viewportPx],
  );

  /**
   * Show the chart, then start the ladder once it has been measured.
   *
   * Two steps rather than one because the chart is only in the tree during
   * `testing`, so there is nothing to measure until after the phase flips. The
   * effect below seeds the ladder on the first frame that has a measurement.
   */
  const beginStage = React.useCallback(() => setPhase("testing"), []);

  React.useEffect(() => {
    if (phase !== "testing" || ladder.status === "running") return;
    // Measure the chart *here*, not from the render that scheduled this. The
    // measuring effect above runs in the same commit, so its setState has not
    // landed yet and `stagePx` would still read 0 on the first eye — which is
    // the whole bug, reintroduced one layer down. The ref is current.
    const el = stageRef.current;
    const measured = el ? Math.min(el.clientWidth, el.clientHeight) : 0;
    const available = measured || viewportPx || FALLBACK_STAGE_PX;
    dispatch({
      type: "start-stage",
      ...ladderBounds(distanceMm, pxPerMm, available, MIN_OPTOTYPE_PX),
    });
  }, [phase, ladder.status, distanceMm, pxPerMm, viewportPx]);

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

  return (
    <div className="space-y-6">
      {phase === "calibrate" && (
        <CalibrateStep
          cardWidthPx={cardWidthPx}
          onChange={setCardWidthPx}
          onNext={() => setPhase("distance")}
        />
      )}

      {phase === "distance" && (
        <DistanceStep
          distanceCm={distanceCm}
          onChange={setDistanceCm}
          onBack={() => setPhase("calibrate")}
          onNext={begin}
          startLabel={ACUITY_LEVELS[bounds.startIndex]?.label}
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
          <ResultPanel stageOutcomes={stageOutcomes} onRestart={() => setPhase("calibrate")} />
        </Card>
      )}

      {phase === "testing" && (
        <Card className={cn(glassFloat, "overflow-hidden p-0")}>
          <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-primary" />
              <span className="font-medium">{EYE_STAGE_LABEL[stage]}</span>
              <span className="text-muted-foreground">·</span>
              <span className="tabular-nums">{ACUITY_LEVELS[levelIndex].label}</span>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              Letter {askedThisLevel + 1} of {PER_LEVEL}
            </span>
          </div>

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
        A Snellen E on a 5×5 grid: three horizontal bars one unit thick,
        separated by one-unit gaps, joined by a spine down the left. Drawn as
        an SVG so it scales to sub-pixel sizes without font hinting rounding
        the strokes — which would quietly change the acuity being measured.
      */}
      <svg viewBox="0 0 5 5" width="100%" height="100%" shapeRendering="crispEdges">
        <path d="M0 0h5v1H1v1h3v1H1v1h4v1H0z" fill="currentColor" />
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

      <div className="mt-5 grid place-items-center">
        <div
          className="rounded-xl border-2 border-dashed border-primary/60 bg-primary/[0.06]"
          style={{ width: cardWidthPx, height: cardWidthPx * (53.98 / CARD_WIDTH_MM) }}
        />
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-muted-foreground">Card width</span>
        <input
          type="range"
          min={140}
          max={640}
          step={1}
          value={cardWidthPx}
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

function DistanceStep({
  distanceCm,
  onChange,
  onBack,
  onNext,
  startLabel,
}: {
  distanceCm: number;
  onChange: (cm: number) => void;
  onBack: () => void;
  onNext: () => void;
  startLabel?: string;
}) {
  return (
    <Card className={cn(glass, "p-5")}>
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Step 2 — how far from the screen?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sit where you will stay for the whole test and measure it once. Arm&apos;s length is
        roughly 60 cm; a phone held comfortably is closer to 40 cm. Guessing here shifts every
        result, so it is worth a tape measure.
      </p>

      <label className="mt-5 block">
        <span className="text-xs font-medium text-muted-foreground">
          Viewing distance —{" "}
          <span className="tabular-nums text-foreground">{distanceCm} cm</span>
        </span>
        <input
          type="range"
          min={25}
          max={300}
          step={5}
          value={distanceCm}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </label>

      {startLabel && (
        <p className="mt-4 text-xs text-muted-foreground">
          At this distance and screen size the test starts at{" "}
          <span className="font-medium text-foreground">{startLabel}</span> — larger lines would
          not fit on screen.
        </p>
      )}

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
      <div className="mt-5 flex justify-end">
        <Button onClick={onNext}>Start</Button>
      </div>
    </Card>
  );
}

function ResultPanel({
  stageOutcomes,
  onRestart,
}: {
  stageOutcomes: Partial<Record<EyeStage, LevelOutcome[]>>;
  onRestart: () => void;
}) {
  const perStage = Object.fromEntries(
    EYE_STAGES.map((s) => [s, bestPassedIndex(stageOutcomes[s] ?? [], REQUIRED)]),
  ) as Record<EyeStage, number | null>;

  const meets = meetsLmvStandard(perStage);
  const bestIndex = bestAcrossStages(perStage);
  const best = bestIndex === null ? null : ACUITY_LEVELS[bestIndex];

  return (
    <div className="p-6">
      <div className="text-center">
        <Badge variant={meets ? "success" : "secondary"} className="mb-3">
          {meets ? "Meets the Code B threshold" : "Worth getting checked"}
        </Badge>
        <p className="font-display text-4xl font-semibold tabular-nums tracking-tight">
          {best ? best.label : "—"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {best
            ? best.lossPercent === null || best.lossPercent === 0
              ? "Your best reading — no visual acuity loss on the manual's chart."
              : `Your best reading — about ${best.lossPercent}% visual acuity loss on the manual's chart.`
            : "You did not clear the largest line this screen could show, with either eye."}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {EYE_STAGES.map((s) => {
          const idx = perStage[s];
          const passedStage = idx !== null && idx >= LMV_PASS_INDEX;
          return (
            <div key={s} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{EYE_STAGE_LABEL[s]}</span>
              <span
                className={cn(
                  "w-14 shrink-0 tabular-nums font-medium",
                  passedStage ? "text-success" : "text-foreground",
                )}
              >
                {idx === null ? "—" : ACUITY_LEVELS[idx].label}
              </span>
              <Progress
                value={idx === null ? 0 : ((idx + 1) / ACUITY_LEVELS.length) * 100}
                tone={passedStage ? "success" : "warning"}
                className="flex-1"
              />
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        The Code B standard is <strong className="text-foreground">6/12 or better in one eye,
        or both eyes together</strong> — with or without glasses or contact lenses. If you need
        lenses to reach it, that is recorded on your licence as a restriction, not a refusal.
      </p>

      <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-3">
        <p className="text-xs font-medium text-foreground">What this cannot check</p>
        <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
          The DLTC screener also tests your <strong>peripheral vision</strong> — lights
          flickering at the edges of your field, which you acknowledge as you see them — and on
          some machines depth perception. A phone or laptop covers far too little of your visual
          field to imitate that, so nothing here attempts it. You can also take an
          optometrist&apos;s certificate to the DLTC instead of using their machine, provided it
          is no more than 90 days old on the day you apply.
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
