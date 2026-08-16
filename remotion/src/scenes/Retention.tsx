import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { B, Dim, Words } from "../components/Words";
import { C } from "../theme";
import { body } from "../fonts";

/**
 * Beat 10 — why the scheduling in the previous beat matters.
 *
 * IMPORTANT, if this beat is ever re-cut: this chart is the *mechanism*, not an
 * outcome. It plots how human memory decays and what scheduled review does to
 * it — established retention research, not a measurement of K53 Mentor users.
 * The caption says so on screen.
 *
 * Do not relabel these axes as pass rates, or redraw them as "before and after
 * using the app", until there is real cohort data to draw. An unbacked efficacy
 * claim about a driving licence exam is the one thing in this film that could
 * actually get it pulled.
 *
 * Geometry is authored in a fixed 1100×420 viewBox and scaled by the SVG, so
 * the curve maths never has to know the composition size.
 *   x(day)       = 90 + day * 69.29        (0 … 14 days)
 *   y(retention) = 350 - retention * 3.1   (0 … 100%)
 */

/** Read once, never reviewed: R = 100·e^(−t/6.5), sampled daily. */
const FORGET =
  "M90,40 L159,84 L229,122 L298,155 L367,183 L436,207 L506,227 L575,245 " +
  "L644,260 L714,273 L783,283 L852,293 L921,301 L991,308 L1060,314";

/**
 * The same fact under spaced review. Each vertical is a review returning it to
 * full strength; each following decay is shallower than the last, which is the
 * whole point — the intervals can stretch because the memory is stronger.
 */
const REVIEWED =
  "M90,40 L124,77 L159,108 L159,40 L229,74 L298,96 L298,40 L436,68 " +
  "L575,83 L575,40 L783,59 L1060,71";

/** Where a review happens, and roughly how far along the draw that is. */
const REVIEWS = [
  { x: 159, progress: 0.18 },
  { x: 298, progress: 0.36 },
  { x: 575, progress: 0.62 },
];

const DRAW_A_FROM = 12;
const DRAW_A_TO = 52;
const DRAW_B_FROM = 46;
const DRAW_B_TO = 100;

export const Retention: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="up">
      <AbsoluteFill>
        <Copy
          y={isPortrait ? "17%" : "17%"}
          width={isPortrait ? 900 : 1400}
          fontSize={66}
        >
          <Words>
            Forgetting is the <B>default</B>.
          </Words>
        </Copy>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "46%" : "56%",
            translate: "-50% -50%",
            width: isPortrait ? 1000 : 1180,
          }}
        >
          <svg viewBox="0 0 1100 420" style={{ width: "100%", height: "auto" }}>
            {/* Baseline and the two horizontal rules it reads against. */}
            {[40, 195, 350].map((y, i) => (
              <line
                key={y}
                x1="90"
                x2="1060"
                y1={y}
                y2={y}
                stroke={C.line}
                strokeWidth={i === 2 ? 3 : 1.5}
                opacity={interpolate(frame, [0 + i * 2, 14 + i * 2], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                })}
              />
            ))}

            {/*
              `pathLength={1}` normalises the path so the dash offset is just
              progress 0→1. No need to measure the real geometry, and the curve
              can be re-authored without retiming the draw.
            */}
            <path
              d={FORGET}
              fill="none"
              stroke={C.danger}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={interpolate(
                frame,
                [DRAW_A_FROM, DRAW_A_TO],
                [1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              )}
            />

            <path
              d={REVIEWED}
              fill="none"
              stroke={C.route}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={interpolate(
                frame,
                [DRAW_B_FROM, DRAW_B_TO],
                [1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.4, 0, 0.2, 1),
                },
              )}
            />

            {/* A marker lands as the line passes each review. */}
            {REVIEWS.map((review) => (
              <circle
                key={review.x}
                cx={review.x}
                cy={40}
                r={interpolate(
                  frame,
                  [
                    DRAW_B_FROM + (DRAW_B_TO - DRAW_B_FROM) * review.progress,
                    DRAW_B_FROM +
                      (DRAW_B_TO - DRAW_B_FROM) * review.progress +
                      12,
                  ],
                  [0, 11],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.34, 1.3, 0.64, 1),
                  },
                )}
                fill={C.route}
                stroke={C.bg}
                strokeWidth="4"
              />
            ))}

            {/* Day markers along the baseline. */}
            {[
              { day: 0, x: 90 },
              { day: 7, x: 575 },
              { day: 14, x: 1060 },
            ].map((tick) => (
              <text
                key={tick.day}
                x={tick.x}
                y={390}
                textAnchor="middle"
                fill={C.inkDim}
                fontFamily={body}
                fontSize="24"
                fontWeight="500"
                letterSpacing="2"
                opacity={interpolate(frame, [10, 26], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                })}
              >
                {tick.day === 0 ? "DAY 0" : "DAY " + tick.day}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend — appears once both curves have finished drawing. */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "64%" : "82%",
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            alignItems: isPortrait ? "flex-start" : "center",
            gap: isPortrait ? 18 : 56,
            opacity: interpolate(frame, [96, 116], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            }),
            translate:
              "-50% calc(-50% + " +
              interpolate(frame, [96, 116], [14, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }) +
              "px)",
          }}
        >
          {[
            { color: C.danger, label: "Read it once" },
            { color: C.route, label: "Reviewed on schedule" },
          ].map((entry) => (
            <span
              key={entry.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                whiteSpace: "nowrap",
                fontFamily: body,
                fontSize: isPortrait ? 32 : 30,
                fontWeight: 500,
                color: C.ink,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: entry.color,
                }}
              />
              {entry.label}
            </span>
          ))}
        </div>

        {/* The honesty line. This is how memory works, not a user outcome. */}
        <Copy
          y={isPortrait ? "72%" : "91%"}
          width={1300}
          fontSize={isPortrait ? 24 : 28}
        >
          <Words from={98} stagger={1}>
            <Dim>
              Spaced repetition &mdash; the schedule every flashcard follows.
            </Dim>
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
