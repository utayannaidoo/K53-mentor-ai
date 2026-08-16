import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { BODY, DISPLAY, MONO } from "./fonts";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KINETIC TYPE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Type is the lead actor in this film, so it gets a proper vocabulary rather
 * than a fade.
 *
 * Three reveals, each with a different emotional job:
 *
 *   MaskLine   Words rise out from behind a hard mask edge. Physical, weighty,
 *              the most confident of the three. Used for the thesis lines.
 *   BlurWords  Words resolve out of defocus while their letter-spacing settles
 *              inward. Reads as *coming into focus* — a thought forming. Used
 *              in the mystery and the reveal.
 *   Slam       Type arrives overscale and decelerates hard into place, with a
 *              1-frame overshoot. Percussive. Problem act only.
 *
 * All three stagger word-by-word, never letter-by-letter. Letter-by-letter is
 * the single most common tell of template motion graphics: real title design
 * treats the word as the unit of meaning, because that is how people read.
 */

type Common = {
  readonly children: string;
  /** Frame the reveal begins, relative to the scene. */
  readonly at: number;
  readonly size: number;
  readonly color?: string;
  readonly weight?: number;
  readonly tracking?: string;
  readonly lineHeight?: number;
  readonly align?: "left" | "center" | "right";
  readonly font?: "display" | "body" | "mono";
  readonly style?: React.CSSProperties;
  /** Frames between each word. 3–5 is a phrase; 10+ is a list. */
  readonly stagger?: number;
  /** Optional frame at which the line starts leaving. */
  readonly out?: number;
};

const familyOf = (font: Common["font"]) =>
  font === "mono" ? MONO : font === "body" ? BODY : DISPLAY;

/* ───────────────────────────────────────────────────────────────────────── */

