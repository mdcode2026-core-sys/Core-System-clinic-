import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

export const appointmentsTotalKpi: KpiDefinition = {
  id: "appointments.total",
  nameAr: "إجمالي المواعيد",
  category: "appointments",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("master_agenda_events")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("scheduled_start", `${dateRange.from}T00:00:00`)
      .lte("scheduled_start", `${dateRange.to}T23:59:59`);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const appointmentsCompletedKpi: KpiDefinition = {
  id: "appointments.completed",
  nameAr: "مواعيد مكتملة",
  category: "appointments",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("master_agenda_events")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "completed")
      .gte("scheduled_start", `${dateRange.from}T00:00:00`)
      .lte("scheduled_start", `${dateRange.to}T23:59:59`);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const appointmentsCancelledKpi: KpiDefinition = {
  id: "appointments.cancelled",
  nameAr: "مواعيد ملغاة",
  category: "appointments",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("master_agenda_events")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "cancelled")
      .gte("scheduled_start", `${dateRange.from}T00:00:00`)
      .lte("scheduled_start", `${dateRange.to}T23:59:59`);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const appointmentsNoShowKpi: KpiDefinition = {
  id: "appointments.no_show",
  nameAr: "لم يحضر",
  category: "appointments",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("master_agenda_events")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "no_show")
      .gte("scheduled_start", `${dateRange.from}T00:00:00`)
      .lte("scheduled_start", `${dateRange.to}T23:59:59`);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const appointmentsAvgWaitingTimeKpi: KpiDefinition = {
  id: "appointments.avg_waiting_time",
  nameAr: "متوسط وقت الانتظار",
  category: "appointments",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("clinic_visit_sessions")
      .select("waiting_time_minutes")
      .eq("tenant_id", tenantId)
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`)
      .not("waiting_time_minutes", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, row) => acc + (row.waiting_time_minutes ?? 0), 0);
    return sum / data.length;
  },
  formatter: kpiFormatter.minutes,
};

export const appointmentsAvgDurationKpi: KpiDefinition = {
  id: "appointments.avg_duration",
  nameAr: "متوسط مدة الكشف",
  category: "appointments",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("clinic_visit_sessions")
      .select("session_duration_minutes")
      .eq("tenant_id", tenantId)
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`)
      .not("session_duration_minutes", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, row) => acc + (row.session_duration_minutes ?? 0), 0);
    return sum / data.length;
  },
  formatter: kpiFormatter.minutes,
};
