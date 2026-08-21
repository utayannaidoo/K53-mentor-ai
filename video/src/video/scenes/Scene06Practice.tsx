import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { COPY } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Shutter } from "../camera/Shutter";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon } from "../elements/LaneLine";
import { BODY, MONO } from "../type/fonts";
import { Flashcard, RatingRow } from "../ui/Product";
import { Cursor } from "../ui/Cursor";
import { Pill } from "../ui/Glass";
import { CornerMark } from "../ui/Logo";
import { FeatureCaption } from "./FeatureCaption";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT IV·3 — DAILY PLAN  ·  0:38–0:44  ·  360 frames
 * ═══════════════════════════════════════════════════════════════════════════
 * "Ten minutes. The right ten minutes."
 *
 * The mini-story: one complete SM-2 review, performed. A card, a flip, a
 * rating, and the mastery it moves. This is the only beat in the film where a
 * cursor appears, and that is deliberate — a cursor everywhere is a screencast,
 * a cursor once is a moment of contact.
 *
 * Beat sheet
 *   000–030  Arrive. The card is already mid-settle.
 *   060–100  The pointer enters frame and travels — arcing, because hands arc.
 *   104      Click. The card flips on the *release*, not the press.
 *   150–180  The four SM-2 ratings stagger up from below.
 *   186–222  Pointer travels to "Good". Press at 224.
 *   232–256  The card is thrown off to the upper left under motion blur; the
 *            next card is already rising behind it. No empty frame.
 *   250–320  Road signs mastery advances 64 → 71 and a +7 chip lands.
 *   320–360  Hold on "8 due · 10 min".
 */

