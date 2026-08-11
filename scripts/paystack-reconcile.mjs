// Diff the live Paystack Plans against src/lib/billing/plans.ts.
//
//   node scripts/paystack-reconcile.mjs        # or: npm run paystack:check
//
// ── Why ──────────────────────────────────────────────────────────────────────
//
// Checkout sends Paystack BOTH an amount and a Plan code. For a subscription,
// Paystack bills the **Plan's dashboard amount** and ignores the amount we
// sent. Nothing in the app, the tests or CI has ever asserted that those two
// figures agree, because one of them does not live in this repository.
//
// So the failure looks like this: someone edits a price in the Paystack
// dashboard, or fat-fingers one when creating a Plan, and from then on the
// pricing page advertises R60 while the card is debited something else. Nobody
// finds out until a customer complains — and charging a price other than the
// one advertised is a Consumer Protection Act problem, not a bug.
//
// This is the cheap, boring check that makes that impossible to miss. Run it
// after touching prices in either place, and before launch.
//
// Read-only: it lists Plans and prints. It never writes to Paystack.
//
// Needs PAYSTACK_SECRET_KEY and the four PAYSTACK_PLAN_* codes, which is why
// this is a script rather than a test — CI has no business holding a live
// billing key.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  // Fine — may already be exported, or passed inline.
}

const KEY = process.env.PAYSTACK_SECRET_KEY;
if (!KEY) {
  console.error(
    "PAYSTACK_SECRET_KEY is not set.\n" +
      "Put it in .env.local, or pass it inline:\n\n" +
      "  PAYSTACK_SECRET_KEY=sk_live_… node scripts/paystack-reconcile.mjs\n",
  );
  process.exit(2);
}
if (KEY.startsWith("sk_test_")) {
  console.warn(
    "⚠ This is a TEST key, so it lists your test-mode Plans.\n" +
      "  Live prices live under the live key — re-run with sk_live_… before trusting a pass.\n",
  );
}

/** The env var holding each Plan code, and what it should cost. */
const EXPECTED = [
  { env: "PAYSTACK_PLAN_PREMIUM_MONTHLY", plan: "premium", cycle: "monthly", interval: "monthly" },
  { env: "PAYSTACK_PLAN_PREMIUM_ANNUAL", plan: "premium", cycle: "annual", interval: "annually" },
  { env: "PAYSTACK_PLAN_PREMIUM_PLUS_MONTHLY", plan: "premium_plus", cycle: "monthly", interval: "monthly" },
  { env: "PAYSTACK_PLAN_PREMIUM_PLUS_ANNUAL", plan: "premium_plus", cycle: "annual", interval: "annually" },
];

async function paystack(pathname) {
  const res = await fetch(`https://api.paystack.co${pathname}`, {
    headers: { Authorization: `Bearer ${KEY}` },
    signal: AbortSignal.timeout(15_000),
  });
  const raw = await res.text();
  let body = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  if (!res.ok || !body?.status) {
    throw new Error(`Paystack ${pathname}: ${body?.message ?? `${res.status} ${res.statusText}`}`);
  }
  return body.data;
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

const rand = (cents) => `R ${(cents / 100).toFixed(2)}`;

let problems = 0;
try {
  const { expectedChargeCents } = await server.ssrLoadModule("/src/lib/billing/charge-amount.ts");

  // One list call, then match by code — cheaper and more robust than four
  // fetches, and it also lets us notice Plans that exist but nothing points at.
  const livePlans = await paystack("/plan?perPage=100");
  const byCode = new Map(livePlans.map((p) => [p.plan_code, p]));

  console.log("\nPaystack Plan  →  plans.ts\n");

  for (const row of EXPECTED) {
    const code = process.env[row.env];
    const label = `${row.plan} ${row.cycle}`.padEnd(22);
    const expected = expectedChargeCents(row.plan, row.cycle);

    if (!code) {
      console.log(`✗ ${label} ${row.env} is not set — checkout returns 500 for this plan`);
      problems++;
      continue;
    }

    const live = byCode.get(code);
    if (!live) {
      console.log(`✗ ${label} no Plan with code ${code} on this Paystack account`);
      problems++;
      continue;
    }

    const notes = [];
    if (live.amount !== expected) {
      notes.push(`amount ${rand(live.amount)} ≠ ${rand(expected)} in plans.ts`);
    }
    if (live.currency && live.currency.toUpperCase() !== "ZAR") {
      notes.push(`currency ${live.currency}, not ZAR`);
    }
    if (live.interval && live.interval !== row.interval) {
      notes.push(`interval "${live.interval}", expected "${row.interval}"`);
    }

    if (notes.length) {
      problems++;
      console.log(`✗ ${label} ${notes.join("; ")}`);
      console.log(`  ${" ".repeat(22)} ${code} — "${live.name}"`);
    } else {
      console.log(`✓ ${label} ${rand(live.amount)} ${row.interval}  (${code})`);
    }
  }

  // Plans nobody points at. Not a failure — old or experimental Plans are
  // normal — but a subscriber could still be sitting on one, so name them.
  const referenced = new Set(EXPECTED.map((r) => process.env[r.env]).filter(Boolean));
  const orphans = livePlans.filter((p) => !referenced.has(p.plan_code));
  if (orphans.length) {
    console.log(`\n${orphans.length} Plan(s) on the account that no env var points at:`);
    for (const p of orphans) {
      console.log(`  · ${p.plan_code}  ${rand(p.amount)} ${p.interval}  "${p.name}"`);
    }
    console.log(
      "  Existing subscribers may still be billed on these. Harmless if they are\n" +
        "  retired, worth checking if one looks like a current price.",
    );
  }
} finally {
  await server.close();
}

if (problems) {
  console.error(
    `\n${problems} mismatch(es). The site advertises one price and Paystack would charge another.\n` +
      `Fix the Plan in the Paystack dashboard, or the price in src/lib/billing/plans.ts.\n`,
  );
  process.exit(1);
}
console.log("\nAll Plans agree with plans.ts.\n");
