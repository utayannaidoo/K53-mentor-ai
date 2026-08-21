import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Copy, Depth, Pop, Scene, useIsPortrait } from "../components/Motion";
import { B, Dim, Words } from "../components/Words";
import { Sfx } from "../components/Sfx";
import { LEVEL, SFX } from "../audio";
import { A, C } from "../theme";
import { body } from "../fonts";

const CHECKS = [
  { label: "Set up", at: 18 },
  { label: "360° observation", at: 37 },
  { label: "Swing in", at: 57 },
  { label: "Secure the vehicle", at: 76 },
];

/** Beat 11 — the practical: a parallel park, executed step by step. */
export const YardTest: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="up">
      <AbsoluteFill>
        <Copy
          y={isPortrait ? "12%" : "16%"}
          width={isPortrait ? 900 : 1300}
          fontSize={66}
        >
          <Words variant="slide">
            Then the <B>yard test</B>.
          </Words>
        </Copy>

        <div
          style={{
            position: "absolute",
            left: isPortrait ? "50%" : "32%",
            top: isPortrait ? "44%" : "56%",
            translate: "-50% -50%",
          }}
        >
          <Depth delay={3} fromY={40} fromScale={0.93}>
            <div
              style={{
                position: "relative",
                width: isPortrait ? 900 : 760,
                height: isPortrait ? 390 : 330,
                borderRadius: 26,
                overflow: "hidden",
                backgroundColor: "hsl(150 6% 52%)",
                boxShadow: "0 30px 70px -34px rgba(36,66,51,0.7)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 34,
                  backgroundColor: "hsl(45 18% 82%)",
                  borderTop: "5px solid hsl(45 14% 68%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 48,
                  left: isPortrait ? 90 : 40,
                  width: 180,
                  height: 86,
                  borderRadius: 14,
                  backgroundColor: "hsl(150 8% 38%)",
                  boxShadow: "inset 0 3px 0 rgba(255,255,255,0.12)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 48,
                  right: isPortrait ? 90 : 40,
                  width: 180,
                  height: 86,
                  borderRadius: 14,
                  backgroundColor: "hsl(150 8% 38%)",
                  boxShadow: "inset 0 3px 0 rgba(255,255,255,0.12)",
                }}
              />
              {/*
                The subject car reverses in: hold alongside, straight back,
                swing, settle. It stays fully ABOVE the parked row until it is
                horizontally clear of the front bumper — otherwise the rotated
                box clips the car it is parking behind.
              */}
              <div
                style={{
                  position: "absolute",
                  bottom: 48,
                  left: "50%",
                  width: 180,
                  height: 86,
                  borderRadius: 14,
                  backgroundImage:
                    "linear-gradient(180deg, " +
                    C.routeLite +
                    ", " +
                    C.route +
                    ")",
                  boxShadow:
                    "0 8px 20px -6px rgba(36,66,51,0.6), inset 0 3px 0 rgba(255,255,255,0.25)",
                  transformOrigin: "50% 50%",
                  translate:
                    interpolate(
                      frame,
                      [15, 31, 56, 78, 94, 105],
                      [180, 180, -25, -55, -80, -90],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                      },
                    ) +
                    "px " +
                    interpolate(
                      frame,
                      [15, 31, 56, 78, 94, 105],
                      [-120, -120, -116, -72, -24, 0],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                      },
                    ) +
                    "px",
                  rotate:
                    interpolate(
                      frame,
                      [15, 31, 56, 78, 94, 105],
                      [0, 0, 0, -11, -5, 0],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                      },
                    ) + "deg",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 22,
                    right: 56,
                    bottom: 14,
                    borderRadius: 7,
                    backgroundColor: "rgba(255,255,255,0.28)",
                  }}
                />
              </div>
            </div>
          </Depth>
        </div>

        <div
          style={{
            position: "absolute",
            left: isPortrait ? "50%" : "70%",
            top: isPortrait ? "72%" : "56%",
            translate: "-50% -50%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: isPortrait ? 760 : 520,
          }}
        >
          {CHECKS.map((check) => (
            <div
              key={check.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: isPortrait ? "18px 26px" : "15px 22px",
                borderRadius: 14,
                fontFamily: body,
                fontSize: isPortrait ? 31 : 25,
                fontWeight: 500,
                color: C.ink,
                backgroundColor: A.surface80,
                border: "1px solid " + A.line60,
                opacity: interpolate(frame, [check.at, check.at + 17], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                }),
                translate:
                  interpolate(frame, [check.at, check.at + 17], [-20, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  }) + "px 0px",
              }}
            >
              <Sfx src={SFX.tick} at={check.at + 11} volume={LEVEL.tick} />
              <Pop delay={check.at + 11} duration={12} from={10}>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: isPortrait ? 40 : 34,
                    height: isPortrait ? 40 : 34,
                    borderRadius: "50%",
                    fontSize: isPortrait ? 21 : 18,
                    fontWeight: 700,
                    color: C.bg,
                    backgroundColor: C.route,
                  }}
                >
                  ✓
                </span>
              </Pop>
              {check.label}
            </div>
          ))}
        </div>

        <Copy
          y={isPortrait ? "93%" : "88%"}
          width={1300}
          fontSize={isPortrait ? 24 : 30}
        >
          <Words>
            <Dim>
              Parallel parking &middot; Alley docking &middot; Three-point turn
              &middot; Incline start
            </Dim>
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
