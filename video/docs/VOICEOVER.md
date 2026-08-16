# Voice-over

The film is cut to work **silent** — every line is on screen. A voice-over is an
addition, not a dependency, and it is off by default (`VO_ENABLED` in
`src/video/audio/cues.ts`).

---

## The script

Six lines. 150 characters. That is the entire narration for 58 seconds, and the
restraint is the point — the two longest gaps in the film (Act I, and the
silence at 0:16) are load-bearing. Do not fill them.

| # | Timecode | Frame | Line | Direction |
|---|---|---:|---|---|
| 1 | 0:02.5 | 152 | *"It's not a hard test."* | Flat. Almost a shrug. This is not a hook, it's a shared fact. |
| 2 | 0:06.7 | 400 | *"So why do six in ten people fail it?"* | No emphasis on any word. The number on screen does the work. |
| 3 | 0:20.7 | 1240 | *"K53 Mentor."* | Once, quietly, on the mark. Nothing after it. |
| 4 | 0:24.7 | 1480 | *"Know exactly where you stand."* | Warm, quiet, over the product. The first reassurance in the film. |
| 5 | 0:27.3 | 1640 | *"Fifteen questions. One honest number."* | Warmer still. The full stop in the middle is a real pause, not a comma. |
| 6 | 0:54.3 | 3260 | *"Pass first time."* | The payoff. Let it sit. Do not lift the last word. |

### Overall direction

Low, unhurried, close-mic'd, nearly conversational. The read sits **under** the
music, never over it. Nothing here should sound like an advert — the pictures
are already doing the selling, and a performed read fights them.

If you record this with a human instead of TTS: South African accent, mid-to-low
register, no smile in the voice. One take per line, generous handles.

---

## Generating it with ElevenLabs

```bash
npm run vo:dry       # cost report — spends nothing
npm run vo:compare   # audition all 4 voices on one line →  116 credits
npm run vo           # the 6 lines                       →  150 credits
npm run vo:sfx       # the 6 lines + 4 SFX               →  630 credits
```

Pick a voice from the audition, then:

```bash
npm run vo -- --voice=lily
```

Files land in `public/audio/vo/vo-01.mp3` … `vo-06.mp3`, which is exactly where
`SoundDesign.tsx` expects them.

### Setting the key

```powershell
$env:ELEVENLABS_API_KEY = 'sk_...'
```

or create `video/.env` with `ELEVENLABS_API_KEY=sk_...` — gitignored.

### If it says "quota of 0"

```
This request exceeds your API key (Claude Code) quota of 0.
```

This is a **per-key credit cap**, not an empty account, and it sends most people
looking in the wrong place. ElevenLabs lets you cap spend per key, and keys
created through an integration often default to zero.

**Fix:** ElevenLabs dashboard → *Profile → API Keys* → edit the key → raise its
credit limit (2,000 is more than enough for this film) → save.

---

## Budget

The free plan is **10,000 credits a month**. TTS bills at exactly **1 credit per
character** — confirmed against a live quote, where a 21-character line was
priced at 21 credits.

| Item | Credits | % of free tier |
|---|---:|---:|
| 6 VO lines (150 characters) | 150 | 1.5% |
| 4 hero SFX | 480 | 4.8% |
| **Total** | **630** | **6.3%** |

Regenerating the whole thing fifteen times still fits inside one month, so
iterate on the read freely.

### Why no music from ElevenLabs

Deliberate. ElevenLabs Music is not on the free plan, and a 58-second bed would
dominate the allowance even if it were. The synthesised score
(`scripts/synth-audio.mjs`) stays until you commission a real one — and when you
do, `docs/SFX-TIMELINE.md` means the edit won't move by a frame.

---

## Voice

The brief is narrow: low register, unhurried, close-mic'd, nearly
conversational, and it has to sit *under* music without disappearing. That rules
out the bright, upbeat, social-media voices immediately — they read as
advertising, and the entire film is built to avoid sounding like one.

| `--voice=` | Voice | Character |
|---|---|---|
| **`alice`** *(default)* | Alice | British · measured, news-presenter poise. Authoritative without performing. |
| `lily` | Lily | British · warm, lower register. Best on the reassurance lines. |
| `matilda` | Matilda | American · warm, friendly narration. Softer. |
| `jessica` | Jessica | American · conversational, expressive. Least formal. |

`npm run vo:compare` renders line 4 in all four (116 credits) into
`public/audio/vo/_compare/` so you can hear them side by side before committing.

**Alice is the default** because British reads more natural than American for a
South African brand, and her register is low and unhurried enough to sit under
the score without tipping into an advert read.

For an actual South African voice: ElevenLabs *Voice Library* → filter **Accent
= South African** → copy the voice ID → set `ELEVENLABS_VOICE_ID` in your
environment. Nothing else changes.

### Voice settings, and why they are not the defaults

| Setting | Value | Why |
|---|---:|---|
| `stability` | 0.62 | Above default. This read must not emote — the pictures do that. Low stability adds theatrical swings that fight the edit's restraint. |
| `similarity_boost` | 0.80 | Keeps timbre consistent across six separate API calls, so it sounds like one session rather than six. |
| `style` | 0.15 | Almost none. Style is the "perform it" dial. |
| `speed` | 0.94 | Fractionally slow. Every line lands in a gap in the music; a rushed read spills over the next hit. |

---

## Wiring it in

1. `npm run vo`
2. In `src/video/audio/cues.ts` set `export const VO_ENABLED = true;`
3. `npm run dev` and scrub each of the six frames above. Check no line collides
   with an SFX hit or runs past its `maxFrames` slot.
4. If a line is long for its slot, either re-record shorter or nudge `at`
   earlier in `VO_SLOTS`.
5. `npm run render:4k`

## Sound effects

`npm run vo:sfx` also writes four ElevenLabs alternatives alongside the
synthesised set, suffixed `-el.mp3` so **nothing is overwritten**:

| File | Replaces | Used at |
|---|---|---|
| `impact-huge-el.mp3` | `impact-huge.wav` | 0:15 the failure stamp · 0:19 the reveal drop |
| `shatter-el.mp3` | `shatter.wav` | 0:14 the line fractures |
| `glass-el.mp3` | `glass.wav` | 0:20 the mark draws itself |
| `whoosh-el.mp3` | `whoosh.wav` | 0:18 the road rushing the lens |

Listen to both, then adopt whichever wins. It is a two-word change in
`cues.ts`, in one place:

```ts
{ src: "impact-huge",    at: 1167, volume: 1, note: "…" }   // synthesised
{ src: "impact-huge-el", ext: "mp3", at: 1167, volume: 1, note: "…" }   // ElevenLabs
```

You can mix formats freely — `ext` defaults to `wav`, so only the cues you
actually swap need touching.
