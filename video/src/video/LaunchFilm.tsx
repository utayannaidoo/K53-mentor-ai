import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { TOTAL_FRAMES } from "./config";
import { PALETTE } from "./theme";
import { blurDissolve, depthPush, lightWipe, throughBlack } from "./transitions";
import { SoundDesign } from "./audio/SoundDesign";
import { Scene01Mystery } from "./scenes/Scene01Mystery";
import { Scene02Problem } from "./scenes/Scene02Problem";
import { Scene03Reveal } from "./scenes/Scene03Reveal";
import { Scene04Diagnostic } from "./scenes/Scene04Diagnostic";
import { Scene05WeakSpots } from "./scenes/Scene05WeakSpots";
import { Scene06Practice } from "./scenes/Scene06Practice";
import { Scene07Tutor } from "./scenes/Scene07Tutor";
import { Scene08Cta } from "./scenes/Scene08Cta";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * K53 MENTOR AI — LAUNCH FILM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 58 seconds. Five acts. One object.
 *
 *   I    MYSTERY     0:00  one line of light, and a sentence
 *   II   PROBLEM     0:06  the line breaks; four slams; a failure stamp
 *        ─ silence ─ 0:16  ~half a second of nothing at all
 *   III  REVEAL      0:17  the road rushes the lens; the mark draws itself
 *   IV   PRODUCT     0:27  four beats, each its own short film
 *   V    CLOSE       0:49  the line bends into a ring and closes
 *
 * Every duration is in `config.ts`; every transition is in `transitions/`;
 * the sound is in `audio/cues.ts`. Nothing is hard-coded twice.
 */

export const LaunchFilm: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.abyss }}>
      <TransitionSeries>
        {/* ── ACT I ────────────────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={372} name="I · Mystery">
          <Scene01Mystery />
        </TransitionSeries.Sequence>

        {/* A blade of light cuts the mystery off mid-breath. 18 frames — this
            is the closest thing to a hard cut in the film, and it is the only
            transition that is meant to feel violent. */}
        <TransitionSeries.Transition
          presentation={lightWipe({ angle: 96, color: PALETTE.ink, softness: 18 })}
          timing={linearTiming({ durationInFrames: 18 })}
        />

        {/* ── ACT II ───────────────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={690} name="II · Problem">
          <Scene02Problem />
        </TransitionSeries.Sequence>

        {/* THE SILENCE. 45 frames, a third of it at full black with nothing
            playing. Everything the film has left to say depends on this. */}
        <TransitionSeries.Transition
          presentation={throughBlack({ hold: 0.36 })}
          timing={linearTiming({ durationInFrames: 45 })}
        />

        {/* ── ACT III ──────────────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={636} name="III · Reveal">
          <Scene03Reveal />
        </TransitionSeries.Sequence>

        {/* We fly into the product. The reveal ends pushing in on the card and
            the diagnostic opens already inside it — object continuity, so the
            viewer reads one continuous move rather than a cut. */}
        <TransitionSeries.Transition
          presentation={depthPush({ amount: 0.5 })}
          timing={linearTiming({ durationInFrames: 30 })}
        />

        {/* ── ACT IV ───────────────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={348} name="IV·1 · Diagnostic">
          <Scene04Diagnostic />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={blurDissolve({ maxBlur: 22, depth: 0.05 })}
          timing={linearTiming({ durationInFrames: 24 })}
        />

        <TransitionSeries.Sequence durationInFrames={342} name="IV·2 · Weak spots">
          <Scene05WeakSpots />
        </TransitionSeries.Sequence>

        {/* One light wipe in the middle of the feature act, so four beats of
            dissolves don't flatten into a slideshow. */}
        <TransitionSeries.Transition
          presentation={lightWipe({ angle: 112, color: PALETTE.greenLift, softness: 30 })}
          timing={linearTiming({ durationInFrames: 24 })}
        />

        <TransitionSeries.Sequence durationInFrames={360} name="IV·3 · Daily plan">
          <Scene06Practice />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={blurDissolve({ maxBlur: 24, depth: 0.06 })}
          timing={linearTiming({ durationInFrames: 24 })}
        />

        <TransitionSeries.Sequence durationInFrames={342} name="IV·4 · AI tutor">
          <Scene07Tutor />
        </TransitionSeries.Sequence>

        {/* The exhale. 40 frames of slow defocus into the close. */}
        <TransitionSeries.Transition
          presentation={blurDissolve({ maxBlur: 34, depth: 0.09 })}
          timing={linearTiming({ durationInFrames: 40 })}
        />

        {/* ── ACT V ────────────────────────────────────────────────────── */}
        <TransitionSeries.Sequence durationInFrames={595} name="V · Close">
          <Scene08Cta />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <SoundDesign />

      {/* Dev-time guard: if a scene length in config.ts stops matching the
          literals above, say so loudly rather than silently truncating the
          film. `<Composition durationInFrames>` has to be an inline literal for
          the Studio to edit it, so this is the check that keeps it honest. */}
      <DurationGuard />
    </AbsoluteFill>
  );
};

const DurationGuard: React.FC = () => {
  // The literals above, summed. They have to be literals — `TransitionSeries`
  // durations are only editable in the Studio when they are inline — so this is
  // the one place the film's shape is written down twice, and the only honest
  // thing to do is check the two copies against each other on every mount.
  const declared =
    372 + 690 + 636 + 348 + 342 + 360 + 342 + 595 - (18 + 45 + 30 + 24 + 24 + 24 + 40);

  if (declared !== TOTAL_FRAMES) {
    throw new Error(
      `Timeline drift: LaunchFilm.tsx declares ${declared} frames but config.ts describes ${TOTAL_FRAMES}. ` +
        `Update the literals in LaunchFilm.tsx and <Composition durationInFrames> in Root.tsx to match.`,
    );
  }
  return null;
};
