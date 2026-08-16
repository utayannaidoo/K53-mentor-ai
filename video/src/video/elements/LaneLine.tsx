import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PALETTE } from "../theme";
import { CLAMP, EASE, drift, rand, signedRand } from "../lib/motion";
import { useStage } from "../lib/stage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE LANE LINE — the film's one continuous object
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every cut in this film is a match cut, because the same object survives it.
 * A single luminous road marking is:
 *
 *   Act I    a horizon in the dark                    <LaneHorizon reach={…}>
 *   Act II   fractured into contradictory fragments   <LaneFracture>
 *   Act III  reassembled and rushed at camera         <LaneRush>
 *   Act IV   the underline beneath every headline     <LaneHorizon thin>
 *   Act V    bent into a closing ring                 <LaneRing>
 *
 * That is the whole reason the edit holds together without a single hard cut.
 * If you change one thing in this project, do not change this.
 *
 * The product justification is not decoration either: the app's palette is
 * literally called Road Atlas, and route-marker green is its primary. The film
 * is built out of the product's own material.
 */

/** Shared bloom recipe so every appearance of the line glows identically. */
const bloom = (color: string, px: number) =>
  `0 0 ${px}px ${color}, 0 0 ${px * 3}px ${color}88, 0 0 ${px * 7}px ${color}44`;

/* ───────────────────────────────────────────────────────────────────────────
 * ACT I & IV — the horizon
 * ─────────────────────────────────────────────────────────────────────────── */

