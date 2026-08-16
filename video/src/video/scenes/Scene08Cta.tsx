import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { COPY } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon, LaneRing } from "../elements/LaneLine";
import { MaskLine } from "../type/Kinetic";
import { BODY, MONO } from "../type/fonts";
import { Lockup } from "../ui/Logo";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT V — THE CLOSE  ·  0:49–0:58  ·  595 frames
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Everything slows. The product is gone; only the line is left — the same line
 * that opened the film in Act I, alone in the dark again, fifty seconds later.
 *
 * And then it bends into a circle and closes. That is the entire ending: an
 * open road becoming a completed ring. The film's argument in one shape.
 *
 * Beat sheet
 *   000–070  Black, and the line. Nothing else. Let it sit.
 *   070–200  THE BEND. The horizon's scaleY opens from 0.015 to 1 while the
 *            ring writes itself around it. Because the two share a centre and a
 *            colour, the eye reads one object deforming, not a crossfade.
 *   200–214  Closure. A bloom pulse on the exact frame the stroke meets itself,
 *            and the particles get one upward push.
 *   214–300  The ring contracts and dims; the mark draws at its centre.
 *   288–370  The wordmark condenses in. Full lockup.
 *   370–450  "Pass first time." Mask-revealed, the largest type in the film.
 *   440–510  "Start free — no card needed." and the URL.
 *   500–560  The pull-back. Everything recedes; particles rise past the lens.
 *   556–595  Fade to black. The last four frames are pure black — a film should
 *            end on nothing, not on a logo dissolving.
 */

