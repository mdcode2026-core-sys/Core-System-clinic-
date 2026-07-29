"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/infrastructure/supabase/database.types";

export type AnalyticsSupabaseClient = SupabaseClient<Database>;

export interface DateRange {
  from: string; // ISO date string YYYY-MM-DD
  to: string;   // ISO date string YYYY-MM-DD
}

export type DatePreset = "today" | "this_month";

export interface KpiDefinition {
  id: string;
  nameAr: string;
  category: "patients" | "appointments" | "queue" | "revenue" | "invoices";
  calculator: (
    supabase: AnalyticsSupabaseClient,
    tenantId: string,
    dateRange: DateRange
  ) => Promise<number>;
  formatter: (value: number) => string | Promise<string>;
}

export interface KpiResult {
  id: string;
  nameAr: string;
  value: string;
  raw: number;
  timestamp: string;
}

export interface KpiRegistry {
  get(id: string): KpiDefinition | undefined;
  getAll(): KpiDefinition[];
  getByCategory(category: KpiDefinition["category"]): KpiDefinition[];
}
