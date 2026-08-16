import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { B, Dim, Words } from "../components/Words";

/**
 * Beat 8 — the breath that hands the film over to the product demo.
 *
 * The three verbs are the three cards of beat 9, in order: answer a practice
 * question, review a flashcard, ask the tutor why. Naming them here is what
 * makes the tab rail in the next beat legible — otherwise the viewer spends
 * the first seconds of the demo working out what they are looking at.
 *
 * Named for its structural job rather than its copy, so rewriting the line
 * does not orphan the filename.
 */
export const DemoIntro: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="through">
      <AbsoluteFill>
        <Copy y="44%" width={1200} fontSize={34}>
          <Words>
            <Dim>INSIDE THE APP</Dim>
          </Words>
        </Copy>
        <Copy y="55%" width={isPortrait ? 900 : 1400} fontSize={82}>
          <Words>
            Answer. Review. <B>Ask why.</B>
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
