import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { A, C, EXIT } from "../theme";
import { LEVEL, SFX } from "../audio";
import { Sfx } from "./Sfx";
import { display } from "../fonts";

/** `true` for the 1080×1920 cut. Scenes branch layout on this, not on a class. */
export const useIsPortrait = () => {
  const { width, height } = useVideoConfig();
  return height > width;
};

/* ================================================================== */
/* Scene                                                               */
/* ================================================================== */

export type ExitVariant = "back" | "up" | "through" | "slide";

/**
 * Wraps a whole beat: holds it in slow continuous motion, then dollies it away
 * over the last {@link EXIT} frames.
 *
 * In the CSS original the exit was `groupOut`, delayed by
 * `calc(var(--in) + var(--hold))` — a number that only existed because the film
 * had one global clock. Inside a `<TransitionSeries.Sequence>`,
 * `durationInFrames` already *is* the end of the beat, so the exit anchors to it
 * and stays correct when scenes are reordered.
 *
 * The drift is the fluidity fix. Previously every element arrived and then sat
 * perfectly still until the cut, which reads as a slide deck no matter how well
 * the arrivals are eased. A frame that is imperceptibly still moving reads as
 * alive. 2% over the length of the beat is below the threshold you can name but
 * above the one you can feel, and because it is the same `scale` channel the
 * exit uses, the dolly-out simply continues from wherever the drift got to.
 *
 * Outgoing layers recede in z rather than simply fading. That is what reads as
 * depth. Four variants keep 16 cuts from all landing the same way.
 */
export const Scene: React.FC<{
  variant?: ExitVariant;
  children: React.ReactNode;
}> = ({ variant = "back", children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(
          frame,
          [durationInFrames - EXIT, durationInFrames],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          },
        ),
        scale: interpolate(
          frame,
          [0, durationInFrames - EXIT, durationInFrames],
          [
            1,
            1.02,
            variant === "through" ? 1.16 : variant === "back" ? 0.88 : 0.97,
          ],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [Easing.linear, Easing.bezier(0.22, 1, 0.36, 1)],
            output: "perceptual-scale",
          },
        ),
        translate:
          variant === "slide"
            ? interpolate(
                frame,
                [durationInFrames - EXIT, durationInFrames],
                [0, -130],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                },
              ) + "px 0px"
            : "0px " +
              interpolate(
                frame,
                [durationInFrames - EXIT, durationInFrames],
                [0, variant === "up" ? -72 : 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                },
              ) +
              "px",
        filter:
          "blur(" +
          interpolate(
            frame,
            [durationInFrames - EXIT, durationInFrames],
            [0, variant === "through" ? 18 : variant === "back" ? 15 : 14],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            },
          ) +
          "px)",
      }}
    >
      <Sfx src={SFX.whoosh} volume={LEVEL.whoosh} />
      {children}
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* Depth entrance                                                      */
/* ================================================================== */

/**
 * Props that fly in from depth: blurred, small and low, resolving into place.
 * `delay` is in frames from the start of the scene.
 *
 * `floaty` adds an ambient breathing drift. The CSS version used
 * `animation: floaty 7s infinite alternate`, which never lands on the same
 * phase twice; here it is a sine of the frame, so frame 400 always looks
 * identical no matter how the render was chunked across machines.
 */
export const Depth: React.FC<{
  delay?: number;
  fromY?: number;
  fromX?: number;
  fromScale?: number;
  fromRotate?: number;
  floaty?: boolean;
  duration?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delay = 0,
  fromY = 60,
  fromX = 0,
  fromScale = 0.8,
  fromRotate = 0,
  floaty = false,
  duration = 40,
  style,
  children,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        ...style,
        opacity: interpolate(frame, [delay, delay + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
        translate:
          interpolate(frame, [delay, delay + duration], [fromX, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }) +
          "px " +
          (interpolate(frame, [delay, delay + duration], [fromY, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }) +
            (floaty ? Math.sin((frame / 210) * Math.PI * 2) * 6 : 0)) +
          "px",
        scale: interpolate(frame, [delay, delay + duration], [fromScale, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          output: "perceptual-scale",
        }),
        rotate:
          interpolate(frame, [delay, delay + duration], [fromRotate, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }) + "deg",
        filter:
          "blur(" +
          interpolate(frame, [delay, delay + duration], [16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }) +
          "px)",
      }}
    >
      {children}
    </div>
  );
};

/** A short spring-y pop, for ticks, badges and CTA buttons. */
export const Pop: React.FC<{
  delay?: number;
  duration?: number;
  from?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ delay = 0, duration = 20, from = 16, style, children }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        ...style,
        opacity: interpolate(frame, [delay, delay + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
        translate:
          "0px " +
          interpolate(frame, [delay, delay + duration], [from, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.34, 1.3, 0.64, 1),
          }) +
          "px",
      }}
    >
      {children}
    </div>
  );
};

/* ================================================================== */
/* Glass                                                               */
/* ================================================================== */

/**
 * The product's liquid-glass panel. `float` is the heavier tier: more blur,
 * a deeper drop shadow, and a specular band that travels across the surface
 * as the panel lands.
 */
export const Glass: React.FC<{
  float?: boolean;
  /** Frame at which the specular sweep begins. Only used when `float`. */
  sweepFrom?: number;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ float = false, sweepFrom = 10, radius = 20, style, children }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        backgroundColor: float ? "rgba(253, 253, 251, 0.68)" : A.surface55,
        backdropFilter: float
          ? "blur(34px) saturate(195%)"
          : "blur(22px) saturate(185%)",
        border: "1px solid " + (float ? A.line60 : A.line50),
        boxShadow: float
          ? "inset 0 1px 0 " +
            A.sheen +
            ", 0 34px 80px -36px rgba(36, 66, 51, 0.7)"
          : "inset 0 1px 0 " +
            A.sheen +
            ", 0 14px 38px -22px rgba(36, 66, 51, 0.6)",
        ...style,
      }}
    >
      {/* Top rim highlight — the edge that sells it as a physical pane. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.1), transparent 64px)",
          boxShadow:
            "inset 0 1px 0 0 " +
            A.rim +
            ", inset 0 0 0 1px rgba(255,255,255,0.08)",
        }}
      />
      {float ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 2,
            backgroundImage:
              "linear-gradient(100deg, transparent 42%, rgba(255,255,255,0.45) 50%, transparent 58%)",
            backgroundSize: "280% 100%",
            backgroundPositionX:
              interpolate(frame, [sweepFrom, sweepFrom + 42], [150, -70], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }) + "%",
            opacity: interpolate(
              frame,
              [sweepFrom, sweepFrom + 5, sweepFrom + 42],
              [0, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        />
      ) : null}
      {children}
    </div>
  );
};

/* ================================================================== */
/* Copy block                                                          */
/* ================================================================== */

/**
 * A headline anchored by its own midpoint. The CSS original used
 * `left/top: 50% + translate(-50%,-50%)` rather than flex centring, because
 * flex degrades to START alignment the moment content overflows and shoves the
 * whole frame down-and-right. Same reasoning holds here.
 */
export const Copy: React.FC<{
  x?: string;
  y?: string;
  width: number;
  fontSize: number;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  x = "50%",
  y = "50%",
  width,
  fontSize,
  align = "center",
  style,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      translate: "-50% -50%",
      textAlign: align,
      fontFamily: display,
      fontWeight: 300,
      fontSize,
      lineHeight: 1.07,
      letterSpacing: "-0.024em",
      color: C.ink,
      textWrap: "balance",
      ...style,
    }}
  >
    {children}
  </div>
);
