"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getAllKpiData, getKpiDataByCategory, getKpiData } from "./analytics.engine";
import { kpiRegistry } from "./kpi/kpi.registry";
import { dateEngine } from "./date/date.engine";
import type { KpiResult, DatePreset, AnalyticsCategory, AnalyticsDrilldownRow } from "./analytics.types";

async function resolveTenantId(authUserId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", authUserId).maybeSingle();
  if (error) { console.error("[analytics.actions] resolveTenantId error:", error); return null; }
  return data?.tenant_id ?? null;
}

async function resolveTenantTimezone(tenantId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("master_tenants").select("timezone").eq("id", tenantId).maybeSingle();
  if (error) { console.error("[analytics.actions] resolveTenantTimezone error:", error); return "UTC"; }
  return data?.timezone || "UTC";
}

async function assertAnalyticsReadAccess(authUserId: string): Promise<{ tenantId: string; timezone: string }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.id !== authUserId) throw new Error("Not authenticated");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) throw new Error("Tenant not found for user");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("analytics:read")) throw new Error("Not authorized");
  return { tenantId, timezone: await resolveTenantTimezone(tenantId) };
}

export async function getAnalyticsOverview(authUserId: string, datePreset: DatePreset = "today", customFrom?: string, customTo?: string): Promise<KpiResult[]> {
  const { tenantId, timezone } = await assertAnalyticsReadAccess(authUserId);
  return getAllKpiData(await createClient(), tenantId, datePreset, timezone, customFrom, customTo);
}

export async function getAnalyticsByCategory(authUserId: string, category: AnalyticsCategory, datePreset: DatePreset = "today", customFrom?: string, customTo?: string): Promise<KpiResult[]> {
  const { tenantId, timezone } = await assertAnalyticsReadAccess(authUserId);
  return getKpiDataByCategory(category, await createClient(), tenantId, datePreset, timezone, customFrom, customTo);
}

function addCalendarDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function inclusiveDays(from: string, to: string) {
  return Math.max(1, Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1);
}

export async function getAnalyticsTrend(authUserId: string, kpiId: string, datePreset: DatePreset = "this_week", customFrom?: string, customTo?: string) {
  const { tenantId, timezone } = await assertAnalyticsReadAccess(authUserId);
  const supabase = await createClient();
  const definition = kpiRegistry.get(kpiId);
  if (!definition) throw new Error(`Unknown KPI: ${kpiId}`);
  if (definition.supportsDateFilter === false || definition.dateBasis === "current_state") return [];
  const range = await dateEngine.resolve(datePreset, timezone, customFrom, customTo);
  const points = [] as { date: string; value: number }[];
  for (let i = 0, day = range.from; i < inclusiveDays(range.from, range.to); i++, day = addCalendarDays(day, 1)) {
    const dayRange = dateEngine.fromDates(day, day, timezone);
    points.push({ date: day, value: await definition.calculator(supabase, tenantId, dayRange) });
  }
  return points;
}

export async function getAnalyticsComparison(authUserId: string, kpiId: string, datePreset: DatePreset = "this_month", customFrom?: string, customTo?: string) {
  const { tenantId, timezone } = await assertAnalyticsReadAccess(authUserId);
  const supabase = await createClient();
  const definition = kpiRegistry.get(kpiId);
  if (!definition) throw new Error(`Unknown KPI: ${kpiId}`);
  if (definition.supportsDateFilter === false || definition.dateBasis === "current_state") return { current: null, previous: null, changePercent: null };
  const current = await dateEngine.resolve(datePreset, timezone, customFrom, customTo);
  const days = inclusiveDays(current.from, current.to);
  const previousTo = addCalendarDays(current.from, -1);
  const previousFrom = addCalendarDays(previousTo, -(days - 1));
  const previous = dateEngine.fromDates(previousFrom, previousTo, timezone);
  const currentValue = await definition.calculator(supabase, tenantId, current);
  const previousValue = await definition.calculator(supabase, tenantId, previous);
  const changePercent = previousValue === 0 ? (currentValue === 0 ? 0 : 100) : ((currentValue - previousValue) / previousValue) * 100;
  return { current: currentValue, previous: previousValue, changePercent, currentFrom: current.from, currentTo: current.to, previousFrom, previousTo };
}

export async function getAnalyticsDrilldown(authUserId: string, kpiId: string, datePreset: DatePreset = "this_month", customFrom?: string, customTo?: string, limit = 50): Promise<AnalyticsDrilldownRow[]> {
  const { tenantId, timezone } = await assertAnalyticsReadAccess(authUserId);
  const definition = kpiRegistry.get(kpiId);
  if (!definition) throw new Error(`Unknown KPI: ${kpiId}`);
  if (!definition.drilldownCalculator) return [];
  const range = await dateEngine.resolve(datePreset, timezone, customFrom, customTo);
  return definition.drilldownCalculator(await createClient(), tenantId, range, Math.min(Math.max(limit, 1), 100));
}
