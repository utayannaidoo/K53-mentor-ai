// Stamp the service-worker cache version with the deploy's commit SHA so each
// production deploy invalidates the previous cache. Only runs on Vercel (the
// build env is ephemeral there) — locally the tracked file stays untouched.
// Wired via the npm "prebuild" hook.
import { readFileSync, writeFileSync } from "node:fs";

if (!process.env.VERCEL) {
  console.log("stamp-sw: not on Vercel, leaving public/sw.js untouched");
  process.exit(0);
}

const sha = (process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString(36)).slice(0, 12);
const path = new URL("../public/sw.js", import.meta.url);
const src = readFileSync(path, "utf8");
const out = src.replace(/const VERSION = "[^"]+";/, `const VERSION = "k53-sw-${sha}";`);
if (out === src) throw new Error("stamp-sw: VERSION line not found in public/sw.js");
writeFileSync(path, out);
console.log(`stamp-sw: cache version set to k53-sw-${sha}`);
