# Rendering & performance

---

## First run

```bash
npm install
npm run assets    # generates the score, the SFX and the grain tiles
npm run dev       # Remotion Studio
```

`npm run assets` is not optional. It runs `npm run audio` (16 WAVs) and
`npm run noise` (two 1024² PNG grain tiles). Both are gitignored build
artefacts, both are deterministic, both take seconds and need no network — and
Remotion will error on the missing assets without them.

## Commands

| Command | Output | Notes |
|---|---|---|
| `npm run dev` | Studio | Scrub, edit, jump to any scene |
| `npm run stills` | `out/stills/16x9/` | 36-frame contact sheet of the film's decision points |
| `npm run stills 9x16` | `out/stills/9x16/` | Same frames, vertical |
| `npm run render:preview` | 1280×720 mp4 | Fast full-length check |
| `npm run render:1440` | 2560×1440 mp4 | Native composition size |
| `npm run render:4k` | 3840×2160 mp4 | **The deliverable.** |
| `npm run render:9x16` | 2160×3840 mp4 | Vertical |
| `npm run render:1x1` | 2160×2160 mp4 | Square |
| `npm run render:all` | all three | |
| `npm run render:master` | ProRes HQ `.mov` | 4:4:4, grade-able |

Individual scenes render by composition id:

```bash
npx remotion render S03-Reveal out/reveal.mp4 --scale=1.5
```

## Why 4K is a `--scale`, not a composition

The composition is 2560×1440 and the 4K render is the same composition at
`--scale=1.5`. Every size in the film is a stage unit (`lib/stage.ts`), nothing
is pinned to a pixel, so scaling is lossless. Making the Studio composition 4K
would only make scrubbing unusable.

## Encoder settings — and why

Set in `remotion.config.ts`.

**`setVideoImageFormat("png")`, not the jpeg default.** This is a dark grade
full of wide, low-contrast gradients. JPEG intermediates quantise those into
visible contour rings, and no amount of encoder bitrate afterwards puts the
information back. PNG frames cost disk and a little time; banding costs the look.

**`setCrf(15)`, not the default 18.** h.264's default is tuned for daylight
footage. Dark gradients and film grain are the two hardest things for an
encoder and this film is made of both. CRF 15 is roughly a 60% larger file and
the difference is plainly visible in the glows.

**`setColorSpace("bt709")`** — pinned rather than left to the encoder's guess,
so the greens don't shift between a browser preview and a player.

**`setPixelFormat("yuv420p")`** — kept because it is the only chroma format every
player and platform accepts. It *is* lossy for this film: the accent green sits
on near-black, and 4:2:0 discards three quarters of the colour resolution on
exactly that kind of saturated edge. For a master, use `render:master` (ProRes,
4:4:4) and encode deliverables from that.

## Banding: the one thing to watch

If you see contour rings around the glows in a render:

1. Check `public/noise/dither.png` exists (`npm run noise`). Without it the
   dither layer is blank and the rings come straight back.
2. Check `ATMOSPHERE.dither` in `config.ts` is still ≈0.045. It is load-bearing
   — see `ANIMATION.md §7`.
3. Check `setVideoImageFormat` is `"png"`.
4. Check CRF has not been raised.
5. If you need it perfect, master in ProRes and encode with a 10-bit profile.
   8-bit h.264 across near-black gradients has a hard floor no settings clear.

## Performance

Two things dominated the render, and neither was the one you would guess.
Both were found by measuring, not by reading the code — the numbers below are
from A/B renders of the same 120-frame slice at 0.3 scale on the same machine.

| Version | Per frame | vs. baseline |
|---|---:|---|
| Original (SVG `feTurbulence` grain) | 0.395s | — |
| Grain removed entirely | 0.140s | −65% |
| **Baked noise tiles (current)** | **0.188s** | **−52%** |

**Two noise filters were 64% of the entire render cost** — more than the camera,
the glass, the type and the motion blur combined. Replacing them with a pair of
pre-baked tiles more than doubled throughput *and* improved the result, because
a tile is per-pixel at any output resolution while `feTurbulence` at a fixed
viewBox got softer the more you scaled the render up.

The other trap was motion blur applied by component rather than by move — see
below.

**Remaining cost, concentrated:**

| Region | Frames | Relative cost |
|---|---:|---|
| `<Shutter>` windows (3 moves) | ~310 | **8× per frame** |
| Backdrop-filter glass | ~1400 | ~1.6× |
| Everything else | ~1770 | 1× |

`MOTION_BLUR.enabled = false` in `config.ts` cuts a full render further and
changes only three moves.

> **If a render appears to hang, check `<Shutter>` first.** Every `Shutter`
> carries an explicit `range`. Drop one and the blur arms for as long as its
> component is *mounted* rather than as long as the move *lasts* — which is how
> this project once ended up paying 8× across 955 frames to blur 20 of them and
> stopped finishing at all. See `ANIMATION.md §4`.

### What was done to keep it fast

- **Every large blur is plated at a fixed pixel size and scaled up.** This is
  the single biggest win in the project. A `<Glow>` is a huge element carrying a
  blur of ~18% of its own diameter; at 4K that is a ~700px blur radius over a
  3000px box, once or twice per scene, and the cost *grew with output
  resolution* — exactly backwards. But a blurred radial gradient is pure
  low-frequency information, so the element is laid out at 480px, blurred at
  480px cost, and scaled up by the compositor afterwards. CSS applies `filter`
  to rendered content and `scale` at composite time, so the blur happens before
  the upscale. Output is visually identical; cost is now independent of render
  scale. The same treatment is applied to the lane halo and the vanishing-point
  bloom.
- **Grain and dither are pre-baked PNG tiles**, not per-frame SVG noise. See the
  table above — this was the single largest win in the project. `npm run noise`
  regenerates them.
- **Particles are radial gradients, not blurred dots.** A `filter` per mote
  promotes 40-odd separate compositing layers every frame; a gradient background
  is one paint op and looks the same.
- **Everything animates on `transform` and `opacity`.** No layout-thrashing
  properties anywhere; the film never triggers a reflow mid-frame.
- **`scale`/`translate`/`rotate` as individual CSS properties**, not `transform`
  strings — composited the same, and the Studio can edit them as keyframes.
- **All randomness is seeded** (`rand()`, `noise2D`). Remotion renders frames out
  of order and in parallel; `Math.random()` would strobe.
- **Blur budget capped at ~36px** of backdrop-filter, per the app's own design
  system. Beyond that the cost climbs fast and it starts reading as cheap
  glassmorphism anyway.
- **Particle counts are modest** (24–46). Depth-correlated size and speed do more
  for the sense of volume than raw count.
- **No images, no video, no external fetches.** Every frame is drawn in code.

### Concurrency

`setConcurrency(null)` lets Remotion pick from the core count. Don't pin it
high: motion blur multiplies the per-frame work, and over-subscribed browser
instances start swapping and get slower, not faster.

## Verifying a change

```bash
npm run typecheck
npm run stills          # 36 frames, ~2 minutes
npm run render:preview  # full length at 0.4 scale
```

The contact sheet is the fast loop. Every real problem found while building this
film — the road rendering as a solid wedge, the logo reading as a lambda, every
light source sitting off-centre, the flashcard jumping half a frame sideways on
each flip — was found by looking at stills, and none of them were visible from
the code.
