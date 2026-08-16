import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { noise2D } from "@remotion/noise";
import { ATMOSPHERE } from "../config";
import { PALETTE } from "../theme";
import { CLAMP, EASE, drift, rand } from "../lib/motion";
import { useStage } from "../lib/stage";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ATMOSPHERE
 * ═══════════════════════════════════════════════════════════════════════════
 * The difference between "dark background" and "a room with no lights on" is
 * entirely in this file. Four layers, always in this order, back to front:
 *
 *   Void      the base — never #000; a green-biased near-black that gives the
 *             greens something to sit in
 *   Glow      volumetric light sources, blurred well past their own size
 *   Particles slow dust catching that light
 *   Grain     a film emulsion over everything, with a vignette
 *
 * Remove the grain and the vignette and the same frames instantly look like a
 * web page screenshot. They are doing more work than any animation here.
 */

/** The base plate. Slightly warmer at the centre so it isn't a flat wash. */
export const Void: React.FC<{ readonly tint?: string }> = ({ tint }) => (
  <AbsoluteFill
    style={{
      backgroundColor: PALETTE.abyss,
      backgroundImage: `radial-gradient(120% 90% at 50% 46%, ${
        tint ?? PALETTE.void
      } 0%, ${PALETTE.abyss} 68%)`,
    }}
  />
);

/**
 * A volumetric light source.
 *
 * `x` and `y` are **fractions of the frame**, not stage units — a light source
 * is a property of the composition, not of the layout, so it must not move when
 * the design width changes or when the film is re-cut to 9:16. (These were
 * stage units originally, which meant that changing the design scale silently
 * slid every light source in the film down and to the right. The frames looked
 * subtly, inexplicably lopsided and it took a contact sheet to see why.)
 *
 * `size` is the diameter in stage units; the blur is derived from it, because a
 * light blurred less than its own radius reads as a flat circle, not as light.
 *
 * ── Rendered small and scaled up, on purpose ────────────────────────────────
 * A glow is a huge element carrying a blur of ~18% of its own diameter. At 4K
 * that is a ~700px blur radius over a 3000px box, and there are one or two in
 * every scene — it was single-handedly the most expensive thing in the film,
 * and it got worse with output resolution, which is exactly the wrong way
 * round.
 *
 * But a blurred radial gradient is by construction pure low-frequency
 * information: there is nothing in it that survives past a few hundred pixels
 * of detail. So the element is laid out at a fixed 480px, blurred at 480px
 * cost, and *then* scaled up by the compositor. CSS applies `filter` to the
 * element's rendered content and `scale` when compositing, so the blur happens
 * before the upscale and its cost no longer depends on the render scale at all.
 * The output is visually identical.
 */
const GLOW_PLATE = 480;

export const Glow: React.FC<{
  /** 0–1, fraction of frame width. */
  readonly x?: number;
  /** 0–1, fraction of frame height. */
  readonly y?: number;
  readonly size: number;
  readonly color: string;
  readonly intensity?: number;
  readonly stretch?: number;
}> = ({ x = 0.5, y = 0.5, size, color, intensity = 0.5, stretch = 1 }) => {
  const { u, width, height } = useStage();
  const target = u(size);

  return (
    <div
      style={{
        position: "absolute",
        left: width * x - (GLOW_PLATE * stretch) / 2,
        top: height * y - GLOW_PLATE / 2,
        width: GLOW_PLATE * stretch,
        height: GLOW_PLATE,
        borderRadius: "50%",
        backgroundImage: `radial-gradient(closest-side, ${color} 0%, transparent 72%)`,
        opacity: intensity,
        filter: `blur(${GLOW_PLATE * 0.18}px)`,
        scale: target / GLOW_PLATE,
        mixBlendMode: "screen",
      }}
    />
  );
};

/**
 * Dust in a light beam. Deterministically seeded — `Math.random()` would strobe
 * because Remotion renders frames out of order and in parallel.
 *
 * Each mote gets its own depth (`z`), which drives size, opacity *and* drift
 * speed together. Motes that are close move fast and are out of focus; distant
 * ones barely crawl. That correlation is what sells the depth.
 */
