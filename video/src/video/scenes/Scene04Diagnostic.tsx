import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { COPY, DATA } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE, rand } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon, LaneRing } from "../elements/LaneLine";
import { BODY, MONO } from "../type/fonts";
import { Glass } from "../ui/Glass";
import { CornerMark } from "../ui/Logo";
import { FeatureCaption } from "./FeatureCaption";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT IV·1 — DIAGNOSTIC  ·  0:27–0:33  ·  348 frames
 * ═══════════════════════════════════════════════════════════════════════════
 * "Fifteen questions. One honest number."
 *
 * The mini-story: fifteen questions go past faster than you can read them, and
 * they *collapse into a single number*. That collapse is the whole feature —
 * an adaptive assessment's value is that it compresses an hour of guessing into
 * one figure you can act on, and the edit says so without a word of narration.
 *
 * Beat sheet
 *   000–030  Arrive out of the depth transition, still moving.
 *   030–176  The deal. Fifteen cards flick through at ~9 frames each, counter
 *            climbing 01→15 in mono. Camera pushes in the whole time.
 *   176–196  The last card implodes toward the centre.
 *   196–300  The ring writes itself and the number counts to 78. The card's
 *            implosion and the ring's birth overlap by 12 frames, so the stack
 *            visibly *becomes* the score.
 *   300–348  Predicted pass probability settles under it. Hold.
 */

/** Question fragments from the app's real signs pack (`src/lib/content/`). */
const DECK = [
  "A circular sign with a red ring means…",
  "The robot ahead is a steady green. You may…",
  "A plain blue circular sign with a white symbol is a…",
  "Road signs with a yellow background at roadworks are…",
  "This sign warns of a steep upward gradient…",
  "A red-bordered triangle indicates…",
  "You may cross a single solid white line when…",
  "The following distance in good conditions is…",
  "At an uncontrolled four-way, right of way goes to…",
  "A barrier line on your side of the road means…",
  "When may you overtake on the left?",
  "The minimum tread depth on a tyre is…",
  "A flashing red robot must be treated as…",
  "Yellow lines at the edge of the roadway indicate…",
  "You are approaching a traffic circle. You must…",
];

