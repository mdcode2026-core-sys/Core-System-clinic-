import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

function shiftDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().slice(0, 10);
}

function inclusiveDays(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${to}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

export const patientsTotalKpi: KpiDefinition = {
  id: "patients.total",
  nameAr: "إجمالي المرضى",
  category: "patients",
  dateBasis: "current_state",
  sourceTables: ["clinic_patients"],
  businessDefinition: "عدد المرضى الحاليين غير المحذوفين في العيادة.",
  supportsDateFilter: false,
  calculator: async (supabase, tenantId) => {
    const { count, error } = await supabase.from("clinic_patients").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsNewKpi: KpiDefinition = {
  id: "patients.new",
  nameAr: "مرضى جدد",
  category: "patients",
  dateBasis: "patient_first_visit_date",
  sourceTables: ["clinic_patients"],
  businessDefinition: "المرضى الذين كان تاريخ أول زيارة مسجلاً لهم داخل الفترة المختارة.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("clinic_patients").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null).gte("first_visit_date", dateRange.from).lte("first_visit_date", dateRange.to);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsReturningKpi: KpiDefinition = {
  id: "patients.returning",
  nameAr: "مرضى عائدون",
  category: "patients",
  dateBasis: "session_event",
  sourceTables: ["clinic_visit_sessions"],
  businessDefinition: "مرضى لديهم نشاط سريري مؤهل مكتمل خلال الفترة المختارة، ولديهم نشاط سريري مؤهل سابق قبل بداية الفترة.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { data: current, error: currentError } = await supabase
      .from("clinic_visit_sessions")
      .select("patient_id")
      .eq("tenant_id", tenantId)
      .eq("session_status", "completed")
      .is("deleted_at", null)
      .gte("visit_closed_at", dateRange.startAt)
      .lt("visit_closed_at", dateRange.endAtExclusive);
    if (currentError) throw currentError;

    const currentPatients = [...new Set((current ?? []).map((row) => row.patient_id).filter(Boolean))];
    if (currentPatients.length === 0) return 0;

    let returning = 0;
    for (const patientId of currentPatients) {
      const { count, error } = await supabase
        .from("clinic_visit_sessions")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("patient_id", patientId)
        .eq("session_status", "completed")
        .is("deleted_at", null)
        .lt("visit_closed_at", dateRange.startAt);
      if (error) throw error;
      if ((count ?? 0) > 0) returning += 1;
    }
    return returning;
  },
  formatter: kpiFormatter.integer,
};

export const patientsActiveKpi: KpiDefinition = {
  id: "patients.active",
  nameAr: "مرضى نشطون",
  category: "patients",
  dateBasis: "current_state",
  sourceTables: ["clinic_patients"],
  businessDefinition: "المرضى غير المحذوفين ذوو حالة patient_status = active حالياً.",
  supportsDateFilter: false,
  calculator: async (supabase, tenantId) => {
    const { count, error } = await supabase.from("clinic_patients").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("patient_status", "active").is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsGrowthRateKpi: KpiDefinition = {
  id: "patients.growth_rate",
  nameAr: "معدل نمو المرضى الجدد",
  category: "patients",
  dateBasis: "patient_first_visit_date",
  sourceTables: ["clinic_patients"],
  businessDefinition: "نمو عدد المرضى الجدد في الفترة المختارة مقارنة بفترة سابقة مكافئة لها في عدد الأيام.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { count: current, error: err1 } = await supabase.from("clinic_patients").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null).gte("first_visit_date", dateRange.from).lte("first_visit_date", dateRange.to);
    if (err1) throw err1;
    const days = inclusiveDays(dateRange.from, dateRange.to);
    const prevTo = shiftDays(dateRange.from, -1);
    const prevFrom = shiftDays(prevTo, -(days - 1));
    const { count: previous, error: err2 } = await supabase.from("clinic_patients").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null).gte("first_visit_date", prevFrom).lte("first_visit_date", prevTo);
    if (err2) throw err2;
    const currentCount = current ?? 0;
    const previousCount = previous ?? 0;
    if (previousCount === 0) return currentCount === 0 ? 0 : 100;
    return ((currentCount - previousCount) / previousCount) * 100;
  },
  formatter: kpiFormatter.percentage,
};

export const patientsAvgVisitsKpi: KpiDefinition = {
  id: "patients.avg_visits",
  nameAr: "متوسط الزيارات لكل مريض",
  category: "patients",
  dateBasis: "session_event",
  sourceTables: ["clinic_visit_sessions"],
  businessDefinition: "عدد الزيارات السريرية المكتملة في الفترة المختارة مقسوماً على عدد المرضى الفريدين ذوي زيارة مكتملة في الفترة نفسها.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("clinic_visit_sessions").select("patient_id").eq("tenant_id", tenantId).eq("session_status", "completed").is("deleted_at", null).gte("visit_closed_at", dateRange.startAt).lt("visit_closed_at", dateRange.endAtExclusive);
    if (error) throw error;
    const visits = data ?? [];
    if (visits.length === 0) return 0;
    const patients = new Set(visits.map((row) => row.patient_id).filter(Boolean));
    return patients.size === 0 ? 0 : visits.length / patients.size;
  },
  formatter: (v) => v.toLocaleString("en-US", { maximumFractionDigits: 1 }),
};
