import type { KpiResult, DatePreset, AnalyticsSupabaseClient, AnalyticsCategory } from "./analytics.types";
import { kpiRegistry } from "./kpi/kpi.registry";
import { dateEngine } from "./date/date.engine";
import { calculateKpi } from "./kpi/kpi.calculator";

export async function getKpiData(
  kpiId: string,
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset,
  timezone: string
): Promise<KpiResult> {
  const kpiDef = kpiRegistry.get(kpiId);
  if (!kpiDef) throw new Error(`Unknown KPI: ${kpiId}`);

  const dateRange = await dateEngine.resolve(datePreset, timezone);
  const rawValue = await calculateKpi(kpiDef, supabase, tenantId, dateRange);

  return {
    id: kpiDef.id,
    nameAr: kpiDef.nameAr,
    value: await kpiDef.formatter(rawValue),
    raw: rawValue,
    timestamp: new Date().toISOString(),
    dateFrom: dateRange.from,
    dateTo: dateRange.to,
    timezone: dateRange.timezone,
    coverage: kpiDef.dateBasis === "current_state" || kpiDef.supportsDateFilter === false ? "complete" : "unknown",
  };
}

async function getKpiDataSafe(
  kpiId: string,
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset,
  timezone: string
): Promise<KpiResult> {
  const kpiDef = kpiRegistry.get(kpiId);
  if (!kpiDef) throw new Error(`Unknown KPI: ${kpiId}`);
  try {
    return await getKpiData(kpiId, supabase, tenantId, datePreset, timezone);
  } catch (err) {
    console.error(`[AnalyticsEngine] KPI ${kpiDef.id} failed:`, err);
    return {
      id: kpiDef.id,
      nameAr: kpiDef.nameAr,
      value: "—",
      raw: 0,
      timestamp: new Date().toISOString(),
      coverage: "unknown",
    };
  }
}

export async function getAllKpiData(
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset,
  timezone: string
): Promise<KpiResult[]> {
  return Promise.all(kpiRegistry.getAll().map((kpi) => getKpiDataSafe(kpi.id, supabase, tenantId, datePreset, timezone)));
}

export async function getKpiDataByCategory(
  category: AnalyticsCategory,
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset,
  timezone: string
): Promise<KpiResult[]> {
  return Promise.all(kpiRegistry.getByCategory(category).map((kpi) => getKpiDataSafe(kpi.id, supabase, tenantId, datePreset, timezone)));
}
