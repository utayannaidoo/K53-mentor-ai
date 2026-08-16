#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOICE-OVER + HERO SFX — ElevenLabs
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/generate-vo.mjs --dry        # cost report, spends nothing
 *   node scripts/generate-vo.mjs              # generate the 6 VO lines
 *   node scripts/generate-vo.mjs --sfx        # VO + the 4 hero sound effects
 *
 * Requires `ELEVENLABS_API_KEY` in the environment or in `video/.env`.
 *
 * ── Budget ──────────────────────────────────────────────────────────────────
 * The free plan is 10,000 credits a month. TTS bills at exactly 1 credit per
 * character (confirmed: a 21-character line was quoted at 21 credits), so the
 * entire voice-over is 150 credits — 1.5% of the monthly allowance.
 *
 * Sound effects bill by duration, roughly 40 credits/second with a ~100 credit
 * floor. The four hero cues come to ~800.
 *
 * Music is deliberately NOT generated here. ElevenLabs Music is not on the free
 * plan, and a 58-second bed would dominate the allowance even if it were. The
 * synthesised score in `synth-audio.mjs` stays until you commission a real one.
 *
 * `--dry` prints the exact bill before you spend anything. Run it first.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");

/* ── Config ──────────────────────────────────────────────────────────────── */

/**
 * Female voice candidates for this read.
 *
 * The brief is narrow: low register, unhurried, close-mic'd, nearly
 * conversational, and it has to sit *under* music without disappearing. That
 * rules out the bright, upbeat, social-media voices immediately — they read as
 * advertising, and the whole film is built to avoid sounding like an advert.
 *
 * Audition them with `npm run vo:compare` (one line each, ~29 credits a voice).
 */
const VOICES = {
  /** Conversational, expressive. THE CHOSEN READ — see settings note below. */
  jessica: { id: "cgSgspJ2msm6clMCkdW9", note: "conversational, expressive — the default" },
  /** Warm, friendly narration. Softer alternative. */
  matilda: { id: "XrExE9yKIg1WjnnlVkGX", note: "warm, friendly narration" },
  /** Soft, young, understated. */
  sarah: { id: "EXAVITQu4vr4xnSDxMaL", note: "soft, understated" },
  /** British, measured, news-presenter poise. Too broadcast-clean for this film. */
  alice: { id: "Xb7hH8MSUJpSbSDYk0k2", note: "British · measured (rejected: reads as AI)" },
  /** British, warm, lower register. */
  lily: { id: "pFZP5JQG7iQjIQuC4Bku", note: "British · warm, low" },
};

const voiceArg = process.argv.find((a) => a.startsWith("--voice="))?.split("=")[1];
const VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ??
  VOICES[voiceArg ?? "jessica"]?.id ??
  VOICES.jessica.id;

/**
 * `eleven_v3`, not `multilingual_v2`.
 *
 * v3 handles short, flat, declarative lines — which is all this script is —
 * markedly better. The older model gives them a uniform contour that is
 * unmistakably synthetic.
 */
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_v3";

/**
 * ── The settings that stopped it sounding like a robot ──────────────────────
 *
 * The first attempt used `stability: 0.62`, reasoning that a high value would
 * stop the voice over-performing, since the pictures are doing the emotional
 * work. That was backwards, and it is the single reason the first take was
 * rejected as "too much like AI".
 *
 * On ElevenLabs, stability does not control theatricality — it controls **pitch
 * variance**. High stability flattens the contour, and a four-word sentence
 * delivered with a flat contour is the most recognisable TTS artefact there is.
 * Real speech varies pitch even when the delivery is deadpan.
 *
 *   stability 0.40   — low enough that the model inflects. Counter-intuitive,
 *                      and the whole fix.
 *   similarity 0.75  — consistent timbre across six separate calls without
 *                      over-constraining delivery. 0.80+ starts to flatten too.
 *   style 0.40       — real expressiveness. At 0.15 it read as a screen reader.
 *
 * No `speed` override: v3 paces short lines well on its own, and slowing it was
 * another thing making the read sound processed.
 */
const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.75,
  style: 0.4,
  use_speaker_boost: true,
};

/**
 * The script. Frames are absolute on the master timeline and must match
 * `VO_SLOTS` in `src/video/audio/cues.ts` — that is what actually places them.
 */
