import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Glass, Pop, Scene, useIsPortrait } from "../components/Motion";
import { Words } from "../components/Words";
import { Sfx } from "../components/Sfx";
import { LEVEL, SFX } from "../audio";
import { A, C } from "../theme";
import { body, display, mono } from "../fonts";

/**
 * Beat 9 — the product demonstrating itself: answer a question, flip a card,
 * ask the tutor why.
 *
 * In the CSS film every child of a card was scheduled against the *master*
 * clock via `calc(var(--in) + var(--at) + 1.45s)`. Switching to the short cut
 * meant rewriting `--at` inline on the card and hoping every descendant picked
 * it up — and when one did not, the card rendered completely empty.
 *
 * Here each card is a `<Sequence>`. `useCurrentFrame()` inside it restarts at
 * zero, so "the answer lights up 1.45s in" is written as frame 43 and stays
 * frame 43 no matter where the card sits, or which cut it is in.
 */

/* ================================================================== */
/* Chrome                                                              */
/* ================================================================== */

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPortrait = useIsPortrait();
  return (
    <span
      style={{
        padding: isPortrait ? "11px 24px" : "9px 20px",
        borderRadius: 999,
        backgroundColor: A.route14,
        color: C.route,
        fontFamily: body,
        fontSize: isPortrait ? 25 : 21,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
};

/**
 * The card shell. Fades up on arrival, sinks away on departure — except the
 * last card of the beat, which holds so the scene exit can take it.
 */
const Card: React.FC<{ hold?: boolean; children: React.ReactNode }> = ({
  hold = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isPortrait = useIsPortrait();

  return (
    <AbsoluteFill
      style={{
        opacity: hold
          ? interpolate(frame, [0, 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            })
          : interpolate(
              frame,
              [0, 8, durationInFrames - 8, durationInFrames],
              [0, 1, 1, 0],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              },
            ),
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: isPortrait ? "53%" : "57%",
          translate: "-50% -50%",
        }}
      >
        <div
          style={{
            translate:
              "0px " +
              (hold
                ? interpolate(frame, [0, 8], [26, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  })
                : interpolate(
                    frame,
                    [0, 8, durationInFrames - 8, durationInFrames],
                    [26, 0, 0, -16],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(0.22, 1, 0.36, 1),
                    },
                  )) +
              "px",
            scale: hold
              ? interpolate(frame, [0, 8], [0.965, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                  output: "perceptual-scale",
                })
              : interpolate(
                  frame,
                  [0, 8, durationInFrames - 8, durationInFrames],
                  [0.965, 1, 1, 0.975],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                    output: "perceptual-scale",
                  },
                ),
            filter:
              "blur(" +
              (hold
                ? interpolate(frame, [0, 8], [12, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  })
                : interpolate(
                    frame,
                    [0, 8, durationInFrames - 8, durationInFrames],
                    [12, 0, 0, 9],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(0.22, 1, 0.36, 1),
                    },
                  )) +
              "px)",
          }}
        >
          <Glass
            float
            sweepFrom={3}
            radius={28}
            style={{
              width: isPortrait ? 960 : 900,
              height: isPortrait ? 940 : 660,
              padding: "34px 38px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              {children}
            </div>
          </Glass>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The rail of pills above the card. The active pill tracks the current card. */
const TabRail: React.FC<{
  tabs: { label: string; from: number; until: number }[];
}> = ({ tabs }) => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: isPortrait ? "13%" : "15%",
        translate: "-50% -50%",
        display: "flex",
        gap: isPortrait ? 10 : 14,
        opacity: interpolate(frame, [0, 24], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
        filter:
          "blur(" +
          interpolate(frame, [0, 24], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }) +
          "px)",
      }}
    >
      {tabs.map((tab) => {
        const on = frame >= tab.from && frame < tab.until;
        return (
          <span
            key={tab.label}
            style={{
              padding: isPortrait ? "15px 26px" : "15px 30px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              fontFamily: body,
              fontSize: isPortrait ? 26 : 24,
              fontWeight: 500,
              color: on ? C.bg : C.inkDim,
              backgroundColor: on ? C.route : A.surface70,
              boxShadow: on ? "0 8px 22px -10px rgba(26,102,66,0.8)" : "none",
            }}
          >
            {tab.label}
          </span>
        );
      })}
    </div>
  );
};

/* ================================================================== */
/* Card 1 — answer a real question                                     */
/* ================================================================== */

const OPTIONS = [
  { letter: "A", text: "Stop completely before the line", correct: false },
  { letter: "B", text: "Yield — give right of way", correct: true },
  { letter: "C", text: "No entry for any vehicle", correct: false },
  { letter: "D", text: "You have right of way", correct: false },
];

/** The moment the answer resolves. Everything on this card keys off it. */
const ANSWER_AT = 43;

