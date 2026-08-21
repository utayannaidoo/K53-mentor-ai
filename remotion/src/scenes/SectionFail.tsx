import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Copy, Scene, useIsPortrait } from "../components/Motion";
import { B, Words } from "../components/Words";
import { A, C } from "../theme";
import { display, mono } from "../fonts";

const ROWS: ({ label: string; value: string } | null)[] = [
  null,
  null,
  { label: "SIGNS", value: "23 / 28" },
  { label: "RULES", value: "22 / 28" },
  { label: "CONTROLS", value: "6 / 8" },
  null,
  null,
];

/** Beat 3 — the pass rule nobody reads: every section must clear on its own. */
export const SectionFail: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="slide">
      <AbsoluteFill>
        <Copy
          x={isPortrait ? "50%" : "66%"}
          y={isPortrait ? "20%" : "26%"}
          width={isPortrait ? 900 : 820}
          fontSize={62}
          align={isPortrait ? "center" : "left"}
        >
          <Words>
            Miss <B>one</B> section &mdash; fail the <B>whole</B> test.
          </Words>
        </Copy>

        <div
          style={{
            position: "absolute",
            left: isPortrait ? "50%" : "30%",
            top: isPortrait ? "58%" : "50%",
            translate: "-50% -50%",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            width: 420,
          }}
        >
          {ROWS.map((row, i) => (
            <div
              key={i}
              style={{
                height: row ? 64 : 56,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: row ? "0 22px" : 0,
                backgroundColor: row ? A.surface80 : A.ink05,
                border: "1px solid " + (row ? A.route50 : A.line50),
                boxShadow: row
                  ? "0 0 0 1px rgba(26,102,66,0.16), 0 14px 34px -20px rgba(36,66,51,0.6)"
                  : "none",
                opacity: interpolate(frame, [i * 2.1, i * 2.1 + 21], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                }),
                translate:
                  interpolate(frame, [i * 2.1, i * 2.1 + 21], [-26, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  }) + "px 0px",
                filter:
                  "blur(" +
                  interpolate(frame, [i * 2.1, i * 2.1 + 21], [8, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  }) +
                  "px)",
              }}
            >
              {row ? (
                <>
                  <span
                    style={{
                      fontFamily: display,
                      fontWeight: 800,
                      fontSize: isPortrait ? 26 : 22,
                      letterSpacing: "0.08em",
                      color: C.ink,
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontWeight: 700,
                      fontSize: isPortrait ? 26 : 22,
                      color: C.route,
                    }}
                  >
                    {row.value}
                  </span>
                </>
              ) : null}
            </div>
          ))}
        </div>

        {/*
          The pointer walks the three failing sections in turn. In CSS this was a
          6-keyframe `pointerMove` whose offsets were hand-tuned to land on each
          live row; here the same offsets are one `interpolate()` with an
          explicit frame ramp, so retiming it is editing two arrays.
        */}
        <div
          style={{
            position: "absolute",
            left: "calc(" + (isPortrait ? "50%" : "30%") + " - 250px)",
            top: isPortrait ? "58%" : "50%",
            width: 0,
            height: 0,
            borderLeft: "26px solid " + C.route,
            borderTop: "15px solid transparent",
            borderBottom: "15px solid transparent",
            filter: "drop-shadow(0 2px 10px rgba(26,102,66,0.5))",
            opacity: interpolate(frame, [15, 27], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            }),
            translate:
              interpolate(frame, [15, 27], [-30, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }) +
              "px " +
              interpolate(
                frame,
                [15, 41, 49, 61, 71, 87],
                [-93, -93, -15, -15, 63, 63],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                },
              ) +
              "px",
          }}
        />
      </AbsoluteFill>
    </Scene>
  );
};