const VO = [
  {
    id: "vo-01",
    at: 152,
    text: "It's not a hard test.",
    direction: "Flat. Almost a shrug. This is not a hook, it is a shared fact.",
  },
  {
    id: "vo-02",
    at: 392,
    // Shortened from "So why do six in ten people fail it?" — that ran 36
    // characters and was still being spoken when the scene cut. The block it
    // sits over is only ~116 frames.
    text: "So why do six in ten fail?",
    direction: "No emphasis on any word. The number on screen does the work.",
  },
  {
    id: "vo-03",
    at: 1480,
    text: "Know exactly where you stand.",
    direction: "Warm, quiet, over the product. The first reassurance in the film.",
  },
  {
    id: "vo-04",
    at: 1690,
    // Filler, and deliberately not a description of anything on screen.
    text: "Everyone studies. Almost nobody studies right.",
    direction: "Conversational, a little wry. The thesis of the product.",
  },
  {
    id: "vo-05",
    at: 1975,
    text: "It finds what's actually holding you back.",
    direction: "On the weak-spots scene, as the list reorders itself.",
  },
  {
    id: "vo-06",
    at: 2330,
    text: "Ten minutes a day. That's all it asks.",
    direction: "Filler over the daily plan. Easy, unhurried, no hard sell.",
  },
  {
    id: "vo-07",
    at: 2650,
    text: "And when you're stuck, it explains why.",
    direction: "On the tutor scene, as the panel rises.",
  },
  {
    id: "vo-08",
    at: 3122,
    // The only time the name is spoken, on the only frame the logo appears.
    text: "K53 Mentor A I.",
    direction: "Once, quietly, as the mark draws. Let the chimes carry it.",
  },
  {
    id: "vo-09",
    at: 3268,
    text: "Pass first time.",
    direction: "The last words in the film. Let it sit. Do not lift the ending.",
  },
];

/**
 * Hero SFX. Only four — the moments a synthesised one-shot cannot carry.
 * Everything else in `synth-audio.mjs` is already doing its job.
 */
const SFX = [
  {
    id: "impact-huge",
    seconds: 4,
    prompt:
      "Deep cinematic trailer impact. Massive sub-bass drop with a short metallic transient, long dark reverb tail. No music, no melody.",
    note: "0:15 the failure stamp, and 0:19 the reveal drop",
  },
  {
    id: "shatter",
    seconds: 2,
    prompt:
      "Thin sheet of glass cracking and splintering, sharp high transients, short room tail. Dry, close, no music.",
    note: "0:14 the line fractures",
  },
  {
    id: "glass",
    seconds: 3,
    prompt:
      "Soft glassy shimmer, like a crystal rod struck once and ringing out. Clean, bright, inharmonic, long decay. No music.",
    note: "0:20 the logo mark draws itself",
  },
  {
    id: "whoosh",
    seconds: 2,
    prompt:
      "Fast cinematic air whoosh passing the camera left to right, filtered noise sweep rising then falling. No music.",
    note: "0:18 the road rushing the lens",
  },
];

/* ── Cost model ──────────────────────────────────────────────────────────── */

const voCost = (t) => t.length; // confirmed 1 credit per character
const sfxCost = (s) => Math.max(100, Math.round(s * 40));

const FREE_TIER = 10000;

/* ── Env ─────────────────────────────────────────────────────────────────── */

const PLACEHOLDER = "PASTE_YOUR_KEY_HERE";

const loadKey = () => {
  const fromEnv = process.env.ELEVENLABS_API_KEY;
  if (fromEnv && fromEnv !== PLACEHOLDER) return fromEnv;

  const envFile = join(ROOT, ".env");
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, "utf8").match(/^ELEVENLABS_API_KEY\s*=\s*(.+)$/m);
    if (m) {
      const key = m[1].trim().replace(/^["']|["']$/g, "");
      // The .env ships with a placeholder so the file exists and is easy to
      // find. Catch it here, otherwise the user gets an opaque 401 instead of
      // being told they simply have not pasted the key yet.
      if (key === PLACEHOLDER) return { placeholder: true };
      if (key) return key;
    }
  }
  return null;
};

/* ── Generation ──────────────────────────────────────────────────────────── */

const post = async (url, key, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    // The most common failure by a mile is a per-key credit cap, which reads as
    // a 401 rather than a 402 and sends people looking in the wrong place.
    if (detail.includes("quota_exceeded")) {
      throw new Error(
        "ElevenLabs refused the request: the API key has no credits.\n\n" +
          "  If it says 'quota of 0' this is a PER-KEY cap, not an empty account:\n" +
          "  ElevenLabs dashboard → Profile → API Keys → edit the key → raise its\n" +
          "  credit limit (2000 is plenty for this film) → save.\n\n" +
          `  Raw: ${detail}`,
      );
    }
    throw new Error(`${res.status} ${res.statusText}\n${detail}`);
  }

  return Buffer.from(await res.arrayBuffer());
};

/**
 * Audition mode. Renders one line — the warm one, which has enough syllables to
 * judge timbre — in every candidate voice, into `public/audio/vo/_compare/`.
 * Listen, pick, then run the real thing with `--voice=<name>`.
 */
