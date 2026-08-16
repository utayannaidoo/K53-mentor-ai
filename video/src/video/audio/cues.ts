/**
 * ═══════════════════════════════════════════════════════════════════════════
 * THE CUE SHEET
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Every sound in the film, at an absolute master-timeline frame. This is the
 * document a composer or sound designer works from — and because it is code,
 * it is also what actually plays.
 *
 * Frames are literals rather than expressions on purpose: a cue sheet you have
 * to evaluate in your head is not a cue sheet. The scene start each one hangs
 * off is in the comment, and those come from `AT` in `config.ts`:
 *
 *     mystery 0 · problem 354 · reveal 999 · diagnostic 1605
 *     weakSpots 1929 · practice 2247 · tutor 2583 · cta 2885 · end 3480
 *
 * ── The one rule ────────────────────────────────────────────────────────────
 * Nothing plays that is not attached to something moving on screen. A sound
 * with no picture is what makes a launch film feel like a stock template with
 * a sound pack dropped over it.
 *
 * ── No whooshes. Deliberately. ──────────────────────────────────────────────
 * There were ten noise-sweep cues here — `whoosh`, `whoosh-short`,
 * `whoosh-down`, `riser-reverse` — one on nearly every transition. They worked
 * against the synthesised placeholder, which was itself noise-based, and they
 * fell apart the moment a real tonal score went underneath: broadband filtered
 * noise sweeping across sustained harmonic material reads as interference, not
 * as design.
 *
 * They are gone and nothing replaced them, because nothing needed to. The moves
 * they were marking are already carried by the picture, by the music ducking,
 * and by the tonal cues that remain (`rise-tone`, `glass`, `glass-soft`,
 * `impact`). Transitions do not need to be *announced* when the score is
 * already moving.
 *
 * The WAV files still exist in `public/audio/` if you ever want them back.
 */

export type Cue = {
  /** File in `public/audio/`, without the extension. */
  /**
   * File in `public/audio/`, without the extension.
   *
   * `px-*` files are real library recordings from Pixabay, processed for the
   * edit by `scripts/build-sfx.mjs` — see `docs/SFX-SOURCES.md`. Everything
   * else is still synthesised by `scripts/synth-audio.mjs`. Both sets are on
   * disk, so A/B-ing a single cue is a one-word change here.
   */
  readonly src: string;
  /**
   * Container. Defaults to `wav`. Both the synthesised set and the processed
   * `px-*` set are wav; only drop to mp3 if you wire in a raw download.
   */
  readonly ext?: "wav" | "mp3";
  /** Absolute frame on the master timeline. */
  readonly at: number;
  readonly volume: number;
  /** What this sound is attached to on screen. */
  readonly note: string;
  /** Playback rate. Below 1 lowers pitch and lengthens — used to weight hits. */
  readonly rate?: number;
  /**
   * Hard cut-off, in frames.
   *
   * Most cues are one-shots whose tail is *meant* to run past the cut — a
   * reverb crossing a dissolve is how an edit is glued together. Set this only
   * where a sound would otherwise keep playing into a shot it has nothing to do
   * with. The typing loop is the one case: unbounded, it carried 140 frames
   * into the closing act and you could hear a keyboard over the final image.
   */
  readonly frames?: number;
};

/**
 * The score. Runs the whole film; its arrangement carries the dynamics.
 *
 * ── Using a track from Suno / Udio / a library ───────────────────────────────
 * Drop the file in as `public/audio/bed.mp3` and set `ext: "mp3"`.
 *
 * Those tools give you two to four minutes with their own structure, and the
 * part you want is rarely at the start. Rather than cutting the audio in an
 * editor, set `trimBefore` to the number of frames to skip — 60 frames = 1
 * second — so the section you chose starts at frame 0 of the film.
 *
 * Finding the offset: play the track, note the timestamp where the good part
 * begins, multiply by 60. A quiet passage that lifts around 20 seconds later is
 * what the edit wants; see `docs/MUSIC.md`.
 */
