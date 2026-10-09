import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Trusted server-only caller for the protected Agenda command RPCs.
 * Appointment reads and UI preflight continue to use the authenticated session client.
 * The service key is never included in the browser bundle.
 */
export function createAgendaCommandClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("AGENDA_COMMAND_CONFIGURATION_MISSING");

  return createClient(SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
