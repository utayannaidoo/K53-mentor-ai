#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VOICE-OVER — Microsoft Edge neural TTS (no API key, no credits)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/generate-vo-edge.mjs --dry     # print the plan, generate nothing
 *   node scripts/generate-vo-edge.mjs           # generate the 7 VO lines
 *
 * Why not ElevenLabs (`generate-vo.mjs`): that path needs ELEVENLABS_API_KEY,
 * which is not configured on this machine. Edge's online neural service is free
 * and — decisively for this film — ships South African English voices, which the
 * brief in cues.ts asks for. Quality on short declarative lines is close enough
 * that under music, at this mix level, the two are hard to tell apart.
 *
 * ── The read: two agents ────────────────────────────────────────────────────
 * The film has a villain act and a hero act, so it has two narrators:
 *
 *   LUKE  en-ZA-LukeNeural   Acts I–II. The problem. Flat, dry, a shrug.
 *   LEAH  en-ZA-LeahNeural   Acts III–V. The product. Warm, quiet, reassurance.
 *
 * Both land in one folder — `public/audio/vo/za-duo/` — because `VO_VOICE` in
 * cues.ts selects a *read*, not a voice, and this read happens to be a duo.
 *
 * ── Slot fitting ────────────────────────────────────────────────────────────
 * Each line must fit inside its `maxFrames` window in VO_SLOTS or Remotion
 * cuts it mid-word. Generation therefore loops: render, measure, and if the
 * take overruns 90% of its budget, re-render faster until it fits. MP3 duration
 * is derived from the constant bitrate, which for speech is accurate to a few
 * milliseconds.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT_DIR = join(ROOT, "public", "audio", "vo", "za-duo");

const FPS = 60;
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3; // CBR → measurable
const BITS_PER_SEC = 48_000;

const VOICES = {
  luke: "en-ZA-LukeNeural",
  leah: "en-ZA-LeahNeural",
};

/**
 * The script. `at`, `maxFrames` and `line` mirror `VO_SLOTS` in
 * src/video/audio/cues.ts — that file places the audio; this file only makes
 * it. Keep the two in step when re-timing the film.
 *
 * `rate` pins the delivery and skips auto-fitting. Set it where the natural
 * read does not fit the picture's window and you have verified by probe that
 * the pinned rate lands inside it (scripts/vo-rate-probe.mjs).
 */
const VO = [
  {
    id: "vo-01",
    voice: "luke",
    text: "It's not a hard test.",
    direction: "Flat. Almost a shrug. A shared fact, not a hook.",
  },
  {
    id: "vo-02",
    voice: "luke",
    text: "So why do six in ten fail?",
    rate: 16,
    direction: "No emphasis anywhere. The number on screen does the work. Pinned +16% — the hook block yields to slam 1 at 504, so the question must land inside ~2s.",
  },
  {
    id: "vo-03",
    voice: "leah",
    text: "Know exactly where you stand.",
    direction: "Warm, quiet, over the product. First reassurance.",
  },
  {
    id: "vo-05",
    voice: "leah",
    text: "It finds what's actually holding you back.",
    direction: "As the weak-spots list reorders itself.",
  },
  {
    id: "vo-07",
    voice: "leah",
    text: "And when you're stuck, it explains why.",
    direction: "On the tutor scene, as the panel rises.",
  },
  {
    id: "vo-08",
    voice: "leah",
    // No spaced periods — they buy letter pauses the window cannot pay for.
    // The model spells "AI" either way; measured identical, 2.86s at −2%.
    text: "K53 Mentor AI",
    rate: -2,
    direction: "The only time the name is spoken, as the mark draws.",
  },
  {
    id: "vo-09",
    voice: "leah",
    text: "Pass first time.",
    direction: "Last words in the film. Let it sit.",
  },
];

/** Slot budgets, copied from VO_SLOTS. Fitted takes may use up to 90%. */
const BUDGETS = {
  "vo-01": 190,
  "vo-02": 134,
  "vo-03": 200,
  "vo-05": 240,
  "vo-07": 230,
  "vo-08": 156,
  "vo-09": 200,
};

const mp3Seconds = (bytes) => (bytes.length * 8) / BITS_PER_SEC;

async function speak(text, voiceName, ratePct) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICES[voiceName], FORMAT);
  const { audioStream } = tts.toStream(text, {
    rate: `${ratePct >= 0 ? "+" : ""}${ratePct}%`,
    pitch: "+0Hz",
    volume: 100,
  });
  const chunks = [];
  for await (const c of audioStream) chunks.push(c);
  return Buffer.concat(chunks);
}

async function fitLine(v) {
  const budgetFrames = BUDGETS[v.id];
  const budgetSec = (budgetFrames / FPS) * 0.9; // never ride the cut

  if (v.rate !== undefined) {
    const buf = await speak(v.text, v.voice, v.rate);
    return { buf, dur: mp3Seconds(buf), rate: v.rate };
  }

  let rate = v.voice === "luke" ? -4 : -2; // unhurried by default
  for (let attempt = 0; attempt < 4; attempt++) {
    const buf = await speak(v.text, v.voice, rate);
    const dur = mp3Seconds(buf);
    if (dur <= budgetSec || attempt === 3) return { buf, dur, rate };
    // Speed up by roughly the overrun, plus margin.
    rate += Math.ceil((dur / budgetSec - 1) * 100) + 4;
  }
}

const dry = process.argv.includes("--dry");

console.log("\n╭─ Edge TTS plan · read: za-duo ─────────────────────────────╮");
for (const v of VO) {
  const b = BUDGETS[v.id];
  console.log(
    `│ ${v.id}  ${v.voice.padEnd(5)}  ≤${String(Math.round((b / FPS) * 10) / 10).padStart(4)}s  ${JSON.stringify(v.text).slice(0, 36).padEnd(38)}│`,
  );
}
console.log("╰────────────────────────────────────────────────────────────╯\n");
if (dry) {
  console.log("Dry run — nothing generated.\n");
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const v of VO) {
  process.stdout.write(`  ${v.id} (${v.voice}) … `);
  const { buf, dur, rate } = await fitLine(v);
  writeFileSync(join(OUT_DIR, `${v.id}.mp3`), buf);
  const budget = BUDGETS[v.id] / FPS;
  const flag = dur > budget ? " ✗ OVER" : "";
  console.log(
    `${dur.toFixed(2)}s of ${budget.toFixed(2)}s budget  rate ${rate > 0 ? "+" : ""}${rate}%${flag}`,
  );
}

console.log(`\nDone → public/audio/vo/za-duo/\nNext: set VO_ENABLED = true in src/video/audio/cues.ts\n`);
