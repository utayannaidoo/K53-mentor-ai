import React from "react";
import { useCurrentFrame } from "remotion";
import { GLASS, PALETTE } from "../theme";
import { drift } from "../lib/motion";
import { useStage } from "../lib/stage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIQUID GLASS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A faithful port of the app's three-tier glass system (`glass-subtle`,
 * `glass`, `glass-2`). The rules that make it read as *material* rather than as
 * "a translucent box" are all here:
 *
 *  1. Every surface carries an edge: one bright specular hairline along the top
 *     where the light source is, and a much fainter rim all the way round. Drop
 *     the specular and the panel instantly looks like a PNG.
 *  2. Adjacent surfaces must sit on different tiers. A `card` inside a `card`
 *     has no visible boundary; a `subtle` inside a `float` does.
 *  3. Translucency only reads if there is something behind it. Every scene puts
 *     a `<Glow>` behind its glass for exactly this reason.
 *  4. The sheen drifts. Very slowly — a full pass takes about nine seconds —
 *     because a static highlight on a moving camera is the giveaway that the
 *     "glass" is painted on.
 */

export interface GlassProps {
  readonly children?: React.ReactNode;
  readonly tier?: keyof typeof GLASS;
  readonly width?: number;
  readonly height?: number;
  readonly radius?: number;
  readonly padding?: number;
  /** Tints the fill toward an accent. Used on the tutor panel and the CTA. */
  readonly tint?: string;
  readonly tintStrength?: number;
  readonly style?: React.CSSProperties;
  /** Turns off the drifting sheen for surfaces that are already busy. */
  readonly sheen?: boolean;
  readonly seed?: number;
}

export const Glass: React.FC<GlassProps> = ({
  children,
  tier = "card",
  width,
  height,
  radius = 26,
  padding,
  tint,
  tintStrength = 0.1,
  style,
  sheen = true,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const t = GLASS[tier];

  return (
    <div
      style={{
        position: "relative",
        width: width === undefined ? undefined : u(width),
        height: height === undefined ? undefined : u(height),
        padding: padding === undefined ? undefined : u(padding),
        borderRadius: u(radius),
        backgroundColor: `${PALETTE.slate}${Math.round(t.alpha * 255)
          .toString(16)
          .padStart(2, "0")}`,
        backgroundImage: tint
          ? `linear-gradient(158deg, ${tint}${Math.round(tintStrength * 255)
              .toString(16)
              .padStart(2, "0")} 0%, transparent 62%)`
          : undefined,
        backdropFilter: `blur(${u(t.blur)}px) saturate(1.25)`,
        WebkitBackdropFilter: `blur(${u(t.blur)}px) saturate(1.25)`,
        boxShadow: [
          // Top specular — the single most important line in the system.
          `inset 0 ${u(1)}px 0 rgba(255,255,255,${t.specular})`,
          // Full rim, an order of magnitude fainter.
          `inset 0 0 0 ${u(1)}px rgba(255,255,255,${t.rim})`,
          // Contact shadow. Cool, wide, and offset well below the surface.
          `0 ${u(34)}px ${u(80)}px ${u(-36)}px rgba(3,10,7,0.72)`,
        ].join(", "),
        overflow: "hidden",
        isolation: "isolate",
        ...style,
      }}
    >
      {sheen ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "linear-gradient(104deg, transparent 38%, rgba(255,255,255,0.055) 50%, transparent 62%)",
            backgroundSize: "260% 100%",
            // ~9s per pass. Slow enough that you never catch it moving, fast
            // enough that the surface is never the same twice.
            backgroundPosition: `${50 + drift(frame, 0.19, seed) * 90}% 50%`,
          }}
        />
      ) : null}
      {children}
    </div>
  );
};

/**
 * A hairline divider matching the app's `divide-y` treatment — a gradient, not
 * a solid line, so it fades out before it hits the panel's rounded corners.
 */
export const Hairline: React.FC<{ readonly style?: React.CSSProperties }> = ({
  style,
}) => {
  const { u } = useStage();
  return (
    <div
      style={{
        height: u(1),
        backgroundImage: `linear-gradient(90deg, transparent, ${PALETTE.hairline}, transparent)`,
        ...style,
      }}
    />
  );
};

/**
 * The app's soft status pill (`bg-<token>/15` + coloured text). Used for
 * "+6 this week", category tones and the rating buttons.
 */
export const Pill: React.FC<{
  readonly children: React.ReactNode;
  readonly color: string;
  readonly size?: number;
  readonly strong?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ children, color, size = 15, strong = false, style }) => {
  const { u } = useStage();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: u(7),
        padding: `${u(size * 0.42)}px ${u(size * 0.86)}px`,
        borderRadius: 999,
        backgroundColor: `${color}${strong ? "2e" : "1f"}`,
        boxShadow: `inset 0 0 0 ${u(1)}px ${color}2b`,
        color,
        fontSize: u(size),
        fontWeight: 600,
        letterSpacing: "-0.005em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
