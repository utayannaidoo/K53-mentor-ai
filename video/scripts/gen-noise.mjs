#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRAIN PLATES
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/gen-noise.mjs
 *
 * Writes `public/noise/grain.png` and `public/noise/dither.png` — two 1024²
 * greyscale noise tiles. Pure Node: zlib for the deflate, hand-rolled CRC for
 * the PNG chunks, no dependencies.
 *
 * ── Why these exist ─────────────────────────────────────────────────────────
 * The grain layers were originally SVG `feTurbulence`, generated per frame.
 * A measured A/B on a 120-frame slice: 0.39 s/frame with grain, 0.14 s/frame
 * without. **Two SVG noise filters were 64% of the entire render cost** — more
 * than the camera, the glass, the type and the motion blur put together.
 *
 * Noise is the one thing in the film that does not need to be computed at
 * render time: it has no relationship to the frame beneath it. So it is baked
 * once here and the component becomes a tiled background image, which is a
 * single paint op. The look is unchanged — arguably better, because a real tile
 * gives per-pixel noise at any output resolution, whereas `feTurbulence` at a
 * fixed viewBox got softer as the render scaled up.
 *
 * Two separate tiles rather than one used twice: the grain and the dither are
 * layered on top of each other, and reusing a single tile would correlate them
 * into one visible pattern.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "public", "noise");
const SIZE = 1024;

/* ── PNG encoding ────────────────────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** 8-bit greyscale PNG. Colour type 0, no filtering (filter byte 0 per row). */
const encodeGrey = (pixels, size) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // greyscale
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  const raw = Buffer.alloc(size * (size + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size + 1)] = 0; // filter type: none
    pixels.copy(raw, y * (size + 1) + 1, y * size, (y + 1) * size);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

/* ── Noise ───────────────────────────────────────────────────────────────── */

/** Deterministic, so re-running produces byte-identical tiles. */
let state = 0x9e3779b9;
const rnd = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 0xffffffff;
};

/**
 * `spread` controls contrast around mid-grey. The dither wants a tight
 * distribution — it only needs to break up contour edges, and wide noise on a
 * normal-blended layer would visibly lift the blacks. The grain, sitting on an
 * `overlay` blend, wants more.
 */
const makeNoise = (size, spread, seed) => {
  state = seed;
  const px = Buffer.alloc(size * size);
  for (let i = 0; i < px.length; i++) {
    // Two samples averaged — a flat uniform distribution reads as digital
    // static; this pulls it toward a bell curve, which is what emulsion does.
    const v = (rnd() + rnd()) / 2;
    px[i] = Math.max(0, Math.min(255, Math.round(128 + (v - 0.5) * 2 * spread * 255)));
  }
  return px;
};

mkdirSync(OUT, { recursive: true });
console.log("\nGenerating grain plates →  public/noise/\n");

for (const [name, spread, seed] of [
  ["grain", 0.85, 0x9e3779b9],
  ["dither", 0.5, 0x1f123bb5],
]) {
  const png = encodeGrey(makeNoise(SIZE, spread, seed), SIZE);
  writeFileSync(join(OUT, `${name}.png`), png);
  console.log(
    `  ${name}.png`.padEnd(18) +
      `${SIZE}×${SIZE}  ${(png.length / 1048576).toFixed(2)} MB`,
  );
}

console.log("\nDone.\n");