export const MUSIC = {
  /**
   * `bed-nothing4` — cut from `music-src/nothing-4.mp3` by `build-bed.mjs`
   * (`node scripts/build-bed.mjs nothing4`), three sections of one generation.
   *
   * Chosen over `bed-seamless` for its character: brighter and less bleak,
   * which suits a product launch better than the original's darkness. The
   * measurable cost is the opening — this take starts at −31 dB against
   * `nothing-0`'s −39 dB, so Act I is less of a void. If the open ever wants
   * to be emptier again, the fix is a fade on the bed across frames 0–200
   * rather than a different take.
   *
   * Alternatives on disk: `bed-seamless` (the darker original), `bed-blend`
   * (all four takes), `bed` (the synthesised placeholder). Swap the name,
   * nothing else.
   */
  src: "bed-nothing4",
  ext: "wav" as "wav" | "mp3",
  at: 0,
  /**
   * Frames to skip from the head of the file. 0 here because `build-bed.mjs`
   * already cut the section to length. Set this only if you drop in a raw
   * full-length track and need to slide it so its lift lands on frame 1167.
   */
  trimBefore: 0,
  /**
   * The single master knob for the score. Retune this first when you swap the
   * bed — everything else in the mix is set relative to it.
   *
   * 0.72, down from 0.9, to give the sound design more room overall.
   *
   * ── A measurement warning, because it cost a round of tuning ───────────────
   * Judging whether a cue is audible by comparing its peak to the *broadband*
   * level underneath it is wrong, and wrong in a direction that will send you
   * chasing problems that do not exist. The bed is bass-heavy; a 3 kHz chime is
   * not masked by a 55 Hz drone, however loud the drone is. Measured broadband,
   * the delicate cues here looked buried at 5–9 dB. Measured in the band each
   * one actually occupies, the same cues were sitting at 15–25 dB and were
   * perfectly clear.
   *
   * If you need to check a cue, band-pass both the mix and the window before it
   * around the cue's own centre frequency (chimes ~3 kHz, glass ~2 kHz, clicks
   * ~2.6 kHz) and compare in there.
   */
  volume: 0.72,
} as const;

