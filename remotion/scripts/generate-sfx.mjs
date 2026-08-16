/**
 * Generates the film's sound design as WAV files in `src/sfx/`.
 *
 *   node scripts/generate-sfx.mjs
 *
 * Why synthesise rather than use a sound pack: these are all pure texture — a
 * key click, an air movement, a pad. There is no performance to capture, so
 * generated audio is indistinguishable from a library one, and it comes with no
 * licence, no attribution, and exact control over level and length. (Music is
 * the opposite case and should be properly licensed.)
 *
 * Everything is deterministic — the noise uses a seeded PRNG — so re-running
 * this produces byte-identical files and the diff stays empty.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "sfx");

/* ------------------------------------------------------------------ */
/* plumbing                                                            */
/* ------------------------------------------------------------------ */

const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const writeWav = (name, channels) => {
  const numCh = channels.length;
  const n = channels[0].length;
  const blockAlign = numCh * 2;
  const dataSize = n * blockAlign;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numCh, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * blockAlign, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      buf.writeInt16LE(Math.round(s * 32767), o);
      o += 2;
    }
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), buf);
  let peak = 0;
  let sum = 0;
  for (const ch of channels) {
    for (let i = 0; i < n; i++) {
      peak = Math.max(peak, Math.abs(ch[i]));
      sum += ch[i] * ch[i];
    }
  }
  const rms = Math.sqrt(sum / (n * numCh));
  console.log(
    name.padEnd(14),
    (n / SR).toFixed(2) + "s",
    numCh === 2 ? "stereo" : "mono  ",
    "peak " + peak.toFixed(3),
    "rms " + rms.toFixed(4),
    (dataSize / 1048576).toFixed(2) + "MB",
  );
};

/** Normalise to a target peak so the mix levels in Remotion mean something. */
const normalise = (channels, target) => {
  let peak = 0;
  for (const ch of channels)
    for (let i = 0; i < ch.length; i++) peak = Math.max(peak, Math.abs(ch[i]));
  if (peak === 0) return;
  const g = target / peak;
  for (const ch of channels) for (let i = 0; i < ch.length; i++) ch[i] *= g;
};

/** One-pole low pass. `fc` may be a function of sample index for sweeps. */
const lowpass = (buf, fc) => {
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    const f = typeof fc === "function" ? fc(i) : fc;
    const a = 1 - Math.exp((-2 * Math.PI * f) / SR);
    y += a * (buf[i] - y);
    buf[i] = y;
  }
};

/** Raised-cosine attack, so nothing starts on a discontinuity and clicks. */
const attack = (buf, seconds) => {
  const n = Math.min(buf.length, Math.floor(seconds * SR));
  for (let i = 0; i < n; i++) buf[i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / n);
};

/* ------------------------------------------------------------------ */
/* tick — the key click                                                */
/* ------------------------------------------------------------------ */

/**
 * Modelled on the iOS keyboard click: a very short, dry, mid-high "tok". Almost
 * all of the character is in the first 15ms, so the decay constants are tiny.
 */
const tick = () => {
  const rand = mulberry32(0x5eed01);
  const n = Math.floor(0.06 * SR);
  const buf = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const noise = rand() * 2 - 1;
    buf[i] =
      0.55 * noise * Math.exp(-t / 0.0055) +
      0.45 *
        (Math.sin(2 * Math.PI * 1150 * t) * 0.7 +
          Math.sin(2 * Math.PI * 2650 * t) * 0.35) *
        Math.exp(-t / 0.013);
  }
  lowpass(buf, 5200);
  attack(buf, 0.0008);
  normalise([buf], 0.72);
  writeWav("tick.wav", [buf]);
};

/* ------------------------------------------------------------------ */
/* tap — a selection landing                                           */
/* ------------------------------------------------------------------ */

/** Warmer and a touch longer than the tick: this one confirms something. */
const tap = () => {
  const rand = mulberry32(0x5eed02);
  const n = Math.floor(0.16 * SR);
  const buf = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    buf[i] =
      (Math.sin(2 * Math.PI * 680 * t) * 0.6 +
        Math.sin(2 * Math.PI * 1020 * t) * 0.3) *
        Math.exp(-t / 0.038) +
      0.18 * (rand() * 2 - 1) * Math.exp(-t / 0.004);
  }
  lowpass(buf, 6500);
  attack(buf, 0.003);
  normalise([buf], 0.7);
  writeWav("tap.wav", [buf]);
};

/* ------------------------------------------------------------------ */
/* whoosh — the cut                                                    */
/* ------------------------------------------------------------------ */

/**
 * Air moving, not a cinematic swoosh. Noise through a filter sweeping down from
 * 4.2kHz to 500Hz, which is what gives it a sense of something passing rather
 * than something hitting.
 */
const whoosh = () => {
  const rand = mulberry32(0x5eed03);
  const dur = 0.52;
  const n = Math.floor(dur * SR);
  const left = new Float64Array(n);
  const right = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t / dur)), 1.6);
    left[i] = (rand() * 2 - 1) * env;
    right[i] = (rand() * 2 - 1) * env;
  }
  // Decorrelated noise per channel already gives width; the sweep gives motion.
  const sweep = (i) => 4200 * Math.pow(500 / 4200, i / n);
  lowpass(left, sweep);
  lowpass(right, sweep);
  attack(left, 0.01);
  attack(right, 0.01);
  normalise([left, right], 0.6);
  writeWav("whoosh.wav", [left, right]);
};

