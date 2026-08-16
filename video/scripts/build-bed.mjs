#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BED ASSEMBLY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/build-bed.mjs seamless    # one source, one hidden splice
 *   node scripts/build-bed.mjs blend       # all four sources
 *   node scripts/build-bed.mjs both
 *
 * Cuts a 58-second score out of the Suno generations in `music-src/` and writes
 * `public/audio/bed-<name>.wav`.
 *
 * ── Where the joins go, and why that matters more than which take you use ───
 * Splicing unrelated AI generations is where this normally falls apart: two
 * takes are in different keys at different tempos, so a butt-join sounds like a
 * mixtape rather than a score, however good either half is.
 *
 * Two things fix it, and both are film editing rather than audio engineering:
 *
 *  1. **Put every join where the picture already changes.** The film is fully
 *     black and silent from 0:16.3 to 0:19.2, and every act boundary carries a
 *     dissolve and a whoosh. A key change under a blackout is inaudible; the
 *     same change over a held shot is glaring.
 *  2. **Crossfade long enough to read as a transition, short enough not to
 *     smear** — 1.5s. Under 0.5s you hear the cut; over 3s you hear both keys
 *     at once.
 *
 * `seamless` takes both halves from the same generation, so there is no key
 * change at all — the join is a jump in *energy*, not tonality, and it lands on
 * the reveal. `blend` uses all four as asked; the joins are hidden, but a
 * trained ear may still catch the tonal shifts.
 *
 * ── Why the DSP is in Node ──────────────────────────────────────────────────
 * Remotion's bundled ffmpeg is a minimal build with no `afade` and no
 * `acrossfade`. Rather than make the project depend on a system ffmpeg install,
 * ffmpeg is used only to decode — which that build does fine — and the fades,
 * crossfades, normalisation and limiting are done here on the samples.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC = join(ROOT, "music-src");
const OUT = join(ROOT, "public", "audio");

const SR = 48000;
const CH = 2;
const TOTAL = 58.0; // seconds — must match the composition
const XF = 2.5; // crossfade seconds — see the note on EDITS
const TAIL_FADE = 3.5; // the film ends on nothing

const S = {
  night: join(SRC, "the-longest-night.mp3"),
  n0: join(SRC, "nothing-0.mp3"),
  n1: join(SRC, "nothing-1.mp3"),
  n2: join(SRC, "nothing-2.mp3"),
  n4: join(SRC, "nothing-4.mp3"),
};

/**
 * Film landmarks, in seconds, from `docs/TIMING-SHEET.md`:
 *   16.3–19.2  the silence — black frame, no SFX. The safest join in the film.
 *   19.45      THE DROP
 *   32.2       weak-spots boundary (light wipe + whoosh)
 *   48.1       close boundary (blur dissolve)
 *
 * Segment `dur` values overlap by XF at each join; the assembler accounts for it.
 */
const EDITS = {
  /**
   * One generation, two sections, no key change anywhere.
   *
   * `nothing-0` is the only take that opens at −31 dB, which is exactly what
   * Act I needs, and its 2:56 region is its loudest sustained passage, which is
   * what the reveal needs. Jumping between them at 19s puts a real step up in
   * energy precisely on the drop.
   */
  seamless: [
    // The join is at 16.5s, not 19s.
    //
    // At 19s it landed exactly where the mix releases the duck, so the new
    // material arrived at the same instant the volume came back — and it read as
    // the sound cutting out and a different track starting. Moving it to 16.5s
    // puts the whole crossfade *inside* the ducked blackout, at 4% volume, where
    // it is inaudible. By the time the volume swells back for the drop the new
    // section is already established, so the release reveals music that was
    // always there. The crossfade is also 2.5s rather than 1.5s.
    { src: S.n0, in: 0, dur: 19.0, note: "0:00 near-silence → build   (Act I + II)" },
    { src: S.n0, in: 174, dur: 42.0, note: "2:54 loudest passage        (reveal → close)" },
  ],

  /**
   * `nothing-4`, three sections, one generation.
   *
   * This take does not have `nothing-0`'s −31 dB opening — it starts at −25 dB
   * and is already moving by 0:04 — so Act I is less of a void than it was.
   * What it has instead is a much better *back half*: a genuinely loud
   * sustained passage at 0:50–1:22 and its true peak at 2:12–2:26, which is
   * the material the close was always short of.
   *
   * Three sections rather than two because this take's loud material is not
   * contiguous — there is a dip at 0:48 and a breakdown from 1:24 — so a single
   * 42-second pull would have run straight through a hole. Both joins sit where
   * the picture already changes:
   *
   *   16.5s  inside the ducked blackout, at 4% volume — inaudible
   *   48.1s  the close boundary, on the blur dissolve
   *
   * Same generation throughout, so neither join carries a key change.
   */
  nothing4: [
    { src: S.n4, in: 0, dur: 19.0, note: "0:00 build from −25 dB      (Act I + II)" },
    { src: S.n4, in: 50, dur: 34.1, note: "0:50 sustained −13 dB       (reveal → feature act)" },
    { src: S.n4, in: 132, dur: 13.0, note: "2:12 loudest passage        (the close)" },
  ],

  /** All four, joined only where the picture already covers the change. */
  blend: [
    { src: S.n0, in: 0, dur: 19.0, note: "0:00 near-silence → build   (Act I + II)" },
    { src: S.night, in: 202, dur: 17.2, note: "3:22 biggest section        (the reveal)" },
    { src: S.n1, in: 107, dur: 18.4, note: "1:47 peak region            (feature act)" },
    { src: S.n2, in: 53, dur: 13.0, note: "0:53 peak                   (the close)" },
  ],
};

