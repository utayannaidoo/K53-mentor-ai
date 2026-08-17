"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The cockpit a learner points at.
 *
 * This is drawn rather than scanned, and that is the whole point. The section
 * used to run on the manual's own page-5 artwork with twelve white rectangles
 * painted over the printed labels to hide the answers. It worked, but what you
 * were left looking at was a raster of a scan with its own heading, its own red
 * callout numbers and a dozen leader lines pointing into the blanks where the
 * words used to be — noise the learner has to read past to see the car. It also
 * could not follow the theme: a white slab in dark mode.
 *
 * So the cabin below is traced off that same artwork rather than invented. The
 * dash silhouette, the wheel's centre and radius, the console, the gear boot and
 * the pedal spacing were all measured off the file (1761 × 996) and carried
 * across at the same proportions — the pedals still sit ~5.2% and ~3.1% of the
 * width apart, the wheel still sits right-of-centre with its hub at 64/47%. The
 * layout a learner memorises here is the layout printed in the book, which was
 * the reason for using the scan in the first place. The scan itself is still on
 * the guide page, labels and all, as the reference it is good at being.
 *
 * Hit targets are HTML buttons over the drawing, not shapes inside it: they get
 * keyboard focus, focus rings and accessible names for free, and their boxes are
 * sized to the part rather than to a uniform dot. The tightest pair — the brake
 * and the accelerator — are 5.4% of the width each instead of the 24px circles
 * they used to share, which is what made this fiddly with a mouse.
 */

export interface CockpitControl {
  id: string;
  label: string;
  /** What it is and what it does — shown once the learner has picked it. */
  what: string;
  /**
   * Where it sits, in purely spatial terms.
   *
   * This is the button's accessible name during a test. Naming the control
   * there would hand a screen-reader user the answer, and labelling the buttons
   * "button 1..12" would make the exercise impossible — describing the position
   * gives them exactly what a sighted learner gets from looking at the drawing,
   * and no more. It doubles as the on-screen hint.
   */
  where: string;
  /**
   * The clickable box, as a centre and size in percent of the diagram. Boxes
   * are laid out not to overlap, except for the hooter, which deliberately sits
   * on top of the steering wheel — the centre pad is part of the wheel, so the
   * wheel takes every click the pad does not.
   */
  hit: { x: number; y: number; w: number; h: number; pill?: boolean };
  /** The marker dot, placed on the drawn part rather than the box's centre. */
  pip: { x: number; y: number };
}

/**
 * Ordered as a walk around the cabin — screen, mirrors, wheel, then down to the
 * hands and feet — because this is also the reading order for keyboard and
 * screen-reader users and the order of the reference list beside it.
 */
