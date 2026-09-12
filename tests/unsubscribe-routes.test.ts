import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The two one-click opt-out endpoints, exercised through their rejection paths.
 *
 * Both were shipped with unit tests on the tokens and none on the routes, and
 * the routes are where the decisions actually live: what a forged link does,
 * what a link for the *other* endpoint does, what happens with no signing
 * secret configured at all, and which of those an attacker can make expensive.
 *
 * Two invariants matter more than the rest:
 *
 *  - **Fail closed with no secret.** `unsubscribeToken` returns null when
 *    neither UNSUBSCRIBE_SECRET nor CRON_SECRET is set. A comparison written
 *    the obvious way (`expected === token`, or a timing-safe compare of two
 *    empty buffers) would then accept an empty `t=` from anyone and let a
 *    stranger unsubscribe any address they can name.
 *  - **A valid signature is never throttled.** #102: Gmail sends one-click
 *    POSTs from Google's shared IP ranges, so throttling before the HMAC check
 *    breaks the button we advertise in every email.
 */

const limitUnsubscribeProbe = vi.fn();

vi.mock("@/lib/ai/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/rate-limit")>();
  return {
    ...actual,
    clientIp: () => "203.0.113.7",
    limitUnsubscribeProbe: (...a: unknown[]) => limitUnsubscribeProbe(...a),
  };
});

const suppress = vi.fn();
vi.mock("@/lib/notify/suppression", () => ({
  suppress: (...a: unknown[]) => suppress(...a),
}));

const forgetPlanLead = vi.fn();
vi.mock("@/lib/leads/plan-lead-store", () => ({
  forgetPlanLead: (...a: unknown[]) => forgetPlanLead(...a),
}));

const profileUpdate = vi.fn();
let adminAvailable = true;
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () =>
    adminAvailable
      ? {
          from: (table: string) => ({
            update: (patch: unknown) => ({
              eq: (column: string, value: unknown) =>
                Promise.resolve(profileUpdate({ table, patch, column, value })),
            }),
          }),
        }
      : null,
}));

const SECRET = "test-unsubscribe-secret";
const OLD_UNSUB = process.env.UNSUBSCRIBE_SECRET;
const OLD_CRON = process.env.CRON_SECRET;

type Handler = (req: Request) => Promise<Response>;
let addressGet: Handler;
let addressPost: Handler;
let remindersGet: Handler;
let remindersPost: Handler;
let unsubscribeToken: (email: string) => string | null;
let reminderOptOutToken: (userId: string) => string | null;

const ADDRESS = "thandi@example.co.za";
const USER = "11111111-2222-3333-4444-555555555555";
const ALLOWED = { success: true, retryAfter: 0 };

beforeAll(async () => {
  process.env.UNSUBSCRIBE_SECRET = SECRET;
  delete process.env.CRON_SECRET;
  const address = await import("@/app/api/unsubscribe/route");
  const reminders = await import("@/app/api/unsubscribe/reminders/route");
  addressGet = address.GET;
  addressPost = address.POST;
  remindersGet = reminders.GET;
  remindersPost = reminders.POST;
  ({ unsubscribeToken } = await import("@/lib/leads/unsubscribe-token"));
  ({ reminderOptOutToken } = await import("@/lib/notify/reminder-optout"));
});

