/**
 * `@remotion/google-fonts` blocks the render until the font file has actually
 * loaded. The original film linked fonts.googleapis.com from `<head>`, which is
 * fine for a screen recording you watch twice, but in a frame-by-frame render
 * the first frames get captured against the fallback face and the type jumps.
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadOverpass } from "@remotion/google-fonts/Overpass";

/** Headlines, numbers-in-copy, buttons. */
export const display = loadOverpass("normal", {
  weights: ["300", "400", "600", "800"],
  subsets: ["latin"],
}).fontFamily;

/** Italic display weight — used for the emphasised word in a headline. */
export const displayItalic = loadOverpass("italic", {
  weights: ["600", "800"],
  subsets: ["latin"],
}).fontFamily;

/** Everything that is not a headline. */
export const body = loadInter("normal", {
  weights: ["300", "400", "500", "600"],
  subsets: ["latin"],
}).fontFamily;

/** Tabular figures: scores, counters, prices. */
export const mono = loadJetBrainsMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
}).fontFamily;
