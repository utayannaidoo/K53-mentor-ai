#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SYNTHESISED SCORE + SFX
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/synth-audio.mjs
 *
 * Writes `public/audio/*.wav`. Pure Node — no dependencies, no network, no
 * licensing. Everything is generated from first principles here: additive
 * synthesis, ADSR envelopes, filtered noise and a small multi-tap reverb.
 *
 * ── What this is, honestly ──────────────────────────────────────────────────
 * This is a *temp score*, arranged to the frame against `src/video/config.ts`.
 * It is real audio, it is in key, it hits on the beat and it lands every cue in
 * `docs/SFX-TIMELINE.md`. It is not a composer. When you commission the final
 * track, the cue sheet is already written and the edit will not need to change
 * by a single frame — swap `bed.wav` and keep everything else.
 *
 * ── The arrangement ─────────────────────────────────────────────────────────
 * A minor, 120 BPM, 60 fps → 1 beat = 0.5s = 30 frames.
 *
 *   0:00  Act I      a 55 Hz drone and almost nothing else
 *   0:06  Act II     a sub pulse on every beat, a minor 2nd grinding above it,
 *                    noise rising — tension by accumulation, not by volume
 *   0:16  SILENCE    everything ducks to −34 dB for ~1.1s. The most important
 *                    bar in the score is the one with nothing in it.
 *   0:17  riser      a 30→70 Hz sub sweep under a noise rise
 *   0:19  THE DROP   full A-minor stack, sub, the film's centre of gravity
 *   0:27  Act IV     steady bed, arpeggio on the beat, room to hear the SFX
 *   0:48  build      the last ascent
 *   0:51  CLOSURE    the peak, on the frame the ring closes
 *   0:52  resolve    a Picardy third — the A minor turns major on the payoff
 *   0:58  out
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "audio");
const SR = 44100;

/* ── WAV container ───────────────────────────────────────────────────────── */

const writeWav = (name, left, right) => {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(2, 22); // stereo
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);

  for (let i = 0; i < n; i++) {
    // Soft-clip rather than hard-limit: tanh keeps transients loud without the
    // crackle a hard clamp puts on every impact.
    const l = Math.tanh(left[i] * 1.05);
    const r = Math.tanh(right[i] * 1.05);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(l * 32767))), 44 + i * 4);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(r * 32767))), 46 + i * 4);
  }

  writeFileSync(join(OUT, name), buf);
  const secs = (n / SR).toFixed(2);
  const mb = (buf.length / 1048576).toFixed(2);
  console.log(`  ${name.padEnd(22)} ${secs.padStart(6)}s  ${mb.padStart(6)} MB`);
};

/* ── Primitives ──────────────────────────────────────────────────────────── */

const TAU = Math.PI * 2;

/** Linear breakpoint envelope: `[[time, value], …]`. */
const env = (points, t) => {
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (t <= points[i][0]) {
      const [t0, v0] = points[i - 1];
      const [t1, v1] = points[i];
      const k = t1 === t0 ? 1 : (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * k;
    }
  }
  return points[points.length - 1][1];
};

/** Exponential decay — the shape of anything struck. */
const decay = (t, tau) => (t < 0 ? 0 : Math.exp(-t / tau));

/** Deterministic noise, so re-running the script produces identical files. */
let seed = 0x2f6e2b1;
const noise = () => {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 0xffffffff) * 2 - 1;
};

/** One-pole low-pass. `c` in (0,1]; lower = darker. */
const makeLowpass = () => {
  let z = 0;
  return (x, c) => {
    z += c * (x - z);
    return z;
  };
};

/** One-pole high-pass, built from the low-pass. */
const makeHighpass = () => {
  const lp = makeLowpass();
  return (x, c) => x - lp(x, c);
};

/**
 * Four fixed taps at prime-ish delays plus feedback. Not a convolution reverb,
 * but enough to stop every hit sounding like it happened inside the speaker.
 */
const reverb = (input, { mix = 0.3, decayAmt = 0.42 } = {}) => {
  const taps = [0.031, 0.0517, 0.0873, 0.1291].map((s) => Math.round(s * SR));
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let wet = 0;
    for (let t = 0; t < taps.length; t++) {
      const j = i - taps[t];
      if (j >= 0) wet += out[j] * decayAmt * (1 - t * 0.16);
    }
    out[i] = input[i] + wet * 0.34;
  }
  const res = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) res[i] = input[i] * (1 - mix) + out[i] * mix;
  return res;
};

