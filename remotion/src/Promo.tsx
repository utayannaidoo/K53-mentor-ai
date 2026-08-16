import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { none } from "@remotion/transitions/none";
import { AtmosphereBack, AtmosphereFront } from "./components/Atmosphere";
import { AmbientBed } from "./components/Sfx";
import { Bank } from "./scenes/Bank";
import { Codes } from "./scenes/Codes";
import { Demo, DemoShort } from "./scenes/Demo";
import { EndCard } from "./scenes/EndCard";
import { Hook } from "./scenes/Hook";
import { Numbers } from "./scenes/Numbers";
import { Offer } from "./scenes/Offer";
import { Proof } from "./scenes/Proof";
import { Reframe } from "./scenes/Reframe";
import { Retention } from "./scenes/Retention";
import { RhythmBreak } from "./scenes/RhythmBreak";
import { Scanner } from "./scenes/Scanner";
import { SectionFail } from "./scenes/SectionFail";
import { SignBoard } from "./scenes/SignBoard";
import { DemoIntro } from "./scenes/DemoIntro";
import { YardTest } from "./scenes/YardTest";

/**
 * The film spine.
 *
 * The CSS original had to compute every beat's start time in JS from its
 * `data-hold`, precisely so that inserting a beat did not require retiming the
 * fourteen after it. `<TransitionSeries>` gives that property for free: each
 * `Sequence` only declares how long IT runs, and everything downstream shifts.
 *
 * Every cut uses a `none()` transition of 14 frames. That is not a visual
 * effect — it is the overlap. It mounts the incoming beat 14 frames before the
 * outgoing one ends, so the new beat lands while the old one is still dollying
 * away. The dolly itself lives inside each scene's `<Scene>` wrapper, where the
 * art direction belongs.
 *
 * Durations below are `hold + 23` (the exit). They are written out rather than
 * derived so they stay draggable in the Remotion Studio timeline.
 */

/** 16:9 and 9:16 master — roughly 57 seconds. */
export const Promo: React.FC = () => {
  return (
    <AbsoluteFill>
      <AmbientBed />
      <AtmosphereBack />
      <TransitionSeries>
        {/* 36 frames of aurora before the first word — the film needs a breath
            to establish before it makes a claim. */}
        <TransitionSeries.Sequence durationInFrames={119} name="1 · Hook">
          <Sequence from={36} durationInFrames={83} layout="none">
            <Hook />
          </Sequence>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={74} name="2 · Reframe">
          <Reframe />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence
          durationInFrames={113}
          name="3 · Section fail"
        >
          <SectionFail />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={71} name="4 · Numbers">
          <Numbers />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={122} name="5 · Sign board">
          <SignBoard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={113} name="6 · The bank">
          <Bank />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence
          durationInFrames={74}
          name="7 · Rhythm break"
        >
          <RhythmBreak />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={65} name="8 · Demo intro">
          <DemoIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={338} name="9 · Demo">
          <Demo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={173} name="10 · Retention">
          <Retention />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={134} name="11 · Scanner">
          <Scanner />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={149} name="12 · Yard test">
          <YardTest />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={89} name="13 · Proof">
          <Proof />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={83} name="14 · Codes">
          <Codes />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={68} name="15 · Offer">
          <Offer />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={137} name="16 · End card">
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <AtmosphereFront />
    </AbsoluteFill>
  );
};

/**
 * The short cut — roughly 25 seconds for paid social.
 *
 * This is a separate edit, not a parameterised one. Eight beats are gone and
 * the survivors are re-timed; expressing that as `data-short-hold` attributes
 * on the master, as the CSS version did, made both cuts harder to read and
 * meant a change to one silently moved the other.
 */
export const PromoShort: React.FC = () => {
  return (
    <AbsoluteFill>
      <AmbientBed />
      <AtmosphereBack />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={99} name="1 · Hook">
          <Sequence from={31} durationInFrames={68} layout="none">
            <Hook />
          </Sequence>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={65} name="2 · Reframe">
          <Reframe />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={62} name="4 · Numbers">
          <Numbers />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={89} name="5 · Sign board">
          <SignBoard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={173} name="9 · Demo">
          <DemoShort />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={173} name="10 · Retention">
          <Retention />
        </TransitionSeries.Sequence>
        {/*
          No yard test in the short cut. The retention chart differentiates the
          product more in a feed than a parallel-park animation does, and this is
          the beat that pays for its runtime.
        */}
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={77} name="13 · Proof">
          <Proof />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={none()}
          timing={linearTiming({ durationInFrames: 14 })}
        />
        <TransitionSeries.Sequence durationInFrames={119} name="16 · End card">
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <AtmosphereFront />
    </AbsoluteFill>
  );
};
