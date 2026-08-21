import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const FMT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
const sec = (bytes) => (bytes.length * 8) / 48_000;

async function dur(text, voice, rate) {
  const t = new MsEdgeTTS();
  await t.setMetadata(voice === "luke" ? "en-ZA-LukeNeural" : "en-ZA-LeahNeural", FMT);
  const { audioStream } = t.toStream(text, { rate: `${rate >= 0 ? "+" : ""}${rate}%`, pitch: "+0Hz", volume: 100 });
  const chunks = [];
  for await (const c of audioStream) chunks.push(c);
  return sec(Buffer.concat(chunks));
}

const cases = [
  ["vo-02", "luke", "So why do six in ten fail?", [-4, 4, 10, 16, 22]],
  ["vo-02b", "luke", "Why do six in ten fail?", [-4, 4, 10]],
  ["vo-08", "leah", "K53 Mentor A . I .", [-2, 20, 40]],
  ["vo-08b", "leah", "K53 Mentor AI.", [-2, 10]],
  ["vo-08c", "leah", "K53 Mentor. A. I.", [-2, 10]],
];

for (const [id, voice, text, rates] of cases) {
  const out = [];
  for (const r of rates) out.push(`${r > 0 ? "+" : ""}${r}%: ${(await dur(text, voice, r)).toFixed(2)}s`);
  console.log(id.padEnd(6), JSON.stringify(text).padEnd(28), out.join("   "));
}
