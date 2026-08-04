"use server";

import { createClient } from "@/infrastructure/supabase/server";

/**
 * Checks whether a module/feature is enabled for a given tenant.
 * Queries feature_flags for a row matching flag_key = moduleKey where:
 * - tenant_id IS NULL (global) OR tenant_id = $tenantId (tenant-specific)
 * - is_enabled = true
 *
 * Tenant-specific rows take precedence over global rows.
 * Per ADR-007: shared infrastructure, reusable beyond Reports.
 */
export async function isFeatureEnabled(
  tenantId: string,
  moduleKey: string
): Promise<boolean> {
  const supabase = await createClient();

  // 1. Check tenant-specific flag first (takes precedence)
  const { data: tenantFlag, error: tErr } = await supabase
    .from("feature_flags")
    .select("is_enabled")
    .eq("flag_key", moduleKey)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (tErr) {
    console.error("[isFeatureEnabled] tenant flag query failed:", tErr.message);
    return false;
  }

  if (tenantFlag) {
    return tenantFlag.is_enabled === true;
  }

  // 2. Fall back to global flag (tenant_id IS NULL)
  const { data: globalFlag, error: gErr } = await supabase
    .from("feature_flags")
    .select("is_enabled")
    .eq("flag_key", moduleKey)
    .is("tenant_id", null)
    .maybeSingle();

  if (gErr) {
    console.error("[isFeatureEnabled] global flag query failed:", gErr.message);
    return false;
  }

  return globalFlag?.is_enabled === true;
}
