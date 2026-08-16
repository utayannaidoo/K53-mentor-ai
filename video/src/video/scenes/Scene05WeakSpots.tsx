import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { COPY, DATA } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon } from "../elements/LaneLine";
import { BODY } from "../type/fonts";
import { Glass, Pill } from "../ui/Glass";
import { MasteryBar } from "../ui/Product";
import { CornerMark } from "../ui/Logo";
import { FeatureCaption } from "./FeatureCaption";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT IV·2 — WEAK SPOTS  ·  0:33–0:38  ·  342 frames
 * ═══════════════════════════════════════════════════════════════════════════
 * "It finds what's actually holding you back."
 *
 * The mini-story: four categories arrive as a flat list — the way a learner
 * sees their own knowledge, undifferentiated. Then the list *reorders itself*.
 * The two weakest lift forward out of the panel and light up; the two strongest
 * dim and fall back in Z.
 *
 * The camera stays wide and tracks laterally the whole time — deliberately the
 * calmest shot in the film, because the content is doing the work. Following a
 * high-energy beat with another high-energy beat is how feature reels become
 * exhausting; this is the breath.
 *
 * Beat sheet
 *   000–030  Arrive.
 *   030–140  Four bars stagger in, in the order the app lists them.
 *   150–210  THE SORT. Rows swap position on a heavy spring — they have mass,
 *            they do not teleport.
 *   200–260  The weak two lift to z+90 and brighten; the strong two drop to
 *            z−120 and dim to 30%.
 *   250–290  A "Focus here" chip lands on Road signs.
 *   290–342  Hold.
 */

// Ordered as the app lists them; `weak` marks the two the sort promotes.
const ROWS = [
  { label: "Rules of the road", value: 88, tone: "green" as const, weak: false },
  { label: "Vehicle controls", value: 81, tone: "green" as const, weak: false },
  { label: "Road signs", value: 64, tone: "ochre" as const, weak: true },
  { label: "Road markings", value: 59, tone: "ochre" as const, weak: true },
];

// After the sort: weakest first. Indices into ROWS.
const SORTED = [2, 3, 0, 1];

export const Scene05WeakSpots: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait, square } = useStage();

  const rowH = portrait ? 128 : 104;

  return (
    <AbsoluteFill>
      <Void />

      <Camera range={[0, 342]} pan={[-30, 26]} yaw={[2.2, -1.6]} zoom={[1.02, 1.07]} handheld={0.42} seed={44}>
        <Depth z={-880}>
          <Particles count={26} color={PALETTE.green} opacity={0.32} speed={0.5} />
        </Depth>
        <Depth z={-420}>
          <Glow
            x={portrait ? 0.5 : 0.46}
            y={portrait ? 0.42 : 0.44}
            size={1400}
            color={PALETTE.ochre}
            intensity={interpolate(frame, [180, 260], [0.05, 0.14], {
              easing: EASE.glass,
              ...CLAMP,
            })}
            stretch={1.4}
          />
        </Depth>

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            translate: `0px ${u(portrait ? -190 : -46)}px`,
          }}
        >
          <Glass
            tier="float"
            width={portrait ? 740 : square ? 730 : 820}
            radius={30}
            padding={portrait ? 40 : 44}
            seed={4}
            style={{
              opacity: interpolate(frame, [10, 40], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              scale: interpolate(frame, [10, 52], [0.96, 1], {
                easing: EASE.glass,
                output: "perceptual-scale",
                ...CLAMP,
              }),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: u(30),
                opacity: interpolate(frame, [20, 44], [0, 1], {
                  easing: EASE.soft,
                  ...CLAMP,
                }),
              }}
            >
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: u(14),
                  fontWeight: 500,
                  letterSpacing: TRACKING.label,
                  textTransform: "uppercase",
                  color: PALETTE.mute,
                }}
              >
                Category mastery
              </span>
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: u(14),
                  fontWeight: 500,
                  letterSpacing: TRACKING.label,
                  textTransform: "uppercase",
                  color: PALETTE.mute,
                  // Reveals only once the sort has resolved — the label is the
                  // punchline, so it cannot arrive before the joke.
                  opacity: interpolate(frame, [196, 226], [0, 1], {
                    easing: EASE.soft,
                    ...CLAMP,
                  }),
                }}
              >
                Weakest first
              </span>
            </div>

            <div style={{ position: "relative", height: u(rowH * ROWS.length) }}>
              {ROWS.map((row, i) => {
                const targetIndex = SORTED.indexOf(i);
                // The sort is a *travel*, not a re-render: each row eases from
                // its original slot to its new one over 60 frames on the glass
                // curve, so rows pass one another and you can follow any single
                // one with your eye.
                const slot = interpolate(frame, [150, 210], [i, targetIndex], {
                  easing: EASE.glass,
                  ...CLAMP,
                });

                const lift = row.weak
                  ? interpolate(frame, [200, 250], [0, 1], {
                      easing: EASE.glass,
                      ...CLAMP,
                    })
                  : 0;
                const recede = row.weak
                  ? 0
                  : interpolate(frame, [200, 250], [0, 1], {
                      easing: EASE.glass,
                      ...CLAMP,
                    });

                return (
                  <div
                    key={row.label}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: u(slot * rowH),
                      display: "flex",
                      alignItems: "center",
                      gap: u(20),
                      opacity: 1 - recede * 0.66,
                      // Weak rows come forward; strong rows fall back. Real Z,
                      // so the perspective actually changes their size.
                      translate: `${u(lift * 14)}px 0px`,
                      scale: 1 + lift * 0.035 - recede * 0.03,
                      filter: recede > 0 ? `blur(${u(recede * 1.6)}px)` : "none",
                    }}
                  >
                    <MasteryBar
                      label={row.label}
                      value={row.value}
                      tone={row.tone}
                      at={30 + i * 14}
                      width={portrait ? 630 : square ? 620 : 660}
                      focus={row.weak}
                      focusAt={200}
                    />
                    {row.weak ? (
                      <div
                        style={{
                          opacity: interpolate(frame, [250 + targetIndex * 12, 278 + targetIndex * 12], [0, 1], {
                            easing: EASE.soft,
                            ...CLAMP,
                          }),
                          scale: interpolate(
                            frame,
                            [250 + targetIndex * 12, 280 + targetIndex * 12],
                            [0.7, 1],
                            { easing: EASE.spring, output: "perceptual-scale", ...CLAMP },
                          ),
                        }}
                      >
                        <Pill color={PALETTE.ochre} size={13} strong>
                          Focus here
                        </Pill>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Glass>

          {/* The consequence, stated in the product's own numbers. */}
          <div
            style={{
              marginTop: u(30),
              fontFamily: BODY,
              fontSize: u(portrait ? 22 : 19),
              color: PALETTE.mute,
              opacity: interpolate(frame, [286, 314], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              translate: `0px ${interpolate(frame, [286, 318], [u(14), 0], {
                easing: EASE.glass,
                ...CLAMP,
              })}px`,
            }}
          >
            {DATA.categories} categories tracked · your plan rebuilds every day
          </div>
        </AbsoluteFill>

        <LaneHorizon reach={1} y={portrait ? 0.9 : 0.94} thickness={1.4} intensity={0.28} halo={0.45} />
      </Camera>

      <Sequence  layout="none">
        <CornerMark at={0} />
      </Sequence>

      <FeatureCaption
        kicker={COPY.features.weakSpots.kicker}
        line={COPY.features.weakSpots.line}
        at={20}
        out={314}
      />

      <Vignette strength={0.6} />
      <Grain />
    </AbsoluteFill>
  );
};