export const SFX: readonly Cue[] = [
  /* ─── ACT I · MYSTERY (scene starts at 0) ──────────────────────────────── */
  { src: "px-glass", at: 46, volume: 0.3, rate: 0.8, note: "The line is born — first point of light" },

  /* ─── ACT II · PROBLEM (scene starts at 354) ───────────────────────────── */
  { src: "impact", at: 354, volume: 0.85, note: "354+000 · the cut into the hook" },
  { src: "tick", at: 380, volume: 0.35, note: "354+026 · the 6-in-10 counter starts" },
  { src: "shatter", at: 474, volume: 0.62, note: "354+120 · THE TURN — the line fractures" },
  // The four slams. Intervals tighten (96 → 84 → 72 frames) and each hit is
  // louder and, from the third, pitched down — the act physically closes in.
  { src: "impact", at: 504, volume: 0.62, note: "354+150 · slam 1 'Study everything'" },
  { src: "impact", at: 600, volume: 0.7, note: "354+246 · slam 2 'Remember nothing'" },
  { src: "impact", at: 684, volume: 0.78, rate: 0.94, note: "354+330 · slam 3 'Guess'" },
  { src: "impact", at: 756, volume: 0.9, rate: 0.88, note: "354+402 · slam 4 'Fail'" },
  { src: "impact-soft", at: 806, volume: 0.5, note: "354+452 · 'Book again'" },
  { src: "impact-soft", at: 828, volume: 0.55, note: "354+474 · 'Pay again'" },
  { src: "impact-soft", at: 850, volume: 0.6, note: "354+496 · 'Wait again'" },
  { src: "impact-huge", at: 914, volume: 1, rate: 0.82, note: "354+560 · NOT YET COMPETENT — the film's low point" },

  /* ─── SILENCE · frames 990–1023 ────────────────────────────────────────── *
   * Nothing. Deliberately. The bed ducks to −34 dB in the arrangement and no
   * SFX fires for 33 frames. If you add anything here you break the film.     */

  /* ─── ACT III · REVEAL (scene starts at 999) ───────────────────────────── */
  { src: "rise-tone", at: 1023, volume: 0.3, rate: 0.55, note: "999+024 · the road starts moving, felt not heard" },
  { src: "impact-huge", at: 1167, volume: 1, note: "999+168 · THE DROP — road passes the lens" },
  // The glass/chime cluster that used to sit here belonged to the logo reveal.
  // The logo now appears only in Act V, and the sound went with it — see 3117.
  { src: "rise-tone", at: 1199, volume: 0.4, rate: 0.9, note: "999+200 · the ring writes to 78" },
  // Both measure 17–19 dB clear in their own band. These are presence lifts,
  // not rescues — resist raising them further.
  { src: "px-chime", at: 1300, volume: 0.34, note: "999+301 · the number lands on 78" },
  { src: "px-glass", at: 1385, volume: 0.52, rate: 0.9, note: "999+386 · the card assembles around it" },

  /* ─── ACT IV·1 · DIAGNOSTIC (scene starts at 1605) ─────────────────────── */
  // Fifteen ticks, one per dealt card, 9.7 frames apart. Volume climbs across
  // the run so the deal accelerates in the ear as well as in the eye.
  //
  // Still the SYNTHESISED tick, deliberately, while everything around it moved
  // to real library recordings. The Pixabay candidate (`px-tick`, built and on
  // disk) centres at 792 Hz against the synth tick's 3400 Hz, and swapping it
  // in cost 10–12 dB of brightness on every card in this run. A dull thud
  // fifteen times in three seconds reads as mud; a bright click reads as a
  // deal. Realism is not the goal for a sound that is marking an abstraction.
  ...Array.from({ length: 15 }, (_, i) => ({
    src: "tick",
    at: Math.round(1635 + i * 9.7),
    volume: 0.22 + i * 0.014,
    rate: 1 + i * 0.02,
    note: `1605+${Math.round(30 + i * 9.7)} · question ${i + 1} of 15`,
  })),
  { src: "rise-tone", at: 1805, volume: 0.46, note: "1605+200 · the ring writes to 78" },
  // Was the one genuinely masked cue in the film at 2.9 dB in its own band —
  // not by the score, but by vo-04, a filler narration line sitting on top of
  // the film stating its central claim. The line is gone (see VO_SLOTS) and the
  // chime has this frame to itself, so it needs no more than a presence lift.
  { src: "px-chime", at: 1877, volume: 0.36, note: "1605+272 · 82% predicted pass" },

  /* ─── ACT IV·2 · WEAK SPOTS (scene starts at 1929) ─────────────────────── */
  { src: "tick", at: 2109, volume: 0.3, note: "1929+180 · row settles" },
  { src: "tick", at: 2121, volume: 0.3, rate: 1.1, note: "1929+192 · row settles" },
  { src: "px-glass", at: 2179, volume: 0.42, note: "1929+250 · 'Focus here' lands" },
  { src: "px-glass", at: 2191, volume: 0.36, rate: 1.14, note: "1929+262 · second chip" },

  /* ─── ACT IV·3 · DAILY PLAN (scene starts at 2247) ─────────────────────── */
  { src: "px-click", at: 2351, volume: 0.48, note: "2247+104 · the card is clicked" },
  { src: "tick", at: 2397, volume: 0.27, note: "2247+150 · rating pills rise" },
  // Was landing under vo-06 at 9.3 dB in band — a button press the audience
  // cannot hear is a button press that did not happen. That line is gone too,
  // so this is back to a normal level for the film's one moment of direct
  // interaction.
  { src: "px-click", at: 2471, volume: 0.52, note: "2247+224 · 'Good' is pressed" },
  { src: "px-chime", at: 2537, volume: 0.34, rate: 1.1, note: "2247+290 · mastery +7" },

  /* ─── ACT IV·4 · AI TUTOR (scene starts at 2583) ───────────────────────── */
  { src: "px-glass", at: 2643, volume: 0.44, rate: 0.85, note: "2583+060 · the tutor panel rises" },
  { src: "tick", at: 2711, volume: 0.3, rate: 1.3, note: "2583+128 · the question lands" },
  // ONE cue, not three. This used to be three overlapping copies of a 3-second
  // synthesised loop, layered to cover the 158-frame stream — which meant three
  // identical files playing on top of each other at an offset, and identical
  // signals summed at a delay comb-filter. You cannot tune your way out of
  // that; it is an artefact of the layering itself.
  //
  // `px-type` is a 20-second recording of a real mechanical keyboard (115
  // keystrokes, measured), so a single bounded cue covers the whole stream with
  // no repetition and no overlap. Bounded because the stream stops at 2873 and
  // so must the keyboard — unbounded it played over the closing act.
  { src: "px-type", at: 2715, volume: 0.62, frames: 160, note: "2583+132 · the answer streams" },

  /* ─── ACT V · THE CLOSE (scene starts at 2885) ─────────────────────────── */
  { src: "rise-tone", at: 2955, volume: 0.46, rate: 0.7, note: "2885+070 · THE BEND begins" },
  { src: "impact-huge", at: 3085, volume: 0.95, note: "2885+200 · CLOSURE — the ring meets itself" },
  // The cluster moved down from Act III. This is the film's only logo, and it
  // gets the full treatment: the mark drawing, then a lit dash per lane marking,
  // then the wordmark settling.
  //
  // Broadband this looked like the most buried cue in the film (4.6 dB) because
  // it lands in the tail of the closure impact 32 frames earlier. That tail is
  // all low end; in the glass band the cue was already 22 dB clear. Lifted a
  // little for weight on the logo, not to rescue it.
  { src: "px-glass", at: 3117, volume: 0.68, note: "2885+232 · the mark draws" },
  { src: "px-glass", at: 3147, volume: 0.46, rate: 1.2, note: "2885+262 · lane dash 1 lights" },
  { src: "px-glass", at: 3161, volume: 0.46, rate: 1.35, note: "2885+276 · lane dash 2" },
  { src: "px-glass", at: 3175, volume: 0.46, rate: 1.5, note: "2885+290 · lane dash 3" },
  { src: "px-chime", at: 3196, volume: 0.4, rate: 0.9, note: "2885+311 · the wordmark settles" },
  { src: "px-glass", at: 3255, volume: 0.46, rate: 0.8, note: "2885+370 · 'Pass first time.'" },
];

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOICE-OVER PLACEHOLDERS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The film is cut to work *silent* — every line is on screen, so no narration
 * is required. These are the slots if you want a VO pass anyway.
 *
 * Direction: a South African voice, low and unhurried, close-mic'd, nearly
 * conversational. Read under the music, never over it. The temptation will be
 * to fill the Act I and the silence — don't. Those two gaps are why the reveal
 * works.
 *
 * Drop takes into `public/audio/vo/` as `vo-01.wav` … and set `enabled: true`.
 *
 * ── Why there is no vo-04 or vo-06 ──────────────────────────────────────────
 * Both were filler — their own notes said so — and both were landing squarely
 * on top of a product cue. vo-04 covered the chime on "82% predicted pass",
 * pulling it down to 2.9 dB in its own band, and vo-06 covered the click of the
 * "Good" button being pressed. The film's central claim and its one moment of
 * direct interaction, each narrated over by a line that adds nothing the
 * picture is not already saying.
 *
 * The gaps are deliberate. Silence over a product shot is not dead air; it is
 * the sound design getting a clear frame to land in. The ids are left
 * non-contiguous so nothing downstream has to be renumbered.
 */
