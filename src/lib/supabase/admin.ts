import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/env";

/**
 * Service-role Supabase client for trusted server code (Stripe webhook).
 * Bypasses RLS — never import from client components; the "server-only"
 * package makes any client-bundle import a build error.
 */
export function createAdminClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseConfig.url || !serviceKey) return null;
  return createSupabaseClient(supabaseConfig.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
