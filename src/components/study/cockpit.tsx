"use client";

import * as React from "react";
import { Check, RotateCcw, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { haptics } from "@/lib/haptics";
import { cn, glassFloat, glassSubtle } from "@/lib/utils";

/**
 * The driver's-eye cockpit.
 *
 * Car controls shipped as prose — "the clutch disengages the engine from the
 * gearbox" — for a skill that is physical and spatial. Reading where the
 * handbrake is does not build the memory the K53 controls section tests, which
 * asks you to *point at* things. Spatial memory is a different and stronger
 * system than verbal, so this puts the controls where they actually are and
 * then asks you to find them.
 *
 * It runs on the manual's own labelled diagram rather than a schematic drawn
 * for the purpose. Two reasons: it is the picture the learner will have seen in
 * every K53 book, so the spatial memory this builds is the one they can reuse;
 * and a second, differently-proportioned cabin drawn beside it taught a layout
 * that matches nothing. Every hotspot below is measured off that artwork — the
 * pedals, for instance, sit at 57.3 / 62.0 / 66.2% of its width — so the
 * diagram stays the single source of truth for where things are.
 */

interface Hotspot {
  id: string;
  label: string;
  /** What it is and what it does — shown after tapping in explore mode. */
  what: string;
  /**
   * Where it sits, in purely spatial terms.
   *
   * This is the button's accessible name during the quiz. Naming the control
   * there would hand a screen-reader user the answer, and labelling the buttons
   * "button 1..12" would make the exercise impossible — describing the position
   * gives them exactly what a sighted learner gets from looking at the diagram,
   * and no more.
   */
  where: string;
  /**
   * Percentage position of the hotspot centre within the diagram image,
   * measured from the artwork itself (1761 × 996).
   */
  x: number;
  y: number;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "rearview",
    label: "Rear-view mirror",
    what: "Centre of the windscreen. Shows the road directly behind you — check it every few seconds and before every signal, slow-down or stop.",
    where: "top centre, on the windscreen",
    x: 45.5,
    y: 21,
  },
  {
    id: "wipers",
    label: "Windscreen wiper",
    what: "The blade resting at the base of the windscreen, worked by a stalk behind the steering wheel. Clears rain and dirt — if you can't see, you can't drive.",
    where: "resting across the base of the windscreen",
    x: 38.6,
    y: 33.3,
  },
  {
    id: "mirror-left",
    label: "Exterior mirror (left)",
    what: "Outside the passenger window. Covers the lane beside and behind you on the left — your blind-spot check still matters.",
    where: "far left, outside the window",
    x: 14.5,
    y: 37.5,
  },
  {
    id: "mirror-right",
    label: "Exterior mirror (right)",
    what: "Outside the driver's window. Covers the lane beside and behind you on the right.",
    where: "far right, outside the window",
    x: 79.5,
    y: 36,
  },
  {
    id: "indicator",
    label: "Indicator",
    what: "Stalk behind the steering wheel. Signals your intention to turn or change lane — in good time, and check it cancels afterwards.",
    where: "small stalk just left of the steering wheel",
    x: 55,
    y: 42,
  },
  {
    id: "steering",
    label: "Steering wheel",
    what: "Steers the vehicle. Both hands stay on it except when you're changing gear or giving a hand signal.",
    where: "the large rim, upper right of the dashboard",
    x: 65.5,
    y: 33.5,
  },
  {
    id: "hooter",
    label: "Hooter",
    what: "The centre pad of the steering wheel. A short warning to make others aware of you — a safety tool, not a way to vent.",
    where: "centre pad of the steering wheel",
    x: 65,
    y: 48.5,
  },
  {
    id: "gear",
    label: "Gear lever",
    what: "On the centre console beside your left hand. Selects gears — always with the clutch fully down.",
    where: "centre console, below the dashboard",
    x: 50.8,
    y: 64,
  },
  {
    id: "clutch",
    label: "Clutch",
    what: "The leftmost of the three pedals. Disengages the engine from the gearbox so you can change gear or pull away smoothly.",
    where: "leftmost of the three pedals",
    x: 57.3,
    y: 69.3,
  },
  {
    id: "brake",
    label: "Foot brake",
    what: "The middle pedal. Reduces speed or stops the vehicle — press it progressively, not in a stab.",
    where: "middle of the three pedals",
    x: 62,
    y: 69,
  },
  {
    id: "accelerator",
    label: "Accelerator",
    what: "The rightmost pedal. Increases or decreases speed — squeeze it, don't stamp on it.",
    where: "rightmost of the three pedals",
    x: 66.2,
    y: 68.7,
  },
  {
    id: "parking-brake",
    label: "Parking brake",
    what: "The lever between the seats. Holds the vehicle stationary once you've stopped — on before you take your foot off the brake on a hill.",
    where: "upright lever between the seats",
    x: 45.9,
    y: 78,
  },
];

