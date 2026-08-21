import ambient from "./sfx/ambient.wav";
import chime from "./sfx/chime.wav";
import tap from "./sfx/tap.wav";
import tick from "./sfx/tick.wav";
import whoosh from "./sfx/whoosh.wav";

/**
 * Sound design. Regenerate with `node scripts/generate-sfx.mjs`.
 *
 * `tick`   — key click. Fires per word as the tutor's answer streams in.
 * `tap`    — a selection landing: the right answer, a grade, a yard-test check.
 * `whoosh` — air moving on a cut. Plays once at the top of every beat.
 * `chime`  — the end card resolving.
 * `ambient`— a 20s seamless pad under the whole film.
 */
export const SFX = { ambient, chime, tap, tick, whoosh };

/**
 * Mix levels, linear, applied to sources normalised to the peaks set in
 * "scripts/generate-sfx.mjs". Chosen so the bed sits around -21 dBFS and the
 * loudest one-shot peaks near -6 — quiet enough to stay underneath the picture,
 * loud enough to actually hear on a phone.
 *
 * The first version of these was roughly 20dB lower and inaudible. Do not trust
 * a level you have not measured: "npm run check:audio" renders the audio track
 * on its own and fails if it is silent, clipping, or too quiet.
 */
export const LEVEL = {
  ambient: 0.55,
  whoosh: 0.45,
  tick: 0.4,
  tap: 0.62,
  chime: 0.72,
} as const;
