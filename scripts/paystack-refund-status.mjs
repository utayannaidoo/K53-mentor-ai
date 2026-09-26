/** Read-only refund preflight. Never submits a refund or changes the retry queue. */
import path from "node:path";
import { fileURLToPath } from "node:url";

try {
  process.loadEnvFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const [reference, ...extra] = process.argv.slice(2);
if (!reference || reference.startsWith("--") || extra.length) {
  console.error("Usage: node scripts/paystack-refund-status.mjs <transaction-reference>");
  process.exit(2);
}
const key = process.env.PAYSTACK_SECRET_KEY;
if (!key || !/^sk_(live|test)_/.test(key)) {
  console.error("Set PAYSTACK_SECRET_KEY to the account's live or test secret key.");
  process.exit(2);
}

async function get(endpoint) {
  const response = await fetch("https://api.paystack.co" + endpoint, {
    headers: { Authorization: "Bearer " + key },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json();
  if (!response.ok || body.status !== true) {
    throw new Error("Paystack read failed: " + (body.message ?? response.status));
  }
  return body;
}

try {
  const { data: tx } = await get("/transaction/verify/" + encodeURIComponent(reference));
  if (tx.reference !== reference || tx.status !== "success" || !Number.isSafeInteger(tx.id) ||
      !Number.isSafeInteger(tx.amount) || tx.amount <= 0 || typeof tx.currency !== "string") {
    throw new Error("Transaction is not a verified successful charge; inspect it in Paystack.");
  }
  const refunds = [];
  let page = 1;
  let pageCount;
  do {
    const result = await get("/refund?transaction=" + tx.id + "&perPage=100&page=" + page);
    if (!Array.isArray(result.data) || !Number.isInteger(result.meta?.pageCount) || result.meta.pageCount < 0) {
      throw new Error("Incomplete refund history; inspect it in Paystack.");
    }
    refunds.push(...result.data);
    pageCount = result.meta.pageCount;
    if (pageCount > 100) throw new Error("Refund history exceeds the preflight limit; inspect it in Paystack.");
    page++;
  } while (page <= pageCount);
  const { data: balances } = await get("/balance");
  if (!Array.isArray(balances)) throw new Error("Unable to read the account balance.");
  const balance = balances.find((b) => b.currency === tx.currency)?.balance;
  const balanceKnown = Number.isSafeInteger(balance) && balance >= 0;
  const result = {
    mode: key.startsWith("sk_live_") ? "LIVE" : "TEST",
    reference: tx.reference,
    currency: tx.currency,
    // Paystack amounts and balances are in the currency's minor units.
    chargeMinorUnits: tx.amount,
    availableBalanceMinorUnits: balanceKnown ? balance : null,
    refunds: refunds.map((r) => ({ id: r.id, status: r.status, amountMinorUnits: r.amount })),
    nextStep: refunds.length
      ? "Existing refund history: reconcile it before any retry, including pending or failed records."
      : !balanceKnown
        ? "Balance unknown: inspect Paystack before any retry."
        : balance < tx.amount
          ? "Insufficient balance: fund the refund balance before an operator reopens the exhausted queue row."
          : "No recorded refund and sufficient reported balance: operator review required before reopening the queue row.",
    mutated: false,
  };
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
