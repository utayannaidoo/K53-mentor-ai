// Regenerate src/lib/content/signs-dimensions.ts — crop sizes + alt-text looks.
// Usage: node scripts/gen-sign-dimensions.mjs
//
// Two client surfaces need per-sign facts without the catalogue itself:
//
//  1. SignVisual needs "how big is this crop" so next/image can reserve layout
//     space. Importing that from signs.ts meant importing signs.catalog.json
//     (~140KB of names, meanings, page numbers) into every route that renders
//     a sign — question practice, mock exams, flashcards, scenarios,
//     diagnostics — which is most of the app.
//  2. sign-alt.ts builds screen-reader alt text from each sign's shape and
//     colour. It looked the sign up in SIGNS, which glued the same catalogue
//     onto question-practice and mock-exam through the back door.
//
// So this emits the narrow projection of BOTH: image path -> {w, h} and image
// path -> appearance description (null-confidence signs are simply absent, so
// the runtime falls back to the family-level description exactly as before).
//
// The appearance strings are computed by loading the REAL modules through
// Vite's SSR loader (same approach as gen-content-meta.mjs) — replicating
// deriveName/traitsFor in this script would be a second implementation free
// to drift.
//
// Kept honest by tests/sign-dimensions.test.ts, which recomputes everything
// from the live modules and fails on any drift.
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const catalog = JSON.parse(
  readFileSync(path.join(root, "src/lib/content/signs.catalog.json"), "utf8"),
);

const server = await createServer({
  root,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
  resolve: {
    alias: {
      "server-only": path.resolve(root, "tests/stubs/server-only.ts"),
      "@": path.resolve(root, "src"),
    },
  },
  logLevel: "error",
});

try {
  const [{ SIGNS }, { describeAppearance }] = await Promise.all([
    server.ssrLoadModule("/src/lib/content/signs.ts"),
    server.ssrLoadModule("/src/lib/content/sign-traits.ts"),
  ]);

  const dims = [];
  const appearances = [];
  const seen = new Set();
  for (const raw of catalog) {
    if (!raw.image || !raw.w || !raw.h) continue;
    if (seen.has(raw.image)) throw new Error(`duplicate image path: ${raw.image}`);
    seen.add(raw.image);
    dims.push([raw.image, { w: raw.w, h: raw.h }]);
    // Same lookup sign-alt.ts did against SIGNS: by exact image path.
    const sign = SIGNS.find((s) => s.image === raw.image);
    if (!sign) throw new Error(`catalogue image ${raw.image} has no derived SIGNS entry`);
    const appearance = describeAppearance(sign);
    if (appearance) appearances.push([raw.image, appearance]);
  }

  if (dims.length === 0) throw new Error("catalogue produced zero dimension entries");

  // Sorted keys → stable diffs between regenerations.
  const sortEntries = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  dims.sort(sortEntries);
  appearances.sort(sortEntries);

  const dimLines = dims.map(([k, d]) => `  ${JSON.stringify(k)}: { w: ${d.w}, h: ${d.h} },`).join("\n");
  const appearLines = appearances.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");

  const out = `// GENERATED FILE — do not edit by hand.
// Regenerate with: node scripts/gen-sign-dimensions.mjs
// Kept honest by tests/sign-dimensions.test.ts, which recomputes both
// projections from the live modules and fails on any drift.
//
// Per-sign facts needed by study routes WITHOUT the catalogue itself:
//
//  - SIGN_IMAGE_DIMENSIONS: intrinsic crop sizes, so <SignVisual> can reserve
//    layout space via next/image.
//  - SIGN_IMAGE_APPEARANCE: shape-and-colour description for screen-reader
//    alt text (see src/lib/content/sign-traits.ts). Confident descriptions
//    only — absent keys fall back to the family-level description, matching
//    describeAppearance()'s own uncertainty rule.
//
// This module exists because importing either fact from signs.ts dragged the
// full ~140KB catalogue JSON into every route that shows a sign.
export const SIGN_IMAGE_DIMENSIONS: Record<string, { w: number; h: number }> = {
${dimLines}
};

export const SIGN_IMAGE_APPEARANCE: Record<string, string> = {
${appearLines}
};

export function signImageDimensions(image: string): { w: number; h: number } | undefined {
  return SIGN_IMAGE_DIMENSIONS[image];
}
`;

  const dest = path.join(root, "src/lib/content/signs-dimensions.ts");
  writeFileSync(dest, out, "utf8");
  console.log(
    `signs-dimensions.ts written: ${dims.length} crops, ${appearances.length} confident appearances ` +
      `(${Math.round(out.length / 1024)}KB)`,
  );
} finally {
  await server.close();
}