const compare = async (key) => {
  const line = VO.find((v) => v.id === "vo-04").text;
  const dir = join(ROOT, "public", "audio", "vo", "_compare");
  mkdirSync(dir, { recursive: true });

  console.log(`Auditioning: "${line}"  (${line.length} credits each)\n`);

  for (const [name, v] of Object.entries(VOICES)) {
    process.stdout.write(`  ${name.padEnd(9)} ${v.note.padEnd(44)} … `);
    const audio = await post(
      `https://api.elevenlabs.io/v1/text-to-speech/${v.id}`,
      key,
      { text: line, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS },
    );
    writeFileSync(join(dir, `${name}.mp3`), audio);
    console.log("ok");
  }

  console.log(
    `\n  → public/audio/vo/_compare/  (${Object.keys(VOICES).length * line.length} credits)\n` +
      `\n  Play them, pick one, then:  npm run vo -- --voice=<name>\n`,
  );
};

const main = async () => {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const withSfx = args.includes("--sfx");
  const wantCompare = args.includes("--compare");

  const voTotal = VO.reduce((n, v) => n + voCost(v.text), 0);
  const sfxTotal = withSfx ? SFX.reduce((n, s) => n + sfxCost(s.seconds), 0) : 0;

  console.log("\n╭─ ElevenLabs bill ──────────────────────────────────────────╮");
  for (const v of VO) {
    console.log(
      `│ ${v.id}  ${String(voCost(v.text)).padStart(4)} cr  ${JSON.stringify(v.text).slice(0, 40).padEnd(42)}│`,
    );
  }
  if (withSfx) {
    for (const s of SFX) {
      console.log(
        `│ ${s.id.padEnd(12)}${String(sfxCost(s.seconds)).padStart(4)} cr  ${s.note.slice(0, 40).padEnd(42)}│`,
      );
    }
  }
  const total = voTotal + sfxTotal;
  console.log("├────────────────────────────────────────────────────────────┤");
  console.log(
    `│ TOTAL ${String(total).padStart(5)} credits  ·  ${((total / FREE_TIER) * 100).toFixed(1)}% of the 10,000 free tier`.padEnd(
      61,
    ) + "│",
  );
  console.log("╰────────────────────────────────────────────────────────────╯\n");

  if (dry) {
    console.log("Dry run — nothing was generated and nothing was billed.\n");
    return;
  }

  const key = loadKey();

  if (key && key.placeholder) {
    console.error(
      "Your key has not been pasted in yet.\n\n" +
        `  Open this file:   ${join(ROOT, ".env")}\n\n` +
        "  Replace PASTE_YOUR_KEY_HERE with your ElevenLabs key (starts with sk_),\n" +
        "  save, and run this command again.\n",
    );
    process.exit(1);
  }

  if (!key) {
    console.error(
      "ELEVENLABS_API_KEY is not set.\n\n" +
        `  Open this file:   ${join(ROOT, ".env")}\n` +
        "  and add the line:  ELEVENLABS_API_KEY=sk_your_key_here\n",
    );
    process.exit(1);
  }

  if (wantCompare) {
    await compare(key);
    return;
  }

  const chosen =
    Object.entries(VOICES).find(([, v]) => v.id === VOICE_ID)?.[0] ?? "custom";
  console.log(`Voice: ${chosen} (${VOICE_ID})\n`);

  // One folder per voice, so generating a second take never destroys the first
  // and you can A/B two finished reads against the picture rather than against
  // your memory of the other one. `VO_VOICE` in cues.ts selects which plays.
  const voDir = join(ROOT, "public", "audio", "vo", chosen);
  mkdirSync(voDir, { recursive: true });

  for (const v of VO) {
    process.stdout.write(`  ${v.id} … `);
    const audio = await post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      key,
      { text: v.text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS },
    );
    writeFileSync(join(voDir, `${v.id}.mp3`), audio);
    console.log(
      `${(audio.length / 1024).toFixed(0)} KB  →  public/audio/vo/${chosen}/${v.id}.mp3`,
    );
  }

  if (withSfx) {
    const sfxDir = join(ROOT, "public", "audio");
    for (const s of SFX) {
      process.stdout.write(`  ${s.id} … `);
      const audio = await post("https://api.elevenlabs.io/v1/sound-generation", key, {
        text: s.prompt,
        duration_seconds: s.seconds,
        prompt_influence: 0.45,
      });
      // Written alongside the synthesised set with an `-el` suffix so nothing is
      // destroyed. Swap them in by renaming once you have listened to both.
      writeFileSync(join(sfxDir, `${s.id}-el.mp3`), audio);
      console.log(`${(audio.length / 1024).toFixed(0)} KB  →  public/audio/${s.id}-el.mp3`);
    }
  }

  console.log("\nDone.");
  console.log("Next:  set VO_ENABLED = true in src/video/audio/cues.ts, then npm run dev\n");
};

main().catch((e) => {
  console.error(`\n${e.message}\n`);
  process.exit(1);
});
