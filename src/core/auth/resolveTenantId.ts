"use server";

// src/core/auth/resolveTenantId.ts
// Single source of truth for resolving tenant_id server-side, from clinic_users.
//
// Supabase PostgREST can intermittently reject a freshly-issued authenticated
// JWT with PGRST303 ("JWT issued at future"). Keep this bounded retry here so a
// transient Auth/PostgREST clock-validation race does not turn a valid session
// into a false tenant-missing redirect. The retry is intentionally limited and
// only applies to that exact transient signature.

import { createClient } from "@/infrastructure/supabase/server";

const MAX_AUTH_CLOCK_RETRIES = 2;
const AUTH_CLOCK_RETRY_DELAYS_MS = [300, 900];

export async function resolveTenantId(authUserId: string): Promise<string | null> {
  for (let attempt = 0; attempt <= MAX_AUTH_CLOCK_RETRIES; attempt += 1) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clinic_users")
      .select("tenant_id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!error) return data?.tenant_id ?? null;

    const isJwtIssuedAtFuture = error.message.includes("JWT issued at future");
    if (!isJwtIssuedAtFuture || attempt === MAX_AUTH_CLOCK_RETRIES) {
      console.error("[resolveTenantId] lookup failed:", error.message);
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, AUTH_CLOCK_RETRY_DELAYS_MS[attempt]));
  }

  return null;
}
