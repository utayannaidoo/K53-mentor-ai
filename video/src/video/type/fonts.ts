import { loadFont as loadOverpass } from "@remotion/google-fonts/Overpass";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

/**
 * The film uses the product's exact three faces — Overpass for display, Inter
 * for body, JetBrains Mono for every number (see `src/app/layout.tsx` in the
 * app). Nothing here is a "cinematic" substitute; the point is that the film
 * and the app are the same object.
 *
 * `loadFont()` blocks rendering until the face is ready, which is what stops a
 * fallback-font frame ever making it into a render. Weights are pinned tight:
 * six faces is already more than the film needs.
 */

export const DISPLAY = loadOverpass("normal", {
  weights: ["300", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const BODY = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
}).fontFamily;

export const MONO = loadMono("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
}).fontFamily;
