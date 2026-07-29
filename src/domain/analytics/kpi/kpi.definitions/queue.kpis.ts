"use server";

import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

export const queueAvgWaitingTimeKpi: KpiDefinition = {
  id: "queue.avg_waiting_time",
  nameAr: "متوسط الانتظار",
  category: "queue",
  calculator: async (supabase, tenantId, _dateRange) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("clinic_visit_sessions")
      .select("waiting_time_minutes")
      .eq("tenant_id", tenantId)
      .gte("created_at", `${todayStr}T00:00:00`)
      .lte("created_at", `${todayStr}T23:59:59`)
      .not("waiting_time_minutes", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, row) => acc + (row.waiting_time_minutes ?? 0), 0);
    return sum / data.length;
  },
  formatter: kpiFormatter.minutes,
};

export const queueLongestWaitKpi: KpiDefinition = {
  id: "queue.longest_wait",
  nameAr: "أطول انتظار",
  category: "queue",
  calculator: async (supabase, tenantId, _dateRange) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("clinic_visit_sessions")
      .select("waiting_time_minutes")
      .eq("tenant_id", tenantId)
      .gte("created_at", `${todayStr}T00:00:00`)
      .lte("created_at", `${todayStr}T23:59:59`)
      .not("waiting_time_minutes", "is", null)
      .order("waiting_time_minutes", { ascending: false })
      .limit(1);
    if (error) throw error;
    return data?.[0]?.waiting_time_minutes ?? 0;
  },
  formatter: kpiFormatter.minutes,
};

export const queueCurrentKpi: KpiDefinition = {
  id: "queue.current",
  nameAr: "الطابور الحالي",
  category: "queue",
  calculator: async (supabase, tenantId, _dateRange) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { count, error } = await supabase
      .from("clinic_visit_sessions")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("session_status", "waiting")
      .gte("created_at", `${todayStr}T00:00:00`)
      .lte("created_at", `${todayStr}T23:59:59`);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const queueServedTodayKpi: KpiDefinition = {
  id: "queue.served_today",
  nameAr: "تم خدمتهم اليوم",
  category: "queue",
  calculator: async (supabase, tenantId, _dateRange) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { count, error } = await supabase
      .from("clinic_visit_sessions")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("session_status", "completed")
      .gte("created_at", `${todayStr}T00:00:00`)
      .lte("created_at", `${todayStr}T23:59:59`);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};
