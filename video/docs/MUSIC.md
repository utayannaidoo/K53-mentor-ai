# Score — how the current one was made

The film's score is `public/audio/bed-seamless.wav`, cut from four Suno
generations kept in `music-src/`.

```bash
node scripts/analyse-audio.mjs "music-src/*.mp3"   # map each take's dynamics
node scripts/build-bed.mjs seamless                # cut the 58s bed
```

## The one that worked, and why

Four takes were generated from the prompt below. Measuring them
(`analyse-audio.mjs` prints a loudness envelope and a brightness curve) turned
up the deciding fact: **`nothing-0` opens at −31 dB and rises to −13 dB by
0:16.** The other three all start loud. That intro maps almost exactly onto the
film's opening — six seconds of near-silence, then tension building into the
collapse.

So the bed is two sections of that same take:

| Film | From | Why |
|---|---|---|
| 0:00–19.0s | `nothing-0` @ 0:00 | the only take with a true near-silent open |
| 19.0–58s | `nothing-0` @ 2:56 | its loudest sustained passage |

Same generation on both sides, so **there is no key change at the join** — it is
a step up in energy, and it lands on the reveal.

## Where joins go

This is the part that decides whether a cut-together score sounds like a score
or like a mixtape. Two rules, both editing rather than audio engineering:

1. **Put every join where the picture already changes.** The film is black and
   silent from 0:16.3 to 0:19.2, and every act boundary carries a dissolve. A
   key change under a blackout is inaudible; the same change over a held shot is
   glaring.
2. **Crossfade 1.5s, equal-power.** Under 0.5s you hear the cut. Over 3s you
   hear both keys at once. Linear crossfades dip ~3 dB in the middle, which on a
   sustained pad is an audible hole exactly where you are hiding the join.

`build-bed.mjs` also normalises to −20 dB RMS, deliberately low, so the
voice-over and impacts stay clearly on top.

## The silence is imposed, not composed

A written score would stop at 0:16. A generated track has no idea the picture
went black — so `SoundDesign.tsx` ducks the bed to **4% across frames 975–1145**
and releases it to full on frame **1167**.

**That release is the reveal.** Without it the road rushes the lens over music
that never stopped, and the act lands as a continuation rather than an arrival.

## Trying other cuts

`EDITS` in `scripts/build-bed.mjs` is a declarative list — source, in-point,
duration. Add an entry and rebuild:

```bash
node scripts/build-bed.mjs blend    # the four-take version
```

Then point `MUSIC.src` in `cues.ts` at the new file. `bed-blend` (all four
takes) and `bed-synth` (the original from-scratch placeholder) are both on disk.

---

## The Suno prompt

Instrumental ON, lyrics empty.

```
cinematic minimal electronic, ambient tech, sub bass drone, warm analog pad,
sparse arpeggio, patient build, one big emotional lift, no drums, no vocals,
Max Richter, Jon Hopkins, Apple product film, 120bpm, A minor
```

Generate several times and **keep the one with the biggest dynamic range** — a
quiet stretch that opens into something larger. Where the lift falls does not
matter; `build-bed.mjs` cuts to it.

## Licensing

- **Suno free tier is non-commercial.** Fine for a landing-page hero or organic
  social. A paid plan is required to run this as an ad.
- **Epidemic Sound / Artlist** (~$15/month) — unambiguous commercial licence and
  a higher quality ceiling, if this becomes paid media.
