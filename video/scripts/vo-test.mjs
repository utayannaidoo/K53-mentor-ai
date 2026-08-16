#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VO SETTINGS TEST
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/vo-test.mjs
 *
 * Renders the same two lines across several model/settings combinations into
 * `public/audio/vo/_test/`, so the "does this sound like a robot" question gets
 * answered by listening rather than by argument.
 *
 * ── Why the first attempt sounded synthetic ─────────────────────────────────
 * Stability was set to 0.62. That reads as the safe choice — it stops the voice
 * over-performing — but on ElevenLabs high stability *removes* pitch variance,
 * and a four-word sentence delivered with no pitch variance is the single most
 * recognisable TTS artefact there is. The fix is counter-intuitive: **lower**
 * stability, so the model is allowed to inflect.
 *
 * The second factor is the model. `eleven_v3` handles short, flat, declarative
 * lines far better than `multilingual_v2`, and it accepts inline delivery tags
 * like [thoughtful] which give the read an intention it otherwise has to guess.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(ROOT, "public", "audio", "vo", "_test");

const loadKey = () => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const f = join(ROOT, ".env");
  if (existsSync(f)) {
    const m = readFileSync(f, "utf8").match(/^ELEVENLABS_API_KEY\s*=\s*(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
};

/**
 * Voices chosen for *naturalism* rather than polish. The news-presenter voices
 * from the first round are technically cleaner and that is exactly the problem
 * — broadcast-clean is what "AI voice" sounds like now. These read closer to
 * someone talking.
 */
const VOICES = {
  jessica: "cgSgspJ2msm6clMCkdW9", // conversational, expressive
  matilda: "XrExE9yKIg1WjnnlVkGX", // warm, friendly narration
  sarah: "EXAVITQu4vr4xnSDxMaL", // soft, young, understated
};

const TESTS = [
  {
    id: "A-v3-jessica-natural",
    voice: VOICES.jessica,
    model: "eleven_v3",
    settings: { stability: 0.4, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
    note: "v3 · conversational voice · low stability = allowed to inflect",
  },
  {
    id: "B-v3-matilda-natural",
    voice: VOICES.matilda,
    model: "eleven_v3",
    settings: { stability: 0.35, similarity_boost: 0.75, style: 0.45, use_speaker_boost: true },
    note: "v3 · warm voice · lower still",
  },
  {
    id: "C-v3-sarah-natural",
    voice: VOICES.sarah,
    model: "eleven_v3",
    settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true },
    note: "v3 · soft understated voice",
  },
  {
    id: "D-v2-jessica-natural",
    voice: VOICES.jessica,
    model: "eleven_multilingual_v2",
    settings: { stability: 0.35, similarity_boost: 0.75, style: 0.5, speed: 1.0, use_speaker_boost: true },
    note: "old model, but with the corrected low-stability settings",
  },
  {
    id: "E-OLD-what-you-heard",
    voice: "Xb7hH8MSUJpSbSDYk0k2",
    model: "eleven_multilingual_v2",
    settings: { stability: 0.62, similarity_boost: 0.8, style: 0.15, speed: 0.94, use_speaker_boost: true },
    note: "the original settings, for reference — this is the one you disliked",
  },
];

/** Two lines back to back: the flat opener and the warm one. */
const LINE = "It's not a hard test. So why do six in ten people fail it?";

const main = async () => {
  const key = loadKey();
  if (!key) {
    console.error(`\nNo API key in ${join(ROOT, ".env")}\n`);
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  console.log(`\nTest line (${LINE.length} credits each):\n  "${LINE}"\n`);

  for (const t of TESTS) {
    process.stdout.write(`  ${t.id.padEnd(24)} ${t.note.padEnd(52)} … `);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${t.voice}`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: LINE, model_id: t.model, voice_settings: t.settings }),
    });
    if (!res.ok) {
      console.log(`FAILED ${res.status} — ${(await res.text()).slice(0, 90)}`);
      continue;
    }
    writeFileSync(join(OUT, `${t.id}.mp3`), Buffer.from(await res.arrayBuffer()));
    console.log("ok");
  }

  console.log(
    `\n  → public/audio/vo/_test/   (${TESTS.length * LINE.length} credits)\n` +
      "\n  E is the version you heard. Compare A-D against it.\n",
  );
};

main().catch((e) => {
  console.error(`\n${e.message}\n`);
  process.exit(1);
});
