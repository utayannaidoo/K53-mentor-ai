"use client";

import * as React from "react";
import { Check, RotateCcw, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

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
 * Schematic rather than photoreal on purpose: a stylised cabin reads clearly at
 * phone size and stays inside the app's visual language, where a rendered car
 * interior would fight it.
 */

interface Hotspot {
  id: string;
  label: string;
  /** What it is / where to find it. */
  what: string;
  /** Percentage position of the hotspot centre within the diagram. */
  x: number;
  y: number;
}

/**
 * Positions match the SVG below. Kept as data so the quiz can shuffle them and
 * the diagram stays a single source of truth for where things are.
 */
const HOTSPOTS: Hotspot[] = [
  { id: "rearview", label: "Rear-view mirror", what: "Centre of the windscreen. Shows the road directly behind you.", x: 50, y: 12 },
  { id: "mirror-left", label: "Left side mirror", what: "Outside the driver's window. Covers the lane beside and behind you.", x: 8, y: 30 },
  { id: "mirror-right", label: "Right side mirror", what: "Outside the passenger window. Your blind-spot check still matters.", x: 92, y: 30 },
  { id: "speedo", label: "Speedometer", what: "The large dial straight ahead through the wheel.", x: 36, y: 47 },
  { id: "temp", label: "Temperature gauge", what: "Small dial in the cluster. Rising into red means stop and let it cool.", x: 60, y: 45 },
  { id: "abs", label: "ABS warning light", what: "Cluster telltale. Lit while driving means the anti-lock brakes need attention.", x: 60, y: 57 },
  { id: "indicators", label: "Indicators", what: "Stalk on the left behind the wheel. Flick up or down to signal.", x: 24, y: 68 },
  { id: "wipers", label: "Windscreen wipers", what: "Stalk on the right behind the wheel.", x: 72, y: 68 },
  { id: "hooter", label: "Hooter (horn)", what: "The centre boss of the steering wheel.", x: 48, y: 74 },
  { id: "headlights", label: "Headlights", what: "Dial or stalk end to the right of the cluster.", x: 84, y: 55 },
];

export function Cockpit() {
  const [selected, setSelected] = React.useState<Hotspot | null>(null);
  const [quiz, setQuiz] = React.useState<{ order: Hotspot[]; i: number; wrong: string[] } | null>(
    null,
  );

  const target = quiz ? quiz.order[quiz.i] : null;
  const done = quiz !== null && quiz.i >= quiz.order.length;

  function startQuiz() {
    haptics.tap();
    setSelected(null);
    setQuiz({ order: [...HOTSPOTS].sort(() => Math.random() - 0.5), i: 0, wrong: [] });
  }

  function tap(h: Hotspot) {
    if (!quiz || done) {
      haptics.tap();
      setSelected(h);
      return;
    }
    if (h.id === target?.id) {
      haptics.success();
      setQuiz({ ...quiz, i: quiz.i + 1 });
    } else {
      haptics.error();
      setQuiz({ ...quiz, wrong: [...quiz.wrong, target!.id] });
    }
  }

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Find it in the car</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {quiz && !done
              ? "Tap the control named below."
              : "Tap any control to see what it does and where it lives."}
          </p>
        </div>
        {quiz && !done ? (
          <Badge variant="default" className="font-mono">
            {quiz.i}/{quiz.order.length}
          </Badge>
        ) : (
          <Button size="sm" variant={done ? "default" : "outline"} onClick={startQuiz}>
            {done ? <RotateCcw className="h-4 w-4" /> : <Target className="h-4 w-4" />}
            {done ? "Go again" : "Test me"}
          </Button>
        )}
      </div>

      {quiz && !done && (
        <div className="mt-4 rounded-xl border-2 border-primary/40 bg-primary/[0.05] px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">Where is the</p>
          <p className="font-display text-lg font-semibold text-foreground">{target?.label}?</p>
        </div>
      )}

      {done && (
        <div className="mt-4 rounded-xl border border-success/30 bg-success/[0.06] px-4 py-3 text-center">
          <p className="text-sm font-semibold text-foreground">
            {quiz!.wrong.length === 0
              ? "Every control, first try. That's the controls section done."
              : `All ten found — ${quiz!.wrong.length} took a second go.`}
          </p>
        </div>
      )}

      {/* The diagram. The SVG is decoration; the hotspots over it are real
          buttons, so the whole thing works by keyboard and screen reader. */}
      <div className="relative mx-auto mt-5 w-full max-w-lg">
        <svg viewBox="0 0 400 260" className="w-full" aria-hidden="true">
          {/* windscreen */}
          <path
            d="M30 10 H370 A10 10 0 0 1 380 20 V96 H20 V20 A10 10 0 0 1 30 10 Z"
            className="fill-primary/[0.05] stroke-border"
            strokeWidth="2"
          />
          {/* rear-view mirror */}
          <rect x="176" y="18" width="48" height="16" rx="8" className="fill-card stroke-border" strokeWidth="2" />
          {/* side mirrors */}
          <path d="M8 66 h34 v24 h-34 z" rx="4" className="fill-card stroke-border" strokeWidth="2" />
          <path d="M358 66 h34 v24 h-34 z" className="fill-card stroke-border" strokeWidth="2" />
          {/* dashboard */}
          <path d="M20 96 H380 V186 A16 16 0 0 1 364 202 H36 A16 16 0 0 1 20 186 Z" className="fill-muted/60 stroke-border" strokeWidth="2" />
          {/* instrument cluster */}
          <circle cx="144" cy="122" r="26" className="fill-card stroke-border" strokeWidth="2" />
          <circle cx="240" cy="118" r="16" className="fill-card stroke-border" strokeWidth="2" />
          <circle cx="240" cy="148" r="9" className="fill-warning/20 stroke-warning" strokeWidth="2" />
          {/* headlight dial */}
          <circle cx="336" cy="143" r="14" className="fill-card stroke-border" strokeWidth="2" />
          {/* steering wheel */}
          <circle cx="192" cy="192" r="52" className="fill-none stroke-foreground/70" strokeWidth="6" />
          <circle cx="192" cy="192" r="18" className="fill-card stroke-foreground/70" strokeWidth="3" />
          {/* stalks */}
          <path d="M96 176 h44" className="stroke-foreground/60" strokeWidth="6" strokeLinecap="round" />
          <path d="M244 176 h44" className="stroke-foreground/60" strokeWidth="6" strokeLinecap="round" />
        </svg>

        {HOTSPOTS.map((h) => {
          // Nothing distinguishes the target dot — in quiz mode every hotspot
          // must look identical, or the thing you're meant to find is labelled.
          const isSelected = selected?.id === h.id;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => tap(h)}
              aria-label={quiz && !done ? `Cockpit position ${h.label}` : h.label}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              className={cn(
                "absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30",
                isSelected && !quiz
                  ? "border-primary bg-primary/25 scale-110"
                  : "border-primary/50 bg-primary/10 hover:bg-primary/20",
              )}
            />
          );
        })}
      </div>

      {selected && !quiz && (
        <div className="mt-4 animate-fade-in rounded-xl border border-border bg-background/60 p-4">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Check className="h-4 w-4 text-primary" /> {selected.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{selected.what}</p>
        </div>
      )}
    </Card>
  );
}