const QuestionCard: React.FC<{ hold?: boolean }> = ({ hold }) => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Card hold={hold}>
      <Sfx src={SFX.tap} at={ANSWER_AT} volume={LEVEL.tap} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <Tag>Road signs</Tag>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: body,
            fontSize: isPortrait ? 23 : 19,
            fontWeight: 500,
            color: C.inkDim,
          }}
        >
          Readiness
          <span
            style={{
              width: isPortrait ? 220 : 190,
              height: 10,
              borderRadius: 999,
              backgroundColor: A.ink12,
              overflow: "hidden",
            }}
          >
            {/* The readiness score moving the instant you answer — the loop, shown. */}
            <span
              style={{
                display: "block",
                height: "100%",
                borderRadius: 999,
                backgroundColor: C.route,
                width:
                  interpolate(frame, [ANSWER_AT, ANSWER_AT + 27], [64, 78], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.22, 1, 0.36, 1),
                  }) + "%",
              }}
            />
          </span>
        </span>
      </div>

      <Img
        src={staticFile("signs/regulatory/regulatory-006-02.png")}
        style={{
          width: isPortrait ? 120 : 88,
          height: isPortrait ? 120 : 88,
          objectFit: "contain",
          marginBottom: 14,
          filter: "drop-shadow(0 8px 18px rgba(36,66,51,0.2))",
        }}
      />

      <p
        style={{
          fontFamily: display,
          fontWeight: 600,
          fontSize: isPortrait ? 38 : 31,
          lineHeight: 1.3,
          marginBottom: 18,
          color: C.ink,
        }}
      >
        This triangular sign with the point facing down means:
      </p>

      {OPTIONS.map((option) => (
        <div
          key={option.letter}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: isPortrait ? "19px 26px" : "15px 22px",
            borderRadius: 14,
            marginBottom: 11,
            fontFamily: body,
            fontSize: isPortrait ? 29 : 23,
            backgroundColor:
              option.correct && frame >= ANSWER_AT + 8
                ? A.route14
                : A.surface75,
            border:
              "1px solid " +
              (option.correct && frame >= ANSWER_AT + 8 ? A.route65 : A.line60),
            color: option.correct && frame >= ANSWER_AT + 8 ? C.route : C.ink,
            opacity: option.correct
              ? 1
              : interpolate(frame, [ANSWER_AT, ANSWER_AT + 17], [1, 0.42], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.22, 1, 0.36, 1),
                }),
          }}
        >
          <span
            style={{
              position: "relative",
              width: isPortrait ? 46 : 38,
              height: isPortrait ? 46 : 38,
              flex: "none",
              borderRadius: 10,
              backgroundColor:
                option.correct && frame >= ANSWER_AT + 8 ? C.route : A.ink08,
              color: option.correct && frame >= ANSWER_AT + 8 ? C.bg : C.ink,
              fontFamily: mono,
              fontSize: isPortrait ? 23 : 19,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
            }}
          >
            {/* Letter swaps out for a tick rather than cross-fading — a swap
                reads as a state change, a cross-fade reads as a glitch. */}
            {option.correct && frame >= ANSWER_AT + 12 ? "✓" : option.letter}
          </span>
          {option.text}
        </div>
      ))}
    </Card>
  );
};

/* ================================================================== */
/* Card 2 — flip a flashcard, grade it, watch it get scheduled         */
/* ================================================================== */

const FlashcardCard: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Card>
      <Sfx src={SFX.whoosh} at={25} volume={0.08} />
      <Sfx src={SFX.tap} at={66} volume={LEVEL.tap} />
      <div
        style={{
          perspective: 1600,
          height: isPortrait ? 400 : 290,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            // 3D flip is order-sensitive and needs the parent's perspective,
            // so this is one of the few places a `transform` string is correct.
            transform:
              "rotateY(" +
              interpolate(frame, [25, 52], [0, 180], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.22, 1, 0.36, 1),
              }) +
              "deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              padding: 34,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              textAlign: "center",
              backfaceVisibility: "hidden",
              backgroundColor: A.surface85,
              border: "1px solid " + A.line60,
            }}
          >
            <Tag>Following distance</Tag>
            <p
              style={{
                fontFamily: display,
                fontWeight: 600,
                fontSize: isPortrait ? 39 : 32,
                lineHeight: 1.3,
                color: C.ink,
              }}
            >
              What is the minimum following distance under the two-second rule?
            </p>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              padding: 34,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              textAlign: "center",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: A.surface85,
              border: "1px solid " + A.line60,
            }}
          >
            <Tag>Answer</Tag>
            <p
              style={{
                fontFamily: body,
                fontSize: isPortrait ? 30 : 25,
                lineHeight: 1.45,
                color: C.ink,
              }}
            >
              At least <b>2 seconds</b> behind the vehicle ahead in dry
              conditions &mdash; double it to <b>4 seconds</b> in rain.
            </p>
          </div>
        </div>
      </div>

      <Pop delay={57} duration={15} style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 14 }}>
          {[
            { label: "Again", color: C.danger, picked: false },
            { label: "Good", color: C.route, picked: true },
            { label: "Easy", color: C.motorway, picked: false },
          ].map((grade) => (
            <span
              key={grade.label}
              style={{
                flex: 1,
                textAlign: "center",
                padding: isPortrait ? "20px 0" : "16px 0",
                borderRadius: 14,
                fontFamily: body,
                fontSize: isPortrait ? 27 : 22,
                fontWeight: 600,
                border: "2px solid " + grade.color,
                color: grade.picked && frame >= 70 ? C.bg : grade.color,
                backgroundColor:
                  grade.picked && frame >= 70 ? grade.color : "transparent",
                scale: grade.picked
                  ? interpolate(frame, [66, 81], [1, 1.06], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(0.34, 1.3, 0.64, 1),
                      output: "perceptual-scale",
                    })
                  : 1,
              }}
            >
              {grade.label}
            </span>
          ))}
        </div>
      </Pop>

      {/* Lands early enough to hold ~0.8s before the card goes. */}
      <Pop delay={75} duration={17}>
        <p
          style={{
            textAlign: "center",
            fontFamily: body,
            fontSize: isPortrait ? 29 : 24,
            color: C.inkDim,
          }}
        >
          Scheduled &mdash; you&rsquo;ll see this card again in{" "}
          <b style={{ color: C.route, fontWeight: 700 }}>3 days</b>.
        </p>
      </Pop>
    </Card>
  );
};

