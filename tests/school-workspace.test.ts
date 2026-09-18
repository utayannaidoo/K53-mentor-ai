import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The school workspace's access rules, tested without a database.
 *
 * What this file can prove: the mapping from a subscription row to
 * "full"/"read_only", which membership is chosen, and that invite codes are
 * well-formed. What it cannot prove is tenant isolation — that is enforced by
 * RLS in 0035 and has to be verified against a real Postgres. A fake query
 * builder that ignores filters would pass a broken policy.
 */

// ── A minimal stand-in for the Supabase query builder ───────────────────────
type Tables = {
  school_members?: { rows?: unknown[]; count?: number };
  schools?: { row?: unknown };
  school_subscriptions?: { row?: unknown };
};

let user: { id: string } | null = null;
let tables: Tables = {};

function fakeClient() {
  return {
    auth: { getUser: async () => ({ data: { user } }) },
    from(table: keyof Tables) {
      let head = false;
      const q = {
        select: (_cols?: string, opts?: { head?: boolean }) => {
          head = Boolean(opts?.head);
          return q;
        },
        eq: () => q,
        in: () => q,
        order: () => q,
        maybeSingle: async () => ({
          data: (tables[table] as { row?: unknown } | undefined)?.row ?? null,
        }),
        then(resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
          const entry = tables[table] as { rows?: unknown[]; count?: number } | undefined;
          const value = head
            ? { data: null, count: entry?.count ?? 0 }
            : { data: entry?.rows ?? [] };
          return Promise.resolve(value).then(resolve, reject);
        },
      };
      return q;
    },
  };
}

vi.mock("@/lib/supabase/server", () => ({ createClient: async () => fakeClient() }));

async function load() {
  vi.resetModules();
  return import("@/lib/schools/auth");
}

const DAY = 86_400_000;
const future = () => new Date(Date.now() + 5 * DAY).toISOString();
const past = () => new Date(Date.now() - DAY).toISOString();

beforeEach(() => {
  user = { id: "user-1" };
  tables = {
    school_members: {
      rows: [{ id: "m1", school_id: "s1", role: "instructor" }],
      count: 1,
    },
    schools: { row: { id: "s1", name: "Sipho's", slug: "siphos", partner_school_id: null } },
    school_subscriptions: {
      row: { plan: "trial", status: "trialing", seats: 1, trial_ends_at: future() },
    },
  };
});

afterEach(() => vi.resetModules());

describe("accessFromSubscription", () => {
  it("grants full access to a live trial, an active plan and a past-due plan", async () => {
    const { accessFromSubscription } = await load();
    expect(
      accessFromSubscription({ plan: "trial", status: "trialing", seats: 1, trial_ends_at: future() }),
    ).toBe("full");
    expect(
      accessFromSubscription({ plan: "solo", status: "active", seats: 1, trial_ends_at: null }),
    ).toBe("full");
    // Past-due is a grace state: the card failed, the school has not left.
    expect(
      accessFromSubscription({ plan: "team", status: "past_due", seats: 5, trial_ends_at: null }),
    ).toBe("full");
  });

  it("goes read-only — never locked out — when the trial ends or the plan stops", async () => {
    const { accessFromSubscription } = await load();
    expect(
      accessFromSubscription({ plan: "trial", status: "trialing", seats: 1, trial_ends_at: past() }),
    ).toBe("read_only");
    expect(
      accessFromSubscription({ plan: "solo", status: "canceled", seats: 1, trial_ends_at: null }),
    ).toBe("read_only");
    expect(
      accessFromSubscription({ plan: "solo", status: "paused", seats: 1, trial_ends_at: null }),
    ).toBe("read_only");
  });

  it("fails closed to read-only on a missing row or an unreadable trial date", async () => {
    const { accessFromSubscription } = await load();
    expect(accessFromSubscription(null)).toBe("read_only");
    expect(
      accessFromSubscription({ plan: "trial", status: "trialing", seats: 1, trial_ends_at: null }),
    ).toBe("read_only");
    expect(
      accessFromSubscription({ plan: "trial", status: "trialing", seats: 1, trial_ends_at: "soon" }),
    ).toBe("read_only");
  });
});