/** Haas-style widening: a few ms of delay and a touch of detune on the right. */
const widen = (mono, ms = 11) => {
  const d = Math.round((ms / 1000) * SR);
  const l = new Float32Array(mono.length);
  const r = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) {
    l[i] = mono[i];
    r[i] = i >= d ? mono[i - d] * 0.94 : 0;
  }
  return [l, r];
};

const mono = (seconds) => new Float32Array(Math.round(seconds * SR));

/* ═══════════════════════════════════════════════════════════════════════════
 * THE SCORE
 * ═══════════════════════════════════════════════════════════════════════════ */

// A minor. Sub is A1; the stack is A2 / C4 / E4, with the Picardy C#4 held back
// for the final resolve.
const A1 = 55, A2 = 110, C4 = 261.63, E4 = 329.63, A4 = 440, Cs4 = 277.18, Bb3 = 233.08;
const BEAT = 0.5; // 120 BPM
const DURATION = 58.4;

const buildBed = () => {
  const buf = mono(DURATION);
  const lpDrone = makeLowpass();
  const lpNoise = makeLowpass();
  const hpAir = makeHighpass();

  // ── Section gains. Every breakpoint below is a frame in config.ts. ──────
  // Act I swell · Act II tension · the duck at 16.37s · the drop at 19.45s ·
  // Act IV bed · the build · CLOSURE at 51.42s · resolve · out.
  const gDrone = [[0, 0], [1.2, 0.5], [6, 0.62], [16.2, 0.72], [16.5, 0.05], [17.5, 0.05], [19.45, 1], [27, 0.82], [48, 0.9], [51.42, 1], [54, 0.72], [58.2, 0]];
  const gTense = [[5.9, 0], [8, 0.18], [13, 0.42], [16.2, 0.62], [16.5, 0.02], [17.4, 0], [58.4, 0]];
  const gStack = [[16.4, 0], [19.4, 0], [19.45, 0.9], [21, 0.72], [27, 0.5], [48, 0.62], [51.42, 0.95], [53, 0.6], [56.5, 0.3], [58.2, 0]];
  const gArp = [[26.8, 0], [27.6, 0.34], [46, 0.34], [48.5, 0.2], [51.4, 0], [58.4, 0]];
  const gPulse = [[5.9, 0], [7, 0.3], [16.2, 0.75], [16.45, 0], [19.45, 0.7], [27, 0.5], [47, 0.6], [51.42, 0.9], [52.5, 0], [58.4, 0]];
  const gAir = [[0, 0], [3, 0.12], [16.3, 0.2], [16.5, 0.01], [19.45, 0.26], [50, 0.3], [58.2, 0]];
  const gRiser = [[17.4, 0], [17.6, 0.3], [19.35, 0.85], [19.5, 0], [58.4, 0]];

  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    let s = 0;

    // Sub drone. Two oscillators a hair apart so it beats slowly and never
    // sits perfectly still.
    const dr =
      Math.sin(TAU * A1 * t) * 0.55 +
      Math.sin(TAU * (A1 * 1.004) * t) * 0.34 +
      Math.sin(TAU * A2 * t) * 0.2;
    // Filter opens as the film builds — the cheapest way to say "rising".
    s += lpDrone(dr, 0.02 + env(gDrone, t) * 0.1) * env(gDrone, t) * 0.5;

    // The minor 2nd. Dissonant on purpose; it is the anxiety in Act II.
    s +=
      (Math.sin(TAU * Bb3 * t) * 0.4 + Math.sin(TAU * (Bb3 * 2.002) * t) * 0.16) *
      env(gTense, t) *
      0.13;

    // The chord. After 52.4s the C natural crossfades to C# — the minor turns
    // major exactly under "Pass first time."
    const picardy = Math.max(0, Math.min(1, (t - 52.4) / 1.6));
    s +=
      (Math.sin(TAU * A2 * t) * 0.4 +
        Math.sin(TAU * C4 * t) * 0.26 * (1 - picardy) +
        Math.sin(TAU * Cs4 * t) * 0.26 * picardy +
        Math.sin(TAU * E4 * t) * 0.22 +
        Math.sin(TAU * A4 * t) * 0.1) *
      env(gStack, t) *
      0.2;

    // Sub pulse on the beat. Pitch-drops 62→44 Hz over 90ms, like a kick.
    const beatPos = t % BEAT;
    s +=
      Math.sin(TAU * (44 + 18 * decay(beatPos, 0.03)) * t) *
      decay(beatPos, 0.085) *
      env(gPulse, t) *
      0.5;

    // Arpeggio through the feature act — one note per beat, A C E A.
    const step = Math.floor(t / BEAT) % 4;
    const arpF = [A2 * 2, C4, E4, A4][step];
    s += Math.sin(TAU * arpF * t) * decay(beatPos, 0.13) * env(gArp, t) * 0.09;

    // Air. Filtered noise, the top of the mix.
    s += hpAir(noise(), 0.55) * env(gAir, t) * 0.02;

    // The riser into the drop: a sub sweep plus a noise rise.
    if (t > 17.3 && t < 19.6) {
      const k = Math.max(0, Math.min(1, (t - 17.5) / 1.95));
      s += Math.sin(TAU * (30 + k * k * 46) * t) * env(gRiser, t) * 0.42;
      s += lpNoise(noise(), 0.05 + k * 0.5) * env(gRiser, t) * 0.12;
    }

    buf[i] = s;
  }

  return widen(reverb(buf, { mix: 0.26, decayAmt: 0.4 }), 13);
};

