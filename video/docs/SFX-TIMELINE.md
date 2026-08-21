# Sound

**The rule:** nothing plays that is not attached to something moving on screen.
A sound with no picture is what makes a launch film feel like a stock template
with a sound pack dropped over it.

**The second rule, learned the hard way: no noise sweeps.** This sheet used to
carry ten of them — a whoosh on nearly every transition. They worked against the
synthesised placeholder score, which was itself noise-based. The moment a real
tonal track went underneath they fell apart: broadband filtered noise sweeping
across sustained harmonic material reads as interference, not as design.

All ten are gone and **nothing replaced them.** The moves they marked are
carried by the picture, by the music ducking, and by the tonal cues that remain.
A transition does not need announcing when the score is already moving.

Machine-readable source of truth:
[`src/video/audio/cues.ts`](../src/video/audio/cues.ts). This document is the
same information for a human — or for the composer you hand it to.

---

## The score

`bed-seamless.wav` — 58s, cut by `scripts/build-bed.mjs` from Suno generations
in `music-src/`. Two sections from the same take, so there is no key change:

| Film | From | Why |
|---|---|---|
| 0:00–19.0s | `nothing-0` @ 0:00 | the only take opening at −31 dB — Act I needs near-silence |
| 19.0–58s | `nothing-0` @ 2:56 | its loudest sustained passage — the reveal onward |

The join sits at 19.0s, **inside the film's own blackout**, and is a step up in
energy rather than tonality.

Measured arc of the finished bed:

```
0:00  −39 dB   near silence      0:19  −20 dB   THE DROP
0:10  −31 dB   creeping in       0:24  −18 dB   sustained
0:14  −23 dB   building          0:56  −42 dB   gone
```

### The silence is imposed, not composed

A written score would stop at 0:16. A generated track has no idea the picture
went black, so `SoundDesign.tsx` ducks the bed to **4% across frames 975–1145**
and releases it to full exactly on frame 1167.

**That release is the reveal.** Without it the road rushes the lens over music
that never stopped, and the act lands as a continuation rather than an arrival.

---

### The original placeholder

`bed-synth.wav` — the generated-from-scratch version, still on disk. A minor,
120 BPM, arranged against the edit. Kept because it is the only version
guaranteed to hit every cue below without a duck.

| Time | Frames | Section | What happens musically |
|---|---:|---|---|
| 0:00 | 0 | Act I | A 55 Hz drone and almost nothing else. Filter nearly shut. |
| 0:06 | 354 | Act II | Sub pulse on every beat. A minor 2nd (B♭) grinds above the root. Noise floor rises. Tension by accumulation, not by volume. |
| 0:16 | 982 | **SILENCE** | Everything ducks to −34 dB for ~1.1s. **The most important bar in the score is the one with nothing in it.** |
| 0:17 | 1044 | Riser | A 30→70 Hz sub sweep under a filtered noise rise. |
| 0:19 | 1167 | **THE DROP** | Full A-minor stack — A2 / C4 / E4 with sub. The film's centre of gravity. |
| 0:27 | 1605 | Act IV | Steady bed, arpeggio on the beat (A–C–E–A), deliberately sparse so the SFX have room. |
| 0:48 | 2880 | Build | The last ascent. |
| 0:51 | 3085 | **CLOSURE** | The peak, on the exact frame the ring meets itself. |
| 0:52 | 3145 | Resolve | **The C natural crossfades to C♯** — a Picardy third. The minor turns major directly under "Pass first time." |
| 0:58 | 3480 | Out | |

### Ducking

The bed drops ~5 dB under the two heaviest hits and releases over half a second
(`SoundDesign.tsx`). Without it the impacts fight the score instead of
punctuating it.

- Frame **914** — the NOT YET COMPETENT stamp
- Frame **3085** — the closure

---

## SFX cue sheet

Frames are absolute on the master timeline.

### Act I — Mystery

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 46 | `glass-soft` ↓0.8 | 0.30 | The line is born |

### Act II — Problem

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 354 | `impact` | 0.85 | The cut into the hook |
| 380 | `tick` | 0.35 | The 6-in-10 counter starts |
| 474 | `shatter` | 0.62 | **THE TURN** — the line fractures |
| 504 | `impact` | 0.62 | Slam 1 · "Cram." |
| 600 | `impact` | 0.70 | Slam 2 · "Forget." |
| 684 | `impact` ↓0.94 | 0.78 | Slam 3 · "Guess." |
| 756 | `impact` ↓0.88 | 0.90 | Slam 4 · "Fail." |
| 806 / 828 / 850 | `impact-soft` | 0.50→0.60 | "Book again / Pay again / Wait again" |
| 914 | `impact-huge` ↓0.82 | 1.00 | **NOT YET COMPETENT** — the film's low point |