/**
 * The printed labels, covered while a quiz is running.
 *
 * The manual's diagram names every control right next to it, which is exactly
 * what makes it a good reference and exactly what makes it a useless test — you
 * can read "CLUTCH" off the page instead of remembering which pedal it is. In
 * explore mode the labels stay; during a quiz they're hidden, so the only thing
 * left to go on is the picture.
 *
 * Each rect is `[x, y, width, height]` as a percentage of the artwork, measured
 * off the file: the label text is neutral near-black (32,32,32) while every
 * part of the car carries a colour tint (the dashboard is 64,64,80, the wheel
 * 112,128,128), so the twelve text blocks separate cleanly from the drawing.
 * The red callout numbers and their leader lines are deliberately left showing
 * — they point at things without naming them. No rect overlaps a hotspot.
 */
const LABEL_MASKS: [number, number, number, number][] = [
  [52.7, 4.4, 14.5, 17.7], // INDICATOR
  [77.5, 5.2, 19.1, 18.1], // STEERING WHEEL
  [33.4, 6.8, 12.9, 9.6], // REAR-VIEW MIRROR
  [22.9, 18.1, 7.7, 5.2], // WIPER
  [6.1, 19.7, 11.6, 9.2], // EXTERIOR MIRROR (left)
  [85.6, 26.5, 11.6, 9.6], // EXTERIOR MIRROR (right)
  [84.7, 40.6, 9.8, 18.5], // HOOTER
  [82, 62.2, 16.6, 14.5], // ACCELERATOR
  [18.9, 64.7, 15.7, 10], // GEAR LEVER
  [54.3, 80.7, 14.8, 18.9], // CLUTCH
  [79, 81.5, 14.1, 14.5], // FOOT BRAKE
  [15.4, 82.3, 19.1, 14.1], // PARKING BRAKE
];

interface Quiz {
  order: Hotspot[];
  i: number;
  /** Ids that took more than one attempt — retries don't double-count. */
  missed: string[];
}