/* ═══════════════════════════════════════════════════════════════════════════
 * SFX
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Cinematic impact: a pitched sub drop, a body, and a transient. */
const impact = (weight = 1, len = 2.6) => {
  const buf = mono(len);
  const lp = makeLowpass();
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const sub = Math.sin(TAU * (58 + 96 * decay(t, 0.045)) * t) * decay(t, 0.5 * weight);
    const body = Math.sin(TAU * (110 + 60 * decay(t, 0.08)) * t) * decay(t, 0.24) * 0.5;
    const crack = lp(noise(), 0.85) * decay(t, 0.018) * 0.55;
    buf[i] = (sub * 0.95 + body + crack) * weight;
  }
  return widen(reverb(buf, { mix: 0.34, decayAmt: 0.5 }), 9);
};

/** Air moving past the lens. Band-passed noise with a swept centre. */
const whoosh = (len = 0.8, rise = true) => {
  const buf = mono(len);
  const lp = makeLowpass();
  const hp = makeHighpass();
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const k = t / len;
    const sweep = rise ? 0.05 + k * 0.75 : 0.8 - k * 0.75;
    const shape = Math.sin(Math.PI * Math.min(1, k)) ** 1.5;
    buf[i] = hp(lp(noise(), sweep), 0.1) * shape * 0.75;
  }
  return widen(reverb(buf, { mix: 0.3, decayAmt: 0.38 }), 15);
};

/** Reverse riser — built forwards, then played backwards. */
const reverseRiser = (len = 2.2) => {
  const fwd = mono(len);
  const lp = makeLowpass();
  for (let i = 0; i < fwd.length; i++) {
    const t = i / SR;
    const k = t / len;
    fwd[i] =
      (lp(noise(), 0.08 + k * 0.6) * 0.6 + Math.sin(TAU * (180 + k * 900) * t) * 0.25) *
      (1 - k) ** 0.6;
  }
  const rev = new Float32Array(fwd.length);
  for (let i = 0; i < fwd.length; i++) rev[i] = fwd[fwd.length - 1 - i];
  return widen(reverb(rev, { mix: 0.3, decayAmt: 0.44 }), 17);
};

/** UI click — a tight filtered transient with a hint of pitch. */
const click = (pitch = 2100, len = 0.13) => {
  const buf = mono(len);
  const hp = makeHighpass();
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    buf[i] =
      (hp(noise(), 0.72) * 0.5 + Math.sin(TAU * pitch * t) * 0.5) * decay(t, 0.011) * 0.7;
  }
  return widen(reverb(buf, { mix: 0.16, decayAmt: 0.28 }), 5);
};

/** Glass: a struck partial stack with a long, clean tail. */
const glass = (root = 1480, len = 2.0, gain = 0.5) => {
  const buf = mono(len);
  // Inharmonic ratios — a real struck glass is not a harmonic series.
  const partials = [1, 2.41, 3.86, 5.44, 7.12];
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    let s = 0;
    for (let p = 0; p < partials.length; p++) {
      s += Math.sin(TAU * root * partials[p] * t) * decay(t, 0.55 / (p * 0.7 + 1));
    }
    buf[i] = (s / partials.length) * gain;
  }
  return widen(reverb(buf, { mix: 0.42, decayAmt: 0.52 }), 19);
};

