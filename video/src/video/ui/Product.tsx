import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SPRING } from "../config";
import { PALETTE, TRACKING } from "../theme";
import { CLAMP, EASE } from "../lib/motion";
import { useStage } from "../lib/stage";
import { BODY, DISPLAY, MONO } from "../type/fonts";
import { Glass, Hairline, Pill } from "./Glass";
import { LaneRing } from "../elements/LaneLine";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT UI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * These are rebuilds of the app's real surfaces — the hero readiness card, the
 * mastery bars, the SM-2 rating row, the tutor panel — not "app-like" mockups.
 * Copy, numbers and layout all come from `src/components/landing/hero.tsx` and
 * `src/components/study/`.
 *
 * Two things are true at once here and both matter: it has to be honest (no
 * invented metrics), and every element has to animate independently, because a
 * card that arrives as one flat block is the thing that makes product video
 * look cheap. Nothing here animates as a group.
 */

const TONE: Record<string, string> = {
  green: PALETTE.green,
  ochre: PALETTE.ochre,
  blue: PALETTE.blue,
  red: PALETTE.red,
};

/* ───────────────────────────────────────────────────────────────────────────
 * Mastery bar — the app's `MasteryBar`
 * ─────────────────────────────────────────────────────────────────────────── */

export const MasteryBar: React.FC<{
  readonly label: string;
  readonly value: number;
  readonly tone?: keyof typeof TONE;
  readonly at: number;
  readonly width?: number;
  /** Lifts the row forward and brightens it — used to single out a weak spot. */
  readonly focus?: boolean;
  readonly focusAt?: number;
}> = ({ label, value, tone = "green", at, width = 420, focus = false, focusAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();
  const color = TONE[tone];

  return (
    <div
      style={{
        width: u(width),
        opacity: interpolate(frame, [at, at + 14], [0, 1], {
          easing: EASE.soft,
          ...CLAMP,
        }),
        translate: `${interpolate(
          spring({ frame: frame - at, fps, config: SPRING.settle }),
          [0, 1],
          [u(24), 0],
        )}px 0px`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: u(9),
          fontFamily: BODY,
          fontSize: u(17),
          fontWeight: focus && frame > focusAt + 9 ? 600 : 500,
          // Focused rows brighten their label to full ink. Crossing at the
          // midpoint of the window rather than easing the colour, because a
          // half-lit label just looks like a rendering artefact.
          color: focus && frame > focusAt + 9 ? PALETTE.ink : PALETTE.mute,
        }}
      >
        <span>{label}</span>
        <span
          style={{
            fontFamily: MONO,
            fontVariantNumeric: "tabular-nums",
            color,
            fontWeight: 600,
          }}
        >
          {Math.round(
            interpolate(frame, [at + 6, at + 46], [0, value], {
              easing: EASE.glass,
              ...CLAMP,
            }),
          )}
          %
        </span>
      </div>

      <div
        style={{
          height: u(9),
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.055)",
          overflow: "hidden",
          boxShadow: `inset 0 ${u(1)}px ${u(2)}px rgba(0,0,0,0.35)`,
        }}
      >
        <div
          style={{
            height: "100%",
            // The fill is animated as a width, but the *number* above uses the
            // same input range — so the digit and the bar always agree, frame
            // for frame. Getting those out of sync is a classic tell.
            width: `${interpolate(frame, [at + 6, at + 46], [0, value], {
              easing: EASE.glass,
              ...CLAMP,
            })}%`,
            borderRadius: 999,
            backgroundImage: `linear-gradient(90deg, ${color}b0, ${color})`,
            boxShadow: `0 0 ${u(14)}px ${color}${focus ? "cc" : "66"}`,
          }}
        />
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * Readiness card — the app's hero mock
 * ─────────────────────────────────────────────────────────────────────────── */

export const ReadinessCard: React.FC<{
  readonly at: number;
  readonly width?: number;
  /** Hides the lower plan row for tighter framings. */
  readonly compact?: boolean;
  /**
   * Overrides when the ring and its number animate, independently of the rest
   * of the card. Defaults to `at`.
   *
   * The reveal hands off from a large centred hero ring to this one: the hero
   * shrinks into the card's ring position while the panel assembles around it.
   * For that swap to be invisible the card's ring has to be *already complete*
   * when the panel appears, while every other row still staggers in normally —
   * hence a separate clock. Pass a large negative number.
   */
  readonly ringAt?: number;
}> = ({ at, width = 620, compact = false, ringAt }) => {
  const ringClock = ringAt ?? at;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();

  return (
    <Glass tier="float" width={width} padding={30} radius={30} seed={2}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          opacity: interpolate(frame, [at + 6, at + 24], [0, 1], {
            easing: EASE.soft,
            ...CLAMP,
          }),
        }}
      >
        <div>
          <div
            style={{
              fontFamily: BODY,
              fontSize: u(14),
              fontWeight: 500,
              letterSpacing: TRACKING.label,
              textTransform: "uppercase",
              color: PALETTE.mute,
            }}
          >
            Your readiness
          </div>
          <div
            style={{
              marginTop: u(8),
              fontFamily: DISPLAY,
              fontSize: u(22),
              fontWeight: 600,
              letterSpacing: TRACKING.title,
              color: PALETTE.ink,
            }}
          >
            Good progress, Thabo
          </div>
        </div>
        <div
          style={{
            scale: interpolate(
              spring({ frame: frame - at - 22, fps, config: SPRING.snap }),
              [0, 1],
              [0.5, 1],
            ),
          }}
        >
          <Pill color={PALETTE.success} size={14}>
            +6 this week
          </Pill>
        </div>
      </div>

      {/* ring + probability */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: u(32),
          marginTop: u(26),
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <LaneRing
            size={168}
            thickness={13}
            progress={interpolate(frame, [ringClock + 14, ringClock + 74], [0, 0.78], {
              easing: EASE.glass,
              ...CLAMP,
            })}
            intensity={interpolate(frame, [ringClock + 14, ringClock + 40], [0.4, 1], CLAMP)}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontSize: u(44),
                fontWeight: 600,
                letterSpacing: "-0.05em",
                fontVariantNumeric: "tabular-nums",
                color: PALETTE.ink,
              }}
            >
              {Math.round(
                interpolate(frame, [ringClock + 14, ringClock + 74], [0, 78], {
                  easing: EASE.glass,
                  ...CLAMP,
                }),
              )}
            </span>
            <span
              style={{
                marginTop: u(2),
                fontFamily: BODY,
                fontSize: u(13),
                fontWeight: 500,
                color: PALETTE.mute,
              }}
            >
              Ready
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: BODY,
              fontSize: u(15),
              fontWeight: 500,
              color: PALETTE.mute,
              opacity: interpolate(frame, [at + 30, at + 46], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
            }}
          >
            Predicted pass probability
          </div>
          <div style={{ marginTop: u(4) }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: u(32),
                fontWeight: 600,
                letterSpacing: "-0.04em",
                fontVariantNumeric: "tabular-nums",
                color: PALETTE.success,
                opacity: interpolate(frame, [at + 34, at + 48], [0, 1], {
                  easing: EASE.soft,
                  ...CLAMP,
                }),
              }}
            >
              {Math.round(
                interpolate(frame, [at + 34, at + 86], [0, 82], {
                  easing: EASE.glass,
                  ...CLAMP,
                }),
              )}
              %
            </span>
          </div>

          <div
            style={{
              marginTop: u(18),
              display: "flex",
              flexDirection: "column",
              gap: u(14),
            }}
          >
            <MasteryBar label="Road signs" value={64} tone="ochre" at={at + 46} width={272} />
            <MasteryBar
              label="Rules of the road"
              value={88}
              tone="green"
              at={at + 56}
              width={272}
            />
          </div>
        </div>
      </div>

      {compact ? null : (
        <>
          <Hairline style={{ marginTop: u(26) }} />
          <div
            style={{
              marginTop: u(20),
              display: "flex",
              alignItems: "center",
              gap: u(14),
              opacity: interpolate(frame, [at + 70, at + 90], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              translate: `0px ${interpolate(
                spring({ frame: frame - at - 70, fps, config: SPRING.settle }),
                [0, 1],
                [u(16), 0],
              )}px`,
            }}
          >
            <div
              style={{
                width: u(40),
                height: u(40),
                borderRadius: u(12),
                backgroundColor: `${PALETTE.green}24`,
                boxShadow: `inset 0 0 0 ${u(1)}px ${PALETTE.green}33`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={u(19)} height={u(19)} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h10M4 17h13"
                  stroke={PALETTE.green}
                  strokeWidth={2.1}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: BODY,
                  fontSize: u(16),
                  fontWeight: 600,
                  color: PALETTE.ink,
                }}
              >
                Today&apos;s plan · 10 min
              </div>
              <div
                style={{
                  marginTop: u(3),
                  fontFamily: BODY,
                  fontSize: u(14),
                  color: PALETTE.mute,
                }}
              >
                8 due cards · Signs drill · 1 scenario
              </div>
            </div>
            <span
              style={{
                fontFamily: MONO,
                fontSize: u(14),
                fontWeight: 600,
                color: PALETTE.green,
              }}
            >
              Start →
            </span>
          </div>
        </>
      )}
    </Glass>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * Flashcard + SM-2 rating row
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * ── Why this is built out of absolutely-positioned faces ────────────────────
 * The obvious implementation — one card, swap its text at 90°, rotate the
 * wrapper — went wrong twice, and both failures are worth recording because
 * neither is obvious from the code.
 *
 *  1. A block-level rotating wrapper fills its parent's width while the card
 *     sits at its left edge, so rotating about the wrapper's centre swings the
 *     card half a frame sideways.
 *  2. This card lives inside `<Shutter>` (`CameraMotionBlur`), which composites
 *     its samples as absolutely-positioned layers — so anything inside it
 *     contributes **no height to normal flow**. Every ancestor collapsed, and
 *     the rating row underneath climbed up over the card.
 *
 * So: explicit `width`/`height`, both faces absolutely positioned and filling
 * the box, one rotation on a box whose centre is unambiguous, and real backface
 * culling instead of swapping strings at the halfway point. Layout no longer
 * depends on flow at all, which is the only safe thing to do under a motion
 * blur wrapper.
 */
export const Flashcard: React.FC<{
  readonly front: string;
  readonly back: string;
  readonly at: number;
  /** Frame the card flips. */
  readonly flipAt: number;
  /** Frame the card is thrown off screen after being rated. */
  readonly throwAt?: number;
  readonly width?: number;
  readonly height?: number;
}> = ({ front, back, at, flipAt, throwAt, width = 500, height = 280 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();

  const flip = interpolate(frame, [flipAt, flipAt + 26], [0, 180], {
    easing: EASE.glass,
    ...CLAMP,
  });

  const face = (label: string, body: string, isBack: boolean) => (
    <Glass
      tier="float"
      width={width}
      height={height}
      radius={26}
      padding={36}
      seed={isBack ? 8 : 7}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        rotate: isBack ? "y 180deg" : undefined,
      }}
    >
      <div
        style={{
          fontFamily: BODY,
          fontSize: u(14),
          fontWeight: 500,
          letterSpacing: TRACKING.label,
          textTransform: "uppercase",
          color: isBack ? PALETTE.green : PALETTE.mute,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: u(18),
          fontFamily: DISPLAY,
          fontSize: u(isBack ? 32 : 30),
          fontWeight: 600,
          lineHeight: 1.22,
          letterSpacing: TRACKING.title,
          color: PALETTE.ink,
        }}
      >
        {body}
      </div>
    </Glass>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: u(width),
        height: u(height),
        marginLeft: u(-width / 2),
        marginTop: u(-height / 2),
        perspective: u(1600),
        translate: throwAt
          ? `${interpolate(frame, [throwAt, throwAt + 20], [0, u(-820)], {
              easing: EASE.anticipate,
              ...CLAMP,
            })}px ${interpolate(frame, [throwAt, throwAt + 20], [0, u(-110)], {
              easing: EASE.anticipate,
              ...CLAMP,
            })}px`
          : undefined,
        rotate: throwAt
          ? `${interpolate(frame, [throwAt, throwAt + 20], [0, -13], {
              easing: EASE.anticipate,
              ...CLAMP,
            })}deg`
          : undefined,
        opacity: throwAt
          ? interpolate(frame, [throwAt + 8, throwAt + 20], [1, 0], CLAMP)
          : 1,
        scale: interpolate(
          spring({ frame: frame - at, fps, config: SPRING.heavy }),
          [0, 1],
          [0.9, 1],
        ),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          rotate: `y ${flip}deg`,
        }}
      >
        {face("Road signs · due today", front, false)}
        {face("Answer", back, true)}
      </div>
    </div>
  );
};

