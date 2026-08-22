// Generate iOS home-screen splash images — public/splash/*.png.
// Usage: node scripts/gen-splash.mjs
//
// Safari reads <link rel="apple-touch-startup-image"> (wired in
// src/app/layout.tsx with per-device media queries) when a saved PWA launches,
// and shows a bare white frame without them. The assets are composed here from
// the existing brand icon over each theme's app background — no design tool
// required, and dark mode gets its own set via prefers-color-scheme media
// queries rather than an unreadable light flash before first paint.
//
// sharp ships with Next.js's image pipeline; this adds no dependency.
import path from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outDir = path.join(root, "public", "splash");
mkdirSync(outDir, { recursive: true });

// [file stem, pixel width, pixel height] — the four portrait iPhone classes
// Safari still matches on device-width/device-height/pixel-ratio triples
// (see the layout links). Landscape is deliberately omitted: the app is
// portrait-locked in practice and every extra file is prepaid data.
const SIZES = [
  ["1290x2796", 1290, 2796], // 14/15 Pro Max class (430×932 @3x)
  ["1284x2778", 1284, 2778], // 12/13 Pro Max class (428×926 @3x)
  ["1179x2556", 1179, 2556], // 14/15 Pro class     (393×852 @3x)
  ["1170x2532", 1170, 2532], // 13/14 class         (390×844 @3x)
];

const THEMES = [
  ["light", "#F8F5EC"], // --background light (globals.css)
  ["dark", "#0F1412"], // --background dark
];

const ICON = path.join(root, "public", "icon-512.png");
const LOGO_EDGE = Math.round(512 * 0.5); // 256px mark on the largest canvas

for (const [theme, bg] of THEMES) {
  for (const [stem, w, h] of SIZES) {
    // Logo scales with the canvas so it reads consistently across devices.
    const logo = Math.round((LOGO_EDGE * w) / 1290);
    await sharp({
      create: { width: w, height: h, channels: 4, background: bg },
    })
      .composite([{ input: await sharp(ICON).resize(logo).png().toBuffer(), gravity: "centre" }])
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(outDir, `${stem}-${theme}.png`));
    console.log(`splash/${stem}-${theme}.png`);
  }
}
console.log("done");
