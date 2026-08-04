"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getAllKpiData, getKpiDataByCategory } from "./analytics.engine";
import type { KpiResult, DatePreset } from "./analytics.types";

/**
 * Resolve tenant_id via clinic_users lookup (proven reliable pattern).
 * NEVER use user.user_metadata?.tenant_id or app_metadata.
 */
async function resolveTenantId(authUserId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("[analytics.actions] resolveTenantId error:", error);
    return null;
  }

  return data?.tenant_id ?? null;
}

export async function getAnalyticsOverview(
  authUserId: string,
  datePreset: DatePreset = "today"
): Promise<KpiResult[]> {
  const tenantId = await resolveTenantId(authUserId);
  if (!tenantId) {
    throw new Error("Tenant not found for user");
  }

  const supabase = await createClient();
  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  return getAllKpiData(supabase, tenantId, datePreset);
}

export async function getAnalyticsByCategory(
  authUserId: string,
  category: "patients" | "appointments" | "queue" | "revenue" | "invoices" | "inventory" | "followup",
  datePreset: DatePreset = "today"
): Promise<KpiResult[]> {
  const tenantId = await resolveTenantId(authUserId);
  if (!tenantId) {
    throw new Error("Tenant not found for user");
  }

  const supabase = await createClient();
  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  return getKpiDataByCategory(category, supabase, tenantId, datePreset);
}
