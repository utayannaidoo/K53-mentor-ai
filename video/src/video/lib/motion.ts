import { Easing } from "remotion";

/**
 * EASING VOCABULARY
 *
 * Four curves, borrowed from the app's own motion tokens so the film moves the
 * way the product moves. Everything in the film uses one of these; nothing uses
 * `Easing.linear` except deliberate constant-velocity drifts (particles, sheen)
 * where a curve would read as a wobble.
 */
export const EASE = {
  /**
   * `cubic-bezier(0.22, 1, 0.36, 1)` — the app's `--ease` / `ease-glass`.
   * Fast out of the gate, long tail. The default for reveals and camera moves.
   */
  glass: Easing.bezier(0.22, 1, 0.36, 1),
  /**
   * `cubic-bezier(0.4, 0, 0.2, 1)` — the app's `--ease-soft`.
   * Symmetric. Colour, opacity and blur changes only.
   */
  soft: Easing.bezier(0.4, 0, 0.2, 1),
  /**
   * `cubic-bezier(0.34, 1.3, 0.64, 1)` — the app's `--ease-spring`.
   * One clean degree of overshoot. Press releases and chips.
   */
  spring: Easing.bezier(0.34, 1.3, 0.64, 1),
  /**
   * Anticipation: pulls *back* before it moves. Used exactly twice — the
   * problem-act word slams and the lane line's launch into the reveal.
   */
  anticipate: Easing.bezier(0.68, -0.4, 0.28, 1),
  /**
   * Hard deceleration. For things that arrive and stop dead, like a cut.
   */
  brake: Easing.bezier(0.16, 1, 0.24, 1),
} as const;

/** Shorthand for the clamped-both-ends interpolation this film uses everywhere. */
export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/**
 * Deterministic pseudo-random in [0, 1). Remotion renders frames out of order
 * and in parallel, so `Math.random()` would strobe. Seeded by index instead.
 */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Deterministic value in [-1, 1). */
export const signedRand = (seed: number) => rand(seed) * 2 - 1;

/**
 * Two summed sine waves at incommensurable periods — the cheapest way to get
 * organic, non-repeating drift for handheld shake and particle float.
 */
export const drift = (frame: number, speed: number, seed: number) =>
  Math.sin(frame * speed * 0.031 + seed * 2.1) * 0.62 +
  Math.sin(frame * speed * 0.0117 + seed * 5.7) * 0.38;
