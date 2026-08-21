#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LIBRARY SFX → CUE-READY WAVS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/build-sfx.mjs
 *
 * Takes the raw Pixabay downloads in `public/audio/pixabay-src/` and writes
 * `public/audio/px-*.wav`, which is what the cue sheet actually plays.
 *
 * ── Why this step exists at all ─────────────────────────────────────────────
 * Library one-shots are mastered to be auditioned in a browser, not to be
 * dropped onto a frame. Measuring the nine files we pulled turned up two
 * problems that would have made the whole sound design feel loose:
 *
 *  1. **Leading silence.** Every file starts with padding before the sound
 *     actually begins — 178ms on the ding, 325ms on one of the keyboards.
 *     At 60fps that is 10 and 20 frames respectively. Our cue sheet places
 *     sounds to the frame against the picture, so a cue that fires 10 frames
 *     late is a cue that visibly does not belong to the thing it is marking.
 *     This is the single biggest reason stock SFX feel "stuck on".
 *
 *  2. **Inconsistent levels.** Peaks ranged from −0.0 to −14.8 dBFS across the
 *     set. Every `volume` number in the cue sheet is tuned against a known
 *     level, so an un-normalised set means every cue has to be re-tuned by ear
 *     one at a time. Normalising to a common peak makes the cue sheet's
 *     existing numbers mean the same thing they meant before.
 *
 * So: trim the head to a fixed 5ms of pre-roll, normalise the peak, and fade
 * the tail so nothing clicks when a `frames` bound cuts it short.
 *
 * The originals in `pixabay-src/` are never modified — re-run this any time.
 *
 * Licence: everything here is Pixabay Content Licence (free for commercial
 * use, no attribution required, modification allowed). Sources are listed in
 * `docs/SFX-SOURCES.md`.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC = join(ROOT, "public", "audio", "pixabay-src");
const OUT = join(ROOT, "public", "audio");
const TMP = join(ROOT, "node_modules", ".cache", "sfx-build");
const SR = 44100;

/** The bundled Remotion compositor ships an ffmpeg; fall back to PATH. */
const findFfmpeg = () => {
  const bundled = join(
    ROOT,
    "node_modules",
    "@remotion",
    "compositor-win32-x64-msvc",
    "ffmpeg.exe",
  );
  return existsSync(bundled) ? bundled : "ffmpeg";
};

/**
 * What each download becomes.
 *
 * ── About `peak`, which is the part that took two passes to get right ───────
 * These targets are NOT uniform, and the reason matters. The first version of
 * this script normalised everything to −3 dBFS, on the theory that a common
 * level makes the cue sheet's `volume` numbers portable. That was exactly
 * backwards: those numbers were tuned against the *synthesised* set, which is
 * much quieter, so a flat −3 dBFS made the glass cues land +16 dB and the
 * clicks +12 dB against the picture. Measured, not guessed — and the logo
 * cluster got so hot that the wordmark chime after it dropped from 14 dB of
 * headroom to 1.5 dB, i.e. the swap buried a cue that had been fine.
 *
 * So each target is set so the cue lands roughly 5 dB above where the
 * synthesised version sat — clearly more present, which is the point, without
 * rewriting every `volume` in the cue sheet or shouting over the film.
 */
const MANIFEST = [
  {
    src: "universfield-soft-interface-click-126517.mp3",
    out: "px-click.wav",
    peak: -10,
    note: "UI clicks — the card press, the 'Good' button",
  },
  {
    src: "virtual_vibes-clean-ding-beep-383726.mp3",
    out: "px-chime.wav",
    // Already landed within a few dB of the synthesised chime at −3, so this
    // one needed no correction.
    peak: -3,
    note: "Confirmations — 78 lands, 82% pass, mastery +7, the wordmark",
  },
  {
    src: "soundshelfstudio-ui-success-chime-513565.mp3",
    out: "px-glass.wav",
    // The worst offender at −3: glass fires ten times, including three times
    // inside the logo cluster, so being hot here compounds.
    peak: -14,
    note: "Glass tones — cards assembling, the tutor panel, the logo mark",
  },
  {
    src: "soundshelfstudio-ui-checkbox-tick-517465.mp3",
    out: "px-tick.wav",
    // Built, but NOT wired into the cue sheet — see the note on the tick cues
    // in cues.ts. Kept here so it is one word away if you disagree.
    peak: -4,
    note: "Light ticks (unused — synth tick is crisper for the deal)",
  },
  {
    src: "soundreality-keyboard-typing-sfx-525007.mp3",
    out: "px-type.wav",
    // A real 20s recording of a mechanical keyboard, 115 keystrokes. Held
    // well below the one-shots because it runs under a whole scene rather
    // than marking one frame.
    peak: -9,
    note: "The tutor's answer streaming — real mechanical keyboard",
  },
];

