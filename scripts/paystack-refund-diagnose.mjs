// Diagnose why refunds aren't landing on a Paystack account.
//
//   node scripts/paystack-refund-diagnose.mjs
//
// Read-only by default: validates the key, lists recent successful charges and
// EVERY refund Paystack has recorded. If the refunds list is empty after a
// money-back cancellation, the refund never reached Paystack — this script
// tells you which side swallowed it.
//
// To attempt the exact refund call the app makes (and see Paystack's raw
// answer), add the charge's reference plus --confirm. This MOVES MONEY in live
// mode, so it is double-flagged:
//
//   node scripts/paystack-refund-diagnose.mjs --refund <reference> --confirm
//
// Needs PAYSTACK_SECRET_KEY (in .env.local or inline) — CI has no business
// holding a live billing key.
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

try {
  process.loadEnvFile(path.join(root, ".env.local"));
} catch {
  // Fine — may already be exported, or passed inline.
}

const argv = process.argv.slice(2);
const refundIdx = argv.indexOf("--refund");
const REFUND_TARGET = refundIdx !== -1 ? argv[refundIdx + 1] : null;
const CONFIRMED = argv.includes("--confirm");

const KEY = process.env.PAYSTACK_SECRET_KEY;
if (!KEY) {
  console.error(
    "PAYSTACK_SECRET_KEY is not set.\n" +
      "Put it in .env.local, or pass it inline:\n\n" +
      "  PAYSTACK_SECRET_KEY=sk_live_… node scripts/paystack-refund-diagnose.mjs\n",
  );
  process.exit(2);
}
const LIVE = KEY.startsWith("sk_live_");
if (!LIVE && !KEY.startsWith("sk_test_")) {
  console.error("PAYSTACK_SECRET_KEY doesn't look like a Paystack secret key (expected sk_live_… or sk_test_…).");
  process.exit(2);
}
console.log(`Key mode: ${LIVE ? "LIVE" : "TEST"}\n`);
console.log(
  "Check the dashboard matches: the toggle at the top of app.paystack.com must say\n" +
    `${LIVE ? "\"Live\"" : "\"Test\""}, or you will be looking at a different set of transactions/refunds.\n`,
);

const rand = (cents) => `R ${(cents / 100).toFixed(2)}`;

async function paystack(pathname, init) {
  const res = await fetch(`https://api.paystack.co${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });
  const raw = await res.text();
  let body = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  // Return the envelope either way — for the refund POST the failure message
  // IS the diagnosis, so the caller needs it verbatim.
  return { httpStatus: res.status, body };
}

function shortDate(iso) {
  const t = Date.parse(iso ?? "");
  return Number.isFinite(t)
    ? new Date(t).toISOString().slice(0, 16).replace("T", " ")
    : String(iso ?? "?");
}

let problems = 0;

// ── 1. Does the key work at all? ─────────────────────────────────────────────
{
  const { httpStatus, body } = await paystack("/transaction?perPage=1");
  if (httpStatus === 401 || body?.message === "Invalid key") {
    console.error("✗ The key is rejected by Paystack (401 Invalid key).");
    console.error("  Every refund the app attempts fails the same way, silently.");
    console.error("  Copy the CURRENT secret key from Settings → API Keys & Webhooks");
    console.error("  (live section for live mode) into the deployment env and redeploy.");
    process.exit(1);
  }
  if (!body?.status) {
    console.error(`✗ Paystack refused a basic listing call: ${body?.message ?? httpStatus}`);
    process.exit(1);
  }
  console.log("✓ Key accepted by Paystack.\n");
}

// ── 2. Recent successful charges (where references come from) ────────────────
{
  const from = new Date(Date.now() - 31 * 86_400_000).toISOString().slice(0, 10);
  const { body } = await paystack(`/transaction?perPage=20&status=success&from=${from}`);
  const txs = Array.isArray(body?.data) ? body.data : [];
  console.log(`Successful charges, last 31 days (${txs.length}):`);
  if (!txs.length) {
    console.log("  · none — nothing on THIS account/key was charged recently.");
    console.log("    If you paid through the site, this deployment is pointed at a");
    console.log("    different Paystack account or mode than you are checking.");
    problems++;
  }
  for (const t of txs) {
    const planBit = t.plan && !Array.isArray(t.plan) && typeof t.plan === "object" ? t.plan.plan_code || "" : "";
    console.log(
      `  · ${shortDate(t.paid_at)}  ${rand(t.amount ?? 0).padEnd(10)} ${String(t.reference).padEnd(28)} ` +
        `${t.customer?.email ?? "?"} ${planBit ? `[${planBit}]` : "[one-off]"}`,
    );
  }
  console.log("");
}

// ── 3. The refunds list — what the dashboard's Refunds page shows ────────────
{
  const { body } = await paystack("/refund?perPage=50");
  const refunds = Array.isArray(body?.data) ? body.data : [];
  console.log(`Refunds on record for this account (${refunds.length}):`);
  if (!refunds.length) {
    console.log("  · none. Combined with a money-back cancellation that reported a");
    console.log("    refund, this means the refund API call failed before Paystack");
    console.log("    recorded anything — run with --refund <reference> --confirm to");
    console.log("    see the exact error Paystack returns.");
  }
  for (const r of refunds) {
    console.log(
      `  #${r.id}  ${shortDate(r.createdAt)}  ${rand(r.amount ?? 0).padEnd(10)} status=${r.status}  tx=${r.transaction}`,
    );
  }
  console.log("");
}

