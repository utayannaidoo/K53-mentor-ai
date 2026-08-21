import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Copy, Depth, Glass, Scene, useIsPortrait } from "../components/Motion";
import { B, Words } from "../components/Words";
import { A, C } from "../theme";
import { body } from "../fonts";

/**
 * The catalogue mixes aspect ratios wildly (guidance-046-01 is 134×842), so
 * each sign sits in a fixed 150px cell and the image is padded inside it —
 * `object-fit: contain` then centres against a definite box with no spill.
 */
const SIGNS = [
  "signs/regulatory/regulatory-006-01.png",
  "signs/regulatory/regulatory-007-05.png",
  "signs/regulatory/regulatory-009-06.png",
  "signs/regulatory/regulatory-012-05.png",
  "signs/warning/warning-027-01.png",
  "signs/warning/warning-028-06.png",
  "signs/warning/warning-031-05.png",
  "signs/warning/warning-038-02.png",
  "signs/guidance/guidance-047-02.png",
  "signs/guidance/guidance-049-05.png",
  "signs/information/information-043-05.png",
  "signs/information/information-044-03.png",
  "signs/marking/marking-084-03.png",
  "signs/marking/marking-077-03.png",
  "signs/marking/marking-079-03.png",
  "signs/marking/marking-088-01.png",
];

/** Beat 5 — the breadth of the sign catalogue, all at once. */
export const SignBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Scene variant="up">
      <AbsoluteFill>
        <Copy
          y={isPortrait ? "16%" : "20%"}
          width={isPortrait ? 900 : 1300}
          fontSize={74}
        >
          <Words>
            Every <B>sign</B>. Every <B>road marking</B>.
          </Words>
        </Copy>

        {/*
          Centring lives on the wrapper, the animation lives on <Depth>. Both
          want the `translate` property, and an element only has one — so they
          get one box each. Doing it any other way means either hand-computed
          negative margins or an entrance that yanks the panel off-centre.
        */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "52%" : "57%",
            translate: "-50% -50%",
          }}
        >
          <Depth delay={1.5} fromY={50} fromScale={0.92} floaty>
            <Glass
              float
              sweepFrom={12}
              radius={30}
              style={{ padding: "32px 36px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(" + (isPortrait ? 4 : 8) + ", 150px)",
                  gap: 18,
                }}
              >
                {SIGNS.map((src, i) => (
                  <div
                    key={src}
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: A.surface70,
                      border: "1px solid " + A.line50,
                      opacity: interpolate(
                        frame,
                        [5 + i * 1.2, 5 + i * 1.2 + 27],
                        [0, 1],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                          easing: Easing.bezier(0.22, 1, 0.36, 1),
                        },
                      ),
                      scale: interpolate(
                        frame,
                        [5 + i * 1.2, 5 + i * 1.2 + 27],
                        [0.8, 1],
                        {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                          easing: Easing.bezier(0.22, 1, 0.36, 1),
                          output: "perceptual-scale",
                        },
                      ),
                    }}
                  >
                    <Img
                      src={staticFile(src)}
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: 15,
                        objectFit: "contain",
                        filter: "drop-shadow(0 6px 14px rgba(36,66,51,0.18))",
                      }}
                    />
                  </div>
                ))}
              </div>
            </Glass>
          </Depth>
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPortrait ? "80%" : "88%",
            translate: "-50% -50%",
            whiteSpace: "nowrap",
            fontFamily: body,
            fontSize: isPortrait ? 26 : 24,
            fontWeight: 500,
            letterSpacing: isPortrait ? "0.12em" : "0.16em",
            textTransform: "uppercase",
            color: C.inkDim,
            opacity: interpolate(frame, [28, 55], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            }),
            filter:
              "blur(" +
              interpolate(frame, [28, 55], [10, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }) +
              "px)",
          }}
        >
          Regulatory &middot; Warning &middot; Guidance &middot; Information
          &middot; Markings
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