/* ================================================================== */
/* Card 3 — ask the tutor why                                          */
/* ================================================================== */

const TutorCard: React.FC = () => {
  const frame = useCurrentFrame();
  const isPortrait = useIsPortrait();

  return (
    <Card hold>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 20,
          marginBottom: 24,
          borderBottom: "1px solid " + A.line70,
        }}
      >
        <span
          style={{
            width: isPortrait ? 54 : 44,
            height: isPortrait ? 54 : 44,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            backgroundColor: A.motorway14,
            color: C.motorway,
            fontSize: isPortrait ? 27 : 22,
          }}
        >
          &#10022;
        </span>
        <b
          style={{
            fontFamily: display,
            fontWeight: 700,
            fontSize: isPortrait ? 32 : 26,
            color: C.ink,
          }}
        >
          Your AI tutor
        </b>
      </div>

      <Pop
        delay={13}
        duration={15}
        style={{ alignSelf: "flex-end", maxWidth: "88%" }}
      >
        <p
          style={{
            padding: isPortrait ? "24px 30px" : "20px 26px",
            borderRadius: "22px 22px 6px 22px",
            backgroundColor: C.route,
            color: C.bg,
            fontFamily: body,
            fontSize: isPortrait ? 31 : 25,
            lineHeight: 1.45,
            fontWeight: 500,
          }}
        >
          Why did I get that wrong?
        </p>
      </Pop>

      <Pop
        delay={30}
        duration={15}
        style={{ alignSelf: "flex-start", maxWidth: "88%", marginTop: 20 }}
      >
        <p
          style={{
            padding: isPortrait ? "24px 30px" : "20px 26px",
            borderRadius: "22px 22px 22px 6px",
            backgroundColor: A.surface90,
            border: "1px solid " + A.line60,
            fontFamily: body,
            fontSize: isPortrait ? 31 : 25,
            lineHeight: 1.45,
            color: C.ink,
          }}
        >
          <Words from={37} stagger={1.35} variant="type">
            Yield doesn&rsquo;t mean stop &mdash; it means{" "}
            <b style={{ fontWeight: 700 }}>give way</b>. Slow down; stop only if
            you must.
          </Words>
          {frame < 70 ? (
            <span
              style={{
                display: "inline-block",
                width: 11,
                height: 26,
                verticalAlign: -4,
                marginLeft: 4,
                backgroundColor: C.motorway,
                opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
              }}
            />
          ) : null}
        </p>
      </Pop>
    </Card>
  );
};

/* ================================================================== */
/* The beat, in two cuts                                               */
/* ================================================================== */

/** Master cut — all three cards. */
export const Demo: React.FC = () => (
  <Scene variant="up">
    <AbsoluteFill>
      <TabRail
        tabs={[
          { label: "Practice question", from: 0, until: 93 },
          { label: "Flashcard", from: 93, until: 219 },
          { label: "AI tutor", from: 219, until: 999 },
        ]}
      />
      <Sequence durationInFrames={93} name="Question" layout="none">
        <QuestionCard />
      </Sequence>
      <Sequence from={93} durationInFrames={126} name="Flashcard" layout="none">
        <FlashcardCard />
      </Sequence>
      <Sequence from={219} durationInFrames={96} name="Tutor" layout="none">
        <TutorCard />
      </Sequence>
    </AbsoluteFill>
  </Scene>
);

/** Short cut — drops the flashcard card and tightens the two that remain. */
export const DemoShort: React.FC = () => (
  <Scene variant="up">
    <AbsoluteFill>
      <TabRail
        tabs={[
          { label: "Practice question", from: 0, until: 72 },
          { label: "AI tutor", from: 72, until: 999 },
        ]}
      />
      <Sequence durationInFrames={72} name="Question" layout="none">
        <QuestionCard />
      </Sequence>
      <Sequence from={72} durationInFrames={78} name="Tutor" layout="none">
        <TutorCard />
      </Sequence>
    </AbsoluteFill>
  </Scene>
);