export const COCKPIT_CONTROLS: CockpitControl[] = [
  {
    id: "rearview",
    label: "Rear-view mirror",
    what: "Centre of the windscreen. Shows the road directly behind you — check it every few seconds and before every signal, slow-down or stop.",
    where: "top centre, on the windscreen",
    hit: { x: 50, y: 9, w: 13, h: 9, pill: true },
    pip: { x: 50, y: 9 },
  },
  {
    id: "wipers",
    label: "Windscreen wiper",
    what: "The blade resting at the base of the windscreen, worked by a stalk behind the steering wheel. Clears rain and dirt — if you can't see, you can't drive.",
    where: "resting across the base of the windscreen",
    hit: { x: 38.5, y: 22.5, w: 28, h: 10, pill: true },
    pip: { x: 33, y: 23.5 },
  },
  {
    id: "mirror-left",
    label: "Exterior mirror (left)",
    what: "Outside the passenger window. Covers the lane beside and behind you on the left — your blind-spot check still matters.",
    where: "far left, outside the window",
    hit: { x: 7.5, y: 26.5, w: 11, h: 12, pill: true },
    pip: { x: 7.5, y: 26.5 },
  },
  {
    id: "mirror-right",
    label: "Exterior mirror (right)",
    what: "Outside the driver's window. Covers the lane beside and behind you on the right.",
    where: "far right, outside the window",
    hit: { x: 92.2, y: 26.5, w: 11, h: 12, pill: true },
    pip: { x: 92.2, y: 26.5 },
  },
  {
    id: "steering",
    label: "Steering wheel",
    what: "Steers the vehicle. Both hands stay on it except when you're changing gear or giving a hand signal.",
    where: "the large rim, upper right of the dashboard",
    hit: { x: 73.4, y: 38.5, w: 21.2, h: 38.2, pill: true },
    pip: { x: 67.7, y: 22.5 },
  },
  {
    id: "indicator",
    label: "Indicator",
    what: "Stalk behind the steering wheel. Signals your intention to turn or change lane — in good time, and check it cancels afterwards.",
    where: "small stalk just left of the steering wheel",
    hit: { x: 59.8, y: 33.5, w: 6.6, h: 9 },
    pip: { x: 60.3, y: 33.3 },
  },
  {
    id: "hooter",
    label: "Hooter",
    what: "The centre pad of the steering wheel. A short warning to make others aware of you — a safety tool, not a way to vent.",
    where: "centre pad of the steering wheel",
    hit: { x: 73.4, y: 39.2, w: 8, h: 11.6, pill: true },
    pip: { x: 73.4, y: 39.2 },
  },
  {
    id: "gear",
    label: "Gear lever",
    what: "On the centre console beside your left hand. Selects gears — always with the clutch fully down.",
    where: "centre console, below the dashboard",
    hit: { x: 51.5, y: 62.7, w: 9, h: 15.4 },
    pip: { x: 51.2, y: 60 },
  },
  {
    id: "clutch",
    label: "Clutch",
    what: "The leftmost of the three pedals. Disengages the engine from the gearbox so you can change gear or pull away smoothly.",
    where: "leftmost of the three pedals",
    hit: { x: 64.35, y: 67, w: 6.7, h: 16 },
    pip: { x: 64.4, y: 65 },
  },
  {
    id: "brake",
    label: "Foot brake",
    what: "The middle pedal. Reduces speed or stops the vehicle — press it progressively, not in a stab.",
    where: "middle of the three pedals",
    // The brake and the accelerator are the tightest pair on the whole diagram
    // — 5.4% of the width each, because that is how close they are in the car.
    // They buy their target area back in height instead, reaching down into the
    // empty footwell below the pedal itself.
    hit: { x: 70.4, y: 67, w: 5.4, h: 16 },
    pip: { x: 71.2, y: 65 },
  },
  {
    id: "accelerator",
    label: "Accelerator",
    what: "The rightmost pedal. Increases or decreases speed — squeeze it, don't stamp on it.",
    where: "rightmost of the three pedals",
    hit: { x: 75.8, y: 67, w: 5.4, h: 16 },
    pip: { x: 75.2, y: 64.8 },
  },
  {
    id: "parking-brake",
    label: "Parking brake",
    what: "The lever between the seats. Holds the vehicle stationary once you've stopped — on before you take your foot off the brake on a hill.",
    where: "upright lever between the seats",
    hit: { x: 50.5, y: 83, w: 8, h: 24 },
    pip: { x: 50.3, y: 82 },
  },
];

/** How a control is being called out right now. */
export type CockpitMark = "hover" | "selected" | "correct" | "wrong" | "reveal" | "missed";

const MARK_TONE: Record<CockpitMark, string> = {
  hover: "bg-primary/[0.14] ring-2 ring-primary/50",
  selected: "bg-primary/[0.22] ring-[3px] ring-primary/80",
  correct: "bg-success/25 ring-[3px] ring-success",
  wrong: "bg-danger/25 ring-[3px] ring-danger",
  reveal: "bg-primary/[0.22] ring-[3px] ring-primary",
  // Amber, not green — on the score map "found first time" and "took another
  // go" have to be told apart at a glance, and `--primary` is a green in this
  // theme, so a primary tint would read as another shade of correct.
  missed: "bg-warning/25 ring-[3px] ring-warning",
};

