import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Shutter } from "../camera/Shutter";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon, LaneRing, LaneRush, LightSweep } from "../elements/LaneLine";
import { BlurWords } from "../type/Kinetic";
import { BODY, MONO } from "../type/fonts";
import { ReadinessCard } from "../ui/Product";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT III — THE REVEAL  ·  0:17–0:27  ·  636 frames
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This is the peak. Everything before it exists to earn these ten seconds and
 * everything after it is consequence.
 *
 * Beat sheet
 *   000–048  The residue of the silence. Black. One point of light returns at
 *            the vanishing point — the same point Act I was born from.
 *   048–168  THE RUSH. The road markings accelerate toward camera. Because the
 *            projection is real (`focal / (focal + z)`) the acceleration is
 *            non-linear and gets away from you. Sub-bass rises underneath.
 *   168–186  Impact. The road passes the lens. One frame of bloom, then the
 *            chromatic fringe pulls apart and snaps back.
 *   176–306  THE NUMBER. One figure counts to 78 in the void with the ring
 *            writing around it. No panel, no chrome, no logo — the film's whole
 *            argument, alone on screen.
 *   176–460  Dawn. A warm bloom lifts from below the horizon: the first light in
 *            the film, and the only place the frame gets brighter.
 *   306–390  Handoff. The hero ring shrinks and travels into the card's own ring
 *            seat while the panel assembles behind it. The card's ring is
 *            already complete, so the swap is invisible and the number is
 *            continuous from the void into the product.
 *   432–560  Slow orbit around the readiness card. −7° to +3° of yaw. The card
 *            is real 3D here; you can see the glass edge catch the light as it
 *            turns.
 *   560–636  Push in, hand off to the depth transition. We fly into the product.
 */

