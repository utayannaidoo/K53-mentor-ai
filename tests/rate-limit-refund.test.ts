import { describe, expect, it } from "vitest";
import { limitUserDaily, refundUserDaily } from "@/lib/ai/rate-limit";

/**
 * The vision route meters a paid scan before the provider call (the cap must
 * gate concurrency), then refunds it when the call dies — an outage must not
 * tax a learner's quota. The refund runs against the same per-user/day bucket,
 * and can never drive it below zero.
 */

const user = `u-${Math.random().toString(36).slice(2)}`;

describe("refundUserDaily", () => {
  it("gives back a consumed unit so the next attempt fits under the cap", async () => {
    // Fresh bucket (unique user id): first passes, cap 1 blocks the second.
    const first = await limitUserDaily("vision", user, 1);
    expect(first.success).toBe(true);
    const second = await limitUserDaily("vision", user, 1);
    expect(second.success).toBe(false);

    await refundUserDaily("vision", user);

    const third = await limitUserDaily("vision", user, 1);
    expect(third.success).toBe(true);
  });

  it("never mints allowance below zero", async () => {
    // Refunding more than was spent must not create credit. With a cap of 2
    // and a counter floored at zero, exactly TWO attempts fit; a refund that
    // had driven the counter negative would let a third through too.
    const negUser = `${user}-neg`;
    await refundUserDaily("vision", negUser);
    await refundUserDaily("vision", negUser);

    expect((await limitUserDaily("vision", negUser, 2)).success).toBe(true);
    expect((await limitUserDaily("vision", negUser, 2)).success).toBe(true);
    const third = await limitUserDaily("vision", negUser, 2);
    expect(third.success).toBe(false);
  });
});
