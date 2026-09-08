import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

export const queueAvgWaitingTimeKpi: KpiDefinition = {
  id: "queue.avg_waiting_time", nameAr: "متوسط الانتظار", category: "queue",
  dateBasis: "session_event", sourceTables: ["clinic_visit_sessions"], supportsDateFilter: true,
  businessDefinition: "متوسط waiting_time_minutes للجلسات التي بدأت خلال الفترة المختارة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("clinic_visit_sessions").select("waiting_time_minutes").eq("tenant_id", tenantId).is("deleted_at", null).not("waiting_time_minutes", "is", null).gte("session_started_at", dateRange.startAt).lt("session_started_at", dateRange.endAtExclusive);
    if (error) throw error;
    if (!data?.length) return 0;
    return data.reduce((sum, row) => sum + Number(row.waiting_time_minutes ?? 0), 0) / data.length;
  }, formatter: kpiFormatter.minutes,
};

export const queueLongestWaitKpi: KpiDefinition = {
  id: "queue.longest_wait", nameAr: "أطول انتظار", category: "queue",
  dateBasis: "session_event", sourceTables: ["clinic_visit_sessions"], supportsDateFilter: true,
  businessDefinition: "أعلى waiting_time_minutes بين الجلسات التي بدأت خلال الفترة المختارة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("clinic_visit_sessions").select("waiting_time_minutes").eq("tenant_id", tenantId).is("deleted_at", null).not("waiting_time_minutes", "is", null).gte("session_started_at", dateRange.startAt).lt("session_started_at", dateRange.endAtExclusive).order("waiting_time_minutes", { ascending: false }).limit(1);
    if (error) throw error;
    return Number(data?.[0]?.waiting_time_minutes ?? 0);
  }, formatter: kpiFormatter.minutes,
};

export const queueCurrentKpi: KpiDefinition = {
  id: "queue.current", nameAr: "الطابور الحالي", category: "queue",
  dateBasis: "current_state", sourceTables: ["clinic_visit_sessions"], supportsDateFilter: false,
  businessDefinition: "عدد الجلسات التي حالتها waiting حالياً ضمن المستأجر.",
  calculator: async (supabase, tenantId) => {
    const { count, error } = await supabase.from("clinic_visit_sessions").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("session_status", "waiting").is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  }, formatter: kpiFormatter.integer,
};

export const queueServedTodayKpi: KpiDefinition = {
  id: "queue.served_today", nameAr: "تم خدمتهم ضمن الفترة", category: "queue",
  dateBasis: "session_event", sourceTables: ["clinic_visit_sessions"], supportsDateFilter: true,
  businessDefinition: "عدد الجلسات التي أصبحت completed وبدأت خلال الفترة المختارة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("clinic_visit_sessions").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("session_status", "completed").is("deleted_at", null).gte("session_started_at", dateRange.startAt).lt("session_started_at", dateRange.endAtExclusive);
    if (error) throw error;
    return count ?? 0;
  }, formatter: kpiFormatter.integer,
};
