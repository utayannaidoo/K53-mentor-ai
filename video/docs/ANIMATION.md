# Animation system

Every moving thing in this film is one of the pieces below. If you are adding a
shot, use these — the film reads as one hand because there are so few of them.

---

## 1. Easing vocabulary

Four curves, borrowed from the app's own motion tokens
(`src/app/globals.css`). Nothing in the film uses `Easing.linear` except two
deliberate constant-velocity drifts (particles, sheen) where a curve would read
as a wobble.

| Token | Curve | Job |
|---|---|---|
| `EASE.glass` | `cubic-bezier(0.22, 1, 0.36, 1)` | The default. Reveals, camera moves, anything that arrives. |
| `EASE.soft` | `cubic-bezier(0.4, 0, 0.2, 1)` | Colour, opacity and blur only. Symmetric. |
| `EASE.spring` | `cubic-bezier(0.34, 1.3, 0.64, 1)` | One clean degree of overshoot. Press releases, chips. |
| `EASE.anticipate` | `cubic-bezier(0.68, -0.4, 0.28, 1)` | Pulls back before it moves. Used **twice**: the Act II slams and the lane-line launch. |
| `EASE.brake` | `cubic-bezier(0.16, 1, 0.24, 1)` | Arrives and stops dead. Impacts. |

## 2. Springs

Four, and nothing else (`SPRING` in `config.ts`).

| Token | Config | Job |
|---|---|---|
| `settle` | damping 200, mass 1, stiffness 100 | The house curve. ~80% of the movement in the film. No visible bounce. |
| `heavy` | damping 200, mass 2.4, stiffness 92 | Anything large: panels, the camera, the logo. |
| `snap` | damping 15, mass 0.55, stiffness 190 | One degree of overshoot. Counters landing, chips. |
| `tactile` | damping 22, mass 0.4, stiffness 260 | UI that should feel touched, not thrown. |

**Press asymmetry.** Buttons go *down fast and come back on a spring* — see
`RatingRow`. The asymmetry is the entire reason a press feels like a button and
not like a state toggle.

## 3. The camera rig — `camera/Camera.tsx`

There is no static shot in the film. The rig models a camera, not a CSS
transform:

| Prop | What it does |
|---|---|
| `zoom` | Dolly along Z. A *push*, not a scale — perspective genuinely changes, so planes separate. |
| `pan` / `tilt` | Lateral and vertical track, in stage units. |
| `yaw` / `pitch` | Rotation. `yaw` is what makes the Act III reveal read as an orbit. |
| `roll` | Z rotation. Never more than ~1°; beyond that it reads drunk. Used once, in Act II. |
| `focus` | Depth of field as blur. `focus={[10, 0]}` is a focus pull. |
| `handheld` | Operator breathing. Two incommensurable sines per axis, so it never visibly loops. |

All ranges are `[from, to]` sharing one `range={[start, end]}`, because a real
camera move has one duration, not seven.

**Cameras nest.** Act III and Act V compose a slow programmed move with an
independent handheld rig. That composition is what stops an orbit reading as a
tween — nest them rather than adding a wobble to the same rig.

**`<Depth z={…}>`** places a layer at a fixed distance. Because the rig uses
real perspective, distant layers move *less* under pan and yaw — parallax for
free, no per-layer maths. The compensating scale keeps apparent size identical
at rest, so `z` can be tuned purely for parallax without re-laying anything out.

Grammar used throughout:

```
-900   atmosphere, particles behind everything
-440   glow, background panels
   0   the subject — the only thing in true focus
+210   foreground dust
```

## 4. Motion blur — `camera/Shutter.tsx`

`<CameraMotionBlur>` re-renders its children `samples` times per frame. An
8-sample region costs roughly **8× the render time for every frame it covers**.

`<Shutter range={[start, end]}>` arms the blur only across those frames and
passes children straight through everywhere else.

> **The `range` is the whole point.** The fast move you want to blur is always
> inside a component mounted far longer than the move itself. The flashcard is
> on screen for 360 frames and thrown for 20; the closing camera is mounted for
> 595 frames and never moves fast at all. The first version had no `range`, so
> the film paid 8× across 955 frames to blur 20 of them — **the full-length
> render did not slow down, it stalled.** Bounding the windows took it from
> "never finishes" to a few minutes.
>
> There is no visual seam at the boundary: with nothing moving, averaging eight
> identical sub-frames returns the same image. Just put the boundaries in slow
> motion.

Armed for three moves, ~310 of the film's 3480 frames:

| Move | Scene | Range |
|---|---|---|
| The word slams | 02 | 150–445 |
| The lane-line launch | 03 | 40–190 |
| The flashcard throw | 06 | 226–262 |

The closing pull-back is deliberately **not** blurred. It travels about 20% of
frame width over ten seconds — there is nothing to smear.

Set `MOTION_BLUR.enabled = false` in `config.ts` for fast preview renders. The
film stays correct; those three moves just get crisper.

> **Layout warning.** `CameraMotionBlur` composites its samples as absolutely
> positioned layers, so **anything inside it contributes no height to normal
> flow.** Always give elements under `<Shutter>` explicit dimensions. Scene 06
> had its rating row climb up over the flashcard for exactly this reason.

