import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MONEY_BACK_DAYS,
  REFUND_GUARANTEE_LABEL,
  REFUND_REDEMPTION_LIMIT,
  REFUND_WINDOW_PHRASE,
} from "@/lib/billing/refund-policy";

const publicSurfaces = [
  "src/app/refunds/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/contact/page.tsx",
  "src/components/landing/faq.tsx",
  "src/components/landing/pricing-section.tsx",
];

describe("shared refund promise", () => {
  it("states the server-enforced anchor and one-redemption limit", () => {
    expect(MONEY_BACK_DAYS).toBe(7);
    expect(REFUND_WINDOW_PHRASE).toBe(
      "within 7 days of your most recent subscription payment",
    );
    expect(REFUND_GUARANTEE_LABEL).toBe("7-day money-back guarantee");
    expect(REFUND_REDEMPTION_LIMIT).toBe("once per subscription");
  });

  it("makes every purchase and policy surface consume the shared contract", () => {
    for (const path of publicSurfaces) {
      const source = readFileSync(resolve(process.cwd(), path), "utf8");
      expect(source, path).toContain("@/lib/billing/refund-policy");
    }
  });

  it("does not revive the old first-subscription promise", () => {
    const copy = publicSurfaces
      .map((path) => readFileSync(resolve(process.cwd(), path), "utf8"))
      .join("\n");
    expect(copy).not.toMatch(/money-back window on (?:a|the) first subscription/i);
  });
});
