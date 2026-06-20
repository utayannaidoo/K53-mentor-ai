import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseConfig } from "@/lib/env";

/**
 * Browser Supabase client. Returns null in local demo mode (no env), so callers
 * fall back to the localStorage-backed store.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseConfig.url!, supabaseConfig.anonKey!);
}
