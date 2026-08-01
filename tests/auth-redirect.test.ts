import { describe, expect, it } from "vitest";
import { signedInAuthPageDest } from "@/lib/supabase/middleware";

const dest = (qs: string) => signedInAuthPageDest(new URLSearchParams(qs));

describe("signed-in user on an auth page", () => {
  it("carries a pricing CTA through to checkout instead of the dashboard", () => {
    // The landing/pricing cards are statically rendered, so they always link to
    // /signup?plan=… — even for someone already signed in. Losing the plan here
    // means the warmest possible buyer lands on a page that can't sell to them.
    expect(dest("plan=premium&cycle=monthly")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
    expect(dest("plan=premium_plus&cycle=annual")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium_plus&cycle=annual",
    });
  });

  it("defaults the cycle to monthly when it is missing or junk", () => {
    expect(dest("plan=premium")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
    expect(dest("plan=premium&cycle=weekly")).toEqual({
      pathname: "/account/billing",
      search: "?buy=premium&cycle=monthly",
    });
  });

  it("ignores an unknown plan rather than sending it to checkout", () => {
    expect(dest("plan=enterprise")).toEqual({ pathname: "/dashboard", search: "" });
    expect(dest("plan=free")).toEqual({ pathname: "/dashboard", search: "" });
  });

  it("sends an ordinary signed-in visitor to the dashboard with a clean URL", () => {
    expect(dest("")).toEqual({ pathname: "/dashboard", search: "" });
    expect(dest("next=/study/mock-exam&ref=abc")).toEqual({ pathname: "/dashboard", search: "" });
  });
});
