import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

const billableInvoiceStatuses = ["issued", "paid", "partial", "refunded"];

async function sumGrossInvoiced(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("clinic_invoices").select("total_subunits, invoice_status").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", billableInvoiceStatuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.total_subunits ?? 0), 0);
}

async function sumCollectedByInvoiceDate(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("clinic_invoices").select("amount_paid_subunits").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", ["issued", "paid", "partial", "refunded"]).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount_paid_subunits ?? 0), 0);
}

async function sumRefunded(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("invoice_refunds").select("amount_subunits").eq("tenant_id", tenantId).is("deleted_at", null).gte("refunded_at", dateRange.startAt).lt("refunded_at", dateRange.endAtExclusive);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount_subunits ?? 0), 0);
}

export const revenueTotalKpi: KpiDefinition = {
  id: "revenue.total", nameAr: "إجمالي الفوترة", category: "revenue",
  dateBasis: "invoice_date", sourceTables: ["clinic_invoices"], supportsDateFilter: true,
  businessDefinition: "Gross Invoiced: مجموع إجمالي الفواتير الصادرة/المدفوعة/الجزئية خلال الفترة، دون اعتبار المدفوعات أو المبالغ المستردة مقياساً للفوترة.",
  calculator: async (supabase, tenantId, dateRange) => sumGrossInvoiced(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueDailyKpi: KpiDefinition = {
  id: "revenue.daily", nameAr: "المحصل ضمن الفترة", category: "revenue",
  dateBasis: "invoice_date", sourceTables: ["clinic_invoices"], supportsDateFilter: true,
  businessDefinition: "Collected: المبالغ المدفوعة المسجلة على فواتير تاريخها داخل الفترة المختارة. استخدام invoice_date موحد مع مقام معدل التحصيل.",
  calculator: async (supabase, tenantId, dateRange) => sumCollectedByInvoiceDate(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueMonthlyKpi: KpiDefinition = {
  id: "revenue.monthly", nameAr: "المبالغ المستردة", category: "revenue",
  dateBasis: "refund_date", sourceTables: ["invoice_refunds"], supportsDateFilter: true,
  businessDefinition: "Refunded: مجموع عمليات الاسترداد الفعلية حسب refunded_at داخل الفترة المختارة.",
  calculator: async (supabase, tenantId, dateRange) => sumRefunded(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueAvgInvoiceKpi: KpiDefinition = {
  id: "revenue.avg_invoice", nameAr: "صافي التحصيل", category: "revenue",
  dateBasis: "invoice_date", sourceTables: ["clinic_invoices", "invoice_refunds"], supportsDateFilter: true,
  businessDefinition: "Net Collected: المحصل ضمن الفترة وفق invoice_date مطروحاً منه الاستردادات المسجلة خلال الفترة وفق refunded_at.",
  calculator: async (supabase, tenantId, dateRange) => (await sumCollectedByInvoiceDate(supabase, tenantId, dateRange)) - (await sumRefunded(supabase, tenantId, dateRange)),
  formatter: kpiFormatter.currency,
};

export const revenueByDoctorKpi: KpiDefinition = {
  id: "revenue.by_doctor", nameAr: "إجمالي الفوترة حسب الطبيب", category: "revenue",
  dateBasis: "invoice_date", sourceTables: ["clinic_invoices", "clinic_visit_sessions"], supportsDateFilter: true, supportsBreakdown: true,
  businessDefinition: "تجميع الفوترة الإجمالية حسب الطبيب المرتبط بالجلسة المالية؛ الفواتير غير المرتبطة بجلسة تبقى في مجموعة مستقلة.",
  calculator: async (supabase, tenantId, dateRange) => sumGrossInvoiced(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueByProcedureKpi: KpiDefinition = {
  id: "revenue.by_procedure", nameAr: "إجمالي الفوترة حسب الخدمة", category: "revenue",
  dateBasis: "invoice_date", sourceTables: ["clinic_invoices", "invoice_items", "clinic_procedures"], supportsDateFilter: true, supportsBreakdown: true,
  businessDefinition: "تجميع بنود الفواتير حسب الهوية التجارية للخدمة/الإجراء في invoice_items.procedure_id، دون افتراض استهلاك مادة.",
  calculator: async (supabase, tenantId, dateRange) => sumGrossInvoiced(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueTopProceduresKpi: KpiDefinition = {
  id: "revenue.top_procedures", nameAr: "أكثر الخدمات من حيث الفوترة", category: "revenue",
  dateBasis: "invoice_date", sourceTables: ["clinic_invoices", "invoice_items", "clinic_procedures"], supportsDateFilter: true, supportsBreakdown: true,
  businessDefinition: "الخدمات ذات أعلى إجمالي فوترة خلال الفترة، مجمعة حسب canonical procedure/service identity وبسياق الفترة.",
  calculator: async (supabase, tenantId, dateRange) => sumGrossInvoiced(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueCollectedKpi: KpiDefinition = {
  id: "revenue.collected", nameAr: "المحصل", category: "revenue", dateBasis: "payment_date",
  sourceTables: ["invoice_payments"], supportsDateFilter: true,
  businessDefinition: "مجموع payment transactions التي حدثت خلال الفترة المختارة حسب payment_date.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("invoice_payments").select("amount_subunits").eq("tenant_id", tenantId).gte("payment_date", dateRange.startAt).lt("payment_date", dateRange.endAtExclusive);
    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + Number(row.amount_subunits ?? 0), 0);
  }, formatter: kpiFormatter.currency,
};

export const revenueRefundedKpi: KpiDefinition = {
  id: "revenue.refunded", nameAr: "المسترد", category: "revenue", dateBasis: "refund_date",
  sourceTables: ["invoice_refunds"], supportsDateFilter: true,
  businessDefinition: "مجموع عمليات الاسترداد خلال الفترة حسب refunded_at.",
  calculator: async (supabase, tenantId, dateRange) => sumRefunded(supabase, tenantId, dateRange),
  formatter: kpiFormatter.currency,
};

export const revenueNetCollectedKpi: KpiDefinition = {
  id: "revenue.net_collected", nameAr: "صافي المحصل", category: "revenue", dateBasis: "payment_date",
  sourceTables: ["invoice_payments", "invoice_refunds"], supportsDateFilter: true,
  businessDefinition: "Net Collected = payment transactions during the selected period minus refunds during the selected period.",
  calculator: async (supabase, tenantId, dateRange) => (await revenueCollectedKpi.calculator(supabase, tenantId, dateRange)) - (await sumRefunded(supabase, tenantId, dateRange)),
  formatter: kpiFormatter.currency,
};

export const revenueBreakdownHelpers = { sumGrossInvoiced, sumCollectedByInvoiceDate, sumRefunded };