/* ── WAV I/O ─────────────────────────────────────────────────────────────── */

const readWav = (path) => {
  const b = readFileSync(path);
  const numCh = b.readUInt16LE(22);
  const sampleRate = b.readUInt32LE(24);
  let o = 12;
  let dataOffset = -1;
  let dataSize = 0;
  while (o < b.length - 8) {
    const id = b.toString("ascii", o, o + 4);
    const size = b.readUInt32LE(o + 4);
    if (id === "data") {
      dataOffset = o + 8;
      dataSize = size;
      break;
    }
    o += 8 + size + (size % 2);
  }
  if (dataOffset < 0) throw new Error(`no data chunk in ${path}`);
  const frames = dataSize / (2 * numCh);
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    left[i] = b.readInt16LE(dataOffset + i * numCh * 2) / 32768;
    right[i] =
      numCh > 1 ? b.readInt16LE(dataOffset + (i * numCh + 1) * 2) / 32768 : left[i];
  }
  return { left, right, sampleRate };
};

const writeWav = (path, left, right) => {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
};

/* ── Processing ──────────────────────────────────────────────────────────── */

/** 5ms of pre-roll: enough that the attack is not clipped, short enough to be
 *  inaudible as delay (0.3 of a frame). */
const PREROLL = Math.round(SR * 0.005);

const process1 = ({ src, out, peak, note }) => {
  const wavPath = join(TMP, `${out}.decoded.wav`);
  execFileSync(
    findFfmpeg(),
    ["-hide_banner", "-loglevel", "error", "-i", join(SRC, src),
     "-ac", "2", "-ar", String(SR), "-acodec", "pcm_s16le", wavPath, "-y"],
    { stdio: "pipe" },
  );

  const { left, right } = readWav(wavPath);
  const n = left.length;

  let max = 0;
  for (let i = 0; i < n; i++) {
    max = Math.max(max, Math.abs(left[i]), Math.abs(right[i]));
  }

  // Find the true onset: first sample above 2% of peak, minus the pre-roll.
  const thr = max * 0.02;
  let first = 0;
  while (first < n && Math.abs(left[first]) < thr && Math.abs(right[first]) < thr) {
    first++;
  }
  const start = Math.max(0, first - PREROLL);

  // Trim the tail the same way, keeping the natural decay.
  let last = n - 1;
  while (last > start && Math.abs(left[last]) < thr && Math.abs(right[last]) < thr) {
    last--;
  }
  const end = Math.min(n, last + Math.round(SR * 0.12));

  const gain = Math.pow(10, peak / 20) / (max || 1);
  const len = end - start;
  const outL = new Float32Array(len);
  const outR = new Float32Array(len);
  // 8ms fade-out so a `frames`-bounded cue never ends on a discontinuity.
  const fade = Math.min(Math.round(SR * 0.008), Math.floor(len / 2));
  for (let i = 0; i < len; i++) {
    const f = i > len - fade ? (len - i) / fade : 1;
    outL[i] = left[start + i] * gain * f;
    outR[i] = right[start + i] * gain * f;
  }

  writeWav(join(OUT, out), outL, outR);
  const trimmedMs = (start / SR) * 1000;
  console.log(
    `  ${out.padEnd(15)} ${(len / SR).toFixed(2).padStart(6)}s   ` +
      `head −${trimmedMs.toFixed(0)}ms (${(trimmedMs / 1000 * 60).toFixed(1)} fr)   ${note}`,
  );
};

mkdirSync(TMP, { recursive: true });
console.log("\nBuilding cue-ready SFX →  public/audio/px-*.wav\n");
for (const item of MANIFEST) process1(item);
rmSync(TMP, { recursive: true, force: true });
console.log("\nDone. Wire them up in src/video/audio/cues.ts\n");