export const Scene08Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait, square } = useStage();

  // The single value the whole ending is built on.
  const bend = interpolate(frame, [70, 200], [0, 1], {
    easing: EASE.glass,
    ...CLAMP,
  });

  return (
    <AbsoluteFill>
      <Void />

      {/* Deliberately no motion blur here. The closing move travels about
          20% of frame width over ten seconds — there is nothing to smear,
          and blurring all 595 frames of it cost more render time than the
          rest of the film put together. Slow moves do not want a shutter. */}
      <Camera
        range={[0, 595]}
        zoom={[1.14, 0.93]}
        tilt={[-8, 14]}
        handheld={0.4}
        ease="glass"
        seed={71}
      >
        <Depth z={-900}>
          <Particles
            count={44}
            color={PALETTE.green}
            opacity={interpolate(frame, [180, 260, 520, 590], [0.3, 0.7, 0.7, 0], {
              easing: EASE.soft,
              ...CLAMP,
            })}
            speed={interpolate(frame, [200, 214, 520], [0.5, 2.4, 1.1], {
              easing: EASE.brake,
              ...CLAMP,
            })}
          />
        </Depth>

        <Depth z={-440}>
          <Glow
            y={0.47}
            size={1700}
            color={PALETTE.green}
            intensity={interpolate(
              frame,
              [40, 200, 210, 300, 540, 595],
              [0.06, 0.16, 0.46, 0.2, 0.2, 0],
              { easing: EASE.soft, ...CLAMP },
            )}
            stretch={1.35}
          />
        </Depth>

        {/* ── The bend ─────────────────────────────────────────────── */}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {/* The straight line, flattening away as the ring opens. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - bend,
            }}
          >
            <LaneHorizon
              reach={interpolate(frame, [0, 60], [0.2, 1], {
                easing: EASE.glass,
                ...CLAMP,
              })}
              y={0.5}
              thickness={2}
              intensity={interpolate(frame, [0, 60], [0.5, 1], {
                easing: EASE.soft,
                ...CLAMP,
              })}
              halo={1}
            />
          </div>

          {/* The same line, now a circle. Opening scaleY from near-zero is
              what makes it read as a bend rather than as a new object.
              After the closure hit it contracts and dims *away* — the ring
              and the lockup previously occupied the same space at the same
              time and read as a collision. One object hands off to the next;
              they do not share the frame. */}
          <div
            style={{
              position: "absolute",
              scale: `${interpolate(frame, [206, 268], [1, 0.42], {
                easing: EASE.glass,
                ...CLAMP,
              })} ${
                (0.015 + bend * 0.985) *
                interpolate(frame, [206, 268], [1, 0.42], {
                  easing: EASE.glass,
                  ...CLAMP,
                })
              }`,
              opacity: interpolate(frame, [70, 110, 206, 258], [0, 1, 1, 0], {
                easing: EASE.soft,
                ...CLAMP,
              }),
            }}
          >
            <LaneRing
              size={portrait ? 640 : square ? 560 : 560}
              thickness={portrait ? 4 : 3.4}
              progress={interpolate(frame, [96, 200], [0, 1], {
                easing: EASE.glass,
                ...CLAMP,
              })}
              trackOpacity={0}
              intensity={interpolate(frame, [196, 206, 240], [1, 2.2, 1], {
                easing: EASE.brake,
                ...CLAMP,
              })}
            />
          </div>

          {/* ── The lockup ────────────────────────────────────────── */}
          {/* Enters as the ring leaves, at the ring's own centre. */}
          <div
            style={{
              position: "absolute",
              opacity: interpolate(frame, [232, 268], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              translate: `0px ${interpolate(frame, [340, 420], [0, u(portrait ? -230 : -140)], {
                easing: EASE.glass,
                ...CLAMP,
              })}px`,
            }}
          >
            <Lockup
              at={232}
              size={portrait ? 132 : square ? 118 : 128}
              wordSize={portrait ? 54 : square ? 60 : 70}
              gap={portrait ? 24 : 28}
              stacked={portrait}
            />
          </div>
        </AbsoluteFill>

        {/* ── The payoff ───────────────────────────────────────────── */}
        <Sequence from={370} durationInFrames={225} layout="none">
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              translate: `0px ${u(portrait ? 200 : 122)}px`,
              flexDirection: "column",
            }}
          >
            <MaskLine
              at={0}
              size={portrait ? 96 : square ? 96 : 128}
              weight={600}
              color={PALETTE.ink}
              tracking={TRACKING.hero}
              stagger={6}
            >
              Pass first time.
            </MaskLine>

            <div
              style={{
                marginTop: u(portrait ? 40 : 34),
                display: "flex",
                flexDirection: portrait ? "column" : "row",
                alignItems: "center",
                gap: u(portrait ? 16 : 26),
                opacity: interpolate(frame - 370, [70, 104], [0, 1], {
                  easing: EASE.soft,
                  ...CLAMP,
                }),
                translate: `0px ${interpolate(frame - 370, [70, 110], [u(18), 0], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}px`,
              }}
            >
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: u(portrait ? 25 : 22),
                  fontWeight: 400,
                  color: PALETTE.mute,
                }}
              >
                {COPY.cta.sub}
              </span>
              {portrait ? null : (
                <span
                  style={{
                    width: u(5),
                    height: u(5),
                    borderRadius: "50%",
                    backgroundColor: PALETTE.mute,
                    opacity: 0.5,
                  }}
                />
              )}
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: u(portrait ? 26 : 23),
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: PALETTE.green,
                }}
              >
                {COPY.cta.url}
              </span>
            </div>
          </AbsoluteFill>
        </Sequence>
      </Camera>

      {/* The closure pulse — three frames, on the exact frame the ring meets
          itself. Everything in the film has been building to this one hit. */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(closest-side, ${PALETTE.greenLift} 0%, transparent 68%)`,
          mixBlendMode: "screen",
          opacity: interpolate(frame, [198, 204, 244], [0, 0.46, 0], {
            easing: EASE.brake,
            ...CLAMP,
          }),
        }}
      />

      <Vignette
        strength={interpolate(frame, [400, 595], [0.62, 0.86], {
          easing: EASE.soft,
          ...CLAMP,
        })}
      />
      <Grain opacity={0.05} />

      {/* Fade out. The final four frames are pure black — a film should end on
          nothing at all, not on a logo mid-dissolve. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 24], [1, 0], {
            easing: EASE.glass,
            ...CLAMP,
          }),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [538, 591], [0, 1], {
            easing: EASE.soft,
            ...CLAMP,
          }),
        }}
      />
    </AbsoluteFill>
  );
};