export const LaneHorizon: React.FC<{
  /** 0 → invisible, 1 → spans the safe area. Animate this, not opacity. */
  readonly reach: number;
  /** Vertical position as a fraction of frame height. */
  readonly y?: number;
  readonly color?: string;
  readonly thickness?: number;
  readonly intensity?: number;
  /** Adds a wide soft pool of light beneath the line. */
  readonly halo?: number;
}> = ({
  reach,
  y = 0.5,
  color = PALETTE.green,
  thickness = 2,
  intensity = 1,
  halo = 1,
}) => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* The pool of light under the line. Laid out at a fixed 360px tall and
          scaled, for the same reason as `<Glow>`: a blur this wide is pure
          low-frequency information, so paying for it at output resolution buys
          nothing and costs a great deal. See `elements/Atmosphere.tsx`. */}
      {halo > 0 ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: y * height,
            width: 900 * Math.min(1, reach * 1.4),
            height: 360,
            transform: "translate(-50%, -50%)",
            backgroundImage: `radial-gradient(closest-side, ${color} 0%, transparent 70%)`,
            opacity: 0.16 * halo * intensity * reach,
            filter: "blur(68px)",
            scale: `${(width * 1.1) / 900} ${u(320) / 360}`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: y * height,
          // Reach eases into the *width*, so the line grows out of a point of
          // light rather than fading up as a finished object. It has to be born.
          width: width * 0.92 * reach,
          height: u(thickness),
          transform: "translate(-50%, -50%)",
          borderRadius: u(thickness),
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${color} 18%, ${PALETTE.greenLift} 50%, ${color} 82%, transparent 100%)`,
          opacity: intensity * (0.86 + 0.14 * drift(frame, 0.4, 3)),
          boxShadow: bloom(color, u(9) * intensity),
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * ACT II — the fracture
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The same line, broken. Fragments sit at contradictory angles and stutter on
 * a 2-frame hold, so the act reads as *noise* rather than as an animation.
 * `chaos` drives angle spread, offset and flicker together — one dial for the
 * whole act's anxiety level.
 */
export const LaneFracture: React.FC<{
  readonly chaos: number;
  readonly count?: number;
  readonly color?: string;
  readonly seed?: number;
}> = ({ chaos, count = 9, color = PALETTE.red, seed = 0 }) => {
  const frame = useCurrentFrame();
  const { u, height } = useStage();
  const hold = Math.floor(frame / 2);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {new Array(count).fill(0).map((_, i) => {
        const s = i * 3.77 + seed * 91;
        const flicker = rand(hold * 0.37 + i) > 0.24 ? 1 : 0.15;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${12 + rand(s) * 76}%`,
              top: height * (0.16 + rand(s + 1) * 0.68),
              width: u(140 + rand(s + 2) * 520) * (0.35 + chaos * 0.65),
              height: u(1.5 + rand(s + 5) * 1.5),
              transformOrigin: "0 50%",
              transform: `translate(${
                signedRand(s + 7) * u(40) * chaos
              }px, 0) rotate(${signedRand(s + 3) * 26 * chaos}deg)`,
              borderRadius: u(2),
              backgroundImage: `linear-gradient(90deg, transparent, ${color} 30%, ${color} 70%, transparent)`,
              opacity: (0.28 + rand(s + 4) * 0.5) * chaos * flicker,
              boxShadow: bloom(color, u(5)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * ACT III — the rush
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * A road, projected properly.
 *
 * The first version of this drew each dash as a `<div>` sized by `k`, and it
 * rendered as one solid luminous wedge: consecutive dashes were taller than the
 * gap between them, so they merged. The fix is to stop treating a dash as a
 * *point* at depth `z` and treat it as a *span* from `z` to `z + length` —
 * which means each one is a trapezoid, wider and taller at its near end. That
 * is what a road marking actually is, and it is the difference between "green
 * triangle" and "you are moving".
 *
 * Projection is the standard pinhole: `k = focal / (focal + z)`. Two edge lines
 * run to the same vanishing point, because a centre line alone is ambiguous —
 * the edges are what tell the eye this is a surface receding, not a shape
 * growing.
 *
 * `travel` moves the whole road toward camera. Ramp it on a cubic and it
 * becomes the transition into the reveal.
 */
export const LaneRush: React.FC<{
  readonly travel: number;
  readonly opacity?: number;
  readonly color?: string;
  /** Vanishing point height as a fraction of the frame. */
  readonly horizon?: number;
  readonly count?: number;
}> = ({ travel, opacity = 1, color = PALETTE.green, horizon = 0.5, count = 18 }) => {
  const { u, width, height } = useStage();

  const focal = 700;
  const drop = 760; // world height of the camera above the road
  const spacing = 520; // z between dash starts
  const dashLen = 190; // z length of one dash
  const halfRoad = 300; // world half-width of the carriageway
  const halfDash = 26; // world half-width of a marking

  const vy = horizon * height;
  const project = (z: number) => {
    const k = focal / (focal + Math.max(z, 1));
    return { k, y: vy + drop * k * (height / 900) };
  };

  const near = project(30);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="lane-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0} />
            <stop offset="26%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={PALETTE.greenLift} stopOpacity={1} />
          </linearGradient>
        </defs>

        {/* Carriageway edges — the surface cue. Faint; they are context, not
            subject, and at full strength they compete with the markings. */}
        {[-1, 1].map((side) => (
          <polygon
            key={side}
            points={[
              `${width / 2 + side * halfRoad * project(30).k * (width / 1200)},${near.y}`,
              `${width / 2 + side * (halfRoad + 34) * project(30).k * (width / 1200)},${near.y}`,
              `${width / 2},${vy}`,
            ].join(" ")}
            fill={color}
            opacity={0.13}
            style={{ filter: `blur(${u(2)}px)` }}
          />
        ))}

        {/* The markings. */}
        {new Array(count).fill(0).map((_, i) => {
          // Wrap depth into a loop so a finite number of dashes reads as an
          // infinite road. Without the modulo you can count them.
          const z0 = (((i * spacing - travel) % (count * spacing)) + count * spacing) %
            (count * spacing);
          const z1 = z0 + dashLen;

          const a = project(z1); // far end
          const b = project(z0); // near end
          const scale = width / 1200;
          const wA = halfDash * a.k * scale;
          const wB = halfDash * b.k * scale;

          // Fade up out of the vanishing point and out again at the near plane,
          // so nothing pops into or out of existence.
          const fade = Math.min(1, a.k * 5) * Math.min(1, (1 - b.k) * 6 + 0.2);
          if (fade <= 0.01) return null;

          return (
            <polygon
              key={i}
              points={[
                `${width / 2 - wA},${a.y}`,
                `${width / 2 + wA},${a.y}`,
                `${width / 2 + wB},${b.y}`,
                `${width / 2 - wB},${b.y}`,
              ].join(" ")}
              fill="url(#lane-fade)"
              opacity={fade}
              style={{
                // Near dashes are moving fastest, so they are the blurriest —
                // a poor man's per-object motion blur that costs nothing.
                filter: `blur(${u(0.5 + b.k * 3.5)}px)`,
              }}
            />
          );
        })}
      </svg>

      {/* Bloom pooled at the vanishing point — the light source the road runs
          to. Plated and scaled, as above. */}
      <div
        style={{
          position: "absolute",
          left: width / 2,
          top: vy,
          width: 420,
          height: 242,
          translate: "-50% -50%",
          backgroundImage: `radial-gradient(closest-side, ${color} 0%, transparent 72%)`,
          opacity: 0.4,
          filter: "blur(37px)",
          scale: u(520) / 420,
        }}
      />
    </AbsoluteFill>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * ACT V — the ring
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The line bent into a circle and closed. This is deliberately the same
 * geometry as the product's own `ScoreRing`, so the film's final image and the
 * first thing a new user sees in the app are the same shape.
 */
export const LaneRing: React.FC<{
  /** 0 → nothing, 1 → closed circle. */
  readonly progress: number;
  readonly size: number;
  readonly thickness?: number;
  readonly color?: string;
  readonly trackOpacity?: number;
  readonly intensity?: number;
}> = ({
  progress,
  size,
  thickness = 5,
  color = PALETTE.green,
  trackOpacity = 0.1,
  intensity = 1,
}) => {
  const { u } = useStage();
  const px = u(size);
  const r = (px - u(thickness)) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{ width: px, height: px, position: "relative" }}>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{
          transform: "rotate(-90deg)",
          overflow: "visible",
          filter: `drop-shadow(0 0 ${u(14) * intensity}px ${color})`,
        }}
      >
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={PALETTE.ink}
          strokeWidth={u(thickness)}
          opacity={trackOpacity}
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={u(thickness)}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          opacity={intensity}
        />
      </svg>
    </div>
  );
};

/**
 * A single sweep of light travelling across a surface. Used as the film's
 * transition wipe and as the specular on floating glass — same physics, two
 * jobs, which is why the two never look unrelated.
 */
export const LightSweep: React.FC<{
  readonly range: readonly [number, number];
  readonly angle?: number;
  readonly color?: string;
  readonly intensity?: number;
  readonly widthPct?: number;
}> = ({
  range,
  angle = 104,
  color = "#ffffff",
  intensity = 0.22,
  widthPct = 34,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: intensity,
        backgroundImage: `linear-gradient(${angle}deg, transparent 0%, transparent ${
          50 - widthPct / 2
        }%, ${color} 50%, transparent ${50 + widthPct / 2}%, transparent 100%)`,
        backgroundSize: "300% 300%",
        backgroundPosition: `${interpolate(frame, range, [-140, 240], {
          easing: EASE.glass,
          ...CLAMP,
        })}% 50%`,
      }}
    />
  );
};
