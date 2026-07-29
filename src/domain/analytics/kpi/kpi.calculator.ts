"use server";

import type { KpiDefinition, DateRange, AnalyticsSupabaseClient } from "../analytics.types";

export async function calculateKpi(
  kpiDef: KpiDefinition,
  supabase: AnalyticsSupabaseClient,
  tenantId: string,
  dateRange: DateRange
): Promise<number> {
  return kpiDef.calculator(supabase, tenantId, dateRange);
}
