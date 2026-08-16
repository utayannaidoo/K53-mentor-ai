import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { DISPLAY } from "../type/fonts";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE MARK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the app's actual logo (`src/components/shared/logo.tsx`): a road
 * narrowing to a vanishing point, with three lane dashes running up the middle.
 *
 * Which means the film's through-line and the company's mark are the same
 * object. The whole edit has been drawing this logo for 50 seconds without
 * saying so — the horizon in Act I, the fracture in Act II, the rush in Act III
 * are all this shape under different pressure. Here it finally resolves.
 *
 * So the reveal is a *draw*, not a fade: the two road edges are stroked on from
 * the vanishing point outward, and only then do the lane dashes light up, one
 * at a time, bottom to top — the same rhythm as the dashes in `<LaneRush>`.
 * Fading this in would throw away the entire premise.
 */

export const LogoMark: React.FC<{
  readonly at: number;
  readonly size?: number;
  /** Skips the draw and shows the finished mark — for feature-scene chrome. */
  readonly static?: boolean;
}> = ({ at, size = 96, static: isStatic = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();
  const t = frame - at;

  // Two road edges, drawn from the vanishing point at the top downward.
  const draw = isStatic
    ? 1
    : interpolate(t, [0, 40], [0, 1], { easing: EASE.glass, ...CLAMP });

  const dashLit = (i: number) =>
    isStatic
      ? 1
      : interpolate(t, [30 + i * 7, 44 + i * 7], [0, 1], {
          easing: EASE.spring,
          ...CLAMP,
        });

  const px = u(size);

  return (
    <div
      style={{
        position: "relative",
        width: px,
        height: px,
        borderRadius: u(size * 0.28),
        backgroundImage: `linear-gradient(152deg, ${PALETTE.greenLift}, ${PALETTE.green} 62%, #2f8f61)`,
        boxShadow: [
          `inset 0 ${u(1.4)}px 0 rgba(255,255,255,0.42)`,
          `0 ${u(18)}px ${u(48)}px ${u(-16)}px ${PALETTE.green}77`,
          `0 0 ${u(70)}px ${PALETTE.green}3a`,
        ].join(", "),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: isStatic
          ? 1
          : interpolate(
              spring({ frame: t, fps, config: SPRING.heavy }),
              [0, 1],
              [0.82, 1],
            ),
        opacity: isStatic
          ? 1
          : interpolate(t, [0, 12], [0, 1], { easing: EASE.soft, ...CLAMP }),
      }}
    >
      {/* The mark occupies 72% of the tile, not the app's 56%. At a logo's
          normal size 56% is correct optical balance; on a cinema screen the
          extra padding made the road read as an abstract glyph — the first
          contact sheet came back looking like a lowercase lambda. */}
      <svg
        width={px * 0.72}
        height={px * 0.72}
        viewBox="0 0 24 24"
        fill="none"
        style={{ overflow: "visible" }}
      >
        {/* Road edges. `pathLength={1}` normalises the dash maths so the two
            asymmetric strokes draw in perfect sync. Weight is up from the app's
            1.6 to 2.5 — a hairline that reads at 36px disappears at 300px
            against a bright fill. */}
        <path
          d="M8.5 21 11 3.5a1 1 0 0 1 2 0L15.5 21"
          stroke="#05130c"
          strokeOpacity={0.94}
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        {/* Lane dashes, lengthened so they read as markings rather than as
            three dots, and lit bottom to top — the same order as `<LaneRush>`. */}
        {[
          { d: "M12 16.9v2.7", i: 0 },
          { d: "M12 11.6v2.7", i: 1 },
          { d: "M12 6.3v2.7", i: 2 },
        ].map(({ d, i }) => (
          <path
            key={d}
            d={d}
            stroke="#ffffff"
            strokeWidth={2.6}
            strokeLinecap="round"
            opacity={dashLit(i)}
            style={{ filter: `drop-shadow(0 0 ${u(size * 0.045)}px rgba(255,255,255,0.9))` }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * Mark plus wordmark. The word settles its own tracking inward as it arrives —
 * the same condensing move as `<BlurWords>`, so the logo lockup and the film's
 * type belong to one another.
 *
 * ── The centring problem ────────────────────────────────────────────────────
 * A flex row reserves the wordmark's width from frame one, so while the word is
 * still invisible the mark sits far left of frame centre and the reveal reads
 * as a layout bug. Measuring the text would mean a layout pass Remotion can't
 * do deterministically, so the group instead starts offset right by half the
 * word's *predicted* width and eases back to zero as the word arrives. The mark
 * is optically centred the entire time it is alone on screen.
 *
 * "K53 Mentor AI" is 13 glyphs; Overpass 600 averages ~0.52em per glyph, so
 * half the word is ≈ 3.4em. That approximation is well inside the tolerance of
 * a move nobody is measuring with a ruler.
 */
export const Lockup: React.FC<{
  readonly at: number;
  readonly size?: number;
  readonly gap?: number;
  readonly wordSize?: number;
  /** Stacks the word under the mark. Used on 9:16, where a row runs out of frame. */
  readonly stacked?: boolean;
}> = ({ at, size = 96, gap = 26, wordSize = 58, stacked = false }) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const t = frame - at;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: "center",
        gap: u(stacked ? gap * 1.1 : gap),
        translate: stacked
          ? undefined
          : `${interpolate(t, [24, 62], [u(wordSize * 3.4 + gap / 2), 0], {
              easing: EASE.glass,
              ...CLAMP,
            })}px 0px`,
      }}
    >
      <LogoMark at={at} size={size} />
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: u(wordSize),
          fontWeight: 600,
          color: PALETTE.ink,
          letterSpacing: `${interpolate(t, [24, 62], [0.14, -0.028], {
            easing: EASE.glass,
            ...CLAMP,
          })}em`,
          opacity: interpolate(t, [24, 48], [0, 1], {
            easing: EASE.soft,
            ...CLAMP,
          }),
          filter: `blur(${interpolate(t, [24, 52], [u(10), 0], {
            easing: EASE.glass,
            ...CLAMP,
          })}px)`,
          whiteSpace: "nowrap",
        }}
      >
        K53 Mentor AI
      </div>
    </div>
  );
};

/**
 * Persistent corner signature for the feature act, so the product is credited
 * on screen without ever interrupting the frame.
 *
 * It is the wordmark alone. The tile was in here originally and at that size it
 * rendered as an indistinct green chip — a logo too small to read is worse than
 * no logo, because the eye stops on it and gets nothing back. The mark earns
 * its screen time twice in this film, at full size, and that is enough.
 */
export const CornerMark: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { u, padX, padY } = useStage();

  return (
    <div
      style={{
        position: "absolute",
        left: padX,
        top: padY * 0.72,
        display: "flex",
        alignItems: "center",
        gap: u(11),
        opacity: interpolate(frame, [at, at + 24], [0, 0.6], {
          easing: EASE.soft,
          ...CLAMP,
        }),
      }}
    >
      <span
        style={{
          width: u(7),
          height: u(7),
          borderRadius: "50%",
          backgroundColor: PALETTE.green,
          boxShadow: `0 0 ${u(10)}px ${PALETTE.green}`,
        }}
      />
      <span
        style={{
          fontFamily: DISPLAY,
          fontSize: u(19),
          fontWeight: 600,
          letterSpacing: TRACKING.title,
          color: PALETTE.ink,
        }}
      >
        K53 Mentor AI
      </span>
    </div>
  );
};
