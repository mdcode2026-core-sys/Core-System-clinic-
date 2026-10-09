import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Trusted server-only client for Agenda persistence commands.
 * Deliberately separate from admin.ts, which is reserved for Auth administration.
 * Never import this module from a client component or expose its key to the browser.
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
