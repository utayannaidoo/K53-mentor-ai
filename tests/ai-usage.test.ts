import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Usage recording sits in the request path of every AI route, so the only
 * behaviour that really matters is that it cannot break one. Analytics must
 * never be the reason a paying learner can't ask a question.
 */

const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => (adminAvailable ? { rpc } : null),
}));

let adminAvailable = true;

import { recordAiUsage } from "@/lib/billing/usage.server";

beforeEach(() => {
  adminAvailable = true;
  rpc.mockReset().mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("recordAiUsage", () => {
  const base = { surface: "tutor" as const, userId: "user-1", tier: "premium" as const };

  it("records a served request", async () => {
    await recordAiUsage({ ...base, capped: false });
    expect(rpc).toHaveBeenCalledWith("record_ai_usage", {
      p_user: "user-1",
      p_surface: "tutor",
      p_tier: "premium",
      p_capped: false,
    });
  });

  it("records a refusal distinctly from a served request", async () => {
    // Conflating the two would make a cap look popular exactly when it is
    // turning people away — the one signal that an allowance is too low.
    await recordAiUsage({ ...base, capped: true });
    expect(rpc).toHaveBeenCalledWith("record_ai_usage", expect.objectContaining({ p_capped: true }));
  });

  it("records the tier at request time", async () => {
    // Denormalised on purpose: joining against today's subscriptions row would
    // let an upgrade retroactively rewrite what someone's free week looked like.
    await recordAiUsage({ ...base, tier: "free", capped: false });
    expect(rpc).toHaveBeenCalledWith("record_ai_usage", expect.objectContaining({ p_tier: "free" }));
  });

  it("does nothing in demo mode — there is no account to attribute it to", async () => {
    await recordAiUsage({ ...base, userId: null, capped: false });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("does nothing when there is no service-role key", async () => {
    adminAvailable = false;
    await expect(recordAiUsage({ ...base, capped: false })).resolves.toBeUndefined();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("swallows an RPC error", async () => {
    // e.g. migration 0021 not applied yet. The tutor must still answer.
    rpc.mockResolvedValue({ error: { message: 'function "record_ai_usage" does not exist' } });
    await expect(recordAiUsage({ ...base, capped: false })).resolves.toBeUndefined();
  });

  it("swallows a thrown error", async () => {
    rpc.mockRejectedValue(new Error("network down"));
    await expect(recordAiUsage({ ...base, capped: false })).resolves.toBeUndefined();
  });

  it("logs failures rather than failing silently", async () => {
    // Six weeks from now this data is what a cap change rests on. "Nobody uses
    // the tutor" and "the write has been broken since launch" must not look the
    // same.
    rpc.mockResolvedValue({ error: { message: "permission denied" } });
    await recordAiUsage({ ...base, capped: false });
    expect(console.error).toHaveBeenCalled();
  });
});
