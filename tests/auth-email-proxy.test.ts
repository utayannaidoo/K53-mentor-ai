import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The two email-triggering auth surfaces used to call GoTrue straight from the
 * browser, so distributed signup spam and email bombing were bounded only by
 * GoTrue's own defaults. Both now proxy through API routes that apply a real
 * per-IP daily cap BEFORE anything touches Supabase, answer identically
 * whether or not an account exists (enumeration safety), and surface only
 * genuine rate limiting honestly. These tests pin that posture for both
 * routes: forward the call intact, cap first, swallow unknown-email errors,
 * and short-circuit in demo mode without ever constructing the SSR client.
 */

const limitAuthReset = vi.fn();
const limitAuthResend = vi.fn();

vi.mock("@/lib/ai/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/rate-limit")>();
  return {
    ...actual,
    clientIp: () => "203.0.113.7",
    limitAuthReset: (...a: unknown[]) => limitAuthReset(...a),
    limitAuthResend: (...a: unknown[]) => limitAuthResend(...a),
  };
});

// Read live on every request via the getter, so the demo-mode case can flip
// configuration without re-importing the modules under test.
let supabaseConfigured = true;
vi.mock("@/lib/env", () => ({
  get isSupabaseConfigured() {
    return supabaseConfigured;
  },
  supabaseConfig: { url: "https://stub.supabase.co", anonKey: "anon" },
}));

const resetForEmail = vi.fn();
const resend = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      resetPasswordForEmail: (...a: unknown[]) => resetForEmail(...a),
      resend: (...a: unknown[]) => resend(...a),
    },
  }),
}));

type Handler = (req: Request) => Promise<Response>;

const RESET_PATH = "/api/auth/request-reset";
const RESEND_PATH = "/api/auth/resend-confirmation";

const handlers = new Map<string, Handler>();

beforeAll(async () => {
  handlers.set(RESET_PATH, (await import("@/app/api/auth/request-reset/route")).POST);
  handlers.set(RESEND_PATH, (await import("@/app/api/auth/resend-confirmation/route")).POST);
});

function post(path: string, body: unknown) {
  return handlers.get(path)!(
    new Request(`https://k53mentorai.co.za${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

const EMAIL = "learner@example.com";
const RESET_REDIRECT = "https://k53mentorai.co.za/auth/callback?next=/reset-password/update";
const CONFIRM_REDIRECT = "https://k53mentorai.co.za/auth/callback?next=%2Fcontinue";
const CAPPED = { success: false, retryAfter: 3600 };

let consoleRestore: () => void;
let consoleErrorCount = 0;

beforeEach(() => {
  vi.clearAllMocks();
  supabaseConfigured = true;
  limitAuthReset.mockResolvedValue({ success: true, retryAfter: 0 });
  limitAuthResend.mockResolvedValue({ success: true, retryAfter: 0 });
  resetForEmail.mockResolvedValue({ error: null });
  resend.mockResolvedValue({ error: null });
  // Unexpected GoTrue failures are logged, never surfaced — keep test output clean.
  const spy = vi.spyOn(console, "error").mockImplementation(() => {
    consoleErrorCount += 1;
  });
  consoleRestore = () => spy.mockRestore();
});

afterEach(() => {
  consoleRestore();
});

describe(`POST ${RESET_PATH}`, () => {
  it("forwards email + redirectTo to the SSR client and answers ok:true", async () => {
    const res = await post(RESET_PATH, { email: EMAIL, redirectTo: RESET_REDIRECT });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(limitAuthReset).toHaveBeenCalledWith("203.0.113.7");
    // The PKCE flow depends on this going through the cookie-bound SSR client.
    expect(resetForEmail).toHaveBeenCalledWith(EMAIL, { redirectTo: RESET_REDIRECT });
  });

  it("maps a GoTrue rate-limit error to 429 with Retry-After", async () => {
    resetForEmail.mockResolvedValue({ error: { status: 429, message: "Too many requests" } });
    const res = await post(RESET_PATH, { email: EMAIL, redirectTo: RESET_REDIRECT });

    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(await res.json()).toMatchObject({ error: "rate_limited" });
  });

  it("swallows an unknown-email error as ok:true (enumeration safety)", async () => {
    resetForEmail.mockResolvedValue({ error: { status: 400, message: "user not found" } });
    const res = await post(RESET_PATH, { email: EMAIL, redirectTo: RESET_REDIRECT });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(consoleErrorCount).toBeGreaterThan(0);
  });

  it("short-circuits in demo mode without touching the Supabase client", async () => {
    supabaseConfigured = false;
    const res = await post(RESET_PATH, { email: EMAIL, redirectTo: RESET_REDIRECT });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, demo: true });
    expect(resetForEmail).not.toHaveBeenCalled();
  });

  it("returns 429 before any Supabase call once the IP cap is spent", async () => {
    limitAuthReset.mockResolvedValue(CAPPED);
    const res = await post(RESET_PATH, { email: EMAIL, redirectTo: RESET_REDIRECT });

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(await res.json()).toMatchObject({ error: "rate_limited" });
    expect(resetForEmail).not.toHaveBeenCalled();
  });

  it("rejects a malformed email with 400 before reaching Supabase", async () => {
    const res = await post(RESET_PATH, { email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(resetForEmail).not.toHaveBeenCalled();
  });
});

describe(`POST ${RESEND_PATH}`, () => {
  it("forwards email + emailRedirectTo as a signup resend and answers ok:true", async () => {
    const res = await post(RESEND_PATH, { email: EMAIL, redirectTo: CONFIRM_REDIRECT });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(limitAuthResend).toHaveBeenCalledWith("203.0.113.7");
    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: EMAIL,
      options: { emailRedirectTo: CONFIRM_REDIRECT },
    });
  });

  it("maps a GoTrue rate-limit error to 429 with Retry-After", async () => {
    resend.mockResolvedValue({ error: { status: 429, message: "email rate limit exceeded" } });
    const res = await post(RESEND_PATH, { email: EMAIL, redirectTo: CONFIRM_REDIRECT });

    expect(res.status).toBe(429);
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(await res.json()).toMatchObject({ error: "rate_limited" });
  });

  it("swallows an unknown-email error as ok:true (enumeration safety)", async () => {
    resend.mockResolvedValue({ error: { status: 422, message: "user not found" } });
    const res = await post(RESEND_PATH, { email: EMAIL, redirectTo: CONFIRM_REDIRECT });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(consoleErrorCount).toBeGreaterThan(0);
  });

  it("short-circuits in demo mode without touching the Supabase client", async () => {
    supabaseConfigured = false;
    const res = await post(RESEND_PATH, { email: EMAIL, redirectTo: CONFIRM_REDIRECT });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, demo: true });
    expect(resend).not.toHaveBeenCalled();
  });

  it("returns 429 before any Supabase call once the IP cap is spent", async () => {
    limitAuthResend.mockResolvedValue(CAPPED);
    const res = await post(RESEND_PATH, { email: EMAIL, redirectTo: CONFIRM_REDIRECT });

    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("3600");
    expect(await res.json()).toMatchObject({ error: "rate_limited" });
    expect(resend).not.toHaveBeenCalled();
  });

  it("rejects a malformed email with 400 before reaching Supabase", async () => {
    const res = await post(RESEND_PATH, { email: "" });

    expect(res.status).toBe(400);
    expect(resend).not.toHaveBeenCalled();
  });
});
