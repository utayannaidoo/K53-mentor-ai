# Colour, typography, assets

---

## Colour — "Night Atlas"

**These are not invented brand colours.** They are the app's own dark-mode
tokens from `src/app/globals.css` (`.dark`), resolved from HSL to hex, so the
film and the product are literally the same material.

The brief for this film asked for "black, white, soft grey, electric blue".
The product's actual identity is *Road Atlas* — paper cream, South African
route-marker green, motorway blue. Generic electric-blue-on-black would have
been a film for a different company. Route-marker green on a green-biased
near-black is both darker and more distinctive, and it is the brand.

| Token | Hex | App token | Use |
|---|---|---|---|
| `void` | `#101413` | `--background` | The base. A green-biased near-black. |
| `abyss` | `#070909` | — | Blackout beats, vignette cores. |
| `slate` | `#171C1A` | `--card` | Glass fill before opacity. |
| `hairline` | `#2E3834` | `--border` | Hairlines and rims. |
| `ink` | `#EBEFEC` | `--foreground` | Type. **Never pure white** — white reads cheap on black. |
| `mute` | `#96A69E` | `--muted-foreground` | Supporting copy, labels. |
| **`green`** | **`#4DBC88`** | `--primary` | **Route-marker green. THE colour.** |
| `greenLift` | `#68CC9C` | `--primary-light` | Gradient top-stop, glow cores. |
| `success` | `#57C78F` | `--success` | Confirmed / passed states only. |
| `blue` | `#5194EC` | `--accent` | Motorway blue. Secondary only — the tutor, one background glow. |
| `ochre` | `#F5AB3D` | `--warning` | **Problem act and weak spots only.** |
| `red` | `#ED7269` | `--danger` | **Problem act only.** Never appears after the reveal. |

### Rules of restraint

- **At most two accent hues on screen at once.**
- Ochre and red are *problem* colours. After frame 1167 (the drop) they appear
  exactly twice: the weak-spot bars and the wrong answer in the tutor scene.
  That is the point — the film's colour tells the same story as its edit.
- One blue→green gradient is allowed, on the logo tile. Nowhere else.
- No neon. No rainbow. No third accent.

---

## Typography

The app's exact three faces (`src/app/layout.tsx`). Nothing here is a
"cinematic" substitute.

| Role | Face | Weights | Used for |
|---|---|---|---|
| Display | **Overpass** | 300 / 600 / 700 | Every headline, the wordmark, card titles |
| Body | **Inter** | 400 / 500 / 600 | UI copy, labels, kickers |
| Mono | **JetBrains Mono** | 400 / 600 | **Every number in the film**, without exception |

Loaded via `@remotion/google-fonts`, which blocks rendering until the face is
ready — that is what stops a fallback-font frame ever reaching a render.

### Tracking

| Token | Value | Where |
|---|---|---|
| `hero` | `-0.045em` | "Pass first time.", the Act II slams |
| `display` | `-0.032em` | Headlines |
| `title` | `-0.022em` | Card titles — matches the app's `.font-display` |
| `body` | `-0.01em` | Copy |
| `label` | `+0.14em` | Uppercase kickers and eyebrows |

### Scale

Sizes are in **stage units**, converted by `u()`. Design widths: 1500 (16:9),
900 (9:16), 980 (1:1). A headline at `u(128)` is 8.5% of frame width on 16:9 and
14% on 9:16 — proportionally larger on vertical, which is what vertical needs.

| Role | 16:9 | 9:16 | ≈ px at 2560 |
|---|---:|---:|---:|
| Payoff line | 128 | 96 | 218 |
| Act II slam (largest) | 240 | 176 | 410 |
| Act II statistic | 230 | 168 | 393 |
| Act I thesis | 78 | 66 | 133 |
| Reveal line | 54 | 50 | 92 |
| Feature caption | 46 | 44 | 78 |
| Card title | 30 | 32 | 51 |
| Body / UI | 18 | 20 | 31 |
| Kicker | 19 | 20 | 32 |

All numerics use `font-variant-numeric: tabular-nums` so digits do not jitter as
they count.

---

## Assets

### Fonts
Fetched at build time by `@remotion/google-fonts`. Nothing to install.

### Audio — `public/audio/`
16 WAV files, **generated**, not licensed. Run once:

```bash
npm run audio
```

~4 seconds, no network, deterministic output (the noise generator is seeded, so
re-running produces byte-identical files). Gitignored — build artefacts, not
sources.

| File | Length | What it is |
|---|---:|---|
| `bed.wav` | 58.4s | The score. Arranged to the frame — see `docs/SFX-TIMELINE.md`. |
| `impact.wav` | 2.8s | Pitched sub drop + body + transient |
| `impact-soft.wav` | 1.6s | Lighter hit |
| `impact-huge.wav` | 3.6s | The two biggest moments |
| `whoosh.wav` / `-short` / `-down` | 0.4–0.9s | Band-passed noise with a swept centre |
| `riser-reverse.wav` | 2.2s | Built forwards, played backwards |
| `click.wav`, `tick.wav` | 0.1s | UI transients |
| `glass.wav`, `glass-soft.wav` | 1.4–2.0s | Inharmonic partial stacks — a real struck glass is not a harmonic series |
| `rise-tone.wav` | 1.6s | Under the ring writing itself |
| `shatter.wav` | 1.6s | 16 shards at staggered onsets |
| `chime.wav` | 1.8s | A clean perfect fifth |
| `type.wav` | 3.0s | Keystrokes, irregular by design |

### Voice-over (optional)
Drop takes into `public/audio/vo/` as `vo-01.wav` … `vo-06.wav` and set
`VO_ENABLED = true` in `src/video/audio/cues.ts`. Slots, timings and direction
are in that file. **The film is cut to work silent** — every line is on screen —
so VO is an addition, not a dependency.

### Grain tiles — `public/noise/`
Two 1024×1024 greyscale PNGs, **generated**:

```bash
npm run noise
```

Instant, deterministic, dependency-free (`scripts/gen-noise.mjs` writes the PNGs
by hand with `zlib` and a CRC table). `grain.png` is the emulsion texture,
`dither.png` breaks up 8-bit banding — see `docs/RENDERING.md`. Gitignored.

`npm run assets` runs the audio and the tiles together.

### Images
**None** beyond the grain tiles. Every frame is drawn in code: the logo is the
app's real SVG path, the UI is rebuilt from the app's components, the road is
projected geometry. Nothing to source, nothing to license, and it re-renders at
any resolution without resampling.