The four slams get louder *and*, from the third, pitch down. Rising level with
falling pitch is what makes a sequence feel like it is closing in on you.

### Frames 990–1023 — nothing

No SFX. Bed at −34 dB. 33 frames. Do not fill this.

### Act III — Reveal

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 1023 | `rise-tone` ↓0.55 | 0.30 | The road starts moving — felt, not heard |
| 1167 | `impact-huge` | 1.00 | **THE DROP** |
| 1185 | `glass` | 0.55 | The mark draws itself |
| 1215 / 1229 / 1243 | `glass-soft` ↑1.2/1.35/1.5 | 0.30 | Lane dashes 1, 2, 3 — rising pitch per dash |
| 1411 | `glass` ↓0.9 | 0.42 | The product rises out of the dark |
| 1473 | `chime` | 0.20 | The readiness ring completes |

### Act IV·1 — Diagnostic

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 1635 → 1771 | `tick` ×15, 9.7f apart | 0.16→0.33 | One per dealt card. Level and pitch both climb, so the deal accelerates in the ear as well as the eye. |
| 1805 | `rise-tone` | 0.34 | The ring writes to 78 |
| 1877 | `chime` | 0.30 | 82% predicted pass |

### Act IV·2 — Weak spots

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 2109 / 2121 | `tick` | 0.20 | Rows settling |
| 2179 / 2191 | `glass-soft` | 0.28 / 0.24 | "Focus here" chips land |

### Act IV·3 — Daily plan

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 2351 | `click` | 0.40 | The card is clicked |
| 2397 | `tick` | 0.18 | Rating pills rise |
| 2471 | `click` | 0.45 | "Good" is pressed |
| 2537 | `chime` ↑1.1 | 0.26 | Mastery +7 |

### Act IV·4 — AI tutor

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 2643 | `glass` ↓0.85 | 0.36 | The tutor panel rises |
| 2711 | `tick` ↑1.3 | 0.20 | The question lands |
| 2715 | `type` (130f) | 0.14 | The answer streams |
| 2845 | `type` (28f) | 0.10 | Stream ends, quieter |

Those two are the only cues in the film with a hard cut-off. Everything else is
a one-shot whose tail is *meant* to run past the cut — a reverb crossing a
dissolve is how an edit is glued together. A keyboard is not: unbounded, the
typing carried 140 frames into the closing act and you could hear it over the
final image.

### Act V — Close

| Frame | Cue | Vol | Attached to |
|---:|---|---:|---|
| 2955 | `rise-tone` ↓0.7 | 0.34 | **THE BEND** begins |
| 3085 | `impact-huge` | 0.95 | **CLOSURE** — the ring meets itself |
| 3099 | `glass` | 0.50 | The mark draws |
| 3140 | `chime` ↓0.9 | 0.30 | The lockup settles |
| 3255 | `glass-soft` ↓0.8 | 0.30 | "Pass first time." |

*↑/↓ = playback rate. Below 1 lowers pitch and lengthens — used to add weight.*

---

## Voice-over slots

Off by default (`VO_ENABLED = false`). The film is cut to read silent.

**Direction:** a South African voice, low and unhurried, close-mic'd, nearly
conversational. Read *under* the music, never over it. The temptation will be to
fill Act I and the silence — don't. Those two gaps are why the reveal works.

| ID | Frame | Max | Line | Note |
|---|---:|---:|---|---|
| `vo-01` | 152 | 190 | "It's not a hard test." | Flat, almost a shrug |
| `vo-02` | 400 | 150 | "So why do six in ten people fail it?" | No emphasis — the number does the work |
| `vo-03` | 1240 | 220 | "K53 Mentor." | Once, on the mark. Nothing else. |
| `vo-04` | 1480 | 200 | "Know exactly where you stand." | Quiet |
| `vo-05` | 1640 | 260 | "Fifteen questions. One honest number." | Warmer |
| `vo-06` | 3260 | 240 | "Pass first time." | Let it sit before the music resolves |

---

## Replacing the score

`bed.wav` is a **synthesised temp track** — real audio, in key, on the grid,
hitting every cue, but it is not a composer. When you commission the final
piece, the cue sheet is already written and **the edit will not need to move by
a single frame**. Hand over this document plus the timing sheet, swap the file,
and keep everything else.
