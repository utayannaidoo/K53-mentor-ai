import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { Dim, Num, Words } from "../components/Words";

/** Beat 14 — the price, on its own, with nothing to distract from it. */
export const Offer: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene>
      <AbsoluteFill>
        <Copy y="46%" width={1100} fontSize={isPortrait ? 82 : 104}>
          <Words variant="scale">
            <Num>R60</Num> a month.
          </Words>
        </Copy>
        <Copy y="60%" width={900} fontSize={38}>
          <Words>
            <Dim>Seven-day refund, no questions asked.</Dim>
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
