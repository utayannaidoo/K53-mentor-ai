"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Lightbulb, RotateCcw, Search, Target, X } from "lucide-react";
import { PageHeader } from "@/components/app/app-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { SessionProgress, type SessionOutcome } from "@/components/ui/session-progress";
import {
  COCKPIT_CONTROLS,
  CockpitDiagram,
  type CockpitControl,
  type CockpitMark,
} from "@/components/study/cockpit-diagram";
import { useStudyStore } from "@/hooks/use-study-store";
import { studyCodeOf } from "@/lib/billing/plans";
import { groupOf } from "@/lib/content/vehicle";
import { haptics } from "@/lib/haptics";
import { cn, glass, glassFloat, glassSubtle } from "@/lib/utils";

/**
 * "Find it in the car" — the controls section as the test actually asks it.
 *
 * The K53 controls section does not ask you to recite what a clutch does. It
 * asks you to put your hand on it. Reading "the clutch disengages the engine
 * from the gearbox" builds verbal memory for a task that is spatial, so this
 * screen only ever asks the spatial question: here is the cabin, point at the
 * thing.
 *
 * It used to be a card wedged into the middle of the Car-controls guide, above
 * the very same diagram it was drawn from — a scrolling reference page is the
 * wrong place for the one interactive thing on it, and at 672px inside a 768px
 * column there was nowhere for a mouse-sized target to go. On its own route it
 * gets the width to put the cabin next to a list of what is in it, which is
 * what turns "twelve dots on a picture" into something you can study from.
 *
 * Two things carry the teaching, and both were missing before:
 *  - A wrong tap is named. Tapping the brake when asked for the clutch answers
 *    "that's the foot brake" rather than buzzing, so the miss teaches the pair
 *    you actually confuse.
 *  - Nothing is scored until it is asked. Progress is per-control and the score
 *    map at the end marks first-time finds apart from the ones that took a
 *    second go, so what to look at again is on the screen rather than in a
 *    number.
 */

type Mode = "explore" | "test";

interface TestRun {
  order: CockpitControl[];
  /** Index of the control being asked for; `order.length` once finished. */
  i: number;
  /** Wrong taps against the current target — two of them offer a reveal. */
  attempts: number;
  /** Ids that took more than one go, recorded once each. */
  missed: string[];
  /** Whether the current target's answer has been shown. */
  revealed: boolean;
}

/** What the strip under the cabin is saying, and why. */
interface Note {
  tone: "neutral" | "good" | "bad";
  text: React.ReactNode;
}

