import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { PALETTE } from "../theme";
import { CLAMP, EASE } from "../lib/motion";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRANSITION LIBRARY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * There is not one hard cut in this film. Every scene change is one of these
 * four, and each exists because a specific moment in the story needed it —
 * none is a "nice transition" applied for variety.
 *
 * Two rules govern all four:
 *
 *  · The outgoing scene and the incoming scene never do the same thing. If
 *    both cross-fade you get mush at 50%. One always leads.
 *  · Everything that leaves, leaves *through defocus*. Blur is what makes a
 *    software transition feel photographic rather than like two divs.
 */

/* ───────────────────────────────────────────────────────────────────────────
 * 1. BLUR DISSOLVE — the workhorse
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The outgoing scene defocuses and drifts *back* in Z while the incoming one
 * resolves forward out of blur. Because they move in opposite directions in
 * depth, the midpoint reads as a rack focus between two planes rather than as
 * a cross-fade.
 *
 * Used: Tutor → CTA (the exhale), and any feature-to-feature beat.
 */
type BlurDissolveProps = {
  readonly maxBlur: number;
  readonly depth: number;
};

const BlurDissolvePresentation: React.FC<
  TransitionPresentationComponentProps<BlurDissolveProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const exiting = presentationDirection === "exiting";
  const p = presentationProgress;

  return (
    <AbsoluteFill
      style={{
        filter: `blur(${
          exiting
            ? interpolate(p, [0, 1], [0, passedProps.maxBlur], {
                easing: EASE.soft,
              })
            : interpolate(p, [0, 1], [passedProps.maxBlur, 0], {
                easing: EASE.glass,
              })
        }px)`,
        opacity: exiting
          ? interpolate(p, [0.15, 0.9], [1, 0], CLAMP)
          : interpolate(p, [0.05, 0.72], [0, 1], CLAMP),
        scale: exiting
          ? interpolate(p, [0, 1], [1, 1 - passedProps.depth], {
              easing: EASE.soft,
            })
          : interpolate(p, [0, 1], [1 + passedProps.depth * 0.7, 1], {
              easing: EASE.glass,
            }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const blurDissolve = (
  options: Partial<BlurDissolveProps> = {},
): TransitionPresentation<BlurDissolveProps> => ({
  component: BlurDissolvePresentation,
  props: { maxBlur: options.maxBlur ?? 26, depth: options.depth ?? 0.06 },
});

/* ───────────────────────────────────────────────────────────────────────────
 * 2. DEPTH PUSH — we fly *into* the next scene
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The outgoing scene continues accelerating toward camera and blows past it;
 * the incoming scene is already there, arriving from behind. Object continuity:
 * because the reveal ends on a card and the diagnostic scene opens on the same
 * card, the viewer reads one continuous camera move, not a cut.
 *
 * Used: Reveal → Diagnostic.
 */
type DepthPushProps = { readonly amount: number };

const DepthPushPresentation: React.FC<
  TransitionPresentationComponentProps<DepthPushProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const exiting = presentationDirection === "exiting";
  const p = presentationProgress;

  return (
    <AbsoluteFill
      style={{
        scale: exiting
          ? interpolate(p, [0, 1], [1, 1 + passedProps.amount], {
              easing: EASE.anticipate,
            })
          : interpolate(p, [0, 1], [1 - passedProps.amount * 0.42, 1], {
              easing: EASE.glass,
            }),
        filter: `blur(${
          exiting
            ? interpolate(p, [0.3, 1], [0, 34], CLAMP)
            : interpolate(p, [0, 0.8], [16, 0], CLAMP)
        }px)`,
        opacity: exiting
          ? interpolate(p, [0.42, 1], [1, 0], CLAMP)
          : interpolate(p, [0, 0.5], [0, 1], CLAMP),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const depthPush = (
  options: Partial<DepthPushProps> = {},
): TransitionPresentation<DepthPushProps> => ({
  component: DepthPushPresentation,
  props: { amount: options.amount ?? 0.55 },
});

/* ───────────────────────────────────────────────────────────────────────────
 * 3. LIGHT WIPE — a blade of light passes and the scene has changed behind it
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * A hard-edged sweep of light crosses the frame; the incoming scene is revealed
 * in its wake by a moving mask, not by opacity. This is the same physical
 * object as `<LightSweep>` and the glass specular — one light source, used
 * three ways.
 *
 * Used: Mystery → Problem (as a snap), and the fast feature beats.
 */
type LightWipeProps = {
  readonly angle: number;
  readonly color: string;
  readonly softness: number;
};

const LightWipePresentation: React.FC<
  TransitionPresentationComponentProps<LightWipeProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const exiting = presentationDirection === "exiting";
  const p = presentationProgress;
  const { angle, color, softness } = passedProps;
  const edge = interpolate(p, [0, 1], [-softness, 100 + softness], {
    easing: EASE.brake,
  });

  if (exiting) {
    return (
      <AbsoluteFill
        style={{
          // The outgoing scene is erased by the blade, not faded — the mask's
          // leading edge *is* the light.
          maskImage: `linear-gradient(${angle}deg, transparent ${edge}%, black ${
            edge + softness
          }%)`,
          WebkitMaskImage: `linear-gradient(${angle}deg, transparent ${edge}%, black ${
            edge + softness
          }%)`,
          filter: `blur(${interpolate(p, [0.5, 1], [0, 12], CLAMP)}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          maskImage: `linear-gradient(${angle}deg, black ${edge}%, transparent ${
            edge + softness
          }%)`,
          WebkitMaskImage: `linear-gradient(${angle}deg, black ${edge}%, transparent ${
            edge + softness
          }%)`,
        }}
      >
        {children}
      </AbsoluteFill>
      {/* The blade itself, brightest at the mid-point of the pass. */}
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: interpolate(p, [0, 0.4, 1], [0, 0.5, 0], CLAMP),
          backgroundImage: `linear-gradient(${angle}deg, transparent ${
            edge - 5
          }%, ${color} ${edge}%, transparent ${edge + 6}%)`,
          filter: "blur(2px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const lightWipe = (
  options: Partial<LightWipeProps> = {},
): TransitionPresentation<LightWipeProps> => ({
  component: LightWipePresentation,
  props: {
    angle: options.angle ?? 104,
    color: options.color ?? PALETTE.ink,
    softness: options.softness ?? 26,
  },
});

/* ───────────────────────────────────────────────────────────────────────────
 * 4. THROUGH BLACK — the silence
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * The most important transition in the film, and the simplest: both scenes
 * pass through complete darkness.
 *
 * Its job is *withholding*. The problem act ends mid-sentence, the frame goes
 * black and silent for roughly half a second, and the reveal begins in that
 * vacuum. Almost every launch film that fails, fails because it never once lets
 * the screen be empty. `hold` is how long nothing happens; do not shorten it.
 *
 * Used: Problem → Reveal.
 */
type ThroughBlackProps = { readonly hold: number };

const ThroughBlackPresentation: React.FC<
  TransitionPresentationComponentProps<ThroughBlackProps>
> = ({ children, presentationProgress, presentationDirection, passedProps }) => {
  const exiting = presentationDirection === "exiting";
  const p = presentationProgress;
  const h = passedProps.hold; // fraction of the transition spent at full black

  const outEnd = (1 - h) / 2;
  const inStart = outEnd + h;

  return (
    <AbsoluteFill
      style={{
        opacity: exiting
          ? interpolate(p, [0, outEnd], [1, 0], { easing: EASE.brake, ...CLAMP })
          : interpolate(p, [inStart, 1], [0, 1], { easing: EASE.glass, ...CLAMP }),
        // The outgoing act also *contracts* as it goes — the chaos collapses
        // inward rather than simply dimming.
        scale: exiting
          ? interpolate(p, [0, outEnd], [1, 0.965], { easing: EASE.brake, ...CLAMP })
          : interpolate(p, [inStart, 1], [1.035, 1], { easing: EASE.glass, ...CLAMP }),
        filter: exiting
          ? `blur(${interpolate(p, [0, outEnd], [0, 18], CLAMP)}px)`
          : "none",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const throughBlack = (
  options: Partial<ThroughBlackProps> = {},
): TransitionPresentation<ThroughBlackProps> => ({
  component: ThroughBlackPresentation,
  props: { hold: options.hold ?? 0.34 },
});