export const Scene03Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait, square } = useStage();

  return (
    <AbsoluteFill>
      <Void />

      {/* ── 000–186 · The rush ──────────────────────────────────────────── */}
      <Sequence  durationInFrames={200} layout="none">
        {/* The rush proper. Before frame 40 the road is barely moving. */}
        <Shutter range={[40, 190]}>
          <Camera
            range={[48, 186]}
            zoom={[1, 1.5]}
            focus={[3, 0]}
            handheld={0.5}
            ease="anticipate"
            seed={5}
          >
            <Depth z={-500}>
              <Glow
                y={0.5}
                size={1400}
                color={PALETTE.green}
                intensity={interpolate(frame, [20, 150, 186], [0, 0.3, 0.9], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}
              />
            </Depth>

            <LaneRush
              // Cubic ramp. A linear travel here would look like a screensaver;
              // the cube is what makes the road *get away from you*.
              travel={interpolate(frame, [24, 186], [0, 5400], {
                easing: EASE.anticipate,
                ...CLAMP,
              })}
              opacity={interpolate(frame, [24, 60, 178, 190], [0, 1, 1, 0], CLAMP)}
              horizon={0.5}
              count={30}
            />
          </Camera>
        </Shutter>
      </Sequence>

      {/* ── 168–186 · Impact ────────────────────────────────────────────── */}
      {/* Bloom, then a chromatic split that resolves in nine frames. Kept under
          2px: any more and it reads as a rendering bug rather than as a lens. */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(closest-side, ${PALETTE.greenLift} 0%, ${PALETTE.green}00 70%)`,
          opacity: interpolate(frame, [160, 172, 210], [0, 0.92, 0], {
            easing: EASE.brake,
            ...CLAMP,
          }),
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: "#dff7ea",
          opacity: interpolate(frame, [168, 171, 184], [0, 0.8, 0], {
            easing: EASE.brake,
            ...CLAMP,
          }),
          mixBlendMode: "screen",
        }}
      />

      {/* ── 176–636 · THE NUMBER, AND THE PRODUCT AROUND IT ─────────────── */}
      {/* This used to be the logo lockup, and it was wrong: a brand card twenty
          seconds in reads as an *ending*, and it deflated the one moment the
          whole film has been building toward. The mark now appears once, in Act
          V, where an end card belongs.

          What replaces it is the film's actual argument. Out of the impact
          bloom, one number counts up in the void — no panel, no chrome, nothing
          to read but the figure. Then the interface assembles *around* it.

          ── Why the hero ring and the card share one camera ──────────────────
          The hero ring does not cross-fade into the card. It shrinks and travels
          into the exact seat the card's own ring occupies, the card arrives with
          its ring already complete (`ringAt`), and for ~20 frames there are two
          identical rings in the same place — so the swap is invisible and the
          number is continuous from the void into the product.

          That only works if both sit under the *same* camera. They were in two
          separate rigs at first, one at zoom 1.05 and the other at 0.92, and no
          amount of tuning the seat coordinates could align them — the cameras
          disagreed, so the rings did too. Sharing a rig makes them align by
          construction, and the camera is then free to move however it likes.

          For the same reason the card fades in on opacity and blur only, with no
          translate: anything that moves the card also moves its ring seat out
          from under the hero. */}
      <Sequence from={176} durationInFrames={460} layout="none">
        <Camera
          range={[0, 460]}
          zoom={[1.12, 1.06]}
          yaw={[-5, 3]}
          pitch={[2.4, -0.6]}
          ease="glass"
        >
          <Camera handheld={0.6} seed={21}>
            <Depth z={-820}>
              <Particles
                count={40}
                color={PALETTE.green}
                opacity={interpolate(frame - 176, [0, 80], [0.2, 0.55], CLAMP)}
                speed={0.7}
              />
            </Depth>

            {/* Dawn. The one place in the film the frame is allowed to get
                lighter — a warm bloom lifting from below the horizon, the first
                light in twenty seconds of near-black. It does the emotional work
                the logo was being asked to do, without saying anything. */}
            <Depth z={-620}>
              <Glow
                y={0.94}
                size={1900}
                color={PALETTE.green}
                intensity={interpolate(frame - 176, [0, 120, 260, 400], [0, 0.13, 0.17, 0.11], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}
                stretch={1.5}
              />
            </Depth>

            <Depth z={-440}>
              <Glow
                y={portrait ? 0.44 : 0.46}
                size={1600}
                color={PALETTE.green}
                intensity={interpolate(frame - 176, [130, 200], [0, 0.24], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}
                stretch={1.3}
              />
              <Glow
                x={portrait ? 0.72 : 0.7}
                y={portrait ? 0.34 : 0.68}
                size={900}
                color={PALETTE.blue}
                intensity={interpolate(frame - 176, [170, 250], [0, 0.16], {
                  easing: EASE.glass,
                  ...CLAMP,
                })}
              />
            </Depth>

            {/* The product. Opacity and blur only — see the note above. */}
            <AbsoluteFill
              style={{
                alignItems: "center",
                justifyContent: "center",
                translate: `0px ${u(portrait ? -90 : 0)}px`,
              }}
            >
              <div
                style={{
                  opacity: interpolate(frame - 176, [128, 168], [0, 1], {
                    easing: EASE.soft,
                    ...CLAMP,
                  }),
                  filter: `blur(${interpolate(frame - 176, [128, 176], [u(20), 0], {
                    easing: EASE.glass,
                    ...CLAMP,
                  })}px)`,
                }}
              >
                <ReadinessCard
                  at={132}
                  width={portrait ? 800 : square ? 830 : 900}
                  // Already complete on arrival: the hero ring is sitting on top
                  // of it through the handoff, and two rings mid-write would not
                  // match.
                  ringAt={-400}
                />
              </div>
            </AbsoluteFill>

            {/* The hero number. Same rig as the card, so the seat holds. */}
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  position: "absolute",
                  // The seat is DERIVED, not eyeballed. Tailwind's preflight is
                  // active, so `box-sizing: border-box` — the card's `width`
                  // includes its 30 units of padding. For a 900-wide card:
                  //
                  //   outer left      = −900/2        = −450
                  //   + padding       = +30
                  //   + half the ring = +84   (168/2)
                  //   ring centre x   =              = −336
                  //
                  // Vertically the ring lands within ~3 units of the card's own
                  // centre, so −3. Two attempts at measuring this off a render
                  // gave −336 and −357 and disagreed with each other, because
                  // both frames caught the card mid-animation. Derive it.
                  translate: `${interpolate(
                    frame - 176,
                    [100, 150],
                    [0, u(portrait ? -286 : square ? -301 : -336)],
                    { easing: EASE.glass, ...CLAMP },
                  )}px ${interpolate(
                    frame - 176,
                    [100, 150],
                    [0, u(portrait ? -93 : -3)],
                    { easing: EASE.glass, ...CLAMP },
                  )}px`,
                  // 400 units down to the card's 168 — the same ring, arriving.
                  scale: interpolate(frame - 176, [100, 150], [1, 0.42], {
                    easing: EASE.glass,
                    output: "perceptual-scale",
                    ...CLAMP,
                  }),
                  // Lands at 150; only fades once the card's identical ring is
                  // underneath it. Because they are aligned and identical, the
                  // cross-dissolve is imperceptible.
                  opacity: interpolate(frame - 176, [0, 16, 158, 180], [0, 1, 1, 0], {
                    easing: EASE.soft,
                    ...CLAMP,
                  }),
                  filter: `blur(${interpolate(frame - 176, [0, 24], [u(18), 0], {
                    easing: EASE.glass,
                    ...CLAMP,
                  })}px)`,
                }}
              >
                <div style={{ position: "relative" }}>
                  <LaneRing
                    size={400}
                    thickness={10}
                    progress={interpolate(frame - 176, [24, 104], [0, 0.78], {
                      easing: EASE.glass,
                      ...CLAMP,
                    })}
                    intensity={interpolate(frame - 176, [24, 60], [0.5, 1], CLAMP)}
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
                        // 105 × 0.42 = 44, exactly the card's number size — so
                        // the digits do not change size at the swap.
                        fontSize: u(105),
                        fontWeight: 600,
                        letterSpacing: "-0.055em",
                        fontVariantNumeric: "tabular-nums",
                        color: PALETTE.ink,
                        textShadow: `0 0 ${u(30)}px ${PALETTE.green}55`,
                      }}
                    >
                      {Math.round(
                        interpolate(frame - 176, [24, 104], [0, 78], {
                          easing: EASE.glass,
                          ...CLAMP,
                        }),
                      )}
                    </span>
                    <span
                      style={{
                        marginTop: u(6),
                        fontFamily: BODY,
                        fontSize: u(26),
                        fontWeight: 500,
                        letterSpacing: TRACKING.label,
                        textTransform: "uppercase",
                        color: PALETTE.mute,
                        // Gone before the travel starts — the card has its own.
                        opacity: interpolate(frame - 176, [56, 84, 96, 116], [0, 1, 1, 0], {
                          easing: EASE.soft,
                          ...CLAMP,
                        }),
                      }}
                    >
                      Readiness
                    </span>
                  </AbsoluteFill>
                </div>
              </div>
            </AbsoluteFill>

            {/* A single blade of light travels across the glass as it turns. */}
            <LightSweep range={[264, 384]} intensity={0.14} widthPct={26} />

            <Depth z={210}>
              <Particles
                count={12}
                color={PALETTE.greenLift}
                opacity={0.4}
                speed={1.4}
                seed={3}
              />
            </Depth>
          </Camera>
        </Camera>
      </Sequence>

      {/* The thesis line. Held back until the product has been on screen for a
          full second — the image earns the words, not the other way round. */}
      <Sequence from={470} durationInFrames={166} layout="none">
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: u(portrait ? 260 : 108),
          }}
        >
          <BlurWords
            at={0}
            size={portrait ? 50 : 54}
            weight={300}
            color={PALETTE.ink}
            defocus={12}
            spread={0.1}
            stagger={5}
            out={140}
            style={{ opacity: 0.9 }}
          >
            Know exactly where you stand.
          </BlurWords>
        </AbsoluteFill>
      </Sequence>

      {/* The lane line returns as a floor beneath the product — object
          continuity across the act break. It never actually left. */}
      <Sequence from={430} durationInFrames={206} layout="none">
        <LaneHorizon
          reach={interpolate(frame - 430, [0, 70], [0, 1], {
            easing: EASE.glass,
            ...CLAMP,
          })}
          y={portrait ? 0.82 : 0.9}
          thickness={1.6}
          intensity={0.42}
          halo={0.7}
        />
      </Sequence>

      <Vignette strength={0.66} />
      <Grain opacity={0.05} />

      {/* Carry the silence in from the previous act. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 30], [1, 0], {
            easing: EASE.glass,
            ...CLAMP,
          }),
        }}
      />
    </AbsoluteFill>
  );
};
