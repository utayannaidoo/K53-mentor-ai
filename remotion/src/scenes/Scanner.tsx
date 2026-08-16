import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Copy, Depth, Pop, Scene, useIsPortrait } from "../components/Motion";
import { B, Words } from "../components/Words";
import { Sfx } from "../components/Sfx";
import { LEVEL, SFX } from "../audio";
import { A, C } from "../theme";
import { body, display } from "../fonts";

/**
 * One corner of the viewfinder reticle. Position goes on the animated wrapper,
 * the L-shaped border goes on the span inside it — putting both on one element
 * draws a closed box instead of a corner.
 */
const Bracket: React.FC<{
  position: React.CSSProperties;
  border: React.CSSProperties;
}> = ({ position, border }) => (
  <Pop delay={16} duration={15} style={{ position: "absolute", ...position }}>
    <span
      style={{
        display: "block",
        width: 56,
        height: 56,
        borderColor: C.route,
        borderStyle: "solid",
        borderWidth: 0,
        ...border,
      }}
    />
  </Pop>
);

/** Beat 10 — the camera shortcut: point the phone, get the answer. */
export const Scanner: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="slide">
      <AbsoluteFill>
        <Sfx src={SFX.tick} at={21} volume={0.06} />
        <Sfx src={SFX.tap} at={60} volume={LEVEL.tap} />
        <Copy
          x={isPortrait ? "50%" : "68%"}
          y={isPortrait ? "82%" : "38%"}
          width={isPortrait ? 900 : 760}
          fontSize={66}
          align={isPortrait ? "center" : "left"}
        >
          <Words>
            Or just <B>point your phone</B> at it.
          </Words>
        </Copy>

        <div
          style={{
            position: "absolute",
            left: isPortrait ? "50%" : "34%",
            top: isPortrait ? "42%" : "52%",
            translate: "-50% -50%",
          }}
        >
          <Depth delay={4.5} fromY={60} fromScale={0.9} floaty>
            <div
              style={{
                width: isPortrait ? 440 : 400,
                height: isPortrait ? 860 : 780,
                borderRadius: 46,
                padding: 13,
                backgroundImage:
                  "linear-gradient(160deg, rgba(24,37,31,0.92), " + C.ink + ")",
                boxShadow: "0 40px 90px -34px rgba(36,66,51,0.8)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: 34,
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  backgroundImage:
                    "radial-gradient(70% 50% at 50% 30%, hsl(45 30% 90%), transparent 70%), linear-gradient(180deg, hsl(200 18% 72%), hsl(150 12% 56%))",
                }}
              >
                <Img
                  src={staticFile("signs/warning/warning-027-01.png")}
                  style={{
                    width: 210,
                    height: 210,
                    objectFit: "contain",
                    filter: "drop-shadow(0 12px 26px rgba(36,66,51,0.45))",
                  }}
                />

                <Bracket
                  position={{ top: 120, left: 60 }}
                  border={{
                    borderWidth: "5px 0 0 5px",
                    borderRadius: "10px 0 0 0",
                  }}
                />
                <Bracket
                  position={{ top: 120, right: 60 }}
                  border={{
                    borderWidth: "5px 5px 0 0",
                    borderRadius: "0 10px 0 0",
                  }}
                />
                <Bracket
                  position={{ bottom: 250, left: 60 }}
                  border={{
                    borderWidth: "0 0 5px 5px",
                    borderRadius: "0 0 0 10px",
                  }}
                />
                <Bracket
                  position={{ bottom: 250, right: 60 }}
                  border={{
                    borderWidth: "0 5px 5px 0",
                    borderRadius: "0 0 10px 0",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: C.route,
                    boxShadow: "0 0 26px 6px rgba(26,102,66,0.75)",
                    top:
                      interpolate(frame, [21, 66], [110, 560], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(0.4, 0, 0.2, 1),
                      }) + "px",
                    opacity: interpolate(
                      frame,
                      [21, 25.5, 61.5, 66],
                      [0, 1, 1, 0],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                  }}
                />

                <Pop
                  delay={60}
                  duration={18}
                  from={24}
                  style={{
                    position: "absolute",
                    left: 16,
                    right: 16,
                    bottom: 16,
                  }}
                >
                  <div
                    style={{
                      padding: "22px 24px",
                      borderRadius: 24,
                      backgroundColor: A.surface96,
                      border: "1px solid " + C.line,
                      boxShadow: "0 -10px 40px -18px rgba(36,66,51,0.7)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: display,
                        fontWeight: 800,
                        fontSize: isPortrait ? 33 : 27,
                        marginBottom: 6,
                        color: C.ink,
                      }}
                    >
                      Warning &middot; Crossroads ahead
                    </div>
                    <div
                      style={{
                        fontFamily: body,
                        fontSize: isPortrait ? 25 : 20,
                        lineHeight: 1.4,
                        color: C.inkDim,
                      }}
                    >
                      Slow down and be ready to yield &mdash; traffic may cross
                      from either side.
                    </div>
                  </div>
                </Pop>
              </div>
            </div>
          </Depth>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
