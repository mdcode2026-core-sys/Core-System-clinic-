import type { KpiDefinition, AnalyticsBreakdownRow, AnalyticsDrilldownRow } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

const billableInvoiceStatuses = ["issued", "paid", "partial", "refunded"];

async function sumGrossInvoiced(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("clinic_invoices").select("total_subunits, invoice_status").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", billableInvoiceStatuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.total_subunits ?? 0), 0);
}

async function sumCollectedByInvoiceDate(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("clinic_invoices").select("amount_paid_subunits").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", billableInvoiceStatuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount_paid_subunits ?? 0), 0);
}

async function sumRefunded(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("invoice_refunds").select("amount_subunits").eq("tenant_id", tenantId).is("deleted_at", null).gte("refunded_at", dateRange.startAt).lt("refunded_at", dateRange.endAtExclusive);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount_subunits ?? 0), 0);
}

async function revenueCollectedForPeriod(supabase: any, tenantId: string, dateRange: any) {
  const { data, error } = await supabase.from("invoice_payments").select("amount_subunits").eq("tenant_id", tenantId).gte("payment_date", dateRange.startAt).lt("payment_date", dateRange.endAtExclusive);
  if (error) throw error;
  return (data ?? []).reduce((sum: number, row: any) => sum + Number(row.amount_subunits ?? 0), 0);
}

async function doctorBreakdown(supabase: any, tenantId: string, dateRange: any): Promise<AnalyticsBreakdownRow[]> {
  const { data, error } = await supabase.from("clinic_invoices").select("id,total_subunits,invoice_date,session_id").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", billableInvoiceStatuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
  if (error) throw error;
  const invoices = data ?? [];
  const sessionIds = Array.from(new Set(invoices.map((r: any) => r.session_id).filter((x: unknown): x is string => typeof x === "string"))) as string[];
  const sessions: any[] = sessionIds.length ? ((await supabase.from("clinic_visit_sessions").select("id,doctor_id").eq("tenant_id", tenantId).in("id", sessionIds))).data ?? [] : [];
  const doctorIds = Array.from(new Set(sessions.map((s: any) => s.doctor_id).filter((x: unknown): x is string => typeof x === "string"))) as string[];
  const doctors: any[] = doctorIds.length ? ((await supabase.from("clinic_users").select("id,full_name").eq("tenant_id", tenantId).in("id", doctorIds))).data ?? [] : [];
  const doctorBySession = new Map<string, string | null>(sessions.map((s: any) => [String(s.id), s.doctor_id == null ? null : String(s.doctor_id)]));
  const doctorNames = new Map<string, string>(doctors.map((d: any) => [String(d.id), String(d.full_name ?? d.id)]));
  const groups = new Map<string, { value: number; count: number }>();
  for (const invoice of invoices) {
    const sessionKey = invoice.session_id == null ? null : String(invoice.session_id);
    const key = doctorBySession.get(sessionKey ?? "") ?? "unassigned";
    const current = groups.get(key) ?? { value: 0, count: 0 };
    current.value += Number(invoice.total_subunits ?? 0);
    current.count += 1;
    groups.set(key, current);
  }
  return [...groups.entries()].sort((a, b) => b[1].value - a[1].value).map(([key, x]) => ({ key, label: key === "unassigned" ? "Unassigned / standalone" : (doctorNames.get(key) ?? key), value: x.value, count: x.count, metadata: { doctorId: key === "unassigned" ? null : key } }));
}