function shuffled(items: CockpitControl[]): CockpitControl[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function startRun(pool: CockpitControl[]): TestRun {
  return { order: shuffled(pool), i: 0, attempts: 0, missed: [], revealed: false };
}

export function FindItInTheCar() {
  const { state } = useStudyStore();

  // A cabin is a car exercise. A code 10/14 or motorcycle learner who lands
  // here directly gets pointed back at their own controls page rather than a
  // dashboard they will never be tested on.
  if (groupOf(studyCodeOf(state)) !== "car") {
    return (
      <div className="mx-auto max-w-xl">
        <Card className={cn(glass, "p-6 text-center")}>
          <h1 className="font-display text-lg font-semibold">This one&apos;s for cars</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Finding the controls by touch is a car-cabin exercise. Your licence code is tested on a
            different set of controls.
          </p>
          <Link href="/study/controls" className={cn(buttonVariants(), "mt-5")}>
            Your controls guide
          </Link>
        </Card>
      </div>
    );
  }

  return <FindItPractice />;
}

function FindItPractice() {
  const [mode, setMode] = React.useState<Mode>("explore");
  const [selected, setSelected] = React.useState<CockpitControl | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [run, setRun] = React.useState<TestRun | null>(null);
  const [note, setNote] = React.useState<Note | null>(null);
  const [hintShown, setHintShown] = React.useState(false);
  /** A short-lived call-out on the cabin: the tap you just made, right or wrong. */
  const [flash, setFlash] = React.useState<{ id: string; mark: CockpitMark } | null>(null);
  const flashTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  function callOut(id: string, mark: CockpitMark, ms = 900) {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash({ id, mark });
    flashTimer.current = setTimeout(() => setFlash(null), ms);
  }

  const target = run && run.i < run.order.length ? run.order[run.i] : null;
  const finished = run !== null && run.i >= run.order.length;
  const firstTime = run ? run.order.length - run.missed.length : 0;

  function toExplore() {
    haptics.tap();
    setMode("explore");
    setRun(null);
    setNote(null);
    setFlash(null);
    setHintShown(false);
  }

  function toTest(pool: CockpitControl[] = COCKPIT_CONTROLS) {
    haptics.tap();
    setMode("test");
    setSelected(null);
    setNote(null);
    setFlash(null);
    setHintShown(false);
    setRun(startRun(pool));
  }

  /** Move past the current target, banking whether it was clean. */
  function advance(clean: boolean) {
    setRun((prev) => {
      if (!prev) return prev;
      const id = prev.order[prev.i].id;
      const missed = clean || prev.missed.includes(id) ? prev.missed : [...prev.missed, id];
      return { ...prev, i: prev.i + 1, attempts: 0, revealed: false, missed };
    });
    setHintShown(false);
  }

  /**
   * Picking in explore mode, from the cabin or from the list beside it. The
   * strip repeats where the control sits because on a phone the list — and the
   * rest of what the control does — is below the fold.
   */
  function selectControl(control: CockpitControl | null) {
    if (!control) {
      setSelected(null);
      setNote(null);
      return;
    }
    haptics.tap();
    setSelected(control);
    setNote({
      tone: "neutral",
      text: (
        <>
          <span className="font-medium text-foreground">{control.label}</span> — {control.where}.
        </>
      ),
    });
  }

  function pickInTest(control: CockpitControl | null) {
    if (!run || !target) return;

    // Once the answer is on the screen the only thing left is to put a finger
    // on it, and that is the whole exercise — so it is still done by hand
    // rather than on a timer. A timer here also meant the one path out of a
    // revealed question depended on a `setTimeout` firing.
    if (run.revealed) {
      if (control?.id === target.id) {
        haptics.tap();
        setNote(null);
        advance(false);
      }
      return;
    }

    if (!control) {
      setNote({ tone: "neutral", text: "Nothing there — that part of the cabin isn't a control." });
      return;
    }

    if (control.id === target.id) {
      haptics.success();
      callOut(control.id, "correct", 650);
      setNote({
        tone: "good",
        text: (
          <>
            <span className="font-medium text-foreground">{target.label}</span> — {target.where}.
          </>
        ),
      });
      advance(run.attempts === 0);
      return;
    }

    haptics.error();
    callOut(control.id, "wrong");
    const attempts = run.attempts + 1;
    setRun({ ...run, attempts });
    setNote({
      tone: "bad",
      text: (
        <>
          That&apos;s the <span className="font-medium text-foreground">{control.label}</span>
          {attempts >= 2 ? " — try the hint, or have it shown to you." : ". Try again."}
        </>
      ),
    });
  }

  function reveal() {
    if (!run || !target) return;
    haptics.tap();
    setRun({ ...run, revealed: true });
    setFlash(null);
    setNote({
      tone: "neutral",
      text: (
        <>
          There it is — the <span className="font-medium text-foreground">{target.label}</span>,{" "}
          {target.where}. Tap it to carry on.
        </>
      ),
    });
  }

  // ── What the cabin is showing ───────────────────────────────────────────
  const marks: Partial<Record<string, CockpitMark>> = {};
  if (finished && run) {
    for (const c of run.order) marks[c.id] = run.missed.includes(c.id) ? "missed" : "correct";
  } else if (mode === "explore") {
    if (hovered && hovered !== selected?.id) marks[hovered] = "hover";
    if (selected) marks[selected.id] = "selected";
  } else if (run?.revealed && target) {
    marks[target.id] = "reveal";
  }
  if (flash) marks[flash.id] = flash.mark;

  const outcomes: SessionOutcome[] | undefined = run
    ? run.order.map((c, idx) =>
        idx >= run.i ? "pending" : run.missed.includes(c.id) ? "wrong" : "correct",
      )
    : undefined;

  return (
    // Wider than the rest of Study on purpose. Every pixel of this page's width
    // goes into the cabin, and the only thing the learner does here is aim at
    // parts of it — a 3xl reading column is what made the old inline version
    // fiddly with a mouse in the first place.
    <div className="mx-auto max-w-7xl">
      <Link
        href="/study/controls"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Car controls
      </Link>

      <PageHeader
        title="Find it in the car"
        description="The controls section asks you to point at things, not describe them. Learn where every control lives, then prove it."
        action={
          <div
            className={cn(glassSubtle, "flex items-center gap-1 rounded-full border p-1")}
            role="group"
            aria-label="Mode"
          >
            <Chip active={mode === "explore"} onClick={toExplore} className="border-transparent">
              <Search className="h-3.5 w-3.5" /> Explore
            </Chip>
            <Chip active={mode === "test"} onClick={() => toTest()} className="border-transparent">
              <Target className="h-3.5 w-3.5" /> Test me
            </Chip>
          </div>
        }
      />

      <div className="grid items-start gap-5 beside:grid-cols-[minmax(0,1fr)_21rem]">
        {/* ── The cabin ─────────────────────────────────────────────────── */}
        <Card className={cn(glassFloat, "overflow-hidden p-4 sm:p-5")}>
          {/* The drawing keeps its aspect ratio, so the floor is a thumb, not a
              screen: at 600px the brake and accelerator are ~32 × 54px each,
              which is the point below which the two stop being separable. On a
              phone it scrolls sideways rather than shrinking past that — and
              explore mode stays fully usable without precise tapping, because
              the list below drives the same selection. */}
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div
              className={cn(
                glassSubtle,
                "mx-auto min-w-[600px] overflow-hidden rounded-2xl border p-2 sm:p-3",
              )}
            >
              <CockpitDiagram
                marks={marks}
                showPips={mode === "explore"}
                crosshair={mode === "test" && !finished}
                nameControls={mode === "explore" || finished}
                onPick={mode === "explore" ? selectControl : pickInTest}
                onHoverChange={mode === "explore" ? setHovered : undefined}
              />
            </div>
          </div>

          {/* One strip, always present, so nothing under the cabin jumps as the
              answer changes. */}
          <div
            aria-live="polite"
            className={cn(
              "mt-4 flex min-h-[3.25rem] items-center gap-2.5 rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ease-soft",
              note?.tone === "good" && "border-success/40 bg-success/[0.07] text-foreground",
              note?.tone === "bad" && "border-danger/40 bg-danger/[0.07] text-foreground",
              (!note || note.tone === "neutral") && "border-border/60 bg-background/40",
            )}
          >
            {note?.tone === "good" && <Check className="h-4 w-4 shrink-0 text-success" />}
            {note?.tone === "bad" && <X className="h-4 w-4 shrink-0 text-danger" />}
            <p className={cn(!note && "text-muted-foreground")}>
              {note?.text ??
                (mode === "explore"
                  ? "Tap any control on the car — or pick one from the list."
                  : "Tap the control named beside the car.")}
            </p>
          </div>
        </Card>

        {/* ── The panel ─────────────────────────────────────────────────── */}
        {/* Stacked, the panel keeps roughly the width it has in the split
            layout instead of stretching to the cabin's — a twelve-row list and
            a pair of buttons spread over 950px stop reading as a column. */}
        <div className="mx-auto w-full max-w-md beside:sticky beside:top-4 beside:max-w-none">
          {mode === "explore" ? (
            <ExplorePanel selected={selected} onSelect={selectControl} onHoverChange={setHovered} />
          ) : finished && run ? (
            <ResultPanel
              total={run.order.length}
              firstTime={firstTime}
              missed={run.missed}
              outcomes={outcomes}
              onDrillMissed={() =>
                toTest(COCKPIT_CONTROLS.filter((c) => run.missed.includes(c.id)))
              }
              onAgain={() => toTest()}
              onExplore={toExplore}
            />
          ) : (
            run &&
            target && (
              <TestPanel
                target={target}
                index={run.i}
                total={run.order.length}
                outcomes={outcomes}
                attempts={run.attempts}
                revealed={run.revealed}
                hintShown={hintShown}
                onHint={() => {
                  haptics.tap();
                  setHintShown(true);
                }}
                onReveal={reveal}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function ExplorePanel({
  selected,
  onSelect,
  onHoverChange,
}: {
  selected: CockpitControl | null;
  onSelect: (c: CockpitControl) => void;
  onHoverChange: (id: string | null) => void;
}) {
  return (
    <Card className={cn(glass, "overflow-hidden p-5")}>
      <h2 className="font-display text-lg font-semibold tracking-tight">The twelve controls</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Every one the K53 controls section can ask you to point at.
      </p>

      <ul className="mt-4 divide-y divide-border/70">
        {COCKPIT_CONTROLS.map((c) => {
          const open = selected?.id === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                onMouseEnter={() => onHoverChange(c.id)}
                onMouseLeave={() => onHoverChange(null)}
                onFocus={() => onHoverChange(c.id)}
                onBlur={() => onHoverChange(null)}
                aria-expanded={open}
                className={cn(
                  "-mx-2 block w-full rounded-lg px-2 py-2.5 text-left transition-colors duration-200 ease-soft",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  open ? "bg-primary/[0.08]" : "hover:bg-muted/60",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full transition-colors duration-200 ease-soft",
                      open ? "bg-primary" : "bg-primary/35",
                    )}
                  />
                  <span
                    className={cn("text-sm font-medium", open ? "text-primary" : "text-foreground")}
                  >
                    {c.label}
                  </span>
                </span>
                <span className="mt-1 block pl-4 text-xs leading-relaxed text-muted-foreground">
                  {open ? c.what : c.where}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function TestPanel({
  target,
  index,
  total,
  outcomes,
  attempts,
  revealed,
  hintShown,
  onHint,
  onReveal,
}: {
  target: CockpitControl;
  index: number;
  total: number;
  outcomes?: SessionOutcome[];
  attempts: number;
  revealed: boolean;
  hintShown: boolean;
  onHint: () => void;
  onReveal: () => void;
}) {
  return (
    <Card className={cn(glass, "p-5")}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {index + 1}/{total}
        </span>
        <SessionProgress completed={index} total={total} index={index} outcomes={outcomes} />
      </div>

      <div
        className={cn(
          glassSubtle,
          "mt-4 rounded-xl border border-primary/40 px-4 py-4 text-center",
        )}
      >
        <p className="text-sm text-muted-foreground">Where is the</p>
        <p
          className="font-display text-xl font-semibold tracking-tight text-foreground"
          aria-live="polite"
        >
          {target.label}?
        </p>
      </div>

      {revealed ? (
        <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Marked on the car — tap it to carry on.</span>
        </p>
      ) : (
        <>
          {hintShown ? (
            <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                It&apos;s the <span className="text-foreground">{target.where}</span>.
              </span>
            </p>
          ) : (
            <Button variant="ghost" size="sm" onClick={onHint} className="mt-4 w-full">
              <Lightbulb className="h-4 w-4" /> Hint
            </Button>
          )}

          {/* Two wrong taps is the point at which hunting stops teaching
              anything, so the answer becomes available rather than the learner
              being stuck on one question with no way forward. */}
          {attempts >= 2 && (
            <Button variant="outline" size="sm" onClick={onReveal} className="mt-2 w-full">
              <Eye className="h-4 w-4" /> Show me
            </Button>
          )}
        </>
      )}
    </Card>
  );
}

function ResultPanel({
  total,
  firstTime,
  missed,
  outcomes,
  onDrillMissed,
  onAgain,
  onExplore,
}: {
  total: number;
  firstTime: number;
  missed: string[];
  outcomes?: SessionOutcome[];
  onDrillMissed: () => void;
  onAgain: () => void;
  onExplore: () => void;
}) {
  const clean = missed.length === 0;
  const missedControls = COCKPIT_CONTROLS.filter((c) => missed.includes(c.id));

  return (
    <Card className={cn(glass, "p-5")}>
      {/* A count, not a percentage: twelve controls is a number a learner can
          hold, and the bar says which ones without a second sentence. */}
      <div className="text-center">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {firstTime}
          <span className="text-xl text-muted-foreground">/{total}</span>
        </p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          found first time
        </p>
      </div>
      <SessionProgress completed={total} total={total} outcomes={outcomes} className="mt-4" />
      <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
        {clean
          ? "Every control, first time. That's the controls section done."
          : `${firstTime} found straight away — ${missed.length} took another go.`}
      </p>

      {!clean && (
        <div className="mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Look at these again
          </h3>
          <ul className="mt-2 space-y-2">
            {missedControls.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning"
                />
                <span>
                  <span className="font-medium text-foreground">{c.label}</span>{" "}
                  <span className="text-muted-foreground">— {c.where}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {!clean && (
          <Button className="w-full" onClick={onDrillMissed}>
            <Target className="h-4 w-4" />{" "}
            {missed.length === 1 ? "Drill that one" : `Drill those ${missed.length}`}
          </Button>
        )}
        <Button variant={clean ? "default" : "outline"} className="w-full" onClick={onAgain}>
          <RotateCcw className="h-4 w-4" /> Go again
        </Button>
        <Button variant="ghost" className="w-full" onClick={onExplore}>
          <Search className="h-4 w-4" /> Back to explore
        </Button>
      </div>
    </Card>
  );
}