export function Cockpit() {
  const [selected, setSelected] = React.useState<Hotspot | null>(null);
  const [quiz, setQuiz] = React.useState<Quiz | null>(null);

  const target = quiz ? quiz.order[quiz.i] : null;
  const done = quiz !== null && quiz.i >= quiz.order.length;
  const inQuiz = quiz !== null && !done;

  function startQuiz() {
    haptics.tap();
    setSelected(null);
    setQuiz({ order: [...HOTSPOTS].sort(() => Math.random() - 0.5), i: 0, missed: [] });
  }

  function tap(h: Hotspot) {
    if (!inQuiz) {
      haptics.tap();
      setSelected(h);
      return;
    }
    if (h.id === target?.id) {
      haptics.success();
      setQuiz({ ...quiz!, i: quiz!.i + 1 });
    } else {
      haptics.error();
      // Record the target that was missed, once — tapping around while hunting
      // for it shouldn't read as ten separate failures.
      setQuiz({
        ...quiz!,
        missed: quiz!.missed.includes(target!.id) ? quiz!.missed : [...quiz!.missed, target!.id],
      });
    }
  }

  return (
    <Card className={cn(glassFloat, "overflow-hidden p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Find it in the car</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {inQuiz
              ? "Tap the control named below."
              : "Tap any control to see what it does and where it lives."}
          </p>
        </div>
        {inQuiz ? (
          <Badge variant="default" className="font-mono tabular">
            {quiz.i}/{quiz.order.length}
          </Badge>
        ) : (
          <Button size="sm" variant={done ? "default" : "outline"} onClick={startQuiz}>
            {done ? <RotateCcw className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            {done ? "Go again" : "Test me"}
          </Button>
        )}
      </div>

      {/* The prompt and the result are recessed against the floating card they
          sit on, so adjacent surfaces never share a depth tier. */}
      {inQuiz && (
        <div
          className={cn(
            glassSubtle,
            "mt-4 rounded-xl border border-primary/40 bg-primary/[0.05] px-4 py-3 text-center",
          )}
          aria-live="polite"
        >
          <p className="text-sm text-muted-foreground">Where is the</p>
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            {target?.label}?
          </p>
        </div>
      )}

      {done && (
        <div
          className={cn(
            glassSubtle,
            "mt-4 rounded-xl border border-success/30 bg-success/[0.06] px-4 py-3 text-center",
          )}
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-foreground">
            {quiz.missed.length === 0
              ? "Every control, first try. That's the controls section done."
              : `All ${quiz.order.length} found — ${quiz.missed.length} took a second go.`}
          </p>
        </div>
      )}

      {/* The manual's diagram with real buttons over it. The image is decoration
          (it is described by the reference copy below); the hotspots are the
          interactive layer, so the whole thing works by keyboard and screen
          reader.
          It scrolls horizontally rather than shrinking below 620px: the three
          pedals sit ~4% of the width apart, which stops being tappable once the
          artwork is narrower than a phone screen. */}
      <div className="-mx-1 mt-5 overflow-x-auto px-1 pb-1">
        <div className="relative mx-auto min-w-[620px] max-w-2xl overflow-hidden rounded-xl border border-border bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/diagrams/car-controls.png"
            alt=""
            aria-hidden="true"
            className="block w-full select-none"
            draggable={false}
          />

          {/* Label cover. One layer, faded in and out, so switching modes reads
              as the diagram going quiet rather than as a different picture. */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-300 ease-soft motion-reduce:transition-none",
              inQuiz ? "opacity-100" : "opacity-0",
            )}
          >
            {LABEL_MASKS.map(([x, y, w, h]) => (
              <span
                key={`${x}-${y}`}
                className="absolute bg-white"
                style={{
                  // A hair of bleed so antialiased glyph edges don't survive.
                  left: `${x - 0.4}%`,
                  top: `${y - 0.6}%`,
                  width: `${w + 0.8}%`,
                  height: `${h + 1.2}%`,
                }}
              />
            ))}
          </div>

          {HOTSPOTS.map((h) => {
            // Nothing distinguishes the target dot — in quiz mode every hotspot
            // must look identical, or the thing you're meant to find is labelled.
            const isSelected = !inQuiz && selected?.id === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => tap(h)}
                aria-label={inQuiz ? `Cockpit position: ${h.where}` : h.label}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                className={cn(
                  "press absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
                  "transition-colors duration-200 ease-soft",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
                  isSelected
                    ? "border-primary bg-primary/50"
                    : "border-primary/70 bg-primary/20 hover:bg-primary/40",
                )}
              />
            );
          })}
        </div>
      </div>

      {selected && !inQuiz && (
        <div
          className={cn(glassSubtle, "mt-4 animate-fade-in rounded-xl border p-4")}
          aria-live="polite"
        >
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Check className="h-4 w-4 text-primary" /> {selected.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{selected.what}</p>
        </div>
      )}
    </Card>
  );
}
