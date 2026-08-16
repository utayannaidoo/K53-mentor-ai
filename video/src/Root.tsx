import "./index.css";
import React from "react";
import { Composition, Folder } from "remotion";
import { LaunchFilm } from "./video/LaunchFilm";
import { Scene01Mystery } from "./video/scenes/Scene01Mystery";
import { Scene02Problem } from "./video/scenes/Scene02Problem";
import { Scene03Reveal } from "./video/scenes/Scene03Reveal";
import { Scene04Diagnostic } from "./video/scenes/Scene04Diagnostic";
import { Scene05WeakSpots } from "./video/scenes/Scene05WeakSpots";
import { Scene06Practice } from "./video/scenes/Scene06Practice";
import { Scene07Tutor } from "./video/scenes/Scene07Tutor";
import { Scene08Cta } from "./video/scenes/Scene08Cta";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPOSITIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The film in three formats, plus every scene registered on its own so you can
 * scrub a single beat without waiting for the whole timeline — and so that
 * double-clicking a sequence in the master composition jumps straight to it.
 *
 * ── Why 2560×1440 and not 3840×2160 ────────────────────────────────────────
 * The Studio composition is 1440p; the 4K render is the same composition at
 * `--scale=1.5`. Rendering the preview at 4K would make scrubbing unusable for
 * no benefit, and because every size in the film is expressed in stage units
 * (`lib/stage.ts`), scaling is lossless — nothing is pinned to a pixel.
 *
 *     npx remotion render LaunchFilm out/k53-launch-4k.mp4 --scale=1.5
 *
 * ── durationInFrames = 3480 ────────────────────────────────────────────────
 * 58.0s at 60fps. Kept as an inline literal because the Studio can only edit
 * inline composition metadata; `<DurationGuard>` inside `LaunchFilm` throws if
 * this ever drifts from `config.ts`.
 */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── The film ────────────────────────────────────────────────────── */}
      <Composition
        id="LaunchFilm"
        component={LaunchFilm}
        durationInFrames={3480}
        fps={60}
        width={2560}
        height={1440}
      />

      <Folder name="Formats">
        {/* Vertical. Not a crop — scenes read `portrait` from `useStage()` and
            restack: captions centre, type grows, cards widen. */}
        <Composition
          id="LaunchFilm-9x16"
          component={LaunchFilm}
          durationInFrames={3480}
          fps={60}
          width={1080}
          height={1920}
        />
        <Composition
          id="LaunchFilm-1x1"
          component={LaunchFilm}
          durationInFrames={3480}
          fps={60}
          width={1200}
          height={1200}
        />
      </Folder>

      {/* ── Individual acts, for scrubbing and for re-cuts ──────────────── */}
      <Folder name="Scenes">
        <Composition
          id="S01-Mystery"
          component={Scene01Mystery}
          durationInFrames={372}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S02-Problem"
          component={Scene02Problem}
          durationInFrames={690}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S03-Reveal"
          component={Scene03Reveal}
          durationInFrames={636}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S04-Diagnostic"
          component={Scene04Diagnostic}
          durationInFrames={348}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S05-WeakSpots"
          component={Scene05WeakSpots}
          durationInFrames={342}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S06-Practice"
          component={Scene06Practice}
          durationInFrames={360}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S07-Tutor"
          component={Scene07Tutor}
          durationInFrames={342}
          fps={60}
          width={2560}
          height={1440}
        />
        <Composition
          id="S08-Close"
          component={Scene08Cta}
          durationInFrames={595}
          fps={60}
          width={2560}
          height={1440}
        />
      </Folder>
    </>
  );
};
