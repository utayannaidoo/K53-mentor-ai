import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE, drift, rand } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Shutter } from "../camera/Shutter";
import { Glow, Grain, Vignette, Void } from "../elements/Atmosphere";
import { LaneFracture, LaneHorizon } from "../elements/LaneLine";
import { MaskLine, Slam } from "../type/Kinetic";
import { BODY, MONO } from "../type/fonts";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT II — THE PROBLEM  ·  0:06–0:17  ·  690 frames
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Beat sheet — every hit lands on a beat (30f) or an off-beat (15f)
 *   000–120  The hook, in three mask-revealed lines: "So why do / 6 in 10 /
 *            fail it?" The number is mono and red. The line from Act I is still
 *            there, and it starts to break.
 *   120–150  THE TURN. The line shatters. Camera rolls 0.9°, which is the only
 *            roll in the film and is why this beat feels wrong on purpose.
 *   150–420  Four word slams, one per bar, each 26 frames long and each *cut*
 *            rather than faded. Between them: the noise wall — 68 question
 *            numbers scrolling past at a speed you cannot read.
 *   420–560  Everything accelerates and overlaps. Three slams stack.
 *   560–620  The failure stamp. One red frame of "NOT YET COMPETENT".
 *   620–690  Collapse. Everything contracts toward the centre and the act ends
 *            mid-breath. No resolution — the resolution is the next scene.
 *
 * The rhythm rule: chaos that is evenly spaced is not chaos, it is a metronome.
 * The slams are at 150 / 246 / 330 / 402 — tightening intervals (96, 84, 72),
 * so the act physically speeds up under the viewer.
 */

