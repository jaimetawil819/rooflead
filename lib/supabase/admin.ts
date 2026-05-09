import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for use in server-only contexts:
 *   - API route handlers under app/api/**
 *   - Webhook handlers
 *   - Cron jobs
 *
 * Never import this from a client component. It uses the service role key
 * which bypasses Row-Level Security.
 *
 * Lazy singleton: instantiated on first access so the module is safe to import
 * at build time even when env vars are not yet bound (e.g. in tooling contexts).
 */

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}