/**
 * The palette is scoped to this component rather than taken from the theme
 * tokens directly: a dashboard has to stay a dark object on a light one and a
 * light object on a dark one, so `--foreground` would invert the whole car at
 * the theme switch. These keep the drawing's internal relationships — dark
 * fascia, mid trim, light panels — and only shift far enough to sit properly on
 * each background.
 */
const PALETTE = [
  "[--ck-glass:hsl(45_22%_89%)] dark:[--ck-glass:hsl(160_12%_13%)]",
  "[--ck-dash:hsl(155_12%_26%)] dark:[--ck-dash:hsl(155_9%_28%)]",
  "[--ck-fascia:hsl(155_10%_36%)] dark:[--ck-fascia:hsl(155_8%_36%)]",
  "[--ck-trim:hsl(152_8%_52%)] dark:[--ck-trim:hsl(152_7%_49%)]",
  "[--ck-panel:hsl(150_8%_68%)] dark:[--ck-panel:hsl(150_7%_62%)]",
  // The pedals are `--ck-ink`, and after dark "darker than everything" stops
  // being visible at all — three of the twelve targets vanished into the
  // footwell. It lifts above the floor there instead of below it.
  "[--ck-ink:hsl(155_14%_16%)] dark:[--ck-ink:hsl(158_11%_25%)]",
].join(" ");

/**
 * The drawing itself, with no interaction on it. Decoration — every control is
 * described by the buttons layered over it — so it is hidden from assistive
 * tech outright. Exported so the card that leads into this exercise can show
 * the cabin the learner is about to be dropped into.
 */
export function CockpitArt({ className }: { className?: string }) {
  return (
    <div className={cn(PALETTE, className)} aria-hidden="true">
      <CabinArt />
    </div>
  );
}

