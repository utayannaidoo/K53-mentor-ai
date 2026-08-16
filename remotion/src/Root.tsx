import React from "react";
import { Composition, Folder } from "remotion";
import "./index.css";
import { Promo, PromoShort } from "./Promo";
import { Bank } from "./scenes/Bank";
import { Codes } from "./scenes/Codes";
import { Demo } from "./scenes/Demo";
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
 * Four deliverables, four compositions.
 *
 * The CSS original produced these from `?v=9x16` and `?cut=short` query params,
 * which meant one file carried two layouts, two timelines and a `remount()`
 * that rebuilt everything when you toggled. Each cut is now a composition you
 * can scrub, still-render and export independently, and
 * `npx remotion render Promo-Portrait-Short` is the whole delivery step.
 *
 * Aspect is NOT a prop: `width`/`height` here are what `useVideoConfig()`
 * reports, and scenes branch on `height > width` via `useIsPortrait()`. That
 * replaces the ~40 `#stage.v .thing {font-size: …}` overrides in the original.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Promo-Landscape"
        component={Promo}
        durationInFrames={1712}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Promo-Portrait"
        component={Promo}
        durationInFrames={1712}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Promo-Landscape-Short"
        component={PromoShort}
        durationInFrames={759}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Promo-Portrait-Short"
        component={PromoShort}
        durationInFrames={759}
        fps={30}
        width={1080}
        height={1920}
      />

      {/*
        Every beat is also its own composition. Double-clicking a sequence in
        the main timeline jumps here, so a beat can be re-timed and re-cut in
        isolation without scrubbing 54 seconds to reach it.
      */}
      <Folder name="Beats">
        <Composition
          id="B01-Hook"
          component={Hook}
          durationInFrames={83}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B02-Reframe"
          component={Reframe}
          durationInFrames={74}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B03-SectionFail"
          component={SectionFail}
          durationInFrames={113}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B04-Numbers"
          component={Numbers}
          durationInFrames={71}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B05-SignBoard"
          component={SignBoard}
          durationInFrames={122}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B06-Bank"
          component={Bank}
          durationInFrames={113}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B07-RhythmBreak"
          component={RhythmBreak}
          durationInFrames={74}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B08-DemoIntro"
          component={DemoIntro}
          durationInFrames={65}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B09-Demo"
          component={Demo}
          durationInFrames={338}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B10-Retention"
          component={Retention}
          durationInFrames={173}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B11-Scanner"
          component={Scanner}
          durationInFrames={134}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B11-YardTest"
          component={YardTest}
          durationInFrames={149}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B12-Proof"
          component={Proof}
          durationInFrames={89}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B13-Codes"
          component={Codes}
          durationInFrames={83}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B14-Offer"
          component={Offer}
          durationInFrames={68}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="B15-EndCard"
          component={EndCard}
          durationInFrames={137}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
