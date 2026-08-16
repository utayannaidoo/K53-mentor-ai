import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PALETTE } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon } from "../elements/LaneLine";
import { BlurWords } from "../type/Kinetic";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT I — MYSTERY  ·  0:00–0:06  ·  372 frames
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Beat sheet
 *   000–060  Black. Grain only. The audience is allowed to wonder if the video
 *            has started. This is the most valuable second in the film.
 *   060–150  A point of light at the horizon opens into a line. No cut, no
 *            music yet — the ambient bed is the only sound.
 *   150–250  "It's not a hard test." resolves out of defocus.
 *   250–330  Camera drifts imperceptibly. Nothing else happens. Hold the nerve.
 *   330–372  The line brightens a half-stop — an inhale before the cut.
 *
 * The discipline here is subtraction. There is exactly one line of type, one
 * graphic element, and one camera move in six seconds. Every instinct will be
 * to add something. Don't.
 */

export const Scene01Mystery: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useStage();

  return (
    <AbsoluteFill>
      <Void />

      {/* A 20-second push masquerading as a still frame. At 1.0 → 1.06 across
          the whole scene it is roughly a pixel every four frames — invisible
          as motion, but the frame is unmistakably alive. */}
      <Camera
        range={[0, 372]}
        zoom={[1, 1.06]}
        tilt={[10, -6]}
        handheld={0.34}
        seed={2}
      >
        <Depth z={-900}>
          <Particles
            count={34}
            color={PALETTE.green}
            opacity={interpolate(frame, [30, 140], [0, 0.5], {
              easing: EASE.soft,
              ...CLAMP,
            })}
            speed={0.5}
          />
        </Depth>

        <Depth z={-420}>
          <Glow
            y={0.5}
            size={portrait ? 900 : 1500}
            color={PALETTE.green}
            intensity={interpolate(frame, [46, 170], [0, 0.16], {
              easing: EASE.glass,
              ...CLAMP,
            })}
            stretch={1.5}
          />
        </Depth>

        {/* THE LINE. Born as a point of light and opened outward — the reach
            is animated, not the opacity, so it has to grow rather than appear. */}
        <Depth z={-120}>
          <LaneHorizon
            reach={interpolate(frame, [46, 186], [0, 1], {
              easing: EASE.glass,
              ...CLAMP,
            })}
            y={0.5}
            thickness={2}
            intensity={interpolate(frame, [46, 120, 320, 372], [0, 0.7, 0.7, 1.15], {
              easing: EASE.soft,
              ...CLAMP,
            })}
            halo={0.9}
          />
        </Depth>

        {/* Type sits below the line, at the classical lower-third mark. Putting
            it *on* the line would fight the one graphic element in the scene. */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: u(portrait ? 320 : 210),
          }}
        >
          <BlurWords
            at={152}
            size={portrait ? 66 : 78}
            weight={300}
            color={PALETTE.ink}
            defocus={17}
            spread={0.13}
            stagger={7}
            style={{ opacity: 0.94 }}
          >
            It&apos;s not a hard test.
          </BlurWords>
        </AbsoluteFill>
      </Camera>

      <Vignette strength={0.78} />
      <Grain opacity={0.07} />

      {/* First-frame fade from absolute black. Two seconds of nothing. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [0, 54], [1, 0], {
            easing: EASE.glass,
            ...CLAMP,
          }),
        }}
      />
    </AbsoluteFill>
  );
};
