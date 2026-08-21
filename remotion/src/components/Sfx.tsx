import React from "react";
import { Audio, interpolate, Sequence, useVideoConfig } from "remotion";
import { LEVEL, SFX } from "../audio";

/**
 * NOTE — use `<Audio>` from `remotion`, NOT from `@remotion/media`.
 *
 * The `@remotion/media` version renders a valid, correctly tagged, completely
 * SILENT audio track in this project. It throws nothing and the output file
 * still reports an AAC stream, so the failure is invisible unless you decode
 * the samples. Verified by bisect: media/staticFile and media/import are both
 * silent; core/staticFile and core/import both produce signal.
 *
 * `npm run check:audio` exists to catch a regression here.
 */

/**
 * A one-shot, fired at a frame within the current scene.
 *
 * `<Audio>` has no `from` prop — it starts wherever its enclosing sequence
 * starts — so the delay is expressed as a headless `<Sequence>`. Because scene
 * clocks restart at zero, `at` is the same number the visual animation uses,
 * which is what keeps a sound and the thing it belongs to from drifting apart
 * when a beat is re-timed.
 */
export const Sfx: React.FC<{
  src: string;
  /** Frame within the current scene. Rounded — sequences start on whole frames. */
  at?: number;
  volume: number;
}> = ({ src, at = 0, volume }) => (
  <Sequence from={Math.round(at)} layout="none" name="sfx">
    <Audio src={src} volume={volume} />
  </Sequence>
);

/**
 * The pad under the whole film. 20 seconds, looped, faded at both ends.
 *
 * `loopVolumeCurveBehavior="extend"` is load-bearing: the default restarts the
 * volume curve on every repeat, so the fade-out would fire three times instead
 * of once at the end.
 */
export const AmbientBed: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <Audio
      src={SFX.ambient}
      loop
      loopVolumeCurveBehavior="extend"
      volume={(f) =>
        interpolate(
          f,
          [0, 45, durationInFrames - 70, durationInFrames - 1],
          [0, LEVEL.ambient, LEVEL.ambient, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
};
