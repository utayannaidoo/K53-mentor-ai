# K53 Mentor AI — Launch Film

A 58-second cinematic launch film, built in Remotion. 60 fps, 4K, three aspect
ratios, synthesised score.

```bash
npm install
npm run assets    # generate the score, the SFX and the grain tiles — required
npm run dev       # Remotion Studio
```

---

## The idea

The K53 is a driving test. The product's design system is literally called
*Road Atlas*, and its logo is a road narrowing to a vanishing point with three
lane dashes up the middle.

So the film is built around **one object: a luminous lane marking**, and it is
the same object in every act.

| Act | | The line is… |
|---|---|---|
| **I** Mystery | 0:00 | a horizon in the dark |
| **II** Problem | 0:06 | fractured into contradictory fragments |
| — | 0:16 | *(silence)* |
| **III** Reveal | 0:17 | reassembled and rushed at the lens — and it resolves into the logo |
| **IV** Product | 0:27 | the underline beneath every scene |
| **V** Close | 0:49 | bent into a ring, and closed |

That is why there is not a single hard cut in the film: every transition is a
match cut, because the same object survives it. The last image — an open road
becoming a completed circle — is the argument the whole film is making.

## What it says

Five acts, and the story is a transformation, not a feature list.

1. **"It's not a hard test."** — one line, six seconds, almost nothing on screen.
2. **"So why do 6 in 10 fail it?"** — then *Cram. Forget. Guess. Fail.*, four
   slams at tightening intervals, ending on a real failure slip: NOT YET COMPETENT.
3. **Silence.** ~half a second of black with nothing in the mix.
4. **The reveal** — the road rushes the lens, the mark draws itself, the product
   rises out of the dark. *"Know exactly where you stand."*
5. **Four features, each a short film of its own** — a diagnostic collapsing into
   one number, a list reordering itself, one complete flashcard review performed
   with a cursor, a rack focus from a wrong answer to a tutor explaining it.
6. **"Pass first time."**

Every number on screen is the product's real number, taken from
`src/components/landing/` — 4 in 10, 15 questions, 68/51 mock, 78 readiness,
82% predicted pass, 7 categories, 10 minutes. Every question and answer is real
content from `src/lib/content/`. Nothing is invented for the film.

## Project layout

```
src/video/
  config.ts            ← THE ONE CONFIG. Every duration, every beat, all copy.
  theme.ts             ← Night Atlas palette, type scale, glass tiers
  LaunchFilm.tsx       ← the assembly: 8 scenes + 7 transitions

  lib/
    stage.ts           ← multi-format layout. One scale, three aspect ratios.
    motion.ts          ← easing vocabulary, seeded randomness, drift
  camera/
    Camera.tsx         ← the rig: zoom / pan / tilt / yaw / pitch / roll / focus / handheld
    Shutter.tsx        ← motion blur, armed for three specific moves
  transitions/         ← blurDissolve · depthPush · lightWipe · throughBlack
  elements/
    Atmosphere.tsx     ← void, glow, particles, grain + dither, vignette
    LaneLine.tsx       ← the through-line object, in all five of its forms
  type/
    Kinetic.tsx        ← MaskLine · BlurWords · Slam · Kicker · Counter
    fonts.ts           ← Overpass · Inter · JetBrains Mono
  ui/
    Glass.tsx          ← the app's three-tier glass, ported
    Product.tsx        ← real product surfaces, rebuilt
    Logo.tsx           ← the mark, drawn rather than faded
    Cursor.tsx         ← a pointer that behaves like a hand
  audio/
    cues.ts            ← the cue sheet — frame-accurate, human-readable
    SoundDesign.tsx    ← mounts it, with ducking
  scenes/              ← one file per act; each opens with its own beat sheet

scripts/
  build-bed.mjs        ← cuts the 58s score out of the Suno takes in music-src/
  analyse-audio.mjs    ← loudness/brightness envelope — finds the usable sections
  generate-vo.mjs      ← ElevenLabs voice-over (eleven_v3, 150 credits)
  synth-audio.mjs      ← the original placeholder score + 15 SFX, from scratch
  gen-noise.mjs        ← bakes the two grain tiles (was 64% of render cost as SVG)
  stills.mjs           ← contact-sheet renderer (bundles once, not per frame)

docs/
  TIMING-SHEET.md      ← every beat, every frame
  MUSIC.md             ← sourcing and cutting a score
  VOICEOVER.md         ← the VO script, direction, and the ElevenLabs budget
  ANIMATION.md         ← the motion system and why each piece exists
  SFX-TIMELINE.md      ← the cue sheet for a composer
  DESIGN-SYSTEM.md     ← colour, typography, assets
  RENDERING.md         ← encoder settings, performance, verification loop
```

## Changing things

**Everything timing-related lives in `src/video/config.ts`** — scene lengths,
transition overlaps, spring configs, camera intensity, grain, motion blur, and
all the copy. A `<DurationGuard>` inside `LaunchFilm` throws if the scene
lengths there ever drift from the literals in the composition.

The grid: 60 fps at 120 BPM, so **1 beat = 30 frames, 1 bar = 120 frames**, and
every scene boundary lands on a bar line. Keep new timings on the grid and they
will sit with the music for free.

Sizes are in **stage units**. One number — the design width in `lib/stage.ts` —
scales the entire film. It is 1500 for 16:9; raising it makes everything
smaller, lowering it makes everything larger.

## Three aspect ratios, no crops

`LaunchFilm`, `LaunchFilm-9x16` and `LaunchFilm-1x1` are the same component.
Scenes read `portrait` / `square` from `useStage()` and restack — captions
centre, type grows proportionally, cards widen, the lockup stacks. Nothing is
cropped and nothing is letterboxed.

## Audio

**Score** — `public/audio/bed-seamless.wav`, cut by `scripts/build-bed.mjs` from
Suno generations in `music-src/`. Two sections of the same take, joined *inside
the film's own blackout* at 19s so there is no audible key change. Measured arc:
−39 dB at the open, −18 dB sustained, −42 dB at the close.

The silence at 0:16 is **imposed by the mix, not composed** — `SoundDesign.tsx`
ducks the bed to 4% for two and a half seconds and releases it on frame 1167.
That release is the reveal.

**Voice-over** — six lines, ElevenLabs `eleven_v3`. Generate with `npm run vo`
(150 credits). Script and direction: [`docs/VOICEOVER.md`](docs/VOICEOVER.md).

**SFX** — synthesised, dependency-free (`npm run audio`). Impacts, glass, ticks,
clicks, chimes and tonal risers. **No noise sweeps** — see the note at the top of
[`docs/SFX-TIMELINE.md`](docs/SFX-TIMELINE.md) for why every whoosh was cut.

`npm run assets` regenerates the SFX and the grain tiles.

## Rendering

```bash
npm run render:4k        # the deliverable
npm run render:all       # 16:9 + 9:16 + 1:1
npm run render:master    # ProRes HQ, 4:4:4, grade-able
```

See [`docs/RENDERING.md`](docs/RENDERING.md) for encoder settings and why they
are not the defaults (short version: this is a dark grade full of low-contrast
gradients, and the defaults band it).

## The verification loop

```bash
npm run stills
```

36 frames at the film's decision points, rendered from one bundle. This is the
fast loop, and it is not optional — every real problem found while building this
film was invisible in the code and obvious in a still.
