import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Depth, Pop, Scene, useIsPortrait } from "../components/Motion";
import { B, Dim, Words } from "../components/Words";
import { Sfx } from "../components/Sfx";
import { LEVEL, SFX } from "../audio";
import { C } from "../theme";
import { body, display, mono } from "../fonts";

/** Beat 15 — the end card. Mark, name, promise, one thing to do. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene>
      <AbsoluteFill>
        <Sfx src={SFX.chime} at={34} volume={LEVEL.chime} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            translate: "-50% -50%",
            width: isPortrait ? 940 : 1200,
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Depth delay={0} fromY={60} fromScale={0.8} duration={30}>
              <div
                style={{
                  width: isPortrait ? 126 : 104,
                  height: isPortrait ? 126 : 104,
                  marginBottom: 30,
                  borderRadius: 26,
                  display: "grid",
                  placeItems: "center",
                  backgroundImage:
                    "linear-gradient(160deg, " +
                    C.routeLite +
                    ", " +
                    C.route +
                    ")",
                  boxShadow:
                    "0 20px 50px -18px rgba(26,102,66,0.7), inset 0 2px 0 rgba(255,255,255,0.3)",
                  fontFamily: display,
                  fontWeight: 800,
                  fontSize: isPortrait ? 46 : 38,
                  letterSpacing: "-0.03em",
                  color: C.bg,
                }}
              >
                K53
              </div>
            </Depth>
          </div>

          <div
            style={{
              fontFamily: display,
              fontWeight: 300,
              fontSize: isPortrait ? 74 : 96,
              lineHeight: 1.07,
              letterSpacing: "-0.024em",
              color: C.ink,
            }}
          >
            <Words>
              <B>K53 Mentor AI</B>
            </Words>
          </div>

          {/* Needs an explicit `from`: at width 0 a glow would still paint. */}
          <div
            style={{
              height: 2,
              margin: "32px auto 0",
              backgroundColor: C.route,
              width: interpolate(frame, [16, 49], [0, 420], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }),
              opacity: interpolate(frame, [16, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />

          <div
            style={{
              marginTop: 24,
              fontFamily: display,
              fontWeight: 300,
              fontSize: isPortrait ? 36 : 44,
              color: C.ink,
            }}
          >
            <Words>
              <Dim>Pass first time.</Dim>
            </Words>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Pop delay={34} duration={21} style={{ marginTop: 38 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  padding: isPortrait ? "26px 54px" : "22px 46px",
                  borderRadius: 16,
                  backgroundColor: C.route,
                  color: C.bg,
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: isPortrait ? 42 : 34,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 18px 40px -16px rgba(26,102,66,0.85)",
                }}
              >
                Start free &rarr;
              </span>
            </Pop>
          </div>

          <Pop delay={43} duration={18} style={{ marginTop: 20 }}>
            <p
              style={{
                fontFamily: body,
                fontSize: isPortrait ? 29 : 24,
                fontWeight: 500,
                color: C.inkDim,
              }}
            >
              Free &middot; no credit card &middot; 5 minutes
            </p>
          </Pop>

          <Pop delay={51} duration={18} style={{ marginTop: 34 }}>
            <p
              style={{
                fontFamily: mono,
                fontWeight: 500,
                fontSize: isPortrait ? 27 : 22,
                letterSpacing: "0.06em",
                color: C.route,
              }}
            >
              k53mentorai.co.za
            </p>
          </Pop>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
