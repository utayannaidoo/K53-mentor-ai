import { beforeAll, describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";

// The Paystack client reads the key lazily, so set it before importing.
beforeAll(() => {
  process.env.PAYSTACK_SECRET_KEY = "sk_test_secret_for_unit_tests";
});

describe("verifyPaystackSignature", () => {
  it("accepts the correct HMAC-SHA512 and rejects everything else", async () => {
    const { verifyPaystackSignature } = await import("@/lib/paystack/client");
    const body = JSON.stringify({ event: "charge.success", data: { id: 1 } });
    const good = createHmac("sha512", "sk_test_secret_for_unit_tests").update(body).digest("hex");

    expect(verifyPaystackSignature(body, good)).toBe(true);
    expect(verifyPaystackSignature(body, null)).toBe(false);
    expect(verifyPaystackSignature(body, "deadbeef")).toBe(false);
    expect(verifyPaystackSignature(body + " ", good)).toBe(false); // any body change breaks it
  });
});

describe("email templates escape user-controlled input", () => {
  it("a crafted name cannot inject markup", async () => {
    const { buildEmail, buildPaymentReceiptEmail } = await import("@/lib/notify/templates");
    const evil = '<img src=x onerror=alert(1)>"';
    const nudge = buildEmail("streak_risk", { firstName: evil, streak: 3, longest: 5, dueCards: 0 });
    expect(nudge.html).not.toContain("<img src=x");
    expect(nudge.html).toContain("&lt;img");

    const receipt = buildPaymentReceiptEmail({ firstName: evil, planName: "Premium", amountZar: 60 });
    expect(receipt.html).not.toContain("<img src=x");
  });
});