async function serviceBreakdown(supabase: any, tenantId: string, dateRange: any): Promise<AnalyticsBreakdownRow[]> {
  const { data, error } = await supabase.from("invoice_items").select("id,invoice_id,procedure_id,line_total_subunits,created_at,quantity").eq("tenant_id", tenantId);
  if (error) throw error;
  const items = data ?? [];
  const invoiceIds = Array.from(new Set(items.map((r: any) => r.invoice_id).filter((x: unknown): x is string => typeof x === "string"))) as string[];
  if (!invoiceIds.length) return [];
  const { data: invoices, error: invoiceError } = await supabase.from("clinic_invoices").select("id,invoice_date").eq("tenant_id", tenantId).is("deleted_at", null).in("id", invoiceIds).in("invoice_status", billableInvoiceStatuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to);
  if (invoiceError) throw invoiceError;
  const invoiceSet = new Set<string>((invoices ?? []).map((r: any) => String(r.id)));
  const procedureIds = Array.from(new Set(items.map((r: any) => r.procedure_id).filter((x: unknown): x is string => typeof x === "string"))) as string[];
  const procedures: any[] = procedureIds.length ? ((await supabase.from("clinic_procedures").select("id,procedure_name").eq("tenant_id", tenantId).in("id", procedureIds))).data ?? [] : [];
  const names = new Map<string, string>(procedures.map((p: any) => [String(p.id), String(p.procedure_name ?? p.id)]));
  const groups = new Map<string, { value: number; count: number }>();
  for (const item of items) {
    if (!invoiceSet.has(String(item.invoice_id))) continue;
    const key = typeof item.procedure_id === "string" ? item.procedure_id : "unassigned";
    const current = groups.get(key) ?? { value: 0, count: 0 };
    current.value += Number(item.line_total_subunits ?? 0);
    current.count += Number(item.quantity ?? 1);
    groups.set(key, current);
  }
  return [...groups.entries()].sort((a, b) => b[1].value - a[1].value).map(([key, x]) => ({ key, label: names.get(key) ?? (key === "unassigned" ? "Unassigned service" : key), value: x.value, count: x.count, metadata: { procedureId: key === "unassigned" ? null : key } }));
}

async function revenueDrilldown(supabase: any, tenantId: string, dateRange: any, limit: number): Promise<AnalyticsDrilldownRow[]> {
  const { data, error } = await supabase.from("clinic_invoices").select("id,invoice_number,invoice_date,total_subunits,amount_paid_subunits,invoice_status,patient_id,session_id").eq("tenant_id", tenantId).is("deleted_at", null).in("invoice_status", billableInvoiceStatuses).gte("invoice_date", dateRange.from).lte("invoice_date", dateRange.to).order("invoice_date", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ id: String(row.id), sourceDomain: "financial", sourceTable: "clinic_invoices", date: row.invoice_date, value: Number(row.total_subunits ?? 0), fields: { invoiceNumber: row.invoice_number, invoiceStatus: row.invoice_status, amountPaidSubunits: row.amount_paid_subunits, patientId: row.patient_id, sessionId: row.session_id } }));
}