const RATINGS = [
  { label: "Again", color: PALETTE.red },
  { label: "Hard", color: PALETTE.ochre },
  { label: "Good", color: PALETTE.green },
  { label: "Easy", color: PALETTE.blue },
] as const;

export const RatingRow: React.FC<{
  readonly at: number;
  /** Index of the button that gets pressed. */
  readonly pressIndex?: number;
  readonly pressAt?: number;
}> = ({ at, pressIndex = 2, pressAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();

  return (
    <div style={{ display: "flex", gap: u(12) }}>
      {RATINGS.map((r, i) => {
        const pressed = pressAt !== undefined && i === pressIndex;
        return (
          <div
            key={r.label}
            style={{
              padding: `${u(14)}px ${u(26)}px`,
              borderRadius: 999,
              backgroundColor: pressed
                ? `${r.color}${
                    frame >= pressAt
                      ? Math.round(
                          interpolate(frame, [pressAt, pressAt + 12], [0.16, 0.3], CLAMP) *
                            255,
                        )
                          .toString(16)
                          .padStart(2, "0")
                      : "1f"
                  }`
                : "rgba(255,255,255,0.045)",
              boxShadow: `inset 0 0 0 ${u(1)}px ${
                pressed && pressAt !== undefined && frame >= pressAt
                  ? `${r.color}77`
                  : "rgba(255,255,255,0.09)"
              }, inset 0 ${u(1)}px 0 rgba(255,255,255,0.1)`,
              fontFamily: BODY,
              fontSize: u(17),
              fontWeight: 600,
              color:
                pressed && pressAt !== undefined && frame >= pressAt
                  ? r.color
                  : PALETTE.mute,
              // Press: down fast, released on a spring. The asymmetry is the
              // whole reason it feels like a button and not a state toggle.
              scale:
                pressed && pressAt !== undefined
                  ? interpolate(
                      spring({
                        frame: frame - pressAt - 5,
                        fps,
                        config: SPRING.tactile,
                      }),
                      [0, 1],
                      [0.94, 1],
                    )
                  : 1,
              opacity: interpolate(frame, [at + i * 4, at + i * 4 + 16], [0, 1], {
                easing: EASE.soft,
                ...CLAMP,
              }),
              translate: `0px ${interpolate(
                spring({
                  frame: frame - at - i * 4,
                  fps,
                  config: SPRING.settle,
                }),
                [0, 1],
                [u(18), 0],
              )}px`,
            }}
          >
            {r.label}
          </div>
        );
      })}
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * AI tutor
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The tutor's reply types itself in. Character count is driven by an eased
 * interpolation rather than a linear one so it accelerates the way a stream
 * actually arrives, and the caret only blinks while the stream is live.
 */
export const TutorPanel: React.FC<{
  readonly question: string;
  readonly answer: string;
  readonly at: number;
  readonly typeAt: number;
  readonly typeDuration?: number;
  readonly width?: number;
}> = ({ question, answer, at, typeAt, typeDuration = 120, width = 620 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();

  const chars = Math.round(
    interpolate(frame, [typeAt, typeAt + typeDuration], [0, answer.length], {
      easing: EASE.soft,
      ...CLAMP,
    }),
  );
  const typing = chars > 0 && chars < answer.length;

  return (
    <Glass
      tier="float"
      width={width}
      radius={28}
      padding={28}
      tint={PALETTE.blue}
      tintStrength={0.07}
      seed={11}
      style={{
        translate: `0px ${interpolate(
          spring({ frame: frame - at, fps, config: SPRING.heavy }),
          [0, 1],
          [u(70), 0],
        )}px`,
        opacity: interpolate(frame, [at, at + 16], [0, 1], {
          easing: EASE.soft,
          ...CLAMP,
        }),
      }}
    >
      {/* the learner's question */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          opacity: interpolate(frame, [at + 8, at + 24], [0, 1], {
            easing: EASE.soft,
            ...CLAMP,
          }),
        }}
      >
        <div
          style={{
            maxWidth: "78%",
            padding: `${u(14)}px ${u(20)}px`,
            borderRadius: u(18),
            borderBottomRightRadius: u(6),
            backgroundColor: "rgba(255,255,255,0.07)",
            fontFamily: BODY,
            fontSize: u(18),
            lineHeight: 1.45,
            color: PALETTE.ink,
          }}
        >
          {question}
        </div>
      </div>

      {/* the tutor */}
      <div
        style={{
          marginTop: u(20),
          display: "flex",
          gap: u(14),
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: u(36),
            height: u(36),
            flexShrink: 0,
            borderRadius: u(11),
            backgroundImage: `linear-gradient(150deg, ${PALETTE.greenLift}, ${PALETTE.green})`,
            boxShadow: `0 0 ${u(20)}px ${PALETTE.green}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: DISPLAY,
            fontSize: u(16),
            fontWeight: 700,
            color: "#08150f",
            scale: interpolate(
              spring({ frame: frame - at - 20, fps, config: SPRING.snap }),
              [0, 1],
              [0.4, 1],
            ),
          }}
        >
          K
        </div>
        <div
          style={{
            flex: 1,
            fontFamily: BODY,
            fontSize: u(18),
            lineHeight: 1.55,
            color: PALETTE.ink,
            minHeight: u(90),
          }}
        >
          {answer.slice(0, chars)}
          <span
            style={{
              display: "inline-block",
              width: u(2.5),
              height: u(19),
              marginLeft: u(3),
              translate: `0px ${u(3)}px`,
              backgroundColor: PALETTE.green,
              // Caret blinks at 2Hz only while the stream is live.
              opacity: typing ? (Math.floor(frame / 15) % 2 === 0 ? 1 : 0.15) : 0,
            }}
          />
        </div>
      </div>
    </Glass>
  );
};

/* ───────────────────────────────────────────────────────────────────────────
 * Multiple-choice question card
 * ─────────────────────────────────────────────────────────────────────────── */

export const QuestionCard: React.FC<{
  readonly index: number;
  readonly total: number;
  readonly question: string;
  readonly options: readonly string[];
  readonly at: number;
  /** Index of the option that gets selected. */
  readonly selected?: number;
  readonly selectAt?: number;
  /** Whether the selection turns out to be right. */
  readonly correct?: boolean;
  readonly width?: number;
}> = ({
  index,
  total,
  question,
  options,
  at,
  selected,
  selectAt,
  correct = false,
  width = 640,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useStage();
  const tone = correct ? PALETTE.success : PALETTE.red;

  return (
    <Glass tier="card" width={width} radius={28} padding={30} seed={5}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: MONO,
          fontSize: u(14),
          fontWeight: 600,
          letterSpacing: TRACKING.label,
          color: PALETTE.mute,
        }}
      >
        <span>
          {String(index).padStart(2, "0")} / {total}
        </span>
        <span style={{ color: PALETTE.green }}>ROAD SIGNS</span>
      </div>

      <div
        style={{
          marginTop: u(18),
          fontFamily: DISPLAY,
          fontSize: u(26),
          fontWeight: 600,
          lineHeight: 1.26,
          letterSpacing: TRACKING.title,
          color: PALETTE.ink,
        }}
      >
        {question}
      </div>

      <div
        style={{
          marginTop: u(24),
          display: "flex",
          flexDirection: "column",
          gap: u(11),
        }}
      >
        {options.map((opt, i) => {
          const isSel = selected === i && selectAt !== undefined && frame >= selectAt;
          return (
            <div
              key={opt}
              style={{
                padding: `${u(16)}px ${u(20)}px`,
                borderRadius: u(15),
                backgroundColor: isSel ? `${tone}1c` : "rgba(255,255,255,0.035)",
                boxShadow: `inset 0 0 0 ${u(1)}px ${
                  isSel ? `${tone}66` : "rgba(255,255,255,0.07)"
                }`,
                fontFamily: BODY,
                fontSize: u(18),
                fontWeight: isSel ? 600 : 400,
                color: isSel ? tone : PALETTE.mute,
                opacity: interpolate(
                  frame,
                  [at + 10 + i * 5, at + 26 + i * 5],
                  [0, 1],
                  { easing: EASE.soft, ...CLAMP },
                ),
                translate: `${interpolate(
                  spring({
                    frame: frame - at - 10 - i * 5,
                    fps,
                    config: SPRING.settle,
                  }),
                  [0, 1],
                  [u(22), 0],
                )}px 0px`,
                scale:
                  isSel && selectAt !== undefined
                    ? interpolate(
                        spring({
                          frame: frame - selectAt,
                          fps,
                          config: SPRING.tactile,
                        }),
                        [0, 1],
                        [0.975, 1],
                      )
                    : 1,
              }}
            >
              <span style={{ fontFamily: MONO, marginRight: u(14), opacity: 0.6 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </div>
          );
        })}
      </div>
    </Glass>
  );
};
