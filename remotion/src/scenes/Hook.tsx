import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { Num, Words } from "../components/Words";

/** Beat 1 — the statistic that makes it your problem. */
export const Hook: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="up">
      <AbsoluteFill>
        <Copy
          x={isPortrait ? "50%" : "47%"}
          width={isPortrait ? 900 : 1120}
          fontSize={isPortrait ? 78 : 82}
        >
          <Words>
            Only <Num>4 in 10</Num> pass the learner&rsquo;s first time.
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