export const revenueTotalKpi: KpiDefinition = { id: "revenue.total", nameAr: "إجمالي الفوترة", category: "revenue", dateBasis: "invoice_date", sourceTables: ["clinic_invoices"], supportsDateFilter: true, businessDefinition: "Gross Invoiced: مجموع إجمالي الفواتير المؤهلة حسب invoice_date خلال الفترة.", calculator: async (s,t,r)=>sumGrossInvoiced(s,t,r), formatter:kpiFormatter.currency, drilldownCalculator: revenueDrilldown };
export const revenueDailyKpi: KpiDefinition = { id: "revenue.daily", nameAr: "المحصل ضمن الفترة", category: "revenue", dateBasis: "invoice_date", sourceTables: ["clinic_invoices"], supportsDateFilter: true, businessDefinition: "Collected المسند للفواتير المؤرخة داخل الفترة، لتوحيد الفترة مع collection rate.", calculator: async (s,t,r)=>sumCollectedByInvoiceDate(s,t,r), formatter:kpiFormatter.currency, drilldownCalculator: revenueDrilldown };
export const revenueMonthlyKpi: KpiDefinition = { id: "revenue.monthly", nameAr: "المبالغ المستردة", category: "revenue", dateBasis: "refund_date", sourceTables: ["invoice_refunds"], supportsDateFilter: true, businessDefinition: "Refunded خلال الفترة حسب refunded_at.", calculator: async (s,t,r)=>sumRefunded(s,t,r), formatter:kpiFormatter.currency };
export const revenueAvgInvoiceKpi: KpiDefinition = { id: "revenue.avg_invoice", nameAr: "صافي المحصل", category: "revenue", dateBasis: "payment_date", sourceTables: ["invoice_payments","invoice_refunds"], supportsDateFilter: true, businessDefinition: "Net Collected = payment transactions خلال الفترة ناقص refunds خلال الفترة.", calculator: async (s,t,r)=>await revenueCollectedForPeriod(s,t,r)-await sumRefunded(s,t,r), formatter:kpiFormatter.currency };
export const revenueByDoctorKpi: KpiDefinition = { id: "revenue.by_doctor", nameAr: "إجمالي الفوترة حسب الطبيب", category: "revenue", dateBasis: "invoice_date", sourceTables: ["clinic_invoices","clinic_visit_sessions","clinic_users"], supportsDateFilter: true, supportsBreakdown: true, businessDefinition: "Gross invoiced grouped by canonical session doctor; standalone/unassigned invoices are separate.", calculator: async(s,t,r)=>sumGrossInvoiced(s,t,r), formatter:kpiFormatter.currency, breakdownCalculator: doctorBreakdown, drilldownCalculator: revenueDrilldown };
export const revenueByProcedureKpi: KpiDefinition = { id: "revenue.by_procedure", nameAr: "إجمالي الفوترة حسب الخدمة", category: "revenue", dateBasis: "invoice_date", sourceTables: ["clinic_invoices","invoice_items","clinic_procedures"], supportsDateFilter: true, supportsBreakdown: true, businessDefinition: "Invoice line totals grouped by canonical procedure/service identity; does not imply material consumption.", calculator: async(s,t,r)=>sumGrossInvoiced(s,t,r), formatter:kpiFormatter.currency, breakdownCalculator: serviceBreakdown, drilldownCalculator: revenueDrilldown };
export const revenueTopProceduresKpi: KpiDefinition = { id: "revenue.top_procedures", nameAr: "أكثر الخدمات من حيث الفوترة", category: "revenue", dateBasis: "invoice_date", sourceTables: ["clinic_invoices","invoice_items","clinic_procedures"], supportsDateFilter: true, supportsBreakdown: true, businessDefinition: "Top invoice-line services by canonical identity within selected invoice dates.", calculator: async(s,t,r)=>sumGrossInvoiced(s,t,r), formatter:kpiFormatter.currency, breakdownCalculator: async(s,t,r)=>(await serviceBreakdown(s,t,r)).slice(0,5), drilldownCalculator: revenueDrilldown };
export const revenueCollectedKpi: KpiDefinition = { id: "revenue.collected", nameAr: "المحصل", category: "revenue", dateBasis: "payment_date", sourceTables: ["invoice_payments"], supportsDateFilter: true, businessDefinition: "Payment transactions occurring during the selected period by payment_date.", calculator: async(s,t,r)=>revenueCollectedForPeriod(s,t,r), formatter:kpiFormatter.currency };
export const revenueRefundedKpi: KpiDefinition = { id: "revenue.refunded", nameAr: "المسترد", category: "revenue", dateBasis: "refund_date", sourceTables: ["invoice_refunds"], supportsDateFilter: true, businessDefinition: "Refund transactions occurring during the selected period by refunded_at.", calculator: async(s,t,r)=>sumRefunded(s,t,r), formatter:kpiFormatter.currency };
export const revenueNetCollectedKpi: KpiDefinition = { id: "revenue.net_collected", nameAr: "صافي المحصل", category: "revenue", dateBasis: "payment_date", sourceTables: ["invoice_payments","invoice_refunds"], supportsDateFilter: true, businessDefinition: "Collected payment transactions minus refunds during the selected period.", calculator: async(s,t,r)=>await revenueCollectedForPeriod(s,t,r)-await sumRefunded(s,t,r), formatter:kpiFormatter.currency };

export const revenueBreakdownHelpers = { sumGrossInvoiced, sumCollectedByInvoiceDate, sumRefunded };
