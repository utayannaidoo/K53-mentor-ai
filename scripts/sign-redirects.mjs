// Writes src/lib/content/sign-redirects.json: old single-sign page slug → the
// anchor that shows the sign now. next.config.mjs reads it to redirect the 151
// retired /road-signs/<slug> URLs.
// Usage: node scripts/sign-redirects.mjs
//
// Re-run it whenever a verified sign is added or renamed;
// tests/sign-redirects.test.ts fails until you do. The map comes from
// signRedirects() in src/lib/content/sign-category-pages.ts, loaded through
// Vite's SSR loader (as in scripts/content-stats.mjs) so the TypeScript and
// the "@/" alias resolve without a build.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const out = path.join(root, "src/lib/content/sign-redirects.json");

const server = await createServer({
  root,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
  // Mirrors the aliases in vitest.config.ts.
  resolve: {
    alias: {
      "server-only": path.resolve(root, "tests/stubs/server-only.ts"),
      "@": path.resolve(root, "src"),
    },
  },
  logLevel: "error",
});

try {
  const { signRedirects } = await server.ssrLoadModule("/src/lib/content/sign-category-pages.ts");
  const map = signRedirects();
  writeFileSync(out, `${JSON.stringify(map, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(map).length} redirects to ${path.relative(root, out)}`);
} finally {
  await server.close();
}