// ── 4. Optional live-fire: attempt one real refund, print the raw verdict ────
if (REFUND_TARGET) {
  if (!REFUND_TARGET || REFUND_TARGET.startsWith("--")) {
    console.error("--refund needs the transaction reference as its value.");
    process.exit(2);
  }

  const verify = await paystack(`/transaction/verify/${encodeURIComponent(REFUND_TARGET)}`);
  if (!verify.body?.status) {
    console.error(`✗ Transaction "${REFUND_TARGET}" not found on THIS key's account:`);
    console.error(`  ${verify.body?.message ?? verify.httpStatus}`);
    console.error("  Wrong account, wrong mode (live vs test toggle), or a typo'd reference.");
    process.exit(1);
  }
  const tx = verify.body.data;
  console.log(`Refund target: ${tx.reference}`);
  console.log(`  amount ${rand(tx.amount ?? 0)} · paid ${shortDate(tx.paid_at)} · ${tx.customer?.email ?? "?"}`);

  if (!CONFIRMED) {
    console.log("\nDry run only — re-run with --confirm to send the actual refund request:");
    console.log(`  node scripts/paystack-refund-diagnose.mjs --refund ${REFUND_TARGET} --confirm`);
    process.exit(0);
  }

  const post = await paystack("/refund", {
    method: "POST",
    body: JSON.stringify({
      transaction: REFUND_TARGET,
      merchant_note: "K53 Mentor refund diagnostic",
      customer_note: "Full refund issued by K53 Mentor AI support.",
    }),
  });

  if (post.body?.status) {
    console.log("\n✓ Refund ACCEPTED by Paystack — queued for processing.");
    console.log(`  id=${post.body.data?.id} status=${post.body.data?.status} expected_at=${post.body.data?.expected_at}`);
    console.log("  It now appears under dashboard Transactions → Refunds.");
  } else {
    problems++;
    console.log("\n✗ Paystack REFUSED the refund — this is the reason nothing shows on the dashboard:");
    console.log(`  HTTP ${post.httpStatus}: ${post.body?.message ?? "(no message)"}`);
    interpret(post.body?.message ?? "");
  }
} else if (!problems) {
  console.log("Read-only run complete. To fire one real refund and capture Paystack's exact response:");
  console.log("  node scripts/paystack-refund-diagnose.mjs --refund <transaction-reference> [--confirm]");
}

/** Turn Paystack's refusal into the thing to do about it. */
function interpret(message) {
  const m = message.toLowerCase();
  if (m.includes("insufficient") || m.includes("balance") || m.includes("settlement")) {
    console.log("\n  → INSUFFICIENT BALANCE. Live-mode refunds are deducted from your");
    console.log("    Paystack balance; once settlements have paid out to your bank there");
    console.log("    is nothing left to refund from, and BOTH this API call and the");
    console.log("    dashboard's own refund button fail identically. Fix: top up the");
    console.log("    Paystack balance (Dashboard → Settlements → Top Up) or refund right");
    console.log("    after a settlement lands. This is an account-state issue, not app code.");
  } else if (m.includes("already") || m.includes("exceed")) {
    console.log("\n  → This charge has already been refunded (fully or partially up to its");
    console.log("    amount). Check the refunds list above for the earlier attempt.");
  } else if (m.includes("not found") || m.includes("invalid transaction")) {
    console.log("\n  → The reference doesn't exist under this key. Different Paystack");
    console.log("    account, or the dashboard was on the other live/test toggle.");
  } else if (m.includes("activation") || m.includes("not enabled") || m.includes("restricted")) {
    console.log("\n  → The business account isn't fully activated/enabled for refunds.");
    console.log("    Contact Paystack support — no code change can lift this.");
  }
}

process.exit(problems ? 1 : 0);