/* ── WAV ─────────────────────────────────────────────────────────────────── */

const decode = (file, inPoint, dur) => {
  const tmp = mkdtempSync(join(tmpdir(), "bed-"));
  const wav = join(tmp, "s.wav");
  execFileSync(
    "npx",
    [
      "remotion", "ffmpeg", "-y",
      "-ss", String(inPoint), "-t", String(dur),
      "-i", `"${file}"`,
      "-ac", String(CH), "-ar", String(SR),
      "-f", "wav", `"${wav}"`,
    ],
    { stdio: ["ignore", "ignore", "ignore"], shell: true },
  );

  const buf = readFileSync(wav);
  // Walk the chunks rather than assuming a 44-byte header — ffmpeg emits a
  // LIST/INFO chunk before `data` often enough that a fixed offset shears the
  // first fraction of a second off every segment.
  let p = 12;
  let start = -1;
  let size = 0;
  while (p + 8 <= buf.length) {
    const id = buf.toString("ascii", p, p + 4);
    const len = buf.readUInt32LE(p + 4);
    if (id === "data") {
      start = p + 8;
      size = Math.min(len, buf.length - start);
      break;
    }
    p += 8 + len + (len % 2);
  }
  if (start < 0) throw new Error(`No data chunk in decode of ${file}`);

  const n = Math.floor(size / 2);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(start + i * 2) / 32768;

  rmSync(tmp, { recursive: true, force: true });
  return out; // interleaved stereo
};

const writeWav = (path, data) => {
  const frames = data.length / CH;
  const bytes = data.length * 2;
  const buf = Buffer.alloc(44 + bytes);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + bytes, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(CH, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * CH * 2, 28);
  buf.writeUInt16LE(CH * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(bytes, 40);
  for (let i = 0; i < data.length; i++) {
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(data[i] * 32767))), 44 + i * 2);
  }
  writeFileSync(path, buf);
  return frames / SR;
};

/* ── Assembly ────────────────────────────────────────────────────────────── */

const build = (name) => {
  const edit = EDITS[name];
  if (!edit) {
    console.error(`\nUnknown edit "${name}". Try: ${Object.keys(EDITS).join(", ")}, both\n`);
    process.exit(1);
  }
  for (const s of edit) {
    if (!existsSync(s.src)) {
      console.error(`\nMissing source: ${s.src}\n`);
      process.exit(1);
    }
  }

  console.log(`\n  ${name}`);

  const xfSamples = Math.round(XF * SR) * CH;
  const totalSamples = Math.round(TOTAL * SR) * CH;
  const mix = new Float32Array(totalSamples);

  let cursor = 0; // interleaved sample index where the next segment starts
  edit.forEach((seg, idx) => {
    const pcm = decode(seg.src, seg.in, seg.dur);
    const mm = Math.floor(seg.in / 60);
    const ss = String(Math.floor(seg.in % 60)).padStart(2, "0");
    console.log(
      `    film ${(cursor / CH / SR).toFixed(1).padStart(5)}s   from ${mm}:${ss}   ${seg.note}`,
    );

    for (let i = 0; i < pcm.length; i++) {
      const at = cursor + i;
      if (at >= totalSamples) break;

      let g = 1;
      // Equal-power (sqrt) crossfade rather than linear. Linear dips ~3 dB in
      // the middle of the overlap, which on a sustained pad is an audible hole
      // exactly where you are trying to hide the join.
      if (idx > 0 && i < xfSamples) g = Math.sqrt(i / xfSamples);
      if (idx < edit.length - 1 && i >= pcm.length - xfSamples) {
        g = Math.sqrt(Math.max(0, (pcm.length - i) / xfSamples));
      }
      mix[at] += pcm[i] * g;
    }

    cursor += pcm.length - xfSamples;
  });

  // Normalise to a consistent perceived level. Suno masters each generation
  // differently, so without this the joins jump in loudness even when they do
  // not jump in key. RMS-based, with a soft-clip ceiling so transients survive.
  let sum = 0;
  for (let i = 0; i < mix.length; i++) sum += mix[i] * mix[i];
  const rms = Math.sqrt(sum / mix.length);
  const TARGET_RMS = 0.1; // ≈ −20 dBFS, leaves room for VO and impacts on top
  const gain = rms > 1e-6 ? TARGET_RMS / rms : 1;

  const fadeStart = Math.round((TOTAL - TAIL_FADE) * SR) * CH;
  const fadeLen = totalSamples - fadeStart;
  let peak = 0;

  for (let i = 0; i < mix.length; i++) {
    let v = mix[i] * gain;
    if (i >= fadeStart) {
      const k = 1 - (i - fadeStart) / fadeLen;
      v *= k * k; // squared = a natural-sounding decay rather than a linear ramp
    }
    v = Math.tanh(v * 1.08); // soft ceiling
    mix[i] = v;
    const a = Math.abs(v);
    if (a > peak) peak = a;
  }

  mkdirSync(OUT, { recursive: true });
  const out = join(OUT, `bed-${name}.wav`);
  const secs = writeWav(out, mix);
  console.log(
    `    → public/audio/bed-${name}.wav   ${secs.toFixed(1)}s   ` +
      `RMS ${(20 * Math.log10(TARGET_RMS)).toFixed(0)} dB   peak ${(20 * Math.log10(peak)).toFixed(1)} dB\n`,
  );
};

const which = process.argv[2] ?? "both";
for (const n of which === "both" ? Object.keys(EDITS) : [which]) build(n);
