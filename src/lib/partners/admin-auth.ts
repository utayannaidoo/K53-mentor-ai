import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Who may open /admin and move partner money.
 *
 * A comma-separated `ADMIN_EMAILS` allowlist, resolved from the Supabase
 * session on the server for every page render and every mutation. There is no
 * client-side half to this: the admin pages are server components and each
 * action re-checks, so a stale tab or a hand-made POST is refused the same way
 * a signed-out browser is.
 *
 * **Fails closed.** An unset or empty `ADMIN_EMAILS` means *nobody* is an
 * admin. The alternative — treating "no allowlist configured" as "no
 * restriction" — turns a missing environment variable on a fresh deploy into
 * an open payout console for every signed-in learner. Locking the owner out of
 * their own admin area is a five-minute fix; the other failure is not.
 */
function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0);
}

/** True when the programme has an admin at all — used only for boot logging. */
export const hasAdminAllowlist = allowlist().length > 0;

/**
 * The signed-in admin's email, or null for everyone else. Null covers all of:
 * Supabase not configured, nobody signed in, an empty allowlist, and a
 * signed-in learner who simply isn't on it. Callers must not distinguish
 * between those cases in anything they render.
 */
export async function adminEmail(): Promise<string | null> {
  const emails = allowlist();
  if (emails.length === 0) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.trim().toLowerCase();
  if (!email || !emails.includes(email)) return null;
  return email;
}

/** `true` when the caller may act. Every mutation must await this first. */
export async function isAdmin(): Promise<boolean> {
  return (await adminEmail()) !== null;
}
