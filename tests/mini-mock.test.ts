import { describe, expect, it } from "vitest";
import { MINI_MOCK, MINI_MOCK_LENGTHS, miniMockConfig } from "@/lib/diagnostic/select";

describe("mini mock lengths", () => {
  it("every offered length keeps the real test's pass ratio", () => {
    for (const l of MINI_MOCK_LENGTHS) {
      const cfg = miniMockConfig(l.total);
      expect(cfg.total).toBe(l.total);
      // 51/64 ≈ 0.797 — each mini rounds up so it never asks less than the real
      // paper proportionally.
      expect(cfg.passMark / cfg.total).toBeGreaterThanOrEqual(0.79);
      expect(cfg.passMark).toBeLessThanOrEqual(cfg.total);
      expect(cfg.seconds).toBeGreaterThan(0);
    }
  });

  it("the default mini is unchanged at 15 questions, pass 12", () => {
    expect(MINI_MOCK.total).toBe(15);
    expect(MINI_MOCK.passMark).toBe(12);
  });
});
