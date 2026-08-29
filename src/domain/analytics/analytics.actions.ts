"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getAllKpiData, getKpiDataByCategory } from "./analytics.engine";
import type { KpiResult, DatePreset, AnalyticsCategory } from "./analytics.types";

async function resolveTenantId(authUserId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", authUserId).maybeSingle();
  if (error) { console.error("[analytics.actions] resolveTenantId error:", error); return null; }
  return data?.tenant_id ?? null;
}

async function assertAnalyticsReadAccess(authUserId: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.id !== authUserId) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("Tenant not found for user");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("analytics:read")) throw new Error("Not authorized");
  return tenantId;
}

export async function getAnalyticsOverview(authUserId: string, datePreset: DatePreset = "today"): Promise<KpiResult[]> {
  const tenantId = await assertAnalyticsReadAccess(authUserId);
  return getAllKpiData(await createClient(), tenantId, datePreset);
}

export async function getAnalyticsByCategory(authUserId: string, category: AnalyticsCategory, datePreset: DatePreset = "today"): Promise<KpiResult[]> {
  const tenantId = await assertAnalyticsReadAccess(authUserId);
  return getKpiDataByCategory(category, await createClient(), tenantId, datePreset);
}
