"use server";

import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

export const revenueTotalKpi: KpiDefinition = {
  id: "revenue.total",
  nameAr: "إجمالي الإيرادات",
  category: "revenue",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("clinic_invoices")
      .select("total_subunits")
      .eq("tenant_id", tenantId)
      .gte("invoice_date", dateRange.from)
      .lte("invoice_date", dateRange.to)
      .not("total_subunits", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, row) => acc + (row.total_subunits ?? 0), 0);
  },
  formatter: kpiFormatter.currency,
};

export const revenueDailyKpi: KpiDefinition = {
  id: "revenue.daily",
  nameAr: "إيرادات اليوم",
  category: "revenue",
  calculator: async (supabase, tenantId, _dateRange) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("clinic_invoices")
      .select("total_subunits")
      .eq("tenant_id", tenantId)
      .eq("invoice_date", todayStr)
      .not("total_subunits", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, row) => acc + (row.total_subunits ?? 0), 0);
  },
  formatter: kpiFormatter.currency,
};

export const revenueMonthlyKpi: KpiDefinition = {
  id: "revenue.monthly",
  nameAr: "إيرادات الشهر",
  category: "revenue",
  calculator: async (supabase, tenantId, _dateRange) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const firstDay = `${yyyy}-${mm}-01`;
    const lastDay = new Date(yyyy, today.getMonth() + 1, 0);
    const lastDayStr = `${yyyy}-${mm}-${String(lastDay.getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("clinic_invoices")
      .select("total_subunits")
      .eq("tenant_id", tenantId)
      .gte("invoice_date", firstDay)
      .lte("invoice_date", lastDayStr)
      .not("total_subunits", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, row) => acc + (row.total_subunits ?? 0), 0);
  },
  formatter: kpiFormatter.currency,
};

export const revenueAvgInvoiceKpi: KpiDefinition = {
  id: "revenue.avg_invoice",
  nameAr: "متوسط الفاتورة",
  category: "revenue",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("clinic_invoices")
      .select("total_subunits")
      .eq("tenant_id", tenantId)
      .gte("invoice_date", dateRange.from)
      .lte("invoice_date", dateRange.to)
      .not("total_subunits", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, row) => acc + (row.total_subunits ?? 0), 0);
    return sum / data.length;
  },
  formatter: kpiFormatter.currency,
};

export const revenueByDoctorKpi: KpiDefinition = {
  id: "revenue.by_doctor",
  nameAr: "الإيرادات حسب الطبيب",
  category: "revenue",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("clinic_invoices")
      .select("total_subunits, session_id")
      .eq("tenant_id", tenantId)
      .gte("invoice_date", dateRange.from)
      .lte("invoice_date", dateRange.to)
      .not("total_subunits", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, row) => acc + (row.total_subunits ?? 0), 0);
  },
  formatter: kpiFormatter.currency,
};

export const revenueByProcedureKpi: KpiDefinition = {
  id: "revenue.by_procedure",
  nameAr: "الإيرادات حسب الخدمة",
  category: "revenue",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("line_total_subunits")
      .eq("tenant_id", tenantId)
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`)
      .not("line_total_subunits", "is", null);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, row) => acc + (row.line_total_subunits ?? 0), 0);
  },
  formatter: kpiFormatter.currency,
};

export const revenueTopProceduresKpi: KpiDefinition = {
  id: "revenue.top_procedures",
  nameAr: "أكثر الخدمات",
  category: "revenue",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase
      .from("invoice_items")
      .select("line_total_subunits")
      .eq("tenant_id", tenantId)
      .gte("created_at", `${dateRange.from}T00:00:00`)
      .lte("created_at", `${dateRange.to}T23:59:59`)
      .not("line_total_subunits", "is", null)
      .order("line_total_subunits", { ascending: false })
      .limit(5);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, row) => acc + (row.line_total_subunits ?? 0), 0);
  },
  formatter: kpiFormatter.currency,
};