afterAll(() => {
  if (OLD_UNSUB === undefined) delete process.env.UNSUBSCRIBE_SECRET;
  else process.env.UNSUBSCRIBE_SECRET = OLD_UNSUB;
  if (OLD_CRON === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = OLD_CRON;
});

let consoleRestore: () => void;
beforeEach(() => {
  vi.clearAllMocks();
  adminAvailable = true;
  limitUnsubscribeProbe.mockResolvedValue(ALLOWED);
  suppress.mockResolvedValue(true);
  forgetPlanLead.mockResolvedValue(undefined);
  profileUpdate.mockReturnValue({ error: null });
  // The error branches log on purpose; keep the run readable.
  const original = console.error;
  console.error = () => {};
  consoleRestore = () => {
    console.error = original;
  };
});
afterEach(() => consoleRestore());

function call(handler: Handler, path: string, params: Record<string, string>, method = "GET") {
  const url = new URL(`https://k53mentorai.co.za${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return handler(new Request(url, { method }));
}

describe("/api/unsubscribe — the address opt-out", () => {
  it("suppresses on a valid signature, without spending the probe budget", async () => {
    const res = await call(addressGet, "/api/unsubscribe", {
      e: ADDRESS,
      t: unsubscribeToken(ADDRESS)!,
    });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/unsubscribed?status=done");
    expect(suppress).toHaveBeenCalledWith(ADDRESS, "unsubscribed", expect.any(String));
    // #102: a valid HMAC proves the caller holds a link we minted, so there is
    // nothing to throttle — and Gmail's one-click POSTs share an IP range.
    expect(limitUnsubscribeProbe).not.toHaveBeenCalled();
  });

  it("accepts the token case-insensitively, as the address is normalised", async () => {
    const res = await call(addressPost, "/api/unsubscribe", {
      e: "Thandi@Example.CO.ZA",
      t: unsubscribeToken(ADDRESS)!,
    }, "POST");
    expect(res.status).toBe(200);
    expect(suppress).toHaveBeenCalledWith(ADDRESS, "unsubscribed", expect.any(String));
  });

  it("refuses a forged token and suppresses nothing", async () => {
    const res = await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: "forged" }, "POST");
    expect(res.status).toBe(400);
    expect(suppress).not.toHaveBeenCalled();
    expect(limitUnsubscribeProbe).toHaveBeenCalledWith("203.0.113.7");
  });

  it("refuses one address's token replayed against another address", async () => {
    const res = await call(addressPost, "/api/unsubscribe", {
      e: "someone@else.com",
      t: unsubscribeToken(ADDRESS)!,
    }, "POST");
    expect(res.status).toBe(400);
    expect(suppress).not.toHaveBeenCalled();
  });

  it("refuses a missing token and a missing address", async () => {
    expect((await call(addressPost, "/api/unsubscribe", { e: ADDRESS }, "POST")).status).toBe(400);
    expect((await call(addressPost, "/api/unsubscribe", {}, "POST")).status).toBe(400);
    expect(suppress).not.toHaveBeenCalled();
  });

  it("sends a human to the page that says the link was not valid", async () => {
    const res = await call(addressGet, "/api/unsubscribe", { e: ADDRESS, t: "forged" });
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("status=invalid");
  });

  it("answers 5xx when the suppression write fails, so the provider retries", async () => {
    suppress.mockResolvedValue(false);
    const res = await call(addressPost, "/api/unsubscribe", {
      e: ADDRESS,
      t: unsubscribeToken(ADDRESS)!,
    }, "POST");
    // Answering "fine" would drop an opt-out the reader believes they made.
    expect(res.status).toBe(503);
  });

  it("deletes the captured lead row, which is what the privacy policy promises", async () => {
    // "Kept only until you unsubscribe" — suppression stops the sending but
    // left the address, result and consent timestamp sitting in plan_leads.
    await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: unsubscribeToken(ADDRESS)! }, "POST");
    expect(forgetPlanLead).toHaveBeenCalledWith(ADDRESS);
  });

  it("keeps the row when the suppression that should precede it failed", async () => {
    // Deleting the lead while still able to mail the address would be the one
    // ordering that loses the opt-out.
    suppress.mockResolvedValue(false);
    await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: unsubscribeToken(ADDRESS)! }, "POST");
    expect(forgetPlanLead).not.toHaveBeenCalled();
  });

  it("forgets nothing on a forged link", async () => {
    await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: "forged" }, "POST");
    expect(forgetPlanLead).not.toHaveBeenCalled();
  });

  it("reports a throttled probe honestly, with Retry-After", async () => {
    limitUnsubscribeProbe.mockResolvedValue({ success: false, retryAfter: 900 });
    const post = await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: "forged" }, "POST");
    expect(post.status).toBe(429);
    expect(post.headers.get("Retry-After")).toBe("900");
    const get = await call(addressGet, "/api/unsubscribe", { e: ADDRESS, t: "forged" });
    expect(get.status).toBe(429);
  });
});

describe("/api/unsubscribe/reminders — the per-account opt-out", () => {
  it("clears email_notifications for the signed user only", async () => {
    const res = await call(remindersPost, "/api/unsubscribe/reminders", {
      u: USER,
      t: reminderOptOutToken(USER)!,
    }, "POST");
    expect(res.status).toBe(200);
    expect(profileUpdate).toHaveBeenCalledWith({
      table: "profiles",
      patch: { email_notifications: false },
      column: "id",
      value: USER,
    });
    // Transactional mail is untouched: nothing reaches the suppression list.
    expect(suppress).not.toHaveBeenCalled();
    expect(limitUnsubscribeProbe).not.toHaveBeenCalled();
  });

  it("tells the reader which of the two happened", async () => {
    const res = await call(remindersGet, "/api/unsubscribe/reminders", {
      u: USER,
      t: reminderOptOutToken(USER)!,
    });
    expect(res.headers.get("location")).toContain("status=done&kind=reminders");
  });

  it("refuses a forged token and another account's token", async () => {
    const forged = await call(remindersPost, "/api/unsubscribe/reminders", { u: USER, t: "forged" }, "POST");
    expect(forged.status).toBe(400);
    const other = await call(remindersPost, "/api/unsubscribe/reminders", {
      u: "99999999-9999-9999-9999-999999999999",
      t: reminderOptOutToken(USER)!,
    }, "POST");
    expect(other.status).toBe(400);
    expect(profileUpdate).not.toHaveBeenCalled();
  });

  it("answers 5xx when the profile write fails or the admin key is absent", async () => {
    profileUpdate.mockReturnValue({ error: { message: "boom" } });
    const failed = await call(remindersPost, "/api/unsubscribe/reminders", {
      u: USER,
      t: reminderOptOutToken(USER)!,
    }, "POST");
    expect(failed.status).toBe(503);

    adminAvailable = false;
    const unconfigured = await call(remindersPost, "/api/unsubscribe/reminders", {
      u: USER,
      t: reminderOptOutToken(USER)!,
    }, "POST");
    expect(unconfigured.status).toBe(503);
  });
});

describe("the two links are not interchangeable", () => {
  /**
   * Domain separation (`${userId}:reminders` vs the bare address) is only
   * worth anything if the endpoints enforce it. A reminder link that could be
   * replayed against the address endpoint would turn "stop nagging me" into
   * "stop sending me receipts and password resets".
   */
  it("a reminder token does not suppress an address", async () => {
    const res = await call(addressPost, "/api/unsubscribe", {
      e: ADDRESS,
      t: reminderOptOutToken(ADDRESS)!,
    }, "POST");
    expect(res.status).toBe(400);
    expect(suppress).not.toHaveBeenCalled();
  });

  it("an address token does not switch an account's reminders off", async () => {
    const res = await call(remindersPost, "/api/unsubscribe/reminders", {
      u: USER,
      t: unsubscribeToken(USER)!,
    }, "POST");
    expect(res.status).toBe(400);
    expect(profileUpdate).not.toHaveBeenCalled();
  });
});

describe("with no signing secret configured", () => {
  beforeEach(() => {
    delete process.env.UNSUBSCRIBE_SECRET;
    delete process.env.CRON_SECRET;
  });
  afterEach(() => {
    process.env.UNSUBSCRIBE_SECRET = SECRET;
  });

  it("refuses an empty token rather than treating 'no expected value' as a match", async () => {
    // Both sides are empty here. This is the one that turns a missing env var
    // into "anyone can unsubscribe anyone".
    const address = await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: "" }, "POST");
    expect(address.status).toBe(400);
    const reminders = await call(remindersPost, "/api/unsubscribe/reminders", { u: USER, t: "" }, "POST");
    expect(reminders.status).toBe(400);
    expect(suppress).not.toHaveBeenCalled();
    expect(profileUpdate).not.toHaveBeenCalled();
  });

  it("refuses a token minted while a secret was configured", async () => {
    // Rotating or losing the secret invalidates outstanding links; it must not
    // do anything more interesting than that.
    process.env.UNSUBSCRIBE_SECRET = SECRET;
    const minted = unsubscribeToken(ADDRESS)!;
    const mintedReminder = reminderOptOutToken(USER)!;
    delete process.env.UNSUBSCRIBE_SECRET;

    expect((await call(addressPost, "/api/unsubscribe", { e: ADDRESS, t: minted }, "POST")).status).toBe(400);
    expect(
      (await call(remindersPost, "/api/unsubscribe/reminders", { u: USER, t: mintedReminder }, "POST")).status,
    ).toBe(400);
    expect(suppress).not.toHaveBeenCalled();
    expect(profileUpdate).not.toHaveBeenCalled();
  });

  it("mints no link at all, so no email advertises one", async () => {
    const { unsubscribeUrl } = await import("@/lib/leads/unsubscribe-token");
    const { reminderOptOutUrl } = await import("@/lib/notify/reminder-optout");
    expect(unsubscribeUrl(ADDRESS)).toBeNull();
    expect(reminderOptOutUrl(USER)).toBeNull();
  });
});