describe("currentSchool", () => {
  it("is null for a signed-out visitor", async () => {
    user = null;
    const { currentSchool } = await load();
    expect(await currentSchool()).toBeNull();
  });

  it("is null for a signed-in user who belongs to no school", async () => {
    tables.school_members = { rows: [], count: 0 };
    const { currentSchool } = await load();
    expect(await currentSchool()).toBeNull();
  });

  it("resolves the school, the role, the seat count and the access level", async () => {
    tables.school_members = {
      rows: [{ id: "m1", school_id: "s1", role: "instructor" }],
      count: 3,
    };
    const { currentSchool } = await load();
    const school = await currentSchool();
    expect(school).toMatchObject({
      schoolId: "s1",
      memberId: "m1",
      name: "Sipho's",
      role: "instructor",
      access: "full",
      seatsUsed: 3,
    });
  });

  it("prefers the school someone owns over one they merely teach at", async () => {
    tables.school_members = {
      rows: [
        { id: "m-teach", school_id: "s-other", role: "instructor" },
        { id: "m-own", school_id: "s1", role: "owner" },
      ],
      count: 1,
    };
    const { currentSchool } = await load();
    expect((await currentSchool())?.memberId).toBe("m-own");
  });

  it("marks the workspace read-only when the trial has lapsed", async () => {
    tables.school_subscriptions = {
      row: { plan: "trial", status: "trialing", seats: 1, trial_ends_at: past() },
    };
    const { currentSchool } = await load();
    expect((await currentSchool())?.access).toBe("read_only");
  });
});

describe("requireSchool", () => {
  it("refuses an instructor where only the owner may act", async () => {
    const { requireSchool } = await load();
    const result = await requireSchool({ roles: ["owner"] });
    expect(result.ok).toBe(false);
  });

  it("refuses a write on a read-only workspace but still allows a read", async () => {
    tables.school_subscriptions = {
      row: { plan: "solo", status: "canceled", seats: 1, trial_ends_at: null },
    };
    const { requireSchool } = await load();
    expect((await requireSchool({ write: true })).ok).toBe(false);
    expect((await requireSchool()).ok).toBe(true);
  });
});

describe("rpcMessage", () => {
  it("passes through a sentence the RPC raised on purpose", async () => {
    const { rpcMessage } = await import("@/lib/schools/rpc-message");
    expect(rpcMessage({ code: "P0001", message: "No seats left on your plan" }, "fallback")).toBe(
      "No seats left on your plan",
    );
  });

  it("never shows a user the internals of an error Postgres raised by itself", async () => {
    const { rpcMessage } = await import("@/lib/schools/rpc-message");
    // A missing function names its whole signature — exactly what shows up if
    // the code ships before its migration.
    expect(
      rpcMessage(
        {
          code: "PGRST202",
          message: "Could not find the function public.create_school_for_owner(p_name, p_user) in the schema cache",
        },
        "Could not create the school.",
      ),
    ).toBe("Could not create the school.");
    expect(
      rpcMessage(
        { code: "23505", message: 'duplicate key value violates unique constraint "schools_slug_key"' },
        "fallback",
      ),
    ).toBe("fallback");
    expect(rpcMessage({ code: "42501", message: "permission denied for table schools" }, "fallback")).toBe(
      "fallback",
    );
  });

  it("falls back when there is no message at all", async () => {
    const { rpcMessage } = await import("@/lib/schools/rpc-message");
    expect(rpcMessage(null, "fallback")).toBe("fallback");
    expect(rpcMessage({ code: "P0001", message: "  " }, "fallback")).toBe("fallback");
  });
});

describe("invite codes", () => {
  it("never produces a character that is ambiguous when read aloud", async () => {
    const { newShortCode, validShortCode } = await import("@/lib/schools/invites");
    for (let i = 0; i < 500; i++) {
      const code = newShortCode();
      expect(code).toHaveLength(8);
      expect(validShortCode(code)).toBe(true);
      expect(code).not.toMatch(/[O0I1]/);
    }
  });

  it("normalises what someone types or pastes", async () => {
    const { normaliseShortCode, validShortCode } = await import("@/lib/schools/invites");
    expect(normaliseShortCode(" abcd-2345 ")).toBe("ABCD2345");
    expect(validShortCode(normaliseShortCode("abcd 2345"))).toBe(true);
    expect(validShortCode("ABCD234")).toBe(false);
    expect(validShortCode("ABCD23456")).toBe(false);
  });

  it("stores a stable digest of the token, never the token", async () => {
    const { hashInviteToken, newInviteToken } = await import("@/lib/schools/invites");
    const token = newInviteToken();
    expect(hashInviteToken(token)).toBe(hashInviteToken(token));
    expect(hashInviteToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashInviteToken(token)).not.toContain(token);
    expect(newInviteToken()).not.toBe(token);
  });
});
