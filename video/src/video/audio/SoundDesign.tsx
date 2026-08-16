import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, interpolate, staticFile } from "remotion";
import { MUSIC, SFX, VO_ENABLED, VO_SLOTS, VO_VOICE } from "./cues";

/**
 * The sound layer. Mounts the bed plus every cue from the sheet, each in its
 * own `<Sequence>` so the Studio timeline shows the SFX as real, draggable
 * clips — the audio is edited in the same place as the picture.
 *
 * Two production details:
 *
 *  · **Ducking.** The bed drops under the two heaviest hits (the Act II stamp
 *    and the Act V closure) via `volume` as a function of frame. Without it the
 *    impacts fight the score instead of punctuating it.
 *  · **Missing files degrade quietly.** If `public/audio/` has not been
 *    generated yet, Remotion will error on a missing asset — so run
 *    `npm run audio` once before previewing. It takes about four seconds and
 *    needs no network.
 */
export const SoundDesign: React.FC = () => {
  return (
    <>
      <Audio
        name="Score — bed"
        src={staticFile(`audio/${MUSIC.src}.${MUSIC.ext}`)}
        // Skips into a longer track so the section you chose lands on frame 0.
        // See the note on MUSIC in cues.ts.
        trimBefore={MUSIC.trimBefore || undefined}
        /**
         * Three moves, and the middle one is the most important thing in the mix.
         *
         *  000–260    THE OPENING FADE. The film starts from nothing and the
         *             score has to start from nothing with it.
         *
         *             This exists because the bed was swapped. `nothing-0`
         *             opened at −39 dB and had real holes between its phrases —
         *             it gave Act I a void for free. `nothing-4` is a warmer,
         *             more continuous take that opens at −31 dB and does not
         *             stop moving, which is why it suits the film better
         *             everywhere *except* the first four seconds, where it
         *             filled a silence that was doing work.
         *
         *             So the void is imposed here instead, the same way the
         *             blackout silence at 972 is imposed rather than composed.
         *             Silent on frame 0, still almost nothing under the first
         *             point of light at 46, and only fully present by 260 —
         *             just before the VO at 152 has finished landing.
         *
         *             A fade cannot restore the old take's gaps between
         *             phrases, and it is not trying to. It restores the one
         *             thing that mattered: the film beginning in silence.
         *  880–960    duck under the NOT YET COMPETENT stamp
         *  972–1200  THE SILENCE, then the swell. A composed score would stop
         *             playing here; a generated track has no idea the picture
         *             went black, so the arrangement is imposed from outside.
         *             Down to 4% over half a second, held through the blackout —
         *             and then back up as a *ramp*, not a step.
         *
         *             The release used to be a single jump from 4% to 100% in
         *             22 frames, and it read as the sound cutting out and a
         *             different track starting. It now climbs 4% → 34% → 82%
         *             across 1120–1167 and only reaches full at 1200, so the
         *             music swells up under the road and arrives *with* the
         *             impact rather than being switched on by it.
         *
         *             This is the reveal. Without it the road rushes the lens
         *             over music that never stopped, and the act lands as a
         *             continuation rather than as an arrival.
         *  1560–2700  THE ACT IV SHELF. The score steps back to 68% for the
         *             whole feature act and stays there.
         *
         *             This is a musical decision, not a rescue. The delicate
         *             cues in Act IV were *not* actually being masked — see the
         *             measurement warning on MUSIC.volume in cues.ts — but the
         *             score has said its piece by the time the product appears,
         *             and holding it at full level through the feature act
         *             means the film keeps talking over its own demo. Act IV is
         *             the product's act, so the product is what you hear.
         *  2722–2868  deeper still (50%) under the tutor's typing — the
         *             keyboard is a texture, not a hit, and needs more room
         *             than a one-shot does. This one *is* a masking fix: the
         *             typing is broadband and does compete with the bed.
         *  3040–3135  duck under the closure hit
         *  3135–3225  held down through the logo cluster, so the mark drawing
         *             and the wordmark settling get the last word.
         */
        volume={(f) =>
          MUSIC.volume *
          interpolate(
            f,
            [0, 46, 150, 260, 880, 914, 960, 972, 1000, 1120, 1148, 1167, 1200, 1560, 1620, 2700, 2722, 2868, 2900, 3040, 3085, 3135, 3225, 3320],
            [0, 0.1, 0.48, 1, 1, 0.55, 1, 1, 0.04, 0.04, 0.34, 0.82, 1, 1, 0.68, 0.68, 0.5, 0.5, 0.72, 0.72, 0.42, 0.6, 0.6, 0.95],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      {SFX.map((cue, i) => (
        <Sequence
          key={`${cue.src}-${cue.at}-${i}`}
          from={cue.at}
          durationInFrames={cue.frames}
          name={`SFX · ${cue.note}`}
          layout="none"
        >
          <Audio
            src={staticFile(`audio/${cue.src}.${cue.ext ?? "wav"}`)}
            // A constant, deliberately. `@remotion/volume-callback` wants a
            // frame callback, which is right for anything that changes over
            // time — the bed above does exactly that — but every one of these
            // is a one-shot played at a fixed level. A closure per cue per
            // frame would buy nothing.
            // eslint-disable-next-line @remotion/volume-callback
            volume={cue.volume}
            playbackRate={cue.rate ?? 1}
          />
        </Sequence>
      ))}

      {/* Voice-over slots. Off by default — the film is cut to read silent. */}
      {VO_ENABLED
        ? VO_SLOTS.map((slot) => (
            <Sequence
              key={slot.id}
              from={slot.at}
              durationInFrames={slot.maxFrames}
              name={`VO · ${slot.line}`}
              layout="none"
            >
              {/* One folder per voice — see `VO_VOICE` in cues.ts. .mp3 because
                  that is what ElevenLabs returns from `generate-vo.mjs`; if you
                  record a real session instead, export mp3 or change this. */}
              <Audio
                src={staticFile(`audio/vo/${VO_VOICE}/${slot.id}.mp3`)}
                volume={0.9}
              />
            </Sequence>
          ))
        : null}
    </>
  );
};
