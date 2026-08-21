import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Depth, Glass, Scene, useIsPortrait } from "../components/Motion";
import { Dim, I, Words } from "../components/Words";
import { C } from "../theme";
import { body, display } from "../fonts";

const CODES = [
  { code: "Code 08", sub: "Car · B", float: false },
  { code: "Code A", sub: "Motorcycle", float: true },
  { code: "Code 10 / 14", sub: "Heavy", float: false },
];

/**
 * Beat 13 — one plan covers every licence code. The vehicle is a study
 * preference, never a purchase, so this beat must never imply three tiers.
 */
export const Codes: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="slide">
      <AbsoluteFill>
        <Copy
          y={isPortrait ? "18%" : "24%"}
          width={isPortrait ? 900 : 1100}
          fontSize={74}
        >
          <Words>
            One plan. <I>Every</I> licence code.
          </Words>
        </Copy>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            alignItems: "stretch",
            gap: isPortrait ? 22 : 44,
          }}
        >
          {CODES.map((entry, i) => (
            <Depth
              key={entry.code}
              delay={2 + i * 2.4}
              fromY={entry.float ? 60 : 50}
              duration={30}
            >
              <Glass
                float={entry.float}
                sweepFrom={12 + i * 2.4}
                radius={22}
                style={{
                  padding: isPortrait ? "30px 46px" : "26px 40px",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  <span
                    style={{
                      fontFamily: display,
                      fontWeight: 800,
                      fontSize: isPortrait ? 46 : 38,
                      letterSpacing: "-0.02em",
                      color: C.ink,
                    }}
                  >
                    {entry.code}
                  </span>
                  <small
                    style={{
                      display: "block",
                      marginTop: 8,
                      fontFamily: body,
                      fontWeight: 500,
                      fontSize: isPortrait ? 20 : 16,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: C.inkDim,
                    }}
                  >
                    {entry.sub}
                  </small>
                </span>
              </Glass>
            </Depth>
          ))}
        </div>

        <Copy y={isPortrait ? "82%" : "78%"} width={900} fontSize={34}>
          <Words>
            <Dim>Switch vehicle any time &mdash; you never pay twice.</Dim>
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