/** A rising tone — used while the score ring writes itself. */
const riseTone = (len = 1.5, from = 320, to = 900) => {
  const buf = mono(len);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const k = t / len;
    const f = from + (to - from) * k * k;
    buf[i] =
      (Math.sin(TAU * f * t) * 0.5 + Math.sin(TAU * f * 2 * t) * 0.15) *
      Math.sin(Math.PI * k) *
      0.4;
  }
  return widen(reverb(buf, { mix: 0.34, decayAmt: 0.44 }), 12);
};

/** Glass breaking, for the Act II fracture. */
const shatter = (len = 1.6) => {
  const buf = mono(len);
  const hp = makeHighpass();
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    // Sixteen shards, each a short high transient at its own onset.
    let s = 0;
    for (let g = 0; g < 16; g++) {
      const onset = (g * 0.0173) % 0.42;
      const d = t - onset;
      if (d > 0) s += Math.sin(TAU * (2400 + g * 430) * d) * decay(d, 0.035 + g * 0.004);
    }
    buf[i] = (s / 7 + hp(noise(), 0.8) * decay(t, 0.14) * 0.5) * 0.55;
  }
  return widen(reverb(buf, { mix: 0.4, decayAmt: 0.5 }), 21);
};

/** Confirmation chime — a clean perfect fifth, no ornament. */
const chime = (len = 1.8) => {
  const buf = mono(len);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    buf[i] =
      (Math.sin(TAU * A4 * t) * 0.5 + Math.sin(TAU * (A4 * 1.5) * t) * 0.32 +
        Math.sin(TAU * (A4 * 2) * t) * 0.14) *
      decay(t, 0.42) *
      0.42;
  }
  return widen(reverb(buf, { mix: 0.44, decayAmt: 0.5 }), 15);
};

/**
 * Keystrokes for the tutor stream. Loopable, irregular by design.
 *
 * Each stroke is two layered transients, the way a real mechanical switch
 * reads: a bright highpassed "snap" (the leaf-spring click) plus a short
 * low-mid "thock" (the housing resonance under it). The original single
 * 6ms noise burst had no body below ~2kHz, so at any sane mix volume it
 * disappeared under the score. This one carries enough low end to cut
 * through instead of needing to be turned up until it clips.
 */
const typeLoop = (len = 3.0) => {
  const buf = mono(len);
  const hpClick = makeHighpass();
  const strokes = [];
  for (let t = 0; t < len; t += 0.052 + (Math.abs(noise()) * 0.04)) strokes.push(t);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    let env = 0;
    let body = 0;
    for (const onset of strokes) {
      const d = t - onset;
      if (d > 0 && d < 0.1) {
        env += decay(d, 0.009);
        const thockHz = 340 + ((onset * 977) % 130);
        body += Math.sin(TAU * thockHz * d) * decay(d, 0.024);
      }
    }
    const snap = hpClick(noise() * env, 0.82);
    buf[i] = snap * 1.5 + body * 0.6;
  }
  return widen(reverb(buf, { mix: 0.12, decayAmt: 0.22 }), 6);
};

/* ═══════════════════════════════════════════════════════════════════════════ */

mkdirSync(OUT, { recursive: true });
console.log("\nSynthesising K53 launch film audio →  public/audio/\n");

writeWav("bed.wav", ...buildBed());
writeWav("impact.wav", ...impact(1, 2.8));
writeWav("impact-soft.wav", ...impact(0.5, 1.6));
writeWav("impact-huge.wav", ...impact(1.35, 3.6));
writeWav("whoosh.wav", ...whoosh(0.85, true));
writeWav("whoosh-short.wav", ...whoosh(0.4, true));
writeWav("whoosh-down.wav", ...whoosh(0.7, false));
writeWav("riser-reverse.wav", ...reverseRiser(2.2));
writeWav("click.wav", ...click(2100, 0.13));
writeWav("tick.wav", ...click(3400, 0.08));
writeWav("glass.wav", ...glass(1480, 2.0, 0.5));
writeWav("glass-soft.wav", ...glass(2100, 1.4, 0.3));
writeWav("rise-tone.wav", ...riseTone(1.6, 300, 940));
writeWav("shatter.wav", ...shatter(1.6));
writeWav("chime.wav", ...chime(1.8));
writeWav("type.wav", ...typeLoop(3.0));

console.log("\nDone. Cue sheet: docs/SFX-TIMELINE.md\n");