export const VO_SLOTS = [
  { id: "vo-01", at: 152, maxFrames: 190, line: "It's not a hard test.", note: "Act I. Flat delivery, almost a shrug." },
  { id: "vo-02", at: 392, maxFrames: 120, line: "So why do six in ten fail?", note: "Shortened to fit the block — the old line was still running when the scene cut." },
  { id: "vo-03", at: 1480, maxFrames: 200, line: "Know exactly where you stand.", note: "Over the product. Quiet." },
  { id: "vo-05", at: 1975, maxFrames: 240, line: "It finds what's actually holding you back.", note: "On the weak-spots scene, as the list reorders." },
  { id: "vo-07", at: 2650, maxFrames: 230, line: "And when you're stuck, it explains why.", note: "On the tutor scene, as the panel rises." },
  { id: "vo-08", at: 3122, maxFrames: 140, line: "K53 Mentor A I.", note: "The only time the name is spoken, on the only frame the logo appears." },
  { id: "vo-09", at: 3268, maxFrames: 200, line: "Pass first time.", note: "Last words in the film." },
] as const;

export const VO_ENABLED = true;

/**
 * Which read plays. Files live in `public/audio/vo/<VO_VOICE>/vo-01.mp3` …
 *
 * `scripts/generate-vo.mjs` writes one folder per voice, so several finished
 * takes can sit on disk at once and switching between them is this one word.
 * That matters more than it sounds: choosing a voice-over from memory of the
 * other option is guesswork, and re-generating to compare destroys the take you
 * were comparing against.
 *
 * Generate with:  npm run vo -- --voice=alice
 */
export const VO_VOICE = "jessica";
