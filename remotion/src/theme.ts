/**
 * Road Atlas (light) — the same palette as the product, lifted from
 * `src/app/globals.css :root` and flattened from HSL to hex.
 *
 *   --bg        45 40% 96%   paper cream
 *   --surface   48 45% 99%   card
 *   --ink       150 20% 12%
 *   --ink-dim   44 10% 40%
 *   --line      45 22% 80%
 *   --route     152 60% 25%  SA route-marker green
 *   --motorway  214 75% 38%  motorway blue
 *
 * These are constants rather than inline literals because 15 scenes share
 * them; the trade-off is that Remotion Studio greys out the colour swatches.
 * Everything that *moves* stays as an inline `interpolate()` so keyframes and
 * easings remain editable in the Studio.
 */
export const C = {
  bg: "#F9F7F1",
  surface: "#FDFDFB",
  ink: "#18251F",
  inkDim: "#706B5C",
  line: "#D7D2C1",
  route: "#1A6642",
  routeLite: "#307E59",
  motorway: "#1857AA",
  danger: "#D03C25",
  shadow: "#244233",
} as const;

/** Translucent variants, pre-mixed so `style` objects stay one line. */
export const A = {
  surface55: "rgba(253, 253, 251, 0.55)",
  surface70: "rgba(253, 253, 251, 0.70)",
  surface75: "rgba(253, 253, 251, 0.75)",
  surface80: "rgba(253, 253, 251, 0.80)",
  surface85: "rgba(253, 253, 251, 0.85)",
  surface90: "rgba(253, 253, 251, 0.90)",
  surface96: "rgba(253, 253, 251, 0.96)",
  line50: "rgba(215, 210, 193, 0.50)",
  line60: "rgba(215, 210, 193, 0.60)",
  line70: "rgba(215, 210, 193, 0.70)",
  ink05: "rgba(24, 37, 31, 0.05)",
  ink08: "rgba(24, 37, 31, 0.08)",
  ink12: "rgba(24, 37, 31, 0.12)",
  ink45: "rgba(24, 37, 31, 0.45)",
  route14: "rgba(26, 102, 66, 0.14)",
  route50: "rgba(26, 102, 66, 0.50)",
  route65: "rgba(26, 102, 66, 0.65)",
  motorway14: "rgba(24, 87, 170, 0.14)",
  sheen: "rgba(255, 255, 255, 0.55)",
  rim: "rgba(255, 255, 255, 0.40)",
} as const;

/**
 * Frame budget shared by every scene's exit. Kept in one place because the
 * exits must read as a single edit rhythm — a per-scene value would drift.
 * 23 frames ≈ 0.78s, the `groupOut` duration of the original CSS film.
 */
export const EXIT = 23;

/**
 * How long two scenes are on screen together. `<TransitionSeries>` mounts the
 * incoming scene this many frames before the outgoing one ends, so the new
 * beat lands while the old one is still dollying away.
 */
export const OVERLAP = 14;
