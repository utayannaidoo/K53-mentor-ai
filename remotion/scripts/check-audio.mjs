/**
 * Fails if a composition's audio track is silent.
 *
 *   node scripts/check-audio.mjs [composition-id]
 *
 * This exists because a Remotion render happily produces a valid, correctly
 * tagged, entirely SILENT AAC track when an `<Audio src>` cannot be resolved.
 * Nothing throws, the container looks right, and inspecting the file for an
 * audio track passes — which is exactly how a broken sound design shipped once
 * already. The only honest check is to decode the samples and look at them.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const composition = process.argv[2] ?? "Promo-Landscape-Short";
const out = path.join(os.tmpdir(), `remotion-audio-check-${process.pid}.wav`);

console.log(`Rendering audio for ${composition} …`);
// `shell: true` because on Windows the npx entry point is a .cmd shim, which
// execFile cannot spawn directly.
execFileSync("npx", ["remotion", "render", composition, out, "--codec=wav"], {
  stdio: "inherit",
  shell: true,
});

const buf = fs.readFileSync(out);

// Walk the RIFF chunks rather than assuming a 44-byte header — Remotion's
// encoder emits extra chunks, and a wrong offset would read header bytes as
// audio and mask a silent file with fake signal.
let offset = 12;
let channels = 0;
let sampleRate = 0;
let bits = 0;
let dataAt = -1;
let dataSize = 0;
while (offset < buf.length - 8) {
  const id = buf.toString("latin1", offset, offset + 4);
  const size = buf.readUInt32LE(offset + 4);
  if (id === "fmt ") {
    channels = buf.readUInt16LE(offset + 10);
    sampleRate = buf.readUInt32LE(offset + 12);
    bits = buf.readUInt16LE(offset + 22);
  }
  if (id === "data") {
    dataAt = offset + 8;
    dataSize = size;
    break;
  }
  offset += 8 + size + (size % 2);
}

if (dataAt < 0 || bits !== 16) {
  console.error(`Could not read 16-bit PCM from ${out}`);
  process.exit(1);
}

const bytesPerFrame = channels * 2;
const frames = Math.floor(Math.min(dataSize, buf.length - dataAt) / bytesPerFrame);
let peak = 0;
let sumSquares = 0;
let audible = 0;
for (let i = 0; i < frames; i++) {
  for (let c = 0; c < channels; c++) {
    const v = buf.readInt16LE(dataAt + i * bytesPerFrame + c * 2) / 32768;
    const a = Math.abs(v);
    if (a > 1e-4) audible++;
    peak = Math.max(peak, a);
    sumSquares += v * v;
  }
}
const rms = Math.sqrt(sumSquares / (frames * channels));
const db = (x) => (x > 0 ? `${(20 * Math.log10(x)).toFixed(1)} dBFS` : "-inf");

fs.unlinkSync(out);

console.log("");
console.log(`  duration    ${(frames / sampleRate).toFixed(2)}s @ ${sampleRate}Hz ${channels}ch`);
console.log(`  non-silent  ${((100 * audible) / (frames * channels)).toFixed(1)}% of samples`);
console.log(`  peak        ${db(peak)}`);
console.log(`  rms         ${db(rms)}`);
console.log("");

if (peak === 0) {
  console.error("FAIL — the audio track is digital silence.");
  process.exit(1);
}
if (peak > 0.999) {
  console.error("FAIL — the mix is clipping. Lower the levels in src/audio.ts.");
  process.exit(1);
}
// Quiet enough that a viewer would reasonably say "I can't hear any audio".
if (rms < 0.008) {
  console.error(`FAIL — mix is far too quiet (${db(rms)} rms). Raise src/audio.ts.`);
  process.exit(1);
}
console.log("PASS — audio present, not clipping, audible.");
