import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/infrastructure/supabase/database.types";

export type AnalyticsSupabaseClient = SupabaseClient<Database>;

export interface DateRange {
  from: string;
  to: string;
  startAt: string;
  endAtExclusive: string;
  timezone: string;
}

export type DatePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "custom";

export type AnalyticsCategory =
  | "patients"
  | "appointments"
  | "queue"
  | "revenue"
  | "invoices"
  | "inventory"
  | "followup"
  | "workforce"
  | "communications"
  | "coordination";

export type MetricDateBasis =
  | "patient_first_visit_date"
  | "appointment_scheduled_start"
  | "session_event"
  | "procedure_performed_at"
  | "invoice_date"
  | "payment_date"
  | "refund_date"
  | "followup_scheduled_for"
  | "followup_sent_at"
  | "inventory_created_at"
  | "attendance_date"
  | "created_at"
  | "current_state";

export interface KpiDefinition {
  id: string;
  nameAr: string;
  category: AnalyticsCategory;
  dateBasis?: MetricDateBasis;
  sourceTables?: string[];
  businessDefinition?: string;
  supportsDateFilter?: boolean;
  supportsBreakdown?: boolean;
  calculator: (supabase: AnalyticsSupabaseClient, tenantId: string, dateRange: DateRange) => Promise<number>;
  formatter: (value: number) => string | Promise<string>;
}

export interface KpiResult {
  id: string;
  nameAr: string;
  value: string;
  raw: number;
  timestamp: string;
  dateFrom?: string;
  dateTo?: string;
  timezone?: string;
  coverage?: "complete" | "partial" | "sparse" | "unknown";
}

export interface KpiRegistry {
  get(id: string): KpiDefinition | undefined;
  getAll(): KpiDefinition[];
  getByCategory(category: AnalyticsCategory): KpiDefinition[];
}