export const MaskLine: React.FC<Common> = ({
  children,
  at,
  size,
  color = PALETTE.ink,
  weight = 600,
  tracking = TRACKING.display,
  lineHeight = 1.02,
  align = "center",
  font = "display",
  stagger = 4,
  out,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();
  const words = children.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `0 ${u(size * 0.26)}px`,
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        fontFamily: familyOf(font),
        fontSize: u(size),
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight,
        color,
        ...style,
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            // The mask is the whole trick: a clip box one line tall, with
            // bottom padding so descenders are not sheared off.
            //
            // That padding makes the box TALLER than one line — 1.02 line
            // height + 0.16 padding ≈ 1.18em — so the word below must travel
            // further than 1.18em or its tops sit inside the box and peek out
            // before the reveal. It travelled 1.05em, and the glyph tops were
            // visible on every mask line in the film. See the `travel` below.
            display: "block",
            overflow: "hidden",
            paddingBottom: u(size * 0.16),
            marginBottom: u(-size * 0.16),
          }}
        >
          <span
            style={{
              display: "block",
              // 1.3em, comfortably clear of the ~1.18em clip box. Do not lower
              // this to "tighten" the reveal — you get peeking glyph tops.
              translate: `0px ${interpolate(
                spring({
                  frame: frame - at - i * stagger,
                  fps,
                  config: SPRING.heavy,
                }),
                [0, 1],
                [u(size * 1.3), 0],
              )}px`,
              opacity: out
                ? interpolate(frame, [out, out + 14], [1, 0], {
                    easing: EASE.soft,
                    ...CLAMP,
                  })
                : 1,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────── */

export const BlurWords: React.FC<
  Common & {
    /** How far out of focus it starts, in stage units. */
    readonly defocus?: number;
    /** Extra tracking at the start, collapsing to `tracking`. */
    readonly spread?: number;
  }
> = ({
  children,
  at,
  size,
  color = PALETTE.ink,
  weight = 300,
  tracking = TRACKING.display,
  lineHeight = 1.14,
  align = "center",
  font = "display",
  stagger = 6,
  defocus = 15,
  spread = 0.09,
  out,
  style,
}) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const words = children.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: `${u(size * 0.18)}px ${u(size * 0.28)}px`,
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        fontFamily: familyOf(font),
        fontSize: u(size),
        fontWeight: weight,
        lineHeight,
        color,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const t = frame - at - i * stagger;
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "block",
              // Letter-spacing collapsing inward as the blur clears is the
              // whole illusion: the word *condenses* into legibility instead of
              // appearing. It costs nothing and reads as expensive.
              letterSpacing: `${interpolate(t, [0, 34], [spread, 0], {
                easing: EASE.glass,
                ...CLAMP,
              })}em`,
              filter: `blur(${interpolate(t, [0, 26], [u(defocus), 0], {
                easing: EASE.glass,
                ...CLAMP,
              })}px)`,
              opacity:
                interpolate(t, [0, 20], [0, 1], { easing: EASE.soft, ...CLAMP }) *
                (out
                  ? interpolate(frame, [out, out + 18], [1, 0], {
                      easing: EASE.soft,
                      ...CLAMP,
                    })
                  : 1),
              translate: `0px ${interpolate(t, [0, 30], [u(size * 0.18), 0], {
                easing: EASE.glass,
                ...CLAMP,
              })}px`,
              marginRight: tracking === TRACKING.label ? u(size * 0.1) : 0,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────── */

export const Slam: React.FC<
  Common & {
    /** Scale it arrives at before decelerating to 1. */
    readonly from?: number;
    /** Frames the whole word stays on screen. */
    readonly hold?: number;
  }
> = ({
  children,
  at,
  size,
  color = PALETTE.ink,
  weight = 700,
  tracking = TRACKING.hero,
  align = "center",
  font = "display",
  from = 1.34,
  hold = 26,
  style,
}) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const t = frame - at;

  return (
    <div
      style={{
        fontFamily: familyOf(font),
        fontSize: u(size),
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: 0.9,
        color,
        textAlign: align,
        textTransform: "uppercase",
        // Arrives big and out of focus, brakes hard, holds, then is *cut* —
        // it does not fade. A word that fades out has no rhythm.
        scale: interpolate(t, [0, 9], [from, 1], {
          easing: EASE.brake,
          output: "perceptual-scale",
          ...CLAMP,
        }),
        filter: `blur(${interpolate(t, [0, 7], [22, 0], {
          easing: EASE.brake,
          ...CLAMP,
        })}px)`,
        opacity: interpolate(t, [0, 3, hold - 2, hold], [0, 1, 1, 0], {
          easing: EASE.soft,
          ...CLAMP,
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────── */

/**
 * Eyebrow label. Small caps, wide tracking, with a lit dot — lifted straight
 * from the app's own section kickers so the film's chapter marks and the
 * product's section headers are the same component.
 */
export const Kicker: React.FC<{
  readonly children: string;
  readonly at: number;
  readonly color?: string;
  readonly size?: number;
  readonly align?: "left" | "center";
}> = ({ children, at, color = PALETTE.green, size = 17, align = "left" }) => {
  const frame = useCurrentFrame();
  const { u } = useStage();
  const t = frame - at;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: u(12),
        justifyContent: align === "center" ? "center" : "flex-start",
        fontFamily: BODY,
        fontSize: u(size),
        fontWeight: 500,
        letterSpacing: TRACKING.label,
        textTransform: "uppercase",
        color,
        opacity: interpolate(t, [0, 16], [0, 1], { easing: EASE.soft, ...CLAMP }),
        translate: `${interpolate(t, [0, 26], [u(-14), 0], {
          easing: EASE.glass,
          ...CLAMP,
        })}px 0px`,
      }}
    >
      <span
        style={{
          width: u(7),
          height: u(7),
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 0 ${u(4)}px ${color}2e, 0 0 ${u(12)}px ${color}`,
          scale: interpolate(t, [2, 20], [0, 1], {
            easing: EASE.spring,
            output: "perceptual-scale",
            ...CLAMP,
          }),
        }}
      />
      {children}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────── */

/**
 * Mono counter. Every number in the film runs through this so they all land the
 * same way: an eased ramp (never linear — a linear count-up reads as a loading
 * spinner) with tabular figures so the glyphs never jitter as digits change.
 */
export const Counter: React.FC<{
  readonly to: number;
  readonly at: number;
  readonly duration?: number;
  readonly size: number;
  readonly color?: string;
  readonly suffix?: string;
  readonly weight?: number;
  readonly style?: React.CSSProperties;
}> = ({
  to,
  at,
  duration = 46,
  size,
  color = PALETTE.ink,
  suffix = "",
  weight = 600,
  style,
}) => {
  const frame = useCurrentFrame();
  const { u } = useStage();

  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: u(size),
        fontWeight: weight,
        letterSpacing: "-0.04em",
        fontVariantNumeric: "tabular-nums",
        color,
        opacity: interpolate(frame, [at, at + 10], [0, 1], {
          easing: EASE.soft,
          ...CLAMP,
        }),
        ...style,
      }}
    >
      {Math.round(
        interpolate(frame, [at, at + duration], [0, to], {
          easing: EASE.glass,
          ...CLAMP,
        }),
      )}
      {suffix}
    </span>
  );
};
