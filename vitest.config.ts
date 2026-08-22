import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    // Forks, not threads. Worker THREADS run inside one process, so
    // `process.env` is shared across every concurrently-running test file —
    // and several suites mutate it (hosted-without-supabase flips NODE_ENV
    // and deletes the Supabase keys; billing-security and webhook-events set
    // DIFFERENT Paystack secrets; payment-reconciliation toggles CRON_SECRET).
    // That let one file's mid-flight env edits fail another's assertions at
    // random (seen once as a hosted-without-supabase failure that passed in
    // isolation). A fork is a separate process with its own env.
    pool: "forks",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // "server-only" throws outside a React Server environment — stub it.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
