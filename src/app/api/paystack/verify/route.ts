import { isPaystackConfigured, isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, limitCheckout } from "@/lib/ai/rate-limit";
import { verifyTransaction } from "@/lib/paystack/client";
import { applyChargeSuccess, type ChargeSuccessData } from "@/lib/paystack/apply";

export const runtime = "nodejs";

/**
 * Confirm a payment on the checkout callback by verifying the transaction with
 * Paystack (its recommended flow) instead of waiting for the async webhook.
 *
 * Paystack redirects the buyer back with a `reference`; we re-fetch that
 * transaction from Paystack — the source of truth — and, if it succeeded,
 * grant the entitlement through the exact same code path the webhook uses.
 * The shared `payment_events` ledger guarantees a charge is applied at most
 * once, no matter whether verify or the webhook gets there first.
 */
export async function POST(req: Request) {
  const rl = await limitCheckout(clientIp(req));
  if (!rl.success) {
    return Response.json(
      { error: "rate_limited", retryAfter: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!isPaystackConfigured || !isSupabaseConfigured) {
    return Response.json({ error: "Billing not configured", demo: true }, { status: 501 });
  }

  let reference = "";
  try {
    reference = String(((await req.json()) as { reference?: unknown }).reference ?? "").trim();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!reference) {
    return Response.json({ error: "Missing reference" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!user || !supabase) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return Response.json({ error: "Storage not configured" }, { status: 500 });
  }

  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch (err) {
    console.error("paystack/verify: paystack error", err);
    return Response.json({ error: "Verification failed — please try again shortly." }, { status: 502 });
  }

  if (tx.status !== "success") {
    return Response.json({ verified: false, status: tx.status });
  }

  const meta = tx.metadata ?? {};
  // The metadata was set by us at initialize, so it's the trusted owner of the
  // charge. A signed-in user may only apply their own payment.
  if (meta.user_id && meta.user_id !== user.id) {
    return Response.json({ error: "reference_mismatch" }, { status: 403 });
  }

  // Idempotency: share the webhook's ledger and its id shape, so the two paths
  // can race safely — whoever inserts the row first applies the grant.
  const ledgerId = `charge.success:${tx.id}`;
  const { error: ledgerError } = await admin
    .from("payment_events")
    .insert({ id: ledgerId, type: "charge.success" });
  const alreadyApplied = ledgerError?.code === "23505";

  if (!alreadyApplied) {
    // verify returns `plan` as an object or a bare code; normalise to the
    // { plan_code } the shared grant expects.
    const planCode = typeof tx.plan === "string" ? tx.plan : tx.plan?.plan_code;
    const data: ChargeSuccessData = {
      id: tx.id,
      reference: tx.reference,
      amount: tx.amount,
      customer: tx.customer,
      metadata: meta,
      plan: planCode ? { plan_code: planCode } : null,
    };
    await applyChargeSuccess(admin, data);
  }

  // Return the current tier so the client can reflect it without a reload.
  const { data: row } = await admin
    .from("subscriptions")
    .select("tier,status")
    .eq("user_id", user.id)
    .maybeSingle();

  return Response.json({
    verified: true,
    tier: (row as { tier?: string } | null)?.tier ?? "free",
    status: (row as { status?: string } | null)?.status ?? null,
  });
}
