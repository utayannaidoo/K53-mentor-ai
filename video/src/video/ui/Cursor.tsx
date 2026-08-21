import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { PALETTE } from "../theme";
import { CLAMP, EASE, drift } from "../lib/motion";
import { useStage } from "../lib/stage";

/**
 * A pointer that behaves like a hand, not like a tween.
 *
 * Three details separate this from the cursor in every other product video:
 *
 *  1. It never travels in a straight line. Human pointer paths bow — the hand
 *     rotates about the wrist — so the motion arcs perpendicular to travel by
 *     an amount proportional to the distance covered.
 *  2. It arrives *before* it clicks and lingers *after*. A cursor that clicks
 *     the instant it lands reads as automation.
 *  3. It has micro-drift while parked. Hands are never still.
 *
 * Coordinates are **fractions of the frame**, not stage units — a pointer aims
 * at something the viewer can see, so it has to stay on target when the design
 * scale changes and when the film is re-cut to 9:16. (These were stage units
 * originally. Changing the design width silently moved every click 15% to the
 * right of the button it was supposed to be pressing.)
 */

export interface CursorProps {
  /** `[x, y]` as fractions of frame width/height where the move starts. */
  readonly from: readonly [number, number];
  /** `[x, y]` as fractions of frame width/height where the move ends. */
  readonly to: readonly [number, number];
  /** Frame range of the travel. */
  readonly range: readonly [number, number];
  /** Frame the click lands. The press animation is centred on it. */
  readonly clickAt?: number;
  /** Fade the cursor out at this frame. */
  readonly out?: number;
  /** Bow of the path, in stage units. Positive arcs upward. */
  readonly arc?: number;
  readonly seed?: number;
}

export const Cursor: React.FC<CursorProps> = ({
  from,
  to,
  range,
  clickAt,
  out,
  arc = 46,
  seed = 4,
}) => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();
  const [a, b] = range;

  // Progress drives both axes so the arc stays attached to the travel.
  const p = interpolate(frame, [a, b], [0, 1], { easing: EASE.glass, ...CLAMP });
  const x = (from[0] + (to[0] - from[0]) * p) * width;
  const y = (from[1] + (to[1] - from[1]) * p) * height;
  // sin(πp) peaks at the midpoint and is zero at both ends — the bow never
  // displaces the start or the target.
  const bow = Math.sin(p * Math.PI) * arc;

  const press = clickAt
    ? interpolate(
        frame,
        [clickAt - 4, clickAt, clickAt + 7],
        [1, 0.84, 1],
        { easing: EASE.spring, ...CLAMP },
      )
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: x + drift(frame, 0.5, seed) * u(2.4),
        top: y - u(bow) + drift(frame, 0.44, seed + 9) * u(2.4),
        scale: press,
        // Fade in AND out — multiplied, not chosen between.
        //
        // This was a ternary: `out ? fadeOut : fadeIn`. Any cursor given an
        // `out` frame therefore skipped its fade-in entirely and sat at full
        // opacity from frame 0, parked at its start position. Scene 06 hands
        // off between two pointers, so both were on screen for the whole shot
        // and the beat read as two mice.
        opacity:
          interpolate(frame, [a - 10, a], [0, 1], { easing: EASE.soft, ...CLAMP }) *
          (out
            ? interpolate(frame, [out, out + 12], [1, 0], {
                easing: EASE.soft,
                ...CLAMP,
              })
            : 1),
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      {clickAt ? (
        <div
          style={{
            position: "absolute",
            left: u(-2),
            top: u(-2),
            width: u(
              interpolate(frame, [clickAt, clickAt + 26], [6, 74], {
                easing: EASE.glass,
                ...CLAMP,
              }),
            ),
            height: u(
              interpolate(frame, [clickAt, clickAt + 26], [6, 74], {
                easing: EASE.glass,
                ...CLAMP,
              }),
            ),
            translate: "-50% -50%",
            borderRadius: "50%",
            boxShadow: `0 0 0 ${u(1.5)}px ${PALETTE.green}`,
            opacity: interpolate(frame, [clickAt, clickAt + 26], [0.75, 0], {
              easing: EASE.soft,
              ...CLAMP,
            }),
          }}
        />
      ) : null}

      <svg width={u(30)} height={u(38)} viewBox="0 0 24 30" fill="none">
        <path
          d="M3 2.2 L3 22.4 L8.1 17.8 L11.3 25.6 L14.6 24.1 L11.5 16.5 L18.2 16.1 Z"
          fill={PALETTE.ink}
          stroke="rgba(6,12,9,0.55)"
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
