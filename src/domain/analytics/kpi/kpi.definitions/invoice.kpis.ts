import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

export const invoicesPaidKpi: KpiDefinition = {
  id: "invoices.paid",
  nameAr: "فواتير مدفوعة",
  category: "invoices",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { count, error } = await supabase
      .from("clinic_invoices")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("invoice_status", "paid");
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const invoicesPendingKpi: KpiDefinition = {
  id: "invoices.pending",
  nameAr: "فواتير معلقة",
  category: "invoices",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { count, error } = await supabase
      .from("clinic_invoices")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .in("invoice_status", ["issued", "partial"]);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const invoicesCancelledKpi: KpiDefinition = {
  id: "invoices.cancelled",
  nameAr: "فواتير ملغاة",
  category: "invoices",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { count, error } = await supabase
      .from("clinic_invoices")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("invoice_status", "cancelled");
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
};

export const invoicesCollectionRateKpi: KpiDefinition = {
  id: "invoices.collection_rate",
  nameAr: "معدل التحصيل",
  category: "invoices",
  calculator: async (supabase, tenantId, _dateRange) => {
    const { data: invoices, error: err1 } = await supabase
      .from("clinic_invoices")
      .select("total_subunits, amount_paid_subunits")
      .eq("tenant_id", tenantId)
      .not("total_subunits", "is", null);
    if (err1) throw err1;
    if (!invoices || invoices.length === 0) return 0;

    const total = invoices.reduce((acc, row) => acc + (row.total_subunits ?? 0), 0);
    const paid = invoices.reduce((acc, row) => acc + (row.amount_paid_subunits ?? 0), 0);

    if (total === 0) return 0;
    return (paid / total) * 100;
  },
  formatter: kpiFormatter.percentage,
};
