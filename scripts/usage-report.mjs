// What learners actually use, against what their plan allows.
//
//   npm run usage:report                 # tutor, last 30 days
//   npm run usage:report -- --days 90 --surface vision
//
// The caps in src/lib/billing/plans.ts have been set twice from estimates,
// because the only usage figure anyone had was the ceiling itself. This reads
// the aggregate written by migration 0021 and prints the distribution next to
// the cap, which is the comparison that decides whether an allowance is too
// tight, about right, or an unpriced tail.
//
// Read **p90 against the cap**, not the mean. The mean is dragged down by every
// learner who opened the app and asked one question; a cap only ever binds the
// tail. A p90 well under the cap means the allowance is not what limits anyone,
// and the cost model's "subscriber at their ceiling every day" is fiction. A
// p90 at the cap, or a non-zero `capped`, means real people are hitting a wall.
//
// Read-only. Needs the service-role key, since the table is server-owned.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  // May already be exported.
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}
const DAYS = Number(arg("days", 30));
const SURFACE = String(arg("surface", "tutor"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      "Put them in .env.local (the service-role key is server-only — never NEXT_PUBLIC_).\n",
  );
  process.exit(2);
}

const since = new Date(Date.now() - DAYS * 86_400_000).toISOString().slice(0, 10);

/** Percentile of a sorted numeric array, linear interpolation. */
function pct(sorted, p) {
  if (!sorted.length) return 0;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// Paged rather than a single select: a row is one user-day, so this grows with
// active users × days and will outrun the default 1000-row cap long before it
// is large enough to need real aggregation.
const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase
    .from("ai_usage_daily")
    .select("user_id, day, tier, requests, capped")
    .eq("surface", SURFACE)
    .gte("day", since)
    .range(from, from + 999);
  if (error) {
    console.error(
      `Query failed: ${error.message}\n` +
        (/does not exist/i.test(error.message)
          ? "Migration 0021 has probably not been applied to this project yet.\n"
          : ""),
    );
    process.exit(1);
  }
  rows.push(...data);
  if (data.length < 1000) break;
}

const server = await createServer({
  root,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
  resolve: {
    alias: {
      "server-only": path.resolve(root, "tests/stubs/server-only.ts"),
      "@": path.resolve(root, "src"),
    },
  },
  logLevel: "error",
});

try {
  const { PLAN_MAP } = await server.ssrLoadModule("/src/lib/billing/plans.ts");
  const capFor = (tier) =>
    SURFACE === "tutor" ? (PLAN_MAP[tier]?.caps?.tutorPerDay ?? null) : null;

  console.log(`\n${SURFACE} usage · since ${since} (${DAYS} days)\n`);

  if (!rows.length) {
    console.log(
      "No rows. Either nobody has used it yet, or migration 0021 is applied but\n" +
        "the deployed build predates the instrumentation.\n",
    );
  }

  const byTier = new Map();
  for (const r of rows) {
    if (!byTier.has(r.tier)) byTier.set(r.tier, []);
    byTier.get(r.tier).push(r);
  }

  const header = ["tier", "users", "user-days", "mean", "p50", "p90", "max", "cap", "capped"];
  const widths = [13, 6, 10, 6, 5, 5, 5, 5, 7];
  console.log(header.map((h, i) => h.padEnd(widths[i])).join(""));
  console.log(widths.map((w) => "─".repeat(w - 1) + " ").join(""));

  for (const tier of ["free", "premium", "premium_plus"]) {
    const tierRows = byTier.get(tier);
    if (!tierRows?.length) continue;
    const counts = tierRows.map((r) => r.requests).sort((a, b) => a - b);
    const users = new Set(tierRows.map((r) => r.user_id)).size;
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const cap = capFor(tier);
    const capped = tierRows.reduce((a, r) => a + (r.capped ?? 0), 0);
    const cells = [
      tier,
      users,
      counts.length,
      mean.toFixed(1),
      pct(counts, 0.5).toFixed(0),
      pct(counts, 0.9).toFixed(0),
      counts.at(-1),
      cap ?? "—",
      capped,
    ];
    console.log(cells.map((c, i) => String(c).padEnd(widths[i])).join(""));
  }

  // "user-days" is the denominator that matters and the one people get wrong:
  // these are days on which someone actually used the surface, not calendar
  // days. Averaging over calendar days would fold in every dormant account and
  // make any allowance look enormous.
  console.log(
    "\nuser-days = days on which that learner used it at all, not calendar days.\n" +
      "Compare p90 with cap. capped = requests refused for being over the allowance.\n",
  );

  const totalCapped = rows.reduce((a, r) => a + (r.capped ?? 0), 0);
  if (totalCapped > 0) {
    const affected = new Set(rows.filter((r) => (r.capped ?? 0) > 0).map((r) => r.user_id)).size;
    console.log(
      `⚠ ${affected} learner(s) hit the daily cap, ${totalCapped} time(s). That is the\n` +
        `  allowance actually binding — weigh it against docs/ops/ai-cost-model.md\n` +
        `  before raising anything.\n`,
    );
  }
} finally {
  await server.close();
}