## 5. Typography — `type/Kinetic.tsx`

Three reveals, each with a different emotional job:

| Component | Behaviour | Used for |
|---|---|---|
| `MaskLine` | Words rise from behind a hard mask edge. Physical, weighty. | Thesis lines, "Pass first time." |
| `BlurWords` | Words resolve out of defocus while letter-spacing collapses inward. Reads as a thought forming. | Act I, the reveal line, all four feature captions. |
| `Slam` | Arrives overscale and out of focus, brakes hard, holds, is **cut**. | Act II only. |

**All three stagger word-by-word, never letter-by-letter.** Letter-by-letter is
the single most common tell of template motion graphics: real title design
treats the word as the unit, because that is how people read.

The signature move is in `BlurWords`: letter-spacing collapsing from +0.09em to
0 *as the blur clears*, so the word condenses into legibility rather than fading
in. It costs nothing and reads as expensive.

`Counter` runs every number in the film — eased, never linear (a linear count-up
reads as a loading spinner), with tabular figures so glyphs never jitter.

## 6. The lane line — `elements/LaneLine.tsx`

The film's one continuous object, and the reason there is not a single hard cut:

| Act | Form | Component |
|---|---|---|
| I | A horizon in the dark | `LaneHorizon` |
| II | Fractured into contradictory fragments | `LaneFracture` |
| III | Reassembled and rushed at the lens | `LaneRush` |
| IV | The underline beneath every scene | `LaneHorizon` (thin) |
| V | Bent into a closing ring | `LaneRing` |

`LaneRush` projects properly: each dash is a *span* from `z` to `z + length`,
drawn as a trapezoid, using `k = focal / (focal + z)`. Two edge lines run to the
same vanishing point, because a centre line alone is ambiguous — the edges are
what tell the eye this is a surface receding rather than a shape growing.

> The first version treated each dash as a point at depth `z` and sized it by
> `k`. Consecutive dashes were taller than the gaps between them, so they merged
> into one solid luminous wedge. If you change the spacing, check that
> `dashLen · k` stays comfortably under `spacing · k`.

## 7. Atmosphere — `elements/Atmosphere.tsx`

Four layers, always in this order:

1. **Void** — the base. Never `#000`; a green-biased near-black that gives the
   greens something to sit in.
2. **Glow** — volumetric light, blurred well past its own radius. A light
   blurred less than its own radius reads as a flat circle, not as light.
   Positions are **fractions of the frame**, not stage units.
3. **Particles** — each mote's depth drives size, opacity *and* drift speed
   together. That correlation is what sells the depth. Deterministically
   seeded, because Remotion renders frames out of order and `Math.random()`
   would strobe.
4. **Grain + dither** — see below.

### The dither is not optional

`Grain` composites two pre-baked 1024² noise tiles (`npm run noise`). The coarse
`overlay` one is texture. The fine normal-blended one at ~4.5% is **dither**,
and it is doing the unglamorous work:

A wide, low-contrast gradient across a near-black field does not have enough
8-bit code values, so it draws visible contour rings around every glow. `overlay`
grain cannot fix this — overlay is a no-op where the underlying pixel is almost
black, which is exactly where the banding is. h.264 makes it worse, not better.

The dither plate adds a few code values of noise everywhere. It lifts absolute
black by roughly 6/255, which is invisible, and destroys the contours, which is
not. Lower `ATMOSPHERE.dither` and the rings come back. Only set it to 0 if you
are mastering in 10-bit (`npm run render:master`).

Both layers started as SVG `feTurbulence`, evaluated per frame — and measured out
at **64% of the film's entire render cost**. Baking them to tiles roughly halved
render time *and* improved the result, because a tile is per-pixel at any output
resolution while a fixed-viewBox filter got softer the more the render scaled up.
Noise is the one thing in the film with no relationship to the frame beneath it,
so it never needed to be computed at render time at all.

## 8. Glass — `ui/Glass.tsx`

A port of the app's three-tier system. Four rules make it read as material
rather than as a translucent box:

1. **Every surface carries an edge** — one bright specular hairline along the
   top where the light is, plus a much fainter rim all round. Drop the specular
   and the panel instantly looks like a PNG.
2. **Adjacent surfaces sit on different tiers.** A `card` inside a `card` has no
   visible boundary; a `subtle` inside a `float` does.
3. **Translucency needs something behind it.** Every scene puts a `<Glow>` behind
   its glass for this reason alone.
4. **The sheen drifts** — a full pass takes about nine seconds. A static
   highlight under a moving camera is the giveaway that the glass is painted on.

## 9. The cursor — `ui/Cursor.tsx`

Three details separate it from every other product video:

- It never travels in a straight line. Human pointer paths bow; the arc peaks at
  the midpoint (`sin(πp)`) so it never displaces the start or the target.
- It arrives *before* it clicks and lingers *after*. Clicking on arrival reads
  as automation.
- It micro-drifts while parked. Hands are never still.

Coordinates are fractions of the frame, so a click stays on its button across
formats and design-scale changes.

Used **once** in the whole film. A cursor everywhere is a screencast; a cursor
once is a moment of contact.