export const Particles: React.FC<{
  readonly count?: number;
  readonly color?: string;
  readonly opacity?: number;
  readonly speed?: number;
  readonly seed?: number;
}> = ({
  count = ATMOSPHERE.particles.count,
  color = PALETTE.green,
  opacity = 1,
  speed = 1,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { u, width, height } = useStage();

  return (
    <AbsoluteFill style={{ opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const s = i * 7.31 + seed * 131;
        const depth = rand(s + 3); // 0 = far, 1 = near
        const size = u(1.2 + depth * 4.4);
        const baseX = rand(s) * width;
        const baseY = rand(s + 1) * height;
        const amp = u(30 + depth * 190);
        const rate = (0.18 + depth * 0.75) * speed * ATMOSPHERE.particles.speed;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              // Each mote is drawn as a soft radial gradient rather than as a
              // solid dot with `filter: blur()` and a `box-shadow`. Visually
              // near-identical; a `filter` per mote promotes 40-odd separate
              // compositing layers per frame, which showed up as one of the
              // largest costs in the whole render.
              left:
                baseX +
                noise2D(`px${seed}`, i * 0.9, frame * 0.0031 * rate) * amp -
                size * 2,
              top:
                baseY +
                noise2D(`py${seed}`, i * 0.9, frame * 0.0027 * rate) * amp -
                frame * rate * u(0.16) -
                size * 2,
              width: size * 5,
              height: size * 5,
              backgroundImage: `radial-gradient(closest-side, ${color} 0%, ${color}66 26%, transparent 70%)`,
              opacity: (0.1 + depth * 0.5) * (0.55 + 0.45 * drift(frame, rate, i)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * Film emulsion, and — just as importantly — the dither.
 *
 * ── Two layers, and the second one is not optional ──────────────────────────
 * The first contact sheet had visible concentric rings around every glow. That
 * is 8-bit banding: a wide, low-contrast gradient across a near-black field
 * simply does not have enough code values, and h.264 makes it worse, not
 * better. `overlay` grain does nothing to fix it, because overlay is a no-op
 * where the underlying pixel is almost black — exactly where the banding is.
 *
 * So there is a second, normal-blended noise layer at ~4.5% that adds a few
 * code values of dither everywhere. It lifts absolute black by roughly 6/255,
 * which is invisible, and it destroys the contours, which is not. Every film
 * you have ever seen graded this dark does the same thing.
 *
 * ── Baked tiles, not `feTurbulence` ─────────────────────────────────────────
 * Both layers were originally SVG noise filters, evaluated every frame. A
 * measured A/B on a 120-frame slice: 0.39 s/frame with them, 0.14 s/frame
 * without. **Two noise filters were 64% of the entire render cost** — more than
 * the camera, the glass, the type and the motion blur combined.
 *
 * Noise is the one thing here that has no relationship to the frame beneath it,
 * so it does not need to be computed at render time. `scripts/gen-noise.mjs`
 * bakes two 1024² tiles once and these become tiled background images: one
 * paint op each. The look is unchanged — better, if anything, since a tile
 * gives true per-pixel noise at any output resolution while the old filter got
 * softer as the render scaled up.
 *
 * The tile is offset on a 3-frame step rather than every frame. Grain that
 * changes at 60fps buzzes; grain frozen across frames reads as a dirty lens.
 */
/**
 * Blocks the frame until a tile has actually decoded.
 *
 * This is why `@remotion/no-background-image` exists: a CSS background is
 * invisible to Remotion's scheduler, so without this the first frames of a
 * render can be committed before the noise has loaded and come out clean while
 * every other frame is grained. Chrome caches after the first hit, so from
 * frame two onward `onload` fires synchronously and this costs nothing.
 */
const usePreloadedTile = (src: string) => {
  const [handle] = useState(() => delayRender(`Loading tile: ${src}`));

  useEffect(() => {
    const img = new Image();
    img.onload = () => continueRender(handle);
    img.onerror = () => cancelRender(new Error(`Could not load ${src}`));
    img.src = src;
  }, [handle, src]);

  return src;
};

export const Grain: React.FC<{
  readonly opacity?: number;
  /** Dither strength. Set to 0 only if you are mastering in 10-bit. */
  readonly dither?: number;
}> = ({ opacity = ATMOSPHERE.grain.opacity, dither = ATMOSPHERE.dither }) => {
  const frame = useCurrentFrame();
  const grainSrc = usePreloadedTile(staticFile("noise/grain.png"));
  const ditherSrc = usePreloadedTile(staticFile("noise/dither.png"));
  const step = Math.floor(frame / 3);

  // Deterministic per-step offsets. Jumping the tile by a prime-ish stride in
  // both axes means the pattern never lands in the same place twice within a
  // shot, so the tiling is invisible even though there are only two plates.
  const ox = (step * 137) % 1024;
  const oy = (step * 271) % 1024;

  return (
    <>
      {/* Texture — coarse, overlay-blended. Upscaled from the tile so the grain
          reads at cinema size rather than as fine video noise.
          Both tiles are preloaded above, which is exactly what this rule
          guards against; a raw un-awaited background is the real hazard. */}
      <AbsoluteFill
        style={{
          opacity,
          mixBlendMode: "overlay",
          pointerEvents: "none",
          // eslint-disable-next-line @remotion/no-background-image
          backgroundImage: `url(${grainSrc})`,
          backgroundSize: `${1024 * ATMOSPHERE.grain.scale}px ${
            1024 * ATMOSPHERE.grain.scale
          }px`,
          backgroundPosition: `${ox}px ${oy}px`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Dither — fine, normal-blended, doing the unglamorous work. Kept at 1:1
          so each noise cell is one screen pixel: coarse dither is just banding
          at a different scale. */}
      {dither > 0 ? (
        <AbsoluteFill
          style={{
            opacity: dither,
            pointerEvents: "none",
            // eslint-disable-next-line @remotion/no-background-image
            backgroundImage: `url(${ditherSrc})`,
            backgroundSize: "1024px 1024px",
            backgroundPosition: `${oy}px ${ox}px`,
            backgroundRepeat: "repeat",
          }}
        />
      ) : null}
    </>
  );
};

/**
 * Vignette with an anamorphic bias — falls off faster at the sides than top and
 * bottom (110% x 96%), which is what a wide spherical lens actually does and
 * what stops the frame reading as a CSS radial gradient.
 */
export const Vignette: React.FC<{ readonly strength?: number }> = ({
  strength = ATMOSPHERE.vignette.strength,
}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(110% 96% at 50% 50%, transparent 38%, rgba(4,6,6,${
        strength * 0.55
      }) 74%, rgba(3,4,4,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/**
 * A hard black plate used for the two blackouts in the film — the silence
 * before the reveal, and the final fade. Kept as a component so the timing of
 * both is visible in the scene file rather than buried in an opacity.
 */
export const Blackout: React.FC<{
  readonly range: readonly [number, number];
  readonly to?: number;
}> = ({ range, to = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        opacity: interpolate(frame, range, [0, to], {
          easing: EASE.soft,
          ...CLAMP,
        }),
      }}
    />
  );
};
