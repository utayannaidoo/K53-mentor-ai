import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { I, Words } from "../components/Words";

/** Beat 2 — reframe the problem away from driving and onto the theory test. */
export const Reframe: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="through">
      <AbsoluteFill>
        <Copy
          x={isPortrait ? "50%" : "38%"}
          y={isPortrait ? "43%" : "44%"}
          width={900}
          fontSize={74}
          align={isPortrait ? "center" : "left"}
        >
          <Words variant="slide">It&rsquo;s not the driving.</Words>
        </Copy>
        <Copy
          x={isPortrait ? "50%" : "60%"}
          y={isPortrait ? "55%" : "57%"}
          width={900}
          fontSize={92}
          align={isPortrait ? "center" : "left"}
        >
          <Words variant="slide">
            It&rsquo;s the <I>questions</I>.
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
