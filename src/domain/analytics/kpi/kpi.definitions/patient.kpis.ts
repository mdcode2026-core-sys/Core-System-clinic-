"use server";

import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

export const patientsTotalKpi: KpiDefinition = {
  id: "patients.total",
  nameAr: "إجمالي المرضى",
  category: "patients",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { count, error } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsNewKpi: KpiDefinition = {
  id: "patients.new",
  nameAr: "مرضى جدد",
  category: "patients",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .gte("first_visit_date", dateRange.from)
      .lte("first_visit_date", dateRange.to);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsReturningKpi: KpiDefinition = {
  id: "patients.returning",
  nameAr: "مرضى عائدون",
  category: "patients",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .lt("first_visit_date", dateRange.from)
      .lte("first_visit_date", dateRange.to);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsActiveKpi: KpiDefinition = {
  id: "patients.active",
  nameAr: "مرضى نشطون",
  category: "patients",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { count, error } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("patient_status", "active")
      .is("deleted_at", null);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const patientsGrowthRateKpi: KpiDefinition = {
  id: "patients.growth_rate",
  nameAr: "معدل النمو",
  category: "patients",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count: currentNew, error: err1 } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .gte("first_visit_date", dateRange.from)
      .lte("first_visit_date", dateRange.to);
    if (err1) throw err1;

    const periodDays = Math.max(1, Math.ceil(
      (new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const prevFrom = new Date(new Date(dateRange.from).getTime() - periodDays * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];
    const prevTo = new Date(new Date(dateRange.from).getTime() - 1 * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0];

    const { count: previousNew, error: err2 } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .gte("first_visit_date", prevFrom)
      .lte("first_visit_date", prevTo);
    if (err2) throw err2;

    const current = currentNew ?? 0;
    const previous = previousNew ?? 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
  formatter: kpiFormatter.percentage,
};

export const patientsAvgVisitsKpi: KpiDefinition = {
  id: "patients.avg_visits",
  nameAr: "متوسط الزيارات",
  category: "patients",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { data, error } = await supabase
      .from("clinic_visit_sessions")
      .select("patient_id", { count: "exact" })
      .eq("tenant_id", tenantId);
    if (error) throw error;

    const { count: patientCount, error: err2 } = await supabase
      .from("clinic_patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);
    if (err2) throw err2;

    const totalVisits = data?.length ?? 0;
    const totalPatients = patientCount ?? 0;
    if (totalPatients === 0) return 0;
    return totalVisits / totalPatients;
  },
  formatter: (v) => v.toLocaleString("ar-SA", { maximumFractionDigits: 1 }),
};
