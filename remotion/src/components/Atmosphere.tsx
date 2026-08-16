import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../theme";

/**
 * Everything that runs for the whole film rather than for one beat: the
 * breathing aurora, the dashed lane lines sweeping through frame, the vignette
 * and the grain.
 *
 * These sit OUTSIDE the `<TransitionSeries>` so `useCurrentFrame()` here is the
 * film clock, not a scene clock. That is the one place a global timeline is
 * still wanted, and Remotion gives it for free — no `--filmDur` bookkeeping.
 */

/** Aurora + lane lines. Renders behind every scene. */
export const AtmosphereBack: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* Three soft radials on cream — the product's `.bg-aurora`, slowly
          drifting. Inset well past the frame so the falloff never shows an edge. */}
      <AbsoluteFill
        style={{
          inset: "-16%",
          opacity: interpolate(frame, [0, 0.06 * durationInFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          backgroundImage: [
            "radial-gradient(46% 42% at " +
              interpolate(
                frame,
                [
                  0,
                  0.3 * durationInFrames,
                  0.58 * durationInFrames,
                  0.82 * durationInFrames,
                  durationInFrames,
                ],
                [4, 18, 2, 14, 8],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              ) +
              "% " +
              interpolate(
                frame,
                [
                  0,
                  0.3 * durationInFrames,
                  0.58 * durationInFrames,
                  0.82 * durationInFrames,
                  durationInFrames,
                ],
                [-10, 2, -4, 4, -6],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              ) +
              "%, rgba(26, 102, 66, 0.20), transparent 62%)",
            "radial-gradient(42% 38% at " +
              interpolate(
                frame,
                [
                  0,
                  0.3 * durationInFrames,
                  0.58 * durationInFrames,
                  0.82 * durationInFrames,
                  durationInFrames,
                ],
                [98, 86, 99, 88, 94],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              ) +
              "% " +
              interpolate(
                frame,
                [
                  0,
                  0.3 * durationInFrames,
                  0.58 * durationInFrames,
                  0.82 * durationInFrames,
                  durationInFrames,
                ],
                [-4, 8, -2, 6, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              ) +
              "%, rgba(24, 87, 170, 0.14), transparent 56%)",
            "radial-gradient(48% 44% at " +
              interpolate(
                frame,
                [
                  0,
                  0.3 * durationInFrames,
                  0.58 * durationInFrames,
                  0.82 * durationInFrames,
                  durationInFrames,
                ],
                [70, 56, 74, 60, 66],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              ) +
              "% " +
              interpolate(
                frame,
                [
                  0,
                  0.3 * durationInFrames,
                  0.58 * durationInFrames,
                  0.82 * durationInFrames,
                  durationInFrames,
                ],
                [116, 104, 112, 106, 110],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              ) +
              "%, rgba(24, 87, 170, 0.10), transparent 60%)",
          ].join(", "),
        }}
      />
      <Lane top="26%" period={330} offset={6} />
      <Lane top="70%" period={420} offset={72} />
    </AbsoluteFill>
  );
};

/**
 * Road Atlas signature: a dashed lane line raking through the frame.
 * `period` is how many frames one full sweep takes; `offset` staggers them.
 */
const Lane: React.FC<{ top: string; period: number; offset: number }> = ({
  top,
  period,
  offset,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: "-20%",
        right: "-20%",
        top,
        height: 10,
        rotate: "-6deg",
        filter: "blur(0.4px)",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(24, 37, 31, 0.45) 0 90px, transparent 90px 200px)",
        backgroundPositionX:
          interpolate((frame + offset) % period, [0, period], [0, -1400], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
          }) + "px",
        opacity: interpolate(
          (frame + offset) % period,
          [0, 0.08 * period, 0.7 * period, period],
          [0, 0.14, 0.08, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
          },
        ),
      }}
    />
  );
};

/** Vignette + grain. Renders in front of every scene. */
export const AtmosphereFront: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* On cream, edge darkening reads as dirt — so it is a whisper. */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(82% 82% at 50% 50%, transparent 52%, rgba(36, 66, 51, 0.10) 100%)",
        }}
      />
      {/*
        Grain.

        Two changes from the CSS original. It used
        `animation: grainShift .5s steps(5) infinite`, whose phase depends on
        when playback started — two renders of the same frame could differ.
        Stepping off `frame` makes it reproducible: every 3rd frame advances one
        of 5 fixed offsets.

        And the noise is an inline <svg> rather than a `background-image:
        url(data:…)`. A background image is not guaranteed to have decoded when
        Remotion captures the frame, so early frames can render clean and then
        the grain pops in. An SVG filter is part of the DOM and always paints.
        As a bonus, one full-frame turbulence has no tiling seam, where the
        original repeated a 180px tile.
      */}
      <AbsoluteFill
        style={{
          inset: -100,
          opacity: 0.05,
          mixBlendMode: "multiply",
          translate: [
            "0px 0px",
            "-24px 14px",
            "18px -22px",
            "-14px -10px",
            "22px 18px",
          ][Math.floor(frame / 3) % 5],
        }}
      >
        <svg style={{ width: "100%", height: "100%" }}>
          <filter id="film-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={3}
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#film-grain)"
            opacity="0.55"
          />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