/* ------------------------------------------------------------------ */
/* reverb — shared by the chime and the pad                            */
/* ------------------------------------------------------------------ */

/**
 * Schroeder reverb: four parallel damped combs into two series allpasses.
 * Crude by modern standards and exactly right for this — it is only ever
 * providing air behind sustained tones, never a transient.
 */
const reverb = (input, { combs, feedback, damping, allpasses, wet }) => {
  const n = input.length;
  const out = new Float64Array(n);
  for (const delay of combs) {
    const line = new Float64Array(delay);
    let idx = 0;
    let store = 0;
    for (let i = 0; i < n; i++) {
      const v = line[idx];
      store = v * (1 - damping) + store * damping;
      line[idx] = input[i] + store * feedback;
      idx = (idx + 1) % delay;
      out[i] += v / combs.length;
    }
  }
  for (const delay of allpasses) {
    const line = new Float64Array(delay);
    let idx = 0;
    for (let i = 0; i < n; i++) {
      const v = line[idx];
      const o = -out[i] + v;
      line[idx] = out[i] + v * 0.5;
      idx = (idx + 1) % delay;
      out[i] = o;
    }
  }
  for (let i = 0; i < n; i++) input[i] = input[i] * (1 - wet) + out[i] * wet;
};

const REVERB_L = {
  combs: [1557, 1617, 1491, 1422],
  feedback: 0.86,
  damping: 0.3,
  allpasses: [225, 556],
  wet: 0.5,
};
const REVERB_R = {
  combs: [1580, 1640, 1514, 1445],
  feedback: 0.86,
  damping: 0.3,
  allpasses: [241, 573],
  wet: 0.5,
};

/* ------------------------------------------------------------------ */
/* chime — the end card                                                */
/* ------------------------------------------------------------------ */

const chime = () => {
  const n = Math.floor(2.0 * SR);
  const left = new Float64Array(n);
  const right = new Float64Array(n);
  const partials = [
    [880, 0.55, 0.5],
    [1320, 0.4, 0.28],
    [1760, 0.3, 0.18],
    [2640, 0.18, 0.09],
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const [f, decay, amp] of partials) {
      v += Math.sin(2 * Math.PI * f * t) * amp * Math.exp(-t / decay);
    }
    left[i] = v;
    right[i] = v;
  }
  attack(left, 0.006);
  attack(right, 0.006);
  reverb(left, REVERB_L);
  reverb(right, REVERB_R);
  normalise([left, right], 0.65);
  writeWav("chime.wav", [left, right]);
};

/* ------------------------------------------------------------------ */
/* ambient — the bed                                                   */
/* ------------------------------------------------------------------ */

/**
 * A slow, wide, unresolved pad — the console-home-screen register. An Asus2/add9
 * stack, so it never commits to major or minor and never asks for a resolution.
 *
 * It is built to loop exactly at 20s:
 *   - every partial frequency is rounded to a multiple of 1/20 Hz, so each one
 *     completes a whole number of cycles;
 *   - every LFO period is 20/n for integer n;
 *   - the reverb is linear and time-invariant, so once its transient has decayed
 *     its output is also 20s-periodic — hence rendering 60s and keeping the last
 *     20s, which is steady state and joins to itself with no seam.
 */
const ambient = () => {
  const LOOP = 20;
  const total = LOOP * 3;
  const n = Math.floor(total * SR);
  const keep = Math.floor(LOOP * SR);

  /** Snap to a multiple of 1/LOOP Hz so the partial closes its cycle. */
  const snap = (f) => Math.round(f * LOOP) / LOOP;

  //        freq,    amp,   lfo n,  depth,  pan
  const partials = [
    [55.0, 0.3, 1, 0.35, 0.0],
    [110.0, 0.26, 3, 0.4, -0.2],
    [164.81, 0.2, 7, 0.45, 0.3],
    [246.94, 0.16, 5, 0.5, -0.35],
    [329.63, 0.12, 9, 0.5, 0.25],
    [440.0, 0.08, 11, 0.6, -0.15],
    [659.25, 0.05, 13, 0.7, 0.4],
    [987.77, 0.03, 17, 0.8, -0.4],
  ];

  const left = new Float64Array(n);
  const right = new Float64Array(n);

  for (const [freqRaw, amp, lfoN, depth, pan] of partials) {
    // Two slightly detuned voices per partial. The beating between them is what
    // stops a stack of sines sounding like a test tone.
    const f1 = snap(freqRaw);
    const f2 = snap(freqRaw * 1.0016);
    const lfoHz = lfoN / LOOP;
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const lfo = 1 - depth + depth * (0.5 + 0.5 * Math.sin(2 * Math.PI * lfoHz * t));
      const v =
        (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t) * 0.8) *
        amp *
        lfo;
      left[i] += v * gl;
      right[i] += v * gr;
    }
  }

  // A single slow breath across the whole bed, once per loop.
  for (let i = 0; i < n; i++) {
    const b = 1 + 0.15 * Math.sin((2 * Math.PI * i) / (LOOP * SR));
    left[i] *= b;
    right[i] *= b;
  }

  lowpass(left, 6000);
  lowpass(right, 6000);
  reverb(left, { ...REVERB_L, wet: 0.42 });
  reverb(right, { ...REVERB_R, wet: 0.42 });

  const l = left.slice(n - keep);
  const r = right.slice(n - keep);
  normalise([l, r], 0.5);
  writeWav("ambient.wav", [l, r]);
};

tick();
tap();
whoosh();
chime();
ambient();
