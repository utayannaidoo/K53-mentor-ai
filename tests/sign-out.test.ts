import { describe, expect, it, vi } from "vitest";
import { revokeRemoteSession, type RemoteSignOutClient } from "@/lib/auth/sign-out";

const clientReturning = (error: unknown | null): RemoteSignOutClient => ({
  auth: { signOut: vi.fn().mockResolvedValue({ error }) },
});

describe("revokeRemoteSession", () => {
  it("succeeds in local demo mode", async () => {
    await expect(revokeRemoteSession(null)).resolves.toBe(true);
  });

  it("only reports success after the remote session is revoked", async () => {
    await expect(revokeRemoteSession(clientReturning(null))).resolves.toBe(true);
  });

  it("reports resolved Supabase auth errors instead of treating them as logout", async () => {
    await expect(revokeRemoteSession(clientReturning(new Error("offline")))).resolves.toBe(false);
  });

  it("reports network rejection instead of treating it as logout", async () => {
    const client: RemoteSignOutClient = {
      auth: { signOut: vi.fn().mockRejectedValue(new Error("network")) },
    };
    await expect(revokeRemoteSession(client)).resolves.toBe(false);
  });
});
