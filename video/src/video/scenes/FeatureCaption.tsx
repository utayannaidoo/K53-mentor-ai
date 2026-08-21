import React from "react";
import { AbsoluteFill } from "remotion";
import { useStage } from "../lib/stage";
import { BlurWords, Kicker } from "../type/Kinetic";
import { PALETTE } from "../theme";

/**
 * The caption block shared by the four feature beats: a lit kicker and one
 * sentence, bottom-left on landscape, bottom-centre on vertical.
 *
 * This is the *only* thing shared across the feature act. Everything else —
 * camera, staging, interaction, timing — is written per scene, because four
 * beats that reuse one template are four beats the viewer stops watching. The
 * caption is common on purpose: it's the one fixed point that lets the rest
 * change freely without the act feeling like four different films.
 */
export const FeatureCaption: React.FC<{
  readonly kicker: string;
  readonly line: string;
  readonly at: number;
  readonly out?: number;
}> = ({ kicker, line, at, out }) => {
  const { u, portrait, square, padX, padY } = useStage();

  return (
    <AbsoluteFill
      style={{
        alignItems: portrait ? "center" : "flex-start",
        justifyContent: "flex-end",
        paddingLeft: padX,
        paddingRight: padX,
        paddingBottom: padY * (portrait ? 1.1 : 0.92),
      }}
    >
      <Kicker at={at} align={portrait ? "center" : "left"} size={portrait ? 20 : 19}>
        {kicker}
      </Kicker>
      <div style={{ height: u(18) }} />
      {/* `maxWidth` is set so each of the four captions sets on ONE line at
          this size. A one-line caption that wraps to two leaves an orphaned
          word under it, and an orphan is the single most visible sign that
          nobody laid the type out on purpose. */}
      <BlurWords
        at={at + 8}
        size={portrait ? 44 : square ? 38 : 46}
        weight={300}
        color={PALETTE.ink}
        align={portrait ? "center" : "left"}
        defocus={11}
        spread={0.08}
        stagger={4}
        out={out}
        style={{ maxWidth: u(portrait ? 780 : square ? 840 : 1180), opacity: 0.94 }}
      >
        {line}
      </BlurWords>
    </AbsoluteFill>
  );
};
