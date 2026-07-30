import type { KpiResult, DatePreset, AnalyticsSupabaseClient } from "./analytics.types";
import { kpiRegistry } from "./kpi/kpi.registry";
import { dateEngine } from "./date/date.engine";
import { calculateKpi } from "./kpi/kpi.calculator";

export async function getKpiData(
  kpiId: string,
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset
): Promise<KpiResult> {
  const kpiDef = kpiRegistry.get(kpiId);
  if (!kpiDef) {
    throw new Error(`Unknown KPI: ${kpiId}`);
  }

  const dateRange = await dateEngine.resolve(datePreset);
  const rawValue = await calculateKpi(kpiDef, supabase, tenantId, dateRange);

  return {
    id: kpiDef.id,
    nameAr: kpiDef.nameAr,
    value: await kpiDef.formatter(rawValue),
    raw: rawValue,
    timestamp: new Date().toISOString(),
  };
}

export async function getAllKpiData(
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset
): Promise<KpiResult[]> {
  const allKpis = kpiRegistry.getAll();
  const results: KpiResult[] = [];

  for (const kpiDef of allKpis) {
    try {
      const result = await getKpiData(kpiDef.id, supabase, tenantId, datePreset);
      results.push(result);
    } catch (err) {
      console.error(`[AnalyticsEngine] KPI ${kpiDef.id} failed:`, err);
      results.push({
        id: kpiDef.id,
        nameAr: kpiDef.nameAr,
        value: "—",
        raw: 0,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}

export async function getKpiDataByCategory(
  category: "patients" | "appointments" | "queue" | "revenue" | "invoices",
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  datePreset: DatePreset
): Promise<KpiResult[]> {
  const kpis = kpiRegistry.getByCategory(category);
  const results: KpiResult[] = [];

  for (const kpiDef of kpis) {
    try {
      const result = await getKpiData(kpiDef.id, supabase, tenantId, datePreset);
      results.push(result);
    } catch (err) {
      console.error(`[AnalyticsEngine] KPI ${kpiDef.id} failed:`, err);
      results.push({
        id: kpiDef.id,
        nameAr: kpiDef.nameAr,
        value: "—",
        raw: 0,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
}
