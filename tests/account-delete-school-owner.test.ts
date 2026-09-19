import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Deleting an account that owns a driving school.
 *
 * The database refuses to erase an active school owner (0041), but it only
 * finds out at the very last step — after the route has stopped every Paystack
 * subscription the person has. So the route must ask first, and stop before
 * any billing is touched. It must also keep working, unchanged, on a database
 * where the school tables do not exist yet.
 */

vi.mock("@/lib/ai/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ai/rate-limit")>();
  return {
    ...actual,
    clientIp: () => "203.0.113.7",
    limitCheckout: async () => ({ success: true, retryAfter: 0 }),
    limitUserDaily: async () => ({ success: true, retryAfter: 0 }),
  };
});

vi.mock("@/lib/env", () => ({
  isSupabaseConfigured: true,
  isPaystackConfigured: true,
  supabaseConfig: { url: "https://stub.supabase.co", anonKey: "anon" },
}));

// An OAuth-only account, so the route takes the emailed-code path.
const USER = { id: "owner-1", email: "owner@example.com", identities: [{ provider: "google" }] };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: USER } }) },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: { provider_customer_id: "CUS_owner", tier: "premium" } }) }),
      }),
    }),
  }),
}));

let memberResult: { data: unknown; error: { code?: string; message: string } | null };
const deleteUser = vi.fn();

function chain(result: () => unknown) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "in", "is", "limit", "delete", "update", "insert"]) {
    builder[method] = () => builder;
  }
  builder.maybeSingle = async () => ({ data: { name: "Sipho's Driving School" }, error: null });
  builder.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result()).then(resolve, reject);
  return builder;
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => chain(() => (table === "school_members" ? memberResult : { data: null, error: null })),
    auth: { admin: { deleteUser: (...a: unknown[]) => deleteUser(...a) } },
    rpc: async () => ({ data: true, error: null }),
  }),
}));

const disableActiveSubscriptions = vi.fn();
vi.mock("@/lib/billing/subscription-cancel", () => ({
  disableActiveSubscriptions: (...a: unknown[]) => disableActiveSubscriptions(...a),
  refundEligible: () => false,
}));
vi.mock("@/lib/paystack/client", () => ({ refundTransaction: vi.fn() }));
vi.mock("@/lib/account/deletion-code", () => ({ verifyDeletionCode: async () => true }));
vi.mock("@/lib/leads/plan-lead-store", () => ({ forgetPlanLead: vi.fn(async () => {}) }));

async function del() {
  const { POST } = await import("@/app/api/account/delete/route");
  return POST(
    new Request("https://k53mentorai.co.za/api/account/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "123456" }),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  deleteUser.mockResolvedValue({ error: null });
  disableActiveSubscriptions.mockResolvedValue(1);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/account/delete for a driving-school owner", () => {
  it("refuses, names the school, and never touches billing", async () => {
    memberResult = { data: [{ school_id: "school-1" }], error: null };
    const res = await del();
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "owns_school", school: "Sipho's Driving School" });
    expect(disableActiveSubscriptions).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("refuses without touching billing when ownership cannot be checked", async () => {
    memberResult = { data: null, error: { code: "57014", message: "canceling statement due to statement timeout" } };
    const res = await del();
    expect(res.status).toBe(502);
    expect(disableActiveSubscriptions).not.toHaveBeenCalled();
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes as before on a database that has no school tables yet", async () => {
    memberResult = {
      data: null,
      error: { code: "PGRST205", message: "Could not find the table 'public.school_members' in the schema cache" },
    };
    const res = await del();
    expect(res.status).toBe(200);
    expect(disableActiveSubscriptions).toHaveBeenCalledWith("CUS_owner", "everything");
    expect(deleteUser).toHaveBeenCalledWith("owner-1");
  });

  it("deletes someone who owns no school, stopping every plan they pay for", async () => {
    memberResult = { data: [], error: null };
    const res = await del();
    expect(res.status).toBe(200);
    expect(disableActiveSubscriptions).toHaveBeenCalledWith("CUS_owner", "everything");
    expect(deleteUser).toHaveBeenCalledWith("owner-1");
  });
});
