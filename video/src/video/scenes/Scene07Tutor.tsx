import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { COPY } from "../config";
import { PALETTE } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { Camera, Depth } from "../camera/Camera";
import { Glow, Grain, Particles, Vignette, Void } from "../elements/Atmosphere";
import { LaneHorizon } from "../elements/LaneLine";
import { QuestionCard, TutorPanel } from "../ui/Product";
import { CornerMark } from "../ui/Logo";
import { FeatureCaption } from "./FeatureCaption";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACT IV·4 — AI TUTOR  ·  0:44–0:49  ·  342 frames
 * ═══════════════════════════════════════════════════════════════════════════
 * "And when you're stuck, it explains the why."
 *
 * The mini-story: a wrong answer, and then help arriving. The question card is
 * still on screen and still wrong — the tutor does not replace the moment of
 * failure, it sits underneath it. That staging is the argument for the feature.
 *
 * The focus pull is the shot. The camera racks from the question (sharp) to the
 * tutor panel (sharp) as the panel rises, and the question goes soft behind it.
 * Two planes, one rack — the most cinematic thing you can do with two divs, and
 * almost nobody does it.
 *
 * Beat sheet
 *   000–040  Arrive on the question. Option C is already marked wrong in red.
 *   060–110  The tutor panel rises from below on a heavy spring, blue-tinted so
 *            it reads as a different system speaking.
 *   080–110  RACK FOCUS. Question → 7px blur; panel → sharp.
 *   110–128  The learner's question lands as a bubble.
 *   130–290  The answer streams. Eased, not linear — a real stream accelerates.
 *   290–342  The caret stops. Hold.
 *
 * The answer text is the app's actual explanation string for this question
 * (`src/lib/content/signs-pack.ts`), not marketing copy written to sound smart.
 */

export const Scene07Tutor: React.FC = () => {
  const frame = useCurrentFrame();
  const { u, portrait, square } = useStage();

  // One value drives the whole rack: the question softens as the panel sharpens.
  const rack = interpolate(frame, [78, 116], [0, 1], {
    easing: EASE.glass,
    ...CLAMP,
  });

  return (
    <AbsoluteFill>
      <Void />

      <Camera range={[0, 342]} zoom={[1.05, 1.12]} tilt={[-16, 12]} handheld={0.5} seed={63}>
        <Depth z={-880}>
          <Particles count={24} color={PALETTE.blue} opacity={0.3} speed={0.5} />
        </Depth>
        <Depth z={-420}>
          <Glow
            y={portrait ? 0.6 : 0.62}
            size={1500}
            color={PALETTE.blue}
            intensity={interpolate(frame, [60, 140], [0.06, 0.19], {
              easing: EASE.glass,
              ...CLAMP,
            })}
            stretch={1.4}
          />
        </Depth>

        {/* Plane A — the question. Sharp, then racked out. */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: u(portrait ? 300 : 128),
          }}
        >
          <div
            style={{
              opacity: interpolate(frame, [8, 34], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }) * (1 - rack * 0.45),
              filter: `blur(${rack * u(7)}px)`,
              scale: 1 - rack * 0.03,
              translate: `0px ${-rack * u(26)}px`,
            }}
          >
            <QuestionCard
              index={7}
              total={15}
              question="A circular sign with a red ring around a symbol means:"
              options={[
                "A warning of the hazard shown",
                "The action or vehicle shown is prohibited",
                "The action shown is compulsory",
                "Information only",
              ]}
              at={8}
              selected={2}
              selectAt={40}
              correct={false}
              width={portrait ? 760 : square ? 700 : 720}
            />
          </div>
        </AbsoluteFill>

        {/* Plane B — the tutor. Rises into focus. */}
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: u(portrait ? 520 : square ? 330 : 236),
          }}
        >
          <div style={{ filter: `blur(${(1 - rack) * u(10)}px)` }}>
            <TutorPanel
              at={60}
              typeAt={132}
              typeDuration={158}
              question="Why is B correct?"
              answer="Red-ringed circle = prohibition. Plain blue circle = command. Red-bordered triangle = warning. Read the shape and colour before you read the symbol — the grammar tells you what the sign is doing."
              width={portrait ? 760 : square ? 740 : 760}
            />
          </div>
        </AbsoluteFill>

        <LaneHorizon reach={1} y={portrait ? 0.93 : 0.96} thickness={1.4} intensity={0.24} halo={0.4} />
      </Camera>

      <Sequence  layout="none">
        <CornerMark at={0} />
      </Sequence>

      <FeatureCaption
        kicker={COPY.features.tutor.kicker}
        line={COPY.features.tutor.line}
        at={16}
        out={310}
      />

      <Vignette strength={0.62} />
      <Grain />
    </AbsoluteFill>
  );
};