/** 68 question numbers, scrolling too fast to read. The noise the product replaces. */
const NoiseWall: React.FC<{ readonly intensity: number }> = ({ intensity }) => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();

  return (
    <AbsoluteFill style={{ opacity: intensity * 0.4, overflow: "hidden" }}>
      {new Array(11).fill(0).map((_, row) => (
        <div
          key={row}
          style={{
            position: "absolute",
            top: (row / 11) * height + u(10),
            left: 0,
            width: width * 3,
            display: "flex",
            gap: u(38),
            whiteSpace: "nowrap",
            fontFamily: MONO,
            fontSize: u(26),
            color: row % 3 === 0 ? PALETTE.red : PALETTE.mute,
            opacity: 0.34 + rand(row) * 0.4,
            // Alternating direction per row. Uniform scroll reads as a
            // background texture; opposing scroll reads as disorder.
            translate: `${
              (row % 2 === 0 ? -1 : 1) * (frame * (2.2 + rand(row + 5) * 3.4) * intensity) %
              (width * 1.5)
            }px 0px`,
          }}
        >
          {new Array(26).fill(0).map((__, i) => (
            <span key={i}>
              {String(((row * 26 + i) % 68) + 1).padStart(2, "0")}
            </span>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const Scene02Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait } = useStage();

  // One dial for the act's anxiety. Ramps in three uneven steps, never linearly.
  const chaos = interpolate(frame, [120, 190, 400, 560, 640], [0, 0.55, 0.9, 1, 0.2], {
    easing: EASE.soft,
    ...CLAMP,
  });

  return (
    <AbsoluteFill>
      <Void tint="#150f0f" />

      <Camera
        range={[120, 690]}
        zoom={[1, 1.13]}
        roll={[0, 0.9]}
        pan={[0, -22]}
        handheld={1.35}
        ease="soft"
        seed={9}
      >
        <Depth z={-700}>
          <Glow
            y={0.46}
            size={1700}
            color={PALETTE.red}
            intensity={chaos * 0.15}
            stretch={1.4}
          />
          <NoiseWall intensity={interpolate(frame, [150, 260, 600, 660], [0, 1, 1, 0], CLAMP)} />
        </Depth>

        {/* The Act I line, still present, coming apart. */}
        <Depth z={-200}>
          <LaneHorizon
            reach={interpolate(frame, [0, 118], [1, 0.2], { easing: EASE.brake, ...CLAMP })}
            intensity={interpolate(frame, [0, 118], [1, 0], { easing: EASE.brake, ...CLAMP })}
            color={PALETTE.green}
            halo={0.4}
          />
          <LaneFracture chaos={chaos} count={11} color={PALETTE.red} seed={3} />
          <LaneFracture chaos={chaos * 0.7} count={7} color={PALETTE.ochre} seed={17} />
        </Depth>

        {/* ── The hook ─────────────────────────────────────────────────── */}
        <Sequence  durationInFrames={140} layout="none">
          <AbsoluteFill
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: u(6),
              opacity: interpolate(frame, [116, 134], [1, 0], {
                easing: EASE.brake,
                ...CLAMP,
              }),
            }}
          >
            <MaskLine at={4} size={portrait ? 44 : 50} weight={300} color={PALETTE.mute}>
              So why do
            </MaskLine>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: u(20),
                fontFamily: MONO,
                // The contrast ratio between "So why do" and the number is the
                // design. 50 → 230 is 4.6×; anything under about 3× and the
                // stat stops being the subject and becomes part of a sentence.
                fontSize: u(portrait ? 168 : 230),
                fontWeight: 600,
                letterSpacing: TRACKING.hero,
                color: PALETTE.red,
                // The number does not fade in — it is *counted* in, and the
                // count is the reason the stat registers as a fact.
                opacity: interpolate(frame, [26, 40], [0, 1], {
                  easing: EASE.soft,
                  ...CLAMP,
                }),
                scale: interpolate(frame, [26, 46], [1.18, 1], {
                  easing: EASE.brake,
                  output: "perceptual-scale",
                  ...CLAMP,
                }),
                filter: `drop-shadow(0 0 ${u(40)}px ${PALETTE.red}44)`,
              }}
            >
              {Math.round(
                interpolate(frame, [26, 74], [0, 6], { easing: EASE.glass, ...CLAMP }),
              )}
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: u(portrait ? 46 : 62),
                  fontWeight: 400,
                  color: PALETTE.mute,
                  letterSpacing: TRACKING.body,
                }}
              >
                in 10
              </span>
            </div>
            <MaskLine at={58} size={portrait ? 56 : 72} weight={400} color={PALETTE.ink}>
              fail it.
            </MaskLine>
          </AbsoluteFill>
        </Sequence>

        {/* ── The slams ────────────────────────────────────────────────── */}
        {/* Four single words, because two-word slams do not hit — the eye has
            to travel and the impact is spent before it is read. Cram, forget,
            guess, fail is the actual failure loop, and each word is larger than
            the last while the intervals tighten (96 → 84 → 72 frames). The act
            physically closes in on the viewer. */}
        {/* The four slams. Each inner Sequence is 30–40 frames, so the armed
            window covers ~130 frames of actual fast movement. */}
        <Shutter range={[150, 445]}>
          <Sequence from={150} durationInFrames={30} layout="none">
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <Slam at={0} size={portrait ? 132 : 170} hold={26} color={PALETTE.ink}>
                Cram.
              </Slam>
            </AbsoluteFill>
          </Sequence>

          <Sequence from={246} durationInFrames={30} layout="none">
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <Slam at={0} size={portrait ? 140 : 185} hold={26} color={PALETTE.ink}>
                Forget.
              </Slam>
            </AbsoluteFill>
          </Sequence>

          <Sequence from={330} durationInFrames={30} layout="none">
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <Slam at={0} size={portrait ? 152 : 205} hold={26} color={PALETTE.ochre}>
                Guess.
              </Slam>
            </AbsoluteFill>
          </Sequence>

          <Sequence from={402} durationInFrames={40} layout="none">
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              <Slam at={0} size={portrait ? 176 : 240} hold={34} color={PALETTE.red}>
                Fail.
              </Slam>
            </AbsoluteFill>
          </Sequence>

          {/* The overlap. Three words stack inside one bar — the only moment in
              the film where more than one line is on screen at once. */}
          <Sequence from={452} durationInFrames={110} layout="none">
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
              {["Book again", "Pay again", "Wait again"].map((word, i) => (
                <div
                  key={word}
                  style={{
                    position: "absolute",
                    translate: `${u((i - 1) * (portrait ? 40 : 150))}px ${u(
                      (i - 1) * (portrait ? 130 : 96),
                    )}px`,
                    opacity: interpolate(
                      frame - 452,
                      [i * 22, i * 22 + 8, 78, 96],
                      [0, 1, 1, 0],
                      { easing: EASE.soft, ...CLAMP },
                    ),
                    scale: interpolate(frame - 452, [i * 22, i * 22 + 12], [1.22, 1], {
                      easing: EASE.brake,
                      output: "perceptual-scale",
                      ...CLAMP,
                    }),
                    filter: `blur(${interpolate(
                      frame - 452,
                      [i * 22, i * 22 + 10],
                      [20, 0],
                      { easing: EASE.brake, ...CLAMP },
                    )}px)`,
                    fontFamily: BODY,
                    fontSize: u(portrait ? 70 : 96),
                    fontWeight: 600,
                    letterSpacing: TRACKING.display,
                    color: i === 2 ? PALETTE.red : PALETTE.ink,
                    textTransform: "uppercase",
                  }}
                >
                  {word}
                </div>
              ))}
            </AbsoluteFill>
          </Sequence>
        </Shutter>

        {/* ── The stamp ────────────────────────────────────────────────── */}
        {/* The words on a real failed K53 result slip. Six frames of full red,
            then it sits there while everything else keeps moving. */}
        <Sequence from={560} durationInFrames={90} layout="none">
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                padding: `${u(20)}px ${u(46)}px`,
                border: `${u(3)}px solid ${PALETTE.red}`,
                borderRadius: u(10),
                fontFamily: BODY,
                fontSize: u(portrait ? 38 : 54),
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PALETTE.red,
                rotate: "-7deg",
                opacity: interpolate(frame - 560, [0, 4, 62, 78], [0, 1, 1, 0], {
                  easing: EASE.brake,
                  ...CLAMP,
                }),
                scale: interpolate(frame - 560, [0, 7], [1.5, 1], {
                  easing: EASE.brake,
                  output: "perceptual-scale",
                  ...CLAMP,
                }),
                boxShadow: `0 0 ${u(60)}px ${PALETTE.red}55`,
              }}
            >
              Not yet competent
            </div>
          </AbsoluteFill>
        </Sequence>
      </Camera>

      {/* One frame of pure red on the stamp hit. A single frame. Any longer and
          it stops being an impact and becomes a colour. */}
      <AbsoluteFill
        style={{
          backgroundColor: PALETTE.red,
          mixBlendMode: "screen",
          opacity: interpolate(frame, [560, 561, 566], [0, 0.36, 0], CLAMP),
        }}
      />

      <Vignette
        strength={interpolate(frame, [120, 400], [0.7, 0.92], {
          easing: EASE.soft,
          ...CLAMP,
        })}
      />
      {/* Grain climbs with the anxiety. It is doing as much work as the type. */}
      <Grain opacity={0.055 + chaos * 0.055} />

      {/* Horizontal tear — a 3-frame glitch on two of the slams only. Used any
          more than twice it becomes a style; used twice it reads as pressure. */}
      {[246, 402].map((hit) => (
        <AbsoluteFill
          key={hit}
          style={{
            opacity: interpolate(frame, [hit, hit + 1, hit + 3], [0, 1, 0], CLAMP),
            backgroundColor: PALETTE.ink,
            mixBlendMode: "overlay",
            clipPath: `inset(${38 + drift(frame, 3, hit) * 12}% 0 ${
              46 - drift(frame, 3, hit) * 12
            }% 0)`,
          }}
        />
      ))}

      {/* The collapse. The frame contracts and darkens into the silence. */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [628, 690], [0, 1], {
            easing: EASE.brake,
            ...CLAMP,
          }),
        }}
      />
    </AbsoluteFill>
  );
};
