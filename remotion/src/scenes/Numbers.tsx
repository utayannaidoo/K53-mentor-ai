import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { Num, NumBlue, Words } from "../components/Words";

/** Beat 4 — the shape of the actual paper. */
export const Numbers: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene>
      <AbsoluteFill>
        <Copy width={isPortrait ? 920 : 1300} fontSize={isPortrait ? 78 : 112}>
          <Words variant="scale">
            <Num>64</Num> questions. <NumBlue>51</NumBlue> to pass.
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
