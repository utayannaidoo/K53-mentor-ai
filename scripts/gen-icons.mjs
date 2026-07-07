// Generates the PWA app icons (route-green Road Atlas lettermark) as real PNGs,
// no image-library dependency — a minimal RGBA PNG encoder (zlib + CRC32).
// Run: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BG = [44, 95, 79]; // #2C5F4F route green (matches manifest theme_color)
const ROAD = [246, 248, 251]; // #F6F8FB cream
const DASH = [242, 144, 42]; // #F2902A signage orange

// The 32-unit favicon design: an A-shaped perspective road + centre dashes.
const roadSegs = [
  [11.5, 27, 16, 6.9], // left leg up to apex
  [16, 6.9, 20.5, 27], // apex down to right leg
];
const dashSegs = [
  [16, 11, 16, 13.4],
  [16, 16.4, 16, 18.8],
  [16, 21.8, 16, 23.8],
];
const HALF = 1.2; // stroke width 2.4 → round-capped half-width

function distToSeg(px, py, [x1, y1, x2, y2]) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx,
    cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // 10,11,12 = compression/filter/interlace = 0
  // Raw scanlines: each row prefixed with filter byte 0.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function render(size, fraction) {
  const s = (size / 32) * fraction;
  const rgba = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      // Map pixel → design space (mark centred at 16, 16.95).
      const dX = (px + 0.5 - size / 2) / s + 16;
      const dY = (py + 0.5 - size / 2) / s + 16.95;
      let col = BG;
      for (const seg of roadSegs) if (distToSeg(dX, dY, seg) <= HALF) col = ROAD;
      for (const seg of dashSegs) if (distToSeg(dX, dY, seg) <= HALF) col = DASH;
      const i = (py * size + px) * 4;
      rgba[i] = col[0];
      rgba[i + 1] = col[1];
      rgba[i + 2] = col[2];
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, rgba);
}

mkdirSync("public", { recursive: true });
// Maskable icons keep the mark inside the ~64% safe zone; Apple auto-rounds.
writeFileSync("public/icon-192.png", render(192, 0.64));
writeFileSync("public/icon-512.png", render(512, 0.64));
writeFileSync("public/apple-icon.png", render(180, 0.72));
console.log("wrote public/icon-192.png, public/icon-512.png, public/apple-icon.png");
