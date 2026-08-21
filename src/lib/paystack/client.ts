import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { assertLivePaystackKeyInProduction } from "@/lib/env";

// Every billing path routes through this module, so a test-key production
// deploy fails here — loudly, and without taking the rest of the app down.
assertLivePaystackKeyInProduction();

/**
 * Thin Paystack REST wrapper — no SDK dependency, same pattern as the Resend
 * email sender (src/lib/notify/email.ts). Paystack's hosted checkout
 * (`authorization_url`) needs only the secret key server-side; there's no
 * client-side public key or Inline JS involved.
 */

const API_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY not configured");
  return key;
}

/** Hard ceiling on any Paystack call — a hung upstream must not hold a serverless function open until the platform kills it. */
const REQUEST_TIMEOUT_MS = 15_000;

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  // A gateway outage can answer with HTML, not JSON — surface the HTTP status
  // instead of a bare JSON.parse SyntaxError.
  const raw = await res.text();
  let body: { status: boolean; message?: string; data: T } | null = null;
  try {
    body = JSON.parse(raw) as { status: boolean; message?: string; data: T };
  } catch {
    body = null;
  }
  if (!res.ok || !body?.status) {
    throw new Error(`Paystack ${path}: ${body?.message ?? `${res.status} ${res.statusText}`}`);
  }
  return body.data;
}

export interface InitializeTransactionInput {
  email: string;
  /** Amount in the currency's smallest unit (ZAR cents). Ignored when `plan` sets a fixed price. */
  amount?: number;
  /** A Paystack Plan code — when present, this initializes a subscription. */
  plan?: string;
  currency?: "ZAR";
  callback_url: string;
  metadata?: Record<string, string>;
}

export interface InitializeTransactionResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

/** Starts a hosted Paystack checkout; the client redirects to `authorization_url`. */
export function initializeTransaction(
  input: InitializeTransactionInput,
): Promise<InitializeTransactionResult> {
  return paystackFetch<InitializeTransactionResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ currency: "ZAR", ...input }),
  });
}

export interface VerifyTransactionResult {
  id: number;
  /** "success" once paid; also "failed" / "abandoned" / "ongoing". */
  status: string;
  reference: string;
  /** Amount actually paid, in ZAR cents. */
  amount?: number;
  currency?: string;
  customer: { customer_code: string; email: string; first_name?: string | null };
  metadata?: Record<string, string> | null;
  /** Present (object or bare code) on subscription charges; empty on one-offs. */
  plan?: { plan_code?: string } | string | null;
}

/**
 * Verify a transaction by its reference. Paystack's recommended way to confirm
 * a payment on the callback: it re-fetches the transaction from Paystack (the
 * source of truth) rather than trusting the redirect. Complements the webhook —
 * activation no longer has to wait for an async event to land.
 */
export function verifyTransaction(reference: string): Promise<VerifyTransactionResult> {
  return paystackFetch<VerifyTransactionResult>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

/**
 * A transaction as returned by the list endpoint. Same shape as verify, with
 * one wrinkle: the list endpoint sometimes returns `metadata` as a JSON
 * *string* rather than an object, so callers must go through
 * `normaliseTransaction` instead of reading it directly.
 */
export interface PaystackTransaction {
  id: number;
  status: string;
  reference: string;
  amount?: number;
  currency?: string;
  paid_at?: string | null;
  customer: { customer_code: string; email: string; first_name?: string | null };
  metadata?: Record<string, string> | string | null;
  plan?: { plan_code?: string } | string | null;
}

/**
 * List transactions, newest first. Used by the reconciliation cron to find
 * charges Paystack took that never landed as an applied event on our side.
 *
 * `from` is an ISO date/time string; Paystack treats it as inclusive.
 * Pagination is by page number because `paystackFetch` unwraps the envelope
 * and drops the `meta` block — callers page until a short page comes back.
 */
export function listTransactions(params: {
  from: string;
  page?: number;
  perPage?: number;
  status?: "success" | "failed" | "abandoned";
}): Promise<PaystackTransaction[]> {
  const q = new URLSearchParams({
    from: params.from,
    page: String(params.page ?? 1),
    perPage: String(params.perPage ?? 50),
  });
  if (params.status) q.set("status", params.status);
  return paystackFetch<PaystackTransaction[]>(`/transaction?${q.toString()}`);
}

export interface PaystackSubscription {
  subscription_code: string;
  email_token: string;
  /** "active" | "non-renewing" | "attention" | "cancelled" | "completed". */
  status: string;
  /**
   * The embedded plan is NOT reliable: endpoints in this API have been
   * observed returning `{}` (no plan_code) for freshly created subscriptions,
   * so treat the code as possibly absent — see subscriptionPlanCode() in
   * apply.ts. Never branch on an unknown plan; at worst that disables a paid
   * subscription.
   */
  plan: { plan_code?: string };
  /**
   * When Paystack will charge next — the end of the period already paid for,
   * and therefore how long access is owed after someone stops renewing.
   *
   * Paystack sets this to null once a subscription stops renewing, so it must
   * be captured while the subscription is still active. That is why it is read
   * on charge success rather than at cancellation time, when it is already gone.
   */
  next_payment_date?: string | null;
}

export interface PaystackCustomer {
  customer_code: string;
  email: string;
  subscriptions: PaystackSubscription[];
}

/** Fetch a customer (with embedded subscriptions) by their Paystack customer code. */
export function fetchCustomer(customerCode: string): Promise<PaystackCustomer> {
  return paystackFetch<PaystackCustomer>(`/customer/${encodeURIComponent(customerCode)}`);
}

/**
 * A one-time link to Paystack's hosted subscription-management page, where the
 * customer can attach a new card (or a debit order) to an existing
 * subscription, or cancel it.
 *
 * This is the closest thing Paystack has to Stripe's billing portal, and it is
 * the only supported way to change the card on a live subscription: there is no
 * "update authorization" API to call on the customer's behalf, because doing so
 * would mean handling card details, which we never do.
 *
 * The link lands on paystack.com, not on our domain — the page collects the
 * card, so that is the correct place for it to live.
 */
export function manageSubscriptionLink(code: string): Promise<{ link: string }> {
  return paystackFetch<{ link: string }>(
    `/subscription/${encodeURIComponent(code)}/manage/link`,
  );
}

/** Cancel a subscription. Requires the subscription's own email_token (fetched via the customer). */
export function disableSubscription(code: string, token: string): Promise<unknown> {
  return paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token }),
  });
}

/**
 * Refund a transaction in full by its reference. Used by the 7-day money-back
 * guarantee: cancelling within the window reverses the first charge. Omitting
 * `amount` refunds the whole transaction; Paystack sends the money back to the
 * customer's original payment method.
 */
export function refundTransaction(reference: string): Promise<unknown> {
  return paystackFetch("/refund", {
    method: "POST",
    body: JSON.stringify({ transaction: reference }),
  });
}

/**
 * Verify the `x-paystack-signature` header: HMAC-SHA512 of the raw request
 * body, keyed with the secret key, hex-encoded. Constant-time compare.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
