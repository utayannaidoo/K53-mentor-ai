import { describe, expect, it } from "vitest";
import { isPasswordValid, passwordRules, MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

/**
 * The client-side validator must mirror the Supabase Auth policy (min 8, with
 * lower + upper + digit). If the dashboard policy changes, these expectations
 * should change with it.
 */
describe("password policy", () => {
  it("accepts a password meeting every rule", () => {
    expect(isPasswordValid("Passw0rd")).toBe(true);
    expect(isPasswordValid("Sup3rSecret")).toBe(true);
  });

  it("rejects passwords that miss any single rule", () => {
    expect(isPasswordValid("Passw0r")).toBe(false); // 7 chars — too short
    expect(isPasswordValid("password1")).toBe(false); // no uppercase
    expect(isPasswordValid("PASSWORD1")).toBe(false); // no lowercase
    expect(isPasswordValid("Password")).toBe(false); // no digit
    expect(isPasswordValid("")).toBe(false);
  });

  it("requires the full length from the shared constant", () => {
    expect(isPasswordValid("Aa1" + "x".repeat(MIN_PASSWORD_LENGTH - 4))).toBe(false); // one short
    expect(isPasswordValid("Aa1" + "x".repeat(MIN_PASSWORD_LENGTH - 3))).toBe(true); // exactly at length
  });

  it("reports each rule's pass/fail for the inline checklist", () => {
    const rules = passwordRules("abcABC12");
    expect(rules.every((r) => r.ok)).toBe(true);
    const weak = passwordRules("abc");
    expect(weak.find((r) => r.label.includes("lowercase"))?.ok).toBe(true);
    expect(weak.find((r) => r.label.includes("uppercase"))?.ok).toBe(false);
    expect(weak.find((r) => r.label.includes("number"))?.ok).toBe(false);
  });
});
