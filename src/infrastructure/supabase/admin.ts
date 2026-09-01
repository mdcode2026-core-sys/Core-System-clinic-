import { createClient } from "@supabase/supabase-js";

/**
 * Trusted-server Supabase client for Auth administration only.
 * Never import this module from client components or expose the secret key.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_ADMIN_CONFIGURATION_MISSING");

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