export const Scene06Practice: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait, square } = useStage();

  return (
    <AbsoluteFill>
      <Void />

      <Camera range={[0, 360]} zoom={[1.04, 1.12]} pan={[10, -14]} pitch={[1.4, -0.8]} handheld={0.55} seed={52}>
        <Depth z={-880}>
          <Particles count={26} color={PALETTE.green} opacity={0.34} speed={0.55} />
        </Depth>
        <Depth z={-420}>
          <Glow
            y={portrait ? 0.4 : 0.42}
            size={1380}
            color={PALETTE.green}
            intensity={0.17}
            stretch={1.3}
          />
        </Depth>

        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            translate: `0px ${u(portrait ? -200 : -54)}px`,
          }}
        >
          {/* The card stage. Explicitly sized, because `<Shutter>` composites
              its motion-blur samples as absolute layers and anything inside it
              contributes no height to flow — leave this to auto and the rating
              row climbs up over the card. */}
          <div
            style={{
              position: "relative",
              width: u(portrait ? 740 : square ? 640 : 600),
              height: u(300),
            }}
          >
            {/* The next card, waiting behind. It is what makes the throw read as
                "one of eight" rather than as an ending — but it has to sit
                behind and below at low opacity, or it reads as a duplicate of
                the card in front rather than as the rest of the deck. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                translate: `0px ${u(
                  interpolate(frame, [232, 280], [52, 0], {
                    easing: EASE.glass,
                    ...CLAMP,
                  }),
                )}px`,
                scale: interpolate(frame, [232, 280], [0.93, 1], {
                  easing: EASE.glass,
                  output: "perceptual-scale",
                  ...CLAMP,
                }),
                // 0.07 at rest, not 0.14: the front card is real glass and the
                // card behind reads *through* it. Any brighter and the deck cue
                // becomes a ghosted double-exposure of the answer.
                opacity: interpolate(frame, [232, 268], [0.07, 1], {
                  easing: EASE.soft,
                  ...CLAMP,
                }),
              }}
            >
              <Flashcard
                at={232}
                flipAt={9999}
                front="Yellow line at the edge of the roadway"
                back=""
                width={portrait ? 740 : square ? 640 : 600}
                height={300}
              />
            </div>

            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
              {/* Armed across the throw only (232 plus settle), not the 360
                  frames the card happens to be mounted for. */}
              <Shutter range={[226, 262]}>
                <Flashcard
                  at={12}
                  flipAt={108}
                  throwAt={232}
                  front="A red ring around a symbol"
                  back="Prohibition — the action shown is not allowed"
                  width={portrait ? 740 : square ? 640 : 600}
                  height={300}
                />
              </Shutter>
            </div>
          </div>

          {/* SM-2 ratings — the app's real Again / Hard / Good / Easy. */}
          <div
            style={{
              marginTop: u(34),
              opacity: interpolate(frame, [150, 176, 236, 252], [0, 1, 1, 0], {
                easing: EASE.soft,
                ...CLAMP,
              }),
            }}
          >
            <RatingRow at={150} pressIndex={2} pressAt={224} />
          </div>

          {/* Mastery moves. The whole point of the interaction. */}
          <div
            style={{
              marginTop: u(30),
              display: "flex",
              alignItems: "center",
              gap: u(18),
              opacity: interpolate(frame, [252, 280], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              translate: `0px ${interpolate(frame, [252, 288], [u(18), 0], {
                easing: EASE.glass,
                ...CLAMP,
              })}px`,
            }}
          >
            <span
              style={{
                fontFamily: BODY,
                fontSize: u(portrait ? 21 : 18),
                color: PALETTE.mute,
              }}
            >
              Road signs mastery
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: u(portrait ? 28 : 24),
                fontWeight: 600,
                letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
                color: PALETTE.green,
              }}
            >
              {Math.round(
                interpolate(frame, [258, 312], [64, 71], {
                  easing: EASE.glass,
                  ...CLAMP,
                }),
              )}
              %
            </span>
            <div
              style={{
                scale: interpolate(frame, [290, 316], [0.6, 1], {
                  easing: EASE.spring,
                  output: "perceptual-scale",
                  ...CLAMP,
                }),
                opacity: interpolate(frame, [290, 308], [0, 1], CLAMP),
              }}
            >
              <Pill color={PALETTE.success} size={13} strong>
                +7
              </Pill>
            </div>
          </div>

          <div
            style={{
              marginTop: u(22),
              fontFamily: BODY,
              fontSize: u(portrait ? 19 : 16),
              letterSpacing: TRACKING.label,
              textTransform: "uppercase",
              color: PALETTE.mute,
              opacity: interpolate(frame, [304, 330], [0, 0.85], {
                easing: EASE.soft,
                ...CLAMP,
              }),
            }}
          >
            7 of 8 due · 6 min left today
          </div>
        </AbsoluteFill>

        <LaneHorizon reach={1} y={portrait ? 0.9 : 0.94} thickness={1.4} intensity={0.28} halo={0.45} />
      </Camera>

      {/* The pointer. Two moves: one to the card, one to "Good". It arrives
          before it clicks and lingers after — automation does neither. */}
      <Sequence  layout="none">
        <AbsoluteFill>
          {/* Two moves: onto the card, then onto "Good". Fractions of the
              frame, aimed at where those two things actually are. */}
          <Cursor
            from={[0.82, 0.8]}
            to={[0.545, 0.31]}
            range={[60, 100]}
            clickAt={104}
            // Hands off to the second move at 186. Without this the first
            // pointer never leaves and there are visibly two cursors on screen.
            out={172}
            arc={portrait ? 80 : 58}
            seed={4}
          />
          <Cursor
            from={[0.545, 0.31]}
            to={[0.535, 0.575]}
            range={[186, 222]}
            clickAt={224}
            out={244}
            arc={portrait ? -36 : -30}
            seed={9}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence  layout="none">
        <CornerMark at={0} />
      </Sequence>

      <FeatureCaption
        kicker={COPY.features.practice.kicker}
        line={COPY.features.practice.line}
        at={18}
        out={332}
      />

      <Vignette strength={0.6} />
      <Grain />
    </AbsoluteFill>
  );
};
