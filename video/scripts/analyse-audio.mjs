#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRACK ANALYSIS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/analyse-audio.mjs "path/to/a.mp3" "path/to/b.mp3" …
 *
 * Prints a loudness envelope and a spectral-brightness curve for each file, and
 * picks out the sections this film needs: the quietest sustained passage, the
 * steepest build, and the loudest peak.
 *
 * ── Why measure instead of listen ───────────────────────────────────────────
 * The edit is already locked to a dynamic shape — near-silence at 0:00, a
 * collapse at 0:16, a lift at 0:19, a resolve at 0:52. Finding those four
 * moments in a source track is a measurement problem, not a taste problem, and
 * measurement gets it frame-accurate where an ear gets it within half a second.
 *
 * Taste still decides *which* candidate sounds best — that part needs ears. This
 * narrows four multi-minute tracks down to a handful of specific timestamps
 * worth listening to.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

/** Remotion ships ffmpeg, so there is nothing to install. */
const ffmpeg = (args) =>
  execFileSync("npx", ["remotion", "ffmpeg", ...args], {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "buffer",
    shell: true,
  });

const SR = 8000; // plenty for an envelope, and fast to decode
const WINDOW = 0.25; // seconds per measurement

const analyse = (file) => {
  const tmp = mkdtempSync(join(tmpdir(), "aud-"));
  const wav = join(tmp, "m.wav");

  // Mono, 8 kHz, 16-bit. Small enough to hold in memory comfortably.
  ffmpeg(["-y", "-i", `"${file}"`, "-ac", "1", "-ar", String(SR), "-f", "wav", `"${wav}"`]);

  const buf = readFileSync(wav);
  // Skip the 44-byte canonical WAV header.
  const samples = new Int16Array(
    buf.buffer.slice(buf.byteOffset + 44, buf.byteOffset + buf.length),
  );
  rmSync(tmp, { recursive: true, force: true });

  const per = Math.floor(SR * WINDOW);
  const rms = [];
  const bright = [];

  for (let i = 0; i + per <= samples.length; i += per) {
    let sum = 0;
    let crossings = 0;
    let prev = samples[i];
    for (let j = i; j < i + per; j++) {
      const s = samples[j] / 32768;
      sum += s * s;
      if ((prev < 0 && samples[j] >= 0) || (prev > 0 && samples[j] <= 0)) crossings++;
      prev = samples[j];
    }
    rms.push(Math.sqrt(sum / per));
    // Zero-crossing rate is a cheap proxy for spectral centroid: high = bright
    // and busy, low = dark and sparse. Good enough to tell a drone from a drop.
    bright.push(crossings / per);
  }

  return { file, rms, bright, duration: samples.length / SR };
};

const dbfs = (v) => (v <= 1e-6 ? -120 : 20 * Math.log10(v));
const ts = (i) => {
  const s = i * WINDOW;
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/** Mean over a window, used for smoothing and for section scoring. */
const mean = (a, from, to) => {
  const lo = Math.max(0, from);
  const hi = Math.min(a.length, to);
  if (hi <= lo) return 0;
  let s = 0;
  for (let i = lo; i < hi; i++) s += a[i];
  return s / (hi - lo);
};

const report = (a) => {
  const peak = Math.max(...a.rms);
  const norm = a.rms.map((v) => v / peak);
  const bars = 56;

  console.log(`\n${"═".repeat(74)}`);
  console.log(`  ${basename(a.file)}   ${a.duration.toFixed(1)}s`);
  console.log("═".repeat(74));

  // Envelope, one row per 2 seconds.
  const rowsPerLine = Math.round(2 / WINDOW);
  for (let i = 0; i < norm.length; i += rowsPerLine) {
    const v = mean(norm, i, i + rowsPerLine);
    const b = mean(a.bright, i, i + rowsPerLine);
    const filled = Math.round(v * bars);
    const tone = b > 0.09 ? "▓" : b > 0.05 ? "▒" : "░";
    console.log(
      `  ${ts(i).padStart(5)}  ${tone.repeat(filled).padEnd(bars)} ${dbfs(mean(a.rms, i, i + rowsPerLine)).toFixed(0).padStart(4)} dB`,
    );
  }

  // ── Section picks ──────────────────────────────────────────────────────
  const W6 = Math.round(6 / WINDOW); // 6-second candidate window

  // Quietest sustained 6s — the Act I opening.
  let quiet = { i: 0, v: Infinity };
  for (let i = 0; i + W6 <= norm.length; i++) {
    const v = mean(norm, i, i + W6);
    if (v < quiet.v) quiet = { i, v };
  }

  // Steepest 6s rise — the run-up into the drop.
  let build = { i: 0, d: -Infinity };
  for (let i = 0; i + W6 * 2 <= norm.length; i++) {
    const d = mean(norm, i + W6, i + W6 * 2) - mean(norm, i, i + W6);
    if (d > build.d) build = { i, d };
  }

  // Loudest sustained 6s — the peak.
  let loud = { i: 0, v: -Infinity };
  for (let i = 0; i + W6 <= norm.length; i++) {
    const v = mean(norm, i, i + W6);
    if (v > loud.v) loud = { i, v };
  }

  console.log(
    `\n  quietest 6s   ${ts(quiet.i)}   ${(quiet.v * 100).toFixed(0)}% of peak   ← Act I candidate`,
  );
  console.log(
    `  steepest rise ${ts(build.i)}   +${(build.d * 100).toFixed(0)}% over 6s   ← run-up candidate`,
  );
  console.log(
    `  loudest 6s    ${ts(loud.i)}   ${(loud.v * 100).toFixed(0)}% of peak   ← drop / peak candidate`,
  );

  return { ...a, norm, quiet, build, loud, peak };
};

const files = process.argv.slice(2);
if (!files.length) {
  console.error("\nPass one or more audio files.\n");
  process.exit(1);
}

console.log("\n  ░ dark/sparse   ▒ mid   ▓ bright/busy      bar length = loudness\n");
for (const f of files) report(analyse(f));
console.log("");
