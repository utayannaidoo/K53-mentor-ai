#!/usr/bin/env node
/**
 * Contact sheet renderer.
 *
 *   node scripts/stills.mjs                      # the review set, 16:9
 *   node scripts/stills.mjs 9x16                 # same frames, vertical
 *   node scripts/stills.mjs 16x9 1200 1240 1280  # specific frames
 *
 * Bundles once and reuses the browser across every frame, which is the whole
 * point — `npx remotion still` re-bundles per call and turns a 20-frame review
 * pass into ten minutes of waiting.
 *
 * The default frame list is the film's decision points: the moments where, if
 * the frame does not hold up on its own, the shot around it will not either.
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

/** [frame, label] — label becomes the filename so a sorted `ls` reads as an edit. */
const REVIEW = [
  [40, "I-black"],
  [120, "I-line-born"],
  [210, "I-thesis"],
  [340, "I-inhale"],
  [400, "II-hook"],
  [430, "II-six-in-ten"],
  [520, "II-slam-1"],
  [700, "II-slam-3"],
  [820, "II-stack"],
  [930, "II-stamp"],
  [1000, "silence"],
  [1080, "III-rush"],
  [1168, "III-impact"],
  [1210, "III-mark-draw"],
  [1320, "III-wordmark"],
  [1460, "III-product"],
  [1560, "III-thesis"],
  [1660, "IV1-deal"],
  [1760, "IV1-deal-late"],
  [1900, "IV1-readiness"],
  [1990, "IV2-bars"],
  [2130, "IV2-sorting"],
  [2210, "IV2-focus"],
  [2330, "IV3-card"],
  [2400, "IV3-flipped"],
  [2480, "IV3-press"],
  [2560, "IV3-mastery"],
  [2660, "IV4-question"],
  [2780, "IV4-tutor-typing"],
  [2870, "IV4-tutor-full"],
  [2960, "V-line"],
  [3040, "V-bend"],
  [3090, "V-closure"],
  [3150, "V-lockup"],
  [3300, "V-payoff"],
  [3400, "V-cta"],
];

const FORMAT = {
  "16x9": { id: "LaunchFilm", scale: 0.34 },
  "9x16": { id: "LaunchFilm-9x16", scale: 0.5 },
  "1x1": { id: "LaunchFilm-1x1", scale: 0.5 },
};

const args = process.argv.slice(2);
const fmtKey = args[0] && FORMAT[args[0]] ? args.shift() : "16x9";
const fmt = FORMAT[fmtKey];
const frames = args.length
  ? args.map((f) => [Number(f), "custom"])
  : REVIEW;

const outDir = join(ROOT, "out", "stills", fmtKey);
mkdirSync(outDir, { recursive: true });

console.log(`\nBundling…`);
const serveUrl = await bundle({
  entryPoint: join(ROOT, "src", "index.ts"),
  onProgress: () => undefined,
});

const composition = await selectComposition({ serveUrl, id: fmt.id });
console.log(
  `Composition ${fmt.id} — ${composition.width}×${composition.height}, ${composition.durationInFrames}f @ ${composition.fps}fps`,
);
console.log(`Rendering ${frames.length} stills at scale ${fmt.scale} → out/stills/${fmtKey}\n`);

for (const [frame, label] of frames) {
  const name = `${String(frame).padStart(4, "0")}-${label}.png`;
  await renderStill({
    composition,
    serveUrl,
    output: join(outDir, name),
    frame,
    scale: fmt.scale,
    imageFormat: "png",
    overwrite: true,
  });
  process.stdout.write(`  ${name}\n`);
}

console.log(`\nDone.\n`);
process.exit(0);
