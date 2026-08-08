"use server";

// src/core/auth/resolveTenantId.ts
// Single source of truth for resolving tenant_id server-side, from clinic_users.
//
// This extracts the exact pattern already documented as canonical in
// src/domain/analytics/analytics.actions.ts:
//   "Resolve tenant_id via clinic_users lookup (proven reliable pattern).
//    NEVER use user.user_metadata?.tenant_id or app_metadata."
//
// Consolidates what was previously duplicated (and done incorrectly, via
// user_metadata) across multiple Server Component pages and domain files.

import { createClient } from "@/infrastructure/supabase/server";

export async function resolveTenantId(authUserId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("[resolveTenantId] lookup failed:", error.message);
    return null;
  }

  return data?.tenant_id ?? null;
}
