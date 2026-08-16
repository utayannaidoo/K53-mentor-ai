import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { Scene, useIsPortrait } from "../components/Motion";
import { C } from "../theme";
import { body, display } from "../fonts";

/**
 * Beat 7 — a rhythm break. Five hard cuts, no easing, nothing eased in or out.
 *
 * The CSS version faked this with `animation: cutIn .26s ... steps(1) forwards`
 * and had to use `forwards` rather than `both`, because `both` would apply the
 * 0% keyframe before the delay and stack all five frames on top of each other
 * at t=0. `<Sequence>` has no such failure mode: a layer that has not started
 * simply is not mounted.
 */
const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 26,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Big: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPortrait = useIsPortrait();
  return (
    <span
      style={{
        fontFamily: display,
        fontWeight: 800,
        fontSize: isPortrait ? 118 : 150,
        letterSpacing: "-0.04em",
        color: C.route,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
};

const Cap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontFamily: body,
      fontSize: 32,
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: C.inkDim,
    }}
  >
    {children}
  </span>
);

export const RhythmBreak: React.FC = () => {
  return (
    <Scene>
      <AbsoluteFill>
        <Sequence durationInFrames={8} name="Signs" layout="none">
          <Frame>
            <Img
              src={staticFile("signs/regulatory/regulatory-006-01.png")}
              style={{
                width: 300,
                height: 300,
                objectFit: "contain",
                filter: "drop-shadow(0 14px 30px rgba(36,66,51,0.22))",
              }}
            />
            <Cap>Signs</Cap>
          </Frame>
        </Sequence>

        <Sequence from={8} durationInFrames={8} name="Flashcards" layout="none">
          <Frame>
            <Big>798</Big>
            <Cap>Flashcards</Cap>
          </Frame>
        </Sequence>

        <Sequence from={16} durationInFrames={7} name="Questions" layout="none">
          <Frame>
            <Big>1 060</Big>
            <Cap>Questions</Cap>
          </Frame>
        </Sequence>

        <Sequence from={23} durationInFrames={8} name="Streak" layout="none">
          <Frame>
            <Big>12</Big>
            <Cap>Day streak</Cap>
          </Frame>
        </Sequence>

        {/* Held twice as long — the cut you are meant to land on. */}
        <Sequence from={31} durationInFrames={20} name="Ready" layout="none">
          <Frame>
            <Big>84%</Big>
            <Cap>Ready</Cap>
          </Frame>
        </Sequence>
      </AbsoluteFill>
    </Scene>
  );
};