export const Scene04Diagnostic: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait, square } = useStage();

  // Lateral travel is written in stage units, so the same number is a larger
  // share of the frame on the narrower formats (900 design units vs 1500).
  // Left unscaled, the deck's -120u drift walks the card off the left edge on
  // 9:16. Scaling by the design-width ratio keeps the move identical as a
  // *proportion* of frame in every format.
  const driftX = portrait ? 0.45 : square ? 0.6 : 1;

  // 9.7 frames per card — under the ~12 frames it takes to actually read a
  // line, which is the point: the viewer registers volume, not content.
  return (
    <AbsoluteFill>
      <Void />

      <Camera range={[0, 348]} zoom={[1.06, 1.16]} pan={[16, -10]} handheld={0.5} seed={31}>
        <Depth z={-880}>
          <Particles count={30} color={PALETTE.green} opacity={0.4} speed={0.6} />
        </Depth>
        <Depth z={-420}>
          <Glow
            y={portrait ? 0.42 : 0.44}
            size={1500}
            color={PALETTE.green}
            intensity={interpolate(frame, [180, 260], [0.12, 0.26], {
              easing: EASE.glass,
              ...CLAMP,
            })}
            stretch={1.35}
          />
        </Depth>

        {/* ── 030–196 · The deal ───────────────────────────────────────── */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            translate: `0px ${u(portrait ? -180 : -40)}px`,
          }}
        >
          {DECK.map((q, i) => {
            const born = 30 + i * 9.7;
            const gone = born + 26;
            // Every card holds its own tiny rotation and offset for the life of
            // the shot, so the stack reads as physical objects rather than as
            // one element being re-labelled.
            const tilt = (rand(i * 3.3) - 0.5) * 5.5;
            const shove = (rand(i * 7.1) - 0.5) * 30 * driftX;

            return (
              <div
                key={q}
                style={{
                  position: "absolute",
                  opacity: interpolate(
                    frame,
                    [born, born + 4, gone - 8, gone],
                    [0, 1, 1, 0],
                    { easing: EASE.soft, ...CLAMP },
                  ),
                  translate: `${u(
                    shove + interpolate(frame, [born, gone], [40 * driftX, -120 * driftX], {
                      easing: EASE.glass,
                      ...CLAMP,
                    }),
                  )}px ${u(
                    interpolate(frame, [born, gone], [30, -46], {
                      easing: EASE.glass,
                      ...CLAMP,
                    }),
                  )}px`,
                  rotate: `${tilt + interpolate(frame, [born, gone], [1.8, -2.6], CLAMP)}deg`,
                  scale: interpolate(frame, [born, gone], [0.94, 1.08], {
                    easing: EASE.glass,
                    output: "perceptual-scale",
                    ...CLAMP,
                  }),
                  filter: `blur(${interpolate(frame, [gone - 12, gone], [0, u(14)], CLAMP)}px)`,
                }}
              >
                <Glass tier="card" width={portrait ? 600 : square ? 640 : 620} radius={24} padding={28} sheen={false} seed={i}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: u(13),
                      letterSpacing: TRACKING.label,
                      color: PALETTE.green,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")} / {DATA.diagnosticQuestions}
                  </div>
                  <div
                    style={{
                      marginTop: u(12),
                      fontFamily: BODY,
                      fontSize: u(21),
                      fontWeight: 500,
                      lineHeight: 1.3,
                      color: PALETTE.ink,
                    }}
                  >
                    {q}
                  </div>
                </Glass>
              </div>
            );
          })}

          {/* ── 184–348 · The number ──────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              opacity: interpolate(frame, [184, 214], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              scale: interpolate(frame, [184, 236], [1.5, 1], {
                easing: EASE.glass,
                output: "perceptual-scale",
                ...CLAMP,
              }),
              filter: `blur(${interpolate(frame, [184, 226], [u(26), 0], {
                easing: EASE.glass,
                ...CLAMP,
              })}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <LaneRing
                size={portrait ? 400 : 320}
                thickness={portrait ? 12 : 10}
                progress={interpolate(frame, [200, 288], [0, DATA.readiness / 100], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}
              />
              <AbsoluteFill
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: u(portrait ? 118 : 96),
                    fontWeight: 600,
                    letterSpacing: "-0.055em",
                    fontVariantNumeric: "tabular-nums",
                    color: PALETTE.ink,
                  }}
                >
                  {Math.round(
                    interpolate(frame, [200, 288], [0, DATA.readiness], {
                      easing: EASE.glass,
                      ...CLAMP,
                    }),
                  )}
                </span>
                <span
                  style={{
                    marginTop: u(2),
                    fontFamily: BODY,
                    fontSize: u(portrait ? 20 : 17),
                    fontWeight: 500,
                    letterSpacing: TRACKING.label,
                    textTransform: "uppercase",
                    color: PALETTE.mute,
                  }}
                >
                  Readiness
                </span>
              </AbsoluteFill>
            </div>

            <div
              style={{
                marginTop: u(30),
                display: "flex",
                alignItems: "baseline",
                gap: u(12),
                opacity: interpolate(frame, [268, 296], [0, 1], {
                  easing: EASE.soft,
                  ...CLAMP,
                }),
                translate: `0px ${interpolate(frame, [268, 300], [u(16), 0], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}px`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: u(portrait ? 46 : 38),
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  color: PALETTE.success,
                }}
              >
                {Math.round(
                  interpolate(frame, [272, 336], [0, DATA.passProbability], {
                    easing: EASE.glass,
                    ...CLAMP,
                  }),
                )}
                %
              </span>
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: u(portrait ? 22 : 19),
                  color: PALETTE.mute,
                }}
              >
                predicted pass probability
              </span>
            </div>
          </div>
        </AbsoluteFill>

        <LaneHorizon reach={1} y={portrait ? 0.9 : 0.94} thickness={1.4} intensity={0.3} halo={0.5} />
      </Camera>

      <Sequence  layout="none">
        <CornerMark at={12} />
      </Sequence>

      <FeatureCaption
        kicker={COPY.features.diagnostic.kicker}
        line={COPY.features.diagnostic.line}
        at={26}
        out={320}
      />

      <Vignette strength={0.6} />
      <Grain />
    </AbsoluteFill>
  );
};
