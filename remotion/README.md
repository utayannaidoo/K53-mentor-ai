# K53 Mentor AI — promo film (Remotion)

The 15-beat promo film, ported from the self-contained CSS version that lived at
`public/ad.html`. Same beats, same Road Atlas palette, same copy — but the
timeline is now React state driven by `useCurrentFrame()`, so it can be
**rendered** rather than screen-recorded.

This is a standalone npm project. It deliberately does **not** share
`package.json` with the Next app: none of Remotion, `@remotion/transitions` or
`@remotion/google-fonts` should end up in the product bundle, and the app's CI
(typecheck + lint + test + build) is untouched by anything in here.

## Deliverables

| Composition             | Size      | Length |
| ----------------------- | --------- | ------ |
| `Promo-Landscape`       | 1920×1080 | ~54s   |
| `Promo-Portrait`        | 1080×1920 | ~54s   |
| `Promo-Landscape-Short` | 1920×1080 | ~25s   |
| `Promo-Portrait-Short`  | 1080×1920 | ~25s   |

Each of the 15 beats is also registered on its own under the **Beats** folder,
so a beat can be re-timed in isolation instead of scrubbing the whole film.

## Commands

Preview in the Studio:

```bash
npx remotion studio --no-open
```

Render one deliverable:

```bash
npx remotion render Promo-Landscape out/promo-16x9.mp4
```

Check a single frame without rendering the whole thing:

```bash
npx remotion still Promo-Portrait --frame=421 --scale=0.4 out/check.png
```

Typecheck and lint (`@remotion/eslint-config-flat` catches Remotion-specific
mistakes such as `background-image`, which is not guaranteed to have decoded
when a frame is captured):

```bash
npm run lint
```

## Assets

`remotion.config.ts` points `publicDir` at the Next app's `../public`, so
`staticFile("signs/regulatory/regulatory-006-01.png")` resolves to the same
artwork the product ships. The film can never drift from the catalogue.

## Structure

```
src/
  Root.tsx            four compositions + one per beat
  Promo.tsx           the film spine — a <TransitionSeries> of 15 beats
  theme.ts            palette, exit/overlap frame budget
  fonts.ts            Overpass / Inter / JetBrains Mono via @remotion/google-fonts
  components/
    Atmosphere.tsx    aurora, lane sweeps, vignette, grain — the film-length layer
    Motion.tsx        SceneExit, Depth, Pop, Glass, Copy, useIsPortrait
    Words.tsx         word-by-word headline reveal (+ B / I / Num / Dim marks)
  scenes/             one file per beat
```

### How timing works

Every scene is a `<TransitionSeries.Sequence>`, so it only declares **how long
it runs** — never when it starts. Inserting or reordering a beat shifts
everything downstream automatically. Inside a scene, `useCurrentFrame()` starts
at 0 and `useVideoConfig().durationInFrames` is that scene's own length, so an
exit is written against `durationInFrames - 23` and stays correct wherever the
scene ends up.

The 9-frame `none()` transition between beats is not an effect — it is the
overlap. It mounts the incoming beat 9 frames before the outgoing one finishes,
so the new beat lands while the old one is still dollying away. The dolly itself
lives in each scene's `<SceneExit>`, where the art direction belongs.
