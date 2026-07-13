import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

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

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = (await res.json()) as { status: boolean; message: string; data: T };
  if (!res.ok || !body.status) {
    throw new Error(`Paystack ${path}: ${body.message ?? res.statusText}`);
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

export interface PaystackCustomer {
  customer_code: string;
  email: string;
  subscriptions: {
    subscription_code: string;
    email_token: string;
    status: string;
    plan: { plan_code: string };
  }[];
}

/** Fetch a customer (with embedded subscriptions) by their Paystack customer code. */
export function fetchCustomer(customerCode: string): Promise<PaystackCustomer> {
  return paystackFetch<PaystackCustomer>(`/customer/${encodeURIComponent(customerCode)}`);
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
