/** Minimal structural type so this helper stays independent of supabase-js. */
export interface RemoteSignOutClient {
  auth: {
    signOut: () => Promise<{ error: unknown | null }>;
  };
}

/**
 * Revoke the durable auth session and report whether it is safe for the UI to
 * claim the learner is signed out. Supabase reports many failures as a
 * resolved `{ error }`, so checking only for a rejected promise is insufficient.
 */
export async function revokeRemoteSession(
  client: RemoteSignOutClient | null,
): Promise<boolean> {
  if (!client) return true;
  try {
    const { error } = await client.auth.signOut();
    return error == null;
  } catch {
    return false;
  }
}
