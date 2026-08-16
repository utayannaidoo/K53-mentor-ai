import React from "react";
import { AbsoluteFill } from "remotion";
import { Copy, Depth, Glass, Scene, useIsPortrait } from "../components/Motion";
import { B, Words } from "../components/Words";
import { A, C } from "../theme";
import { body, mono } from "../fonts";

const STATS = [
  { value: "1 060", label: "Questions", float: false },
  { value: "798", label: "Flashcards", float: true },
  { value: "68", label: "Scenarios", float: false },
];

const CHIPS = [
  { label: "Road signs", on: true },
  { label: "Rules of the road", on: false },
  { label: "Vehicle controls", on: false },
  { label: "Intersections", on: false },
  { label: "Road markings", on: true },
  { label: "Hazard awareness", on: false },
  { label: "Parking", on: false },
  { label: "Following distance", on: false },
];

/** Beat 6 — what is actually in the bank, by the numbers and by category. */
export const Bank: React.FC = () => {
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="slide">
      <AbsoluteFill>
        <Copy y="15%" width={1400} fontSize={66}>
          <Words>
            Questions, flashcards and scenarios &mdash; <B>every category</B>.
          </Words>
        </Copy>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "44%" : "46%",
            translate: "-50% -50%",
            display: "flex",
            flexDirection: isPortrait ? "column" : "row",
            gap: isPortrait ? 24 : 52,
          }}
        >
          {STATS.map((stat, i) => (
            <Depth
              key={stat.label}
              delay={3 + i * 3}
              fromY={stat.float ? 60 : 50}
              fromScale={0.8}
              duration={30}
            >
              <Glass
                float={stat.float}
                sweepFrom={13 + i * 3}
                radius={24}
                style={{
                  width: 420,
                  padding: isPortrait ? 24 : 34,
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "block",
                    fontFamily: mono,
                    fontWeight: 700,
                    fontSize: isPortrait ? 78 : 78,
                    letterSpacing: "-0.05em",
                    color: C.route,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "block",
                    marginTop: 8,
                    fontFamily: body,
                    fontSize: isPortrait ? 27 : 23,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.inkDim,
                  }}
                >
                  {stat.label}
                </span>
              </Glass>
            </Depth>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "80%" : "79%",
            translate: "-50% -50%",
            width: isPortrait ? 960 : 1560,
            display: "flex",
            flexWrap: "wrap",
            gap: 15,
            justifyContent: "center",
          }}
        >
          {CHIPS.map((chip, i) => (
            <Depth
              key={chip.label}
              delay={13.5 + i * 1.5}
              fromY={26}
              fromScale={0.8}
              duration={24}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: isPortrait ? "16px 30px" : "14px 28px",
                  borderRadius: 999,
                  fontFamily: body,
                  fontSize: isPortrait ? 28 : 24,
                  fontWeight: 500,
                  color: chip.on ? C.bg : C.ink,
                  backgroundColor: chip.on ? C.route : A.surface80,
                  border: "1px solid " + (chip.on ? "transparent" : A.line70),
                  boxShadow: chip.on
                    ? "0 8px 22px -10px rgba(26,102,66,0.8)"
                    : "none",
                }}
              >
                {chip.label}
              </span>
            </Depth>
          ))}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
