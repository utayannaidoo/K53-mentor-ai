#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCORE — ElevenLabs Music
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   node scripts/generate-music.mjs --probe    # is Music on this plan? free
 *   node scripts/generate-music.mjs            # generate the 58s bed
 *
 * Replaces `public/audio/bed.wav` — the synthesised placeholder — with a real
 * generated score. The old file is kept as `bed-synth.wav` so nothing is lost
 * and you can A/B them.
 *
 * ── The prompt is doing real work ───────────────────────────────────────────
 * A generic "cinematic trailer music" prompt produces exactly the stock bed
 * that makes launch films feel templated. This one describes the film's actual
 * dynamic arc — the near-silent opening, the collapse at 0:16, the drop at
 * 0:19, the resolve at 0:52 — because the edit is already cut to that shape and
 * a bed that ignores it will fight every cut.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(ROOT, "public", "audio");

/** 3480 frames at 60fps. The bed must cover the whole film. */
const LENGTH_MS = 58_000;

/**
 * Written as a brief to a composer, not as a list of adjectives. Section
 * timings match `docs/TIMING-SHEET.md` exactly.
 */
const PROMPT = `Cinematic minimal electronic score for a premium technology product film. 58 seconds, 120 BPM, A minor, fully instrumental, no vocals, no drums until 0:19.

0:00-0:06 — almost silence. A single deep sub drone, barely audible, and a faint high shimmer. Restrained and patient. Space, not sound.

0:06-0:16 — tension accumulates. A low pulse enters on the beat. Add a quiet dissonant string or synth line grinding a minor second above the root. Filtered noise slowly rising. Never loud, only denser and more anxious.

0:16-0:19 — everything drops away to near-total silence for one second, then a low sub-bass riser sweeps upward.

0:19 — THE DROP. Full warm A-minor chord, deep sub-bass, wide analogue pad, a single struck bell. Emotional, spacious, hopeful. This is the peak.

0:19-0:48 — sustained and confident. A gentle arpeggio on the beat, plenty of headroom in the mids so dialogue and sound effects can sit through it. Calm forward motion, never busy.

0:48-0:52 — a final controlled build.

0:52 — the harmony resolves from minor to major. Warm, uplifting, resolved.

0:52-0:58 — the arrangement thins to a single sustained warm chord and fades to nothing.

Reference feel: Apple product film, Max Richter restraint, Jon Hopkins texture. Elegant and understated. Absolutely no epic trailer braams, no orchestral hits, no aggressive percussion.`;

/* ── Key ─────────────────────────────────────────────────────────────────── */

const PLACEHOLDER = "PASTE_YOUR_KEY_HERE";

const loadKey = () => {
  const fromEnv = process.env.ELEVENLABS_API_KEY;
  if (fromEnv && fromEnv !== PLACEHOLDER) return fromEnv;
  const envFile = join(ROOT, ".env");
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, "utf8").match(/^ELEVENLABS_API_KEY\s*=\s*(.+)$/m);
    if (m) {
      const key = m[1].trim().replace(/^["']|["']$/g, "");
      if (key && key !== PLACEHOLDER) return key;
    }
  }
  return null;
};

/* ── Run ─────────────────────────────────────────────────────────────────── */

const main = async () => {
  const probe = process.argv.includes("--probe");
  const key = loadKey();

  if (!key) {
    console.error(`\nNo API key. Add it to ${join(ROOT, ".env")}\n`);
    process.exit(1);
  }

  if (probe) {
    // Ask the account what it is entitled to before spending anything.
    const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) {
      console.error(`\nCould not read subscription: ${res.status}\n${await res.text()}\n`);
      process.exit(1);
    }
    const s = await res.json();
    console.log("\n╭─ ElevenLabs account ───────────────────────────────────╮");
    console.log(`│ Plan            ${String(s.tier ?? "?").padEnd(38)}│`);
    console.log(
      `│ Credits used    ${String(`${s.character_count ?? "?"} / ${s.character_limit ?? "?"}`).padEnd(38)}│`,
    );
    const left = (s.character_limit ?? 0) - (s.character_count ?? 0);
    console.log(`│ Remaining       ${String(left).padEnd(38)}│`);
    console.log("╰────────────────────────────────────────────────────────╯\n");
    console.log("Probing the Music API with a 5-second request…\n");

    const test = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "quiet ambient drone", music_length_ms: 10000 }),
    });

    if (test.ok) {
      const buf = Buffer.from(await test.arrayBuffer());
      mkdirSync(OUT, { recursive: true });
      writeFileSync(join(OUT, "_music-probe.mp3"), buf);
      console.log(
        `  Music IS available.  ${(buf.length / 1024).toFixed(0)} KB written to public/audio/_music-probe.mp3\n` +
          "  Run without --probe to generate the real 58-second bed.\n",
      );
    } else {
      console.log(`  Music API said ${test.status}:\n  ${await test.text()}\n`);
    }
    return;
  }

  console.log("\nGenerating 58s score… this takes a minute or two.\n");

  const res = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: PROMPT, music_length_ms: LENGTH_MS }),
  });

  if (!res.ok) {
    console.error(`\n${res.status} ${res.statusText}\n${await res.text()}\n`);
    process.exit(1);
  }

  const audio = Buffer.from(await res.arrayBuffer());

  // Preserve the synthesised bed rather than destroying it — it is still the
  // only version guaranteed to hit every cue in docs/SFX-TIMELINE.md.
  const bed = join(OUT, "bed.wav");
  if (existsSync(bed) && !existsSync(join(OUT, "bed-synth.wav"))) {
    renameSync(bed, join(OUT, "bed-synth.wav"));
    console.log("  kept the old placeholder as public/audio/bed-synth.wav");
  }

  writeFileSync(join(OUT, "bed.mp3"), audio);
  console.log(`  ${(audio.length / 1024 / 1024).toFixed(2)} MB  →  public/audio/bed.mp3\n`);
  console.log("  Set MUSIC.ext = 'mp3' in src/video/audio/cues.ts, then npm run dev\n");
};

main().catch((e) => {
  console.error(`\n${e.message}\n`);
  process.exit(1);
});