function CabinArt() {
  return (
    <svg
      viewBox="0 0 1000 602"
      className="block w-full"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Windscreen and footwell. Neither is in the manual's drawing, which
          floats the dash on bare paper — they are here so the rear-view mirror
          and wiper read as being on the glass, the exterior mirrors read as
          being outside it, and the pedals read as being down in a footwell
          rather than dangling in space. Both are the same neutral surface, held
          well under the car's own tones so they ground it without competing. */}
      <rect x={148} y={6} width={730} height={168} rx={26} fill="var(--ck-glass)" />
      <path
        d="M206 316 C176 442 302 540 516 540 C730 540 856 442 826 316 Z"
        fill="var(--ck-glass)"
        opacity={0.55}
      />

      {/* Exterior mirrors, on their stalks, outside the glass either side. */}
      <path d="M118 166 L150 178" stroke="var(--ck-trim)" strokeWidth={9} strokeLinecap="round" />
      <rect
        x={32}
        y={136}
        width={86}
        height={48}
        rx={22}
        fill="var(--ck-glass)"
        stroke="var(--ck-trim)"
        strokeWidth={7}
      />
      <path d="M878 178 L882 166" stroke="var(--ck-trim)" strokeWidth={9} strokeLinecap="round" />
      <rect
        x={880}
        y={136}
        width={86}
        height={48}
        rx={22}
        fill="var(--ck-glass)"
        stroke="var(--ck-trim)"
        strokeWidth={7}
      />

      {/* Rear-view mirror on its stem, centre of the screen. */}
      <path d="M500 40 L500 20" stroke="var(--ck-trim)" strokeWidth={8} strokeLinecap="round" />
      <rect
        x={447}
        y={38}
        width={107}
        height={32}
        rx={15}
        fill="var(--ck-glass)"
        stroke="var(--ck-trim)"
        strokeWidth={7}
      />

      {/* Dashboard. Traced off the manual: left edge 19.5% of the artwork's
          width, right edge 75.5%, crown at 32% of its height, lower edge 60%. */}
      <path
        d="M149 180
           C155 158 190 146 232 141
           C300 131 410 121 500 120
           C580 120 650 131 712 133
           C780 138 846 152 878 180
           L878 300
           C878 320 866 331 844 331
           L240 331
           C192 331 154 320 149 288
           Z"
        fill="var(--ck-dash)"
      />

      {/* Wiper, drawn after the dash so it sits on top of the screen's base
          edge the way the printed one does rather than behind it. */}
      <path
        d="M248 144 L510 114 L514 124 L252 154 Z"
        fill="var(--ck-panel)"
        stroke="var(--ck-trim)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={512} cy={119} r={7} fill="var(--ck-trim)" />

      {/* Passenger air vent and the lower fascia panel on the left. */}
      <circle cx={168} cy={196} r={19} fill="var(--ck-trim)" />
      <rect x={158} y={248} width={222} height={64} rx={24} fill="var(--ck-fascia)" />
      <rect x={238} y={279} width={46} height={8} rx={4} fill="var(--ck-dash)" opacity={0.7} />

      {/* Centre console: vents, a switch slot, and the stack running down
          between the seats. */}
      <rect x={432} y={196} width={152} height={176} rx={26} fill="var(--ck-fascia)" />
      <circle cx={464} cy={291} r={13.5} fill="var(--ck-panel)" />
      <circle cx={498} cy={291} r={13.5} fill="var(--ck-panel)" />
      <circle cx={532} cy={291} r={13.5} fill="var(--ck-panel)" />
      <rect x={456} y={309} width={86} height={8} rx={4} fill="var(--ck-panel)" opacity={0.8} />

      {/* Steering column and the three pedal stems hanging under the dash. */}
      <rect x={640} y={326} width={9} height={58} rx={4} fill="var(--ck-trim)" />
      <rect x={707} y={326} width={9} height={58} rx={4} fill="var(--ck-trim)" />
      <rect x={747} y={326} width={9} height={48} rx={4} fill="var(--ck-trim)" />

      {/* Pedals — clutch, brake, accelerator, left to right. The accelerator is
          drawn edge-on and narrower, exactly as the manual has it. */}
      <rect x={626} y={378} width={38} height={26} rx={7} fill="var(--ck-ink)" />
      <rect x={694} y={378} width={36} height={26} rx={7} fill="var(--ck-ink)" />
      <rect x={741} y={366} width={22} height={46} rx={7} fill="var(--ck-ink)" />

      {/* Gear lever, its gaiter, and the parking brake behind it. */}
      <path
        d="M432 398 L592 398 L592 452 C592 484 556 500 512 500 C468 500 432 484 432 452 Z"
        fill="var(--ck-trim)"
        opacity={0.8}
      />
      <path
        d="M500 370 C492 388 490 398 492 406 L532 406 C534 398 532 388 524 370 Z"
        fill="var(--ck-trim)"
      />
      <ellipse cx={512} cy={360} rx={20} ry={18} fill="var(--ck-panel)" />
      <path
        d="M505 353 L505 367 M519 353 L519 367 M505 360 L519 360"
        stroke="var(--ck-ink)"
        strokeWidth={2.5}
        strokeLinecap="round"
        opacity={0.8}
      />
      <rect x={491} y={432} width={24} height={130} rx={12} fill="var(--ck-ink)" />
      <rect x={495} y={440} width={16} height={42} rx={8} fill="var(--ck-trim)" opacity={0.55} />

      {/* Steering wheel: rim, three spokes, and the centre pad that is the
          hooter. Hub at 64.5 / 46.6% of the artwork, rim radius 8.15% of its
          width — the same place and size as the printed one. */}
      <ellipse
        cx={734}
        cy={232}
        rx={106}
        ry={115}
        fill="none"
        stroke="var(--ck-trim)"
        strokeWidth={26}
      />
      <path
        d="M734 236 L648 252 M734 236 L820 252 M734 236 L734 340"
        stroke="var(--ck-trim)"
        strokeWidth={22}
        strokeLinecap="round"
      />
      <rect x={692} y={199} width={84} height={74} rx={22} fill="var(--ck-dash)" />
      {/* Horn glyph on the pad */}
      <path d="M722 229 L730 229 L740 220 L740 252 L730 243 L722 243 Z" fill="var(--ck-panel)" />
      <path
        d="M748 224 C755 231 755 241 748 248"
        fill="none"
        stroke="var(--ck-panel)"
        strokeWidth={3.5}
        strokeLinecap="round"
      />

      {/* Indicator stalk, poking out from behind the wheel's left rim. */}
      <rect x={586} y={194} width={46} height={14} rx={7} fill="var(--ck-panel)" />
    </svg>
  );
}

