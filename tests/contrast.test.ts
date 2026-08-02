import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * WCAG AA for the semantic status colours, on the page *and* on their own tint.
 *
 * The house pattern is coloured text on a `bg-<token>/10` chip — the flashcard
 * rating buttons, "+6 this week", inline answer feedback. A tint lifts the
 * background toward the text, so a value that clears AA on the page background
 * can still fail inside the chip it is actually used in. That is the failure
 * this pins: it is invisible to a spot check and regresses whenever someone
 * nudges a token for aesthetic reasons.
 */

const CSS = readFileSync(path.resolve(__dirname, "../src/app/globals.css"), "utf8");

/** Pull `--token: H S% L%;` out of a `:root` / `.dark` block. */
function tokens(blockStart: RegExp): Record<string, [number, number, number]> {
  const from = CSS.search(blockStart);
  expect(from, `block ${blockStart} not found in globals.css`).toBeGreaterThan(-1);
  const block = CSS.slice(from, CSS.indexOf("\n  }", from));
  const out: Record<string, [number, number, number]> = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

/** HSL (as authored in the CSS custom properties) → sRGB 0–1. */
function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const S = s / 100;
  const L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = L - c / 2;
  return [r1 + m, g1 + m, b1 + m];
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(fg: [number, number, number], bg: [number, number, number]): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** `bg-<token>/<alpha>` composited over the page background. */
function tint(
  fg: [number, number, number],
  bg: [number, number, number],
  alpha: number,
): [number, number, number] {
  return [
    fg[0] * alpha + bg[0] * (1 - alpha),
    fg[1] * alpha + bg[1] * (1 - alpha),
    fg[2] * alpha + bg[2] * (1 - alpha),
  ];
}

const AA = 4.5;
const STATUS = ["success", "warning", "danger"] as const;
/** The tint strengths actually used across the app's chips and callouts. */
const ALPHAS = [0.06, 0.1, 0.2];

describe.each([
  ["light", /:root\s*\{/],
  ["dark", /\.dark\s*\{/],
])("%s theme status colours", (theme, block) => {
  const t = tokens(block);

  it("defines every status token", () => {
    for (const name of STATUS) expect(t[name], `--${name} missing in ${theme}`).toBeDefined();
    expect(t.background).toBeDefined();
  });

  it.each(STATUS)("--%s clears AA on the page background", (name) => {
    const ratio = contrast(hslToRgb(t[name]), hslToRgb(t.background));
    expect(ratio, `--${name} on --background is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA);
  });

  it.each(STATUS)("--%s clears AA on its own tint, which is where it's used", (name) => {
    const fg = hslToRgb(t[name]);
    const bg = hslToRgb(t.background);
    for (const alpha of ALPHAS) {
      const ratio = contrast(fg, tint(fg, bg, alpha));
      expect(
        ratio,
        `--${name} on bg-${name}/${alpha * 100} is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA);
    }
  });
});
