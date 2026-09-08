import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

const invoiceCount = (id: string, nameAr: string, statuses: string[]): KpiDefinition => ({
  id,
  nameAr,
  category: "invoices",
  dateBasis: "invoice_date",
  sourceTables: ["clinic_invoices"],
  businessDefinition: "عدد الفواتير ذات الحالة المحددة حسب invoice_date داخل الفترة المختارة.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("clinic_invoices").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", statuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
    if (error) throw error;
    return count ?? 0;
  },
  formatter: kpiFormatter.integer,
});

export const invoicesPaidKpi = invoiceCount("invoices.paid", "فواتير مدفوعة", ["paid"]);
export const invoicesPendingKpi = invoiceCount("invoices.pending", "فواتير قائمة/جزئية", ["issued", "partial"]);
export const invoicesCancelledKpi = invoiceCount("invoices.cancelled", "فواتير ملغاة", ["cancelled"]);

export const invoicesCollectionRateKpi: KpiDefinition = {
  id: "invoices.collection_rate",
  nameAr: "معدل التحصيل",
  category: "invoices",
  dateBasis: "invoice_date",
  sourceTables: ["clinic_invoices"],
  businessDefinition: "المبالغ المدفوعة المسجلة على الفواتير المؤرخة داخل الفترة ÷ إجمالي الفوترة لتلك الفواتير. يستخدم invoice_date في البسط والمقام لضمان تطابق الفترة.",
  supportsDateFilter: true,
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("clinic_invoices").select("total_subunits, amount_paid_subunits, invoice_status").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", ["issued", "paid", "partial", "refunded"]).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
    if (error) throw error;
    const rows = data ?? [];
    const total = rows.reduce((sum, row) => sum + Number(row.total_subunits ?? 0), 0);
    const paid = rows.reduce((sum, row) => sum + Number(row.amount_paid_subunits ?? 0), 0);
    return total === 0 ? 0 : (paid / total) * 100;
  },
  formatter: kpiFormatter.percentage,
};
