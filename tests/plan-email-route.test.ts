import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `/api/plan-email` — the open, account-free endpoint that mails a visitor
 * their starting-check plan.
 *
 * The case this file exists for: an address already on the suppression list.
 * `sendEmail` refuses it and returns the same `false` as a provider outage, so
 * the screen told the one person who had explicitly opted out to "try again in
 * a moment" — advice that can never work, forever. It now says what actually
 * happened. That does reveal the address is on our list, to whoever typed the
 * address in, which in practice is the person it belongs to; misleading them
 * indefinitely is the worse trade.
 */

const limitPlanEmail = vi.fn();
vi.mock("@/lib/ai/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/rate-limit")>();
  return {
    ...actual,
    clientIp: () => "203.0.113.7",
    limitPlanEmail: (...a: unknown[]) => limitPlanEmail(...a),
  };
});

const sendEmail = vi.fn();
vi.mock("@/lib/notify/email", () => ({
  get isEmailConfigured() {
    return true;
  },
  sendEmail: (...a: unknown[]) => sendEmail(...a),
}));

const isSuppressed = vi.fn();
vi.mock("@/lib/notify/suppression", () => ({
  isSuppressed: (...a: unknown[]) => isSuppressed(...a),
}));

const upsert = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ upsert: (...a: unknown[]) => upsert(...a) }) }),
}));

let POST: (req: Request) => Promise<Response>;
beforeAll(async () => {
  ({ POST } = await import("@/app/api/plan-email/route"));
});

const LEAD = {
  email: "thandi@example.co.za",
  consent: true,
  score: 47,
  correct: 7,
  total: 15,
  weakCategories: ["signs", "rules"],
  vehicleCode: "8",
};

let consoleRestore: () => void;
beforeEach(() => {
  vi.clearAllMocks();
  limitPlanEmail.mockResolvedValue({ success: true, retryAfter: 0 });
  isSuppressed.mockResolvedValue(false);
  sendEmail.mockResolvedValue(true);
  upsert.mockResolvedValue({ error: null });
  const original = console.error;
  console.error = () => {};
  consoleRestore = () => {
    console.error = original;
  };
});
afterEach(() => consoleRestore());

function post(body: unknown) {
  return POST(
    new Request("https://k53mentorai.co.za/api/plan-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("plan email", () => {
  it("sends and records a consented request", async () => {
    const res = await post(LEAD);
    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: LEAD.email }));
    expect(upsert).toHaveBeenCalled();
  });

  it("tells an opted-out address the truth instead of 'try again'", async () => {
    isSuppressed.mockResolvedValue(true);
    const res = await post(LEAD);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "suppressed" });
    // Nothing is attempted, and no lead row is written for someone who asked
    // us to stop.
    expect(sendEmail).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  it("still reports a genuine send failure as retryable", async () => {
    sendEmail.mockResolvedValue(false);
    const res = await post(LEAD);
    expect(res.status).toBe(503);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("refuses an unticked consent box and a malformed address", async () => {
    expect((await post({ ...LEAD, consent: false })).status).toBe(400);
    expect((await post({ ...LEAD, email: "nope" })).status).toBe(400);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("caps per IP before doing any work", async () => {
    limitPlanEmail.mockResolvedValue({ success: false, retryAfter: 3600 });
    const res = await post(LEAD);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(isSuppressed).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