export function CockpitDiagram({
  marks,
  showPips = false,
  crosshair = false,
  nameControls = true,
  onPick,
  onHoverChange,
  className,
}: {
  /** Which controls are called out, and how. */
  marks: Partial<Record<string, CockpitMark>>;
  /** Draw the marker dots. Off during a test, or the answers are all visible. */
  showPips?: boolean;
  crosshair?: boolean;
  /**
   * Whether a button may be named after its control. False during a test, where
   * the accessible name falls back to the control's position instead.
   */
  nameControls?: boolean;
  /** `null` means the learner clicked the cabin but missed every control. */
  onPick: (control: CockpitControl | null) => void;
  onHoverChange?: (id: string | null) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("isolate select-none", PALETTE, crosshair && "cursor-crosshair", className)}
      onMouseLeave={() => onHoverChange?.(null)}
    >
      {/* Every hotspot is placed in percentages, and percentages on an
          absolutely positioned box resolve against its containing block's
          *padding* box. So the containing block has to be exactly the drawing
          and nothing else — an inner wrapper, not the element above, which
          callers are free to pad. With padding on the same element the boxes
          drifted outward from the parts they mark, by the full padding at the
          edges of the cabin and by nothing at all in the middle, which is the
          worst way for that bug to present. */}
      <div className="relative">
        <CabinArt />

        {/* Click-catcher for the cabin itself, under the controls. A div
            rather than a button: it exists so a miss during a test can be
            answered with "nothing there" instead of silence, which is a mouse
            affordance only — keyboard users tab straight between the twelve
            real controls. */}
        <div aria-hidden="true" className="absolute inset-0 z-0" onClick={() => onPick(null)} />

        {showPips && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
            {COCKPIT_CONTROLS.map((c) => (
              <span
                key={c.id}
                className={cn(
                  "absolute -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full",
                  "bg-primary ring-[3px] ring-primary/25 transition-opacity duration-300 ease-soft",
                  marks[c.id] && "opacity-0",
                )}
                style={{ left: `${c.pip.x}%`, top: `${c.pip.y}%` }}
              />
            ))}
          </div>
        )}

        {COCKPIT_CONTROLS.map((c) => {
          const mark = marks[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c)}
              onMouseEnter={() => onHoverChange?.(c.id)}
              onFocus={() => onHoverChange?.(c.id)}
              onBlur={() => onHoverChange?.(null)}
              aria-label={nameControls ? c.label : `Cockpit position: ${c.where}`}
              aria-pressed={mark === "selected" || undefined}
              style={{
                left: `${c.hit.x - c.hit.w / 2}%`,
                top: `${c.hit.y - c.hit.h / 2}%`,
                width: `${c.hit.w}%`,
                height: `${c.hit.h}%`,
              }}
              className={cn(
                // Sized and placed by box rather than centred with a transform:
                // `.press` sets its own transform on :active and would otherwise
                // knock a translate-centred hotspot half its own size off the part
                // it marks, every time you held the mouse down on it.
                "group absolute z-20 rounded-2xl focus-visible:outline-none",
                // The hooter sits inside the steering wheel and has to win the
                // clicks that land on the centre pad.
                c.id === "hooter" && "z-30",
              )}
            >
              {/* Focusing a control also marks it, so the halo is the focus
                  indicator too; this ring is what makes that unmistakable. */}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute -inset-1 opacity-0 ring-4 ring-ring/45 group-focus-visible:opacity-100",
                  c.hit.pill ? "rounded-full" : "rounded-[1.15rem]",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 transition-all duration-300 ease-soft motion-reduce:transition-none",
                  c.hit.pill ? "rounded-full" : "rounded-2xl",
                  mark ? MARK_TONE[mark] : "scale-90 opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
