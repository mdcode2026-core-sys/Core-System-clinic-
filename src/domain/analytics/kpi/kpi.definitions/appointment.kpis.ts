import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

const appointmentBase = (id: string, nameAr: string, status?: string): KpiDefinition => ({
  id,
  nameAr,
  category: "appointments",
  dateBasis: "appointment_scheduled_start",
  sourceTables: ["master_agenda_events"],
  businessDefinition: status ? `عدد المواعيد ذات الحالة ${status} حسب وقت البداية المجدول داخل الفترة المختارة.` : "عدد المواعيد المجدولة داخل الفترة المختارة حسب وقت البداية.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    let query = supabase.from("master_agenda_events").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null).gte("scheduled_start", dateRange.startAt).lt("scheduled_start", dateRange.endAtExclusive);
    if (status) query = query.eq("status", status);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
});

export const appointmentsTotalKpi = appointmentBase("appointments.total", "إجمالي المواعيد");
export const appointmentsCompletedKpi = appointmentBase("appointments.completed", "مواعيد مكتملة", "completed");
export const appointmentsCancelledKpi = appointmentBase("appointments.cancelled", "مواعيد ملغاة", "cancelled");
export const appointmentsNoShowKpi = appointmentBase("appointments.no_show", "لم يحضر", "no_show");

export const appointmentsAvgWaitingTimeKpi: KpiDefinition = {
  id: "appointments.avg_waiting_time",
  nameAr: "متوسط وقت الانتظار",
  category: "appointments",
  dateBasis: "session_event",
  sourceTables: ["clinic_visit_sessions"],
  businessDefinition: "متوسط waiting_time_minutes للزيارات المكتملة/المعالجة وفق بداية الجلسة داخل الفترة المختارة.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("clinic_visit_sessions").select("waiting_time_minutes").eq("tenant_id", tenantId).is("deleted_at", null).not("waiting_time_minutes", "is", null).gte("session_started_at", dateRange.startAt).lt("session_started_at", dateRange.endAtExclusive);
    if (error) throw error;
    if (!data?.length) return 0;
    return data.reduce((sum, row) => sum + Number(row.waiting_time_minutes ?? 0), 0) / data.length;
  },
  formatter: kpiFormatter.minutes,
};

export const appointmentsAvgDurationKpi: KpiDefinition = {
  id: "appointments.avg_duration",
  nameAr: "متوسط مدة الجلسة",
  category: "appointments",
  dateBasis: "session_event",
  sourceTables: ["clinic_visit_sessions"],
  businessDefinition: "متوسط مدة الجلسة المسجلة للزيارات التي بدأت داخل الفترة المختارة.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("clinic_visit_sessions").select("session_duration_minutes").eq("tenant_id", tenantId).is("deleted_at", null).not("session_duration_minutes", "is", null).gte("session_started_at", dateRange.startAt).lt("session_started_at", dateRange.endAtExclusive);
    if (error) throw error;
    if (!data?.length) return 0;
    return data.reduce((sum, row) => sum + Number(row.session_duration_minutes ?? 0), 0) / data.length;
  },
  formatter: kpiFormatter.minutes,
};
