import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Copy, Depth, Scene, useIsPortrait } from "../components/Motion";
import { B, Words } from "../components/Words";
import { C } from "../theme";
import { mono } from "../fonts";

/**
 * Beat 12 — the payoff metric.
 *
 * The counter in the CSS original needed `@property --n` plus a
 * `counter-reset` / `content: counter(n)` trick, because CSS cannot animate a
 * number into text. In React the number is just a number.
 */
export const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="through">
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "42%" : "47%",
            translate: "-50% -50%",
          }}
        >
          <Depth delay={0} fromY={40} fromScale={0.86} duration={30}>
            <div
              style={{
                position: "relative",
                width: isPortrait ? 420 : 340,
                height: isPortrait ? 420 : 340,
              }}
            >
              <svg
                viewBox="0 0 340 340"
                style={{ width: "100%", height: "100%", rotate: "-90deg" }}
              >
                <circle
                  cx="170"
                  cy="170"
                  r="150"
                  fill="none"
                  stroke={C.line}
                  strokeWidth="14"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="150"
                  fill="none"
                  stroke={C.route}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="942"
                  strokeDashoffset={interpolate(frame, [10, 67], [942, 151], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  })}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: isPortrait ? 108 : 88,
                  letterSpacing: "-0.05em",
                  color: C.ink,
                }}
              >
                {Math.round(
                  interpolate(frame, [10, 67], [0, 84], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  }),
                )}
                %
              </div>
            </div>
          </Depth>
        </div>

        <Copy
          y={isPortrait ? "70%" : "80%"}
          width={isPortrait ? 900 : 1100}
          fontSize={56}
        >
          <Words>
            &ldquo;You&rsquo;d <B>pass</B> if the test were tomorrow.&rdquo;
          </Words>
        </Copy>
      </AbsoluteFill>
    </Scene>
  );
};
