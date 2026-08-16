import { useVideoConfig } from "remotion";

/**
 * THE STAGE — one layout system, three aspect ratios.
 *
 * The naive approach to multi-format video is to scale a 16:9 layout down and
 * letterbox it. That produces tiny type on 9:16 and dead space on 1:1. Instead
 * every size in this film is expressed in *stage units*, and each format has
 * its own design width:
 *
 *   16:9  →  1500 design units wide
 *   9:16  →   900 design units wide
 *   1:1   →   980 design units wide
 *
 * A headline written as `u(120)` is therefore 8% of the frame on 16:9 and
 * 13.3% on 9:16 — proportionally larger on vertical, which is exactly what
 * vertical needs. No per-format font tables.
 *
 * ── Why 1500 and not 1920 ───────────────────────────────────────────────────
 * This started at 1920, i.e. sizes that read like CSS pixels on a 1080p page.
 * The first contact sheet was unusable: every panel sat as a small rectangle in
 * the middle of a large empty frame, and the type looked like a screenshot
 * rather than a title. Cinema frames its subject much larger than a web page
 * does. Dropping the design width to 1500 scales the entire film up by 1.28×
 * in one number — which is exactly what a single source of truth is for.
 *
 * Scenes additionally read `portrait` / `square` to switch a row into a column.
 * Nothing else in the film needs to know which format it is rendering.
 */

export type StageFormat = "landscape" | "portrait" | "square";

const DESIGN_WIDTH: Record<StageFormat, number> = {
  landscape: 1500,
  portrait: 900,
  square: 980,
};

export interface Stage {
  width: number;
  height: number;
  format: StageFormat;
  portrait: boolean;
  square: boolean;
  landscape: boolean;
  /** Convert a design-unit value into pixels for the current format. */
  u: (value: number) => number;
  /** Horizontal safe-area inset in px. Key content never crosses it. */
  padX: number;
  /** Vertical safe-area inset in px. */
  padY: number;
  /** Longest edge, in px — for full-bleed effects that must cover on rotation. */
  cover: number;
}

export const useStage = (): Stage => {
  const { width, height } = useVideoConfig();
  const ratio = width / height;

  const format: StageFormat =
    ratio > 1.15 ? "landscape" : ratio < 0.87 ? "portrait" : "square";

  const scale = width / DESIGN_WIDTH[format];
  const u = (value: number) => value * scale;

  return {
    width,
    height,
    format,
    portrait: format === "portrait",
    square: format === "square",
    landscape: format === "landscape",
    u,
    // Landscape gets a wider gutter because the eye tracks horizontally; on
    // vertical the frame is already narrow and a big gutter starves the type.
    padX: u(format === "landscape" ? 104 : 60),
    padY: u(format === "landscape" ? 76 : 110),
    cover: Math.hypot(width, height),
  };
};
