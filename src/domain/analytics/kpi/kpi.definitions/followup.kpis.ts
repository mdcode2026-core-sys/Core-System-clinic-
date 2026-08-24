import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

/**
 * Follow-up KPIs — Package 3.1.8
 * Approved: Follow-up Completion Rate, Follow-up Response Rate,
 *            Overdue Follow-up Rate, Patient Retention Rate,
 *            Average Follow-up Delay
 */

export const followupCompletionRateKpi: KpiDefinition = {
  id: "followup.completion_rate", nameAr: "معدل إنجاز المتابعات", category: "followup",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count: completedCount, error: err1 } = await supabase.from("retention_followups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).in("delivery_status", ["sent", "delivered", "read"]).gte("sent_at", `${dateRange.from}T00:00:00`).lte("sent_at", `${dateRange.to}T23:59:59`);
    if (err1) throw err1;
    const { count: totalCount, error: err2 } = await supabase.from("retention_followups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("scheduled_for", `${dateRange.from}T00:00:00`).lte("scheduled_for", `${dateRange.to}T23:59:59`);
    if (err2) throw err2;
    const total = totalCount ?? 0;
    return total === 0 ? 0 : ((completedCount ?? 0) / total) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const followupResponseRateKpi: KpiDefinition = {
  id: "followup.response_rate", nameAr: "معدل استجابة المتابعات", category: "followup",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count: respondedCount, error: err1 } = await supabase.from("retention_followups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("response_received", true).gte("sent_at", `${dateRange.from}T00:00:00`).lte("sent_at", `${dateRange.to}T23:59:59`);
    if (err1) throw err1;
    const { count: sentCount, error: err2 } = await supabase.from("retention_followups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).in("delivery_status", ["sent", "delivered", "read"]).gte("sent_at", `${dateRange.from}T00:00:00`).lte("sent_at", `${dateRange.to}T23:59:59`);
    if (err2) throw err2;
    const sent = sentCount ?? 0;
    return sent === 0 ? 0 : ((respondedCount ?? 0) / sent) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const overdueFollowupRateKpi: KpiDefinition = {
  id: "followup.overdue_rate", nameAr: "معدل المتابعات المتأخرة", category: "followup",
  calculator: async (supabase, tenantId) => {
    const now = new Date().toISOString();
    const { count: overdueCount, error: err1 } = await supabase.from("retention_followups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("delivery_status", "pending").lt("scheduled_for", now);
    if (err1) throw err1;
    const { count: pendingCount, error: err2 } = await supabase.from("retention_followups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("delivery_status", "pending");
    if (err2) throw err2;
    const pending = pendingCount ?? 0;
    return pending === 0 ? 0 : ((overdueCount ?? 0) / pending) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const patientRetentionRateKpi: KpiDefinition = {
  id: "followup.patient_retention_rate", nameAr: "معدل الاحتفاظ بالمرضى", category: "followup",
  calculator: async (supabase, tenantId) => {
    const { data: followupPatients, error: err1 } = await supabase.from("retention_followups").select("patient_id").eq("tenant_id", tenantId);
    if (err1) throw err1;
    const distinctFollowupPatients = new Set((followupPatients ?? []).map((row) => row.patient_id)).size;
    const { count: totalPatients, error: err2 } = await supabase.from("clinic_patients").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).is("deleted_at", null);
    if (err2) throw err2;
    const total = totalPatients ?? 0;
    return total === 0 ? 0 : (distinctFollowupPatients / total) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const avgFollowupDelayKpi: KpiDefinition = {
  id: "followup.avg_delay", nameAr: "متوسط تأخير المتابعة", category: "followup",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("retention_followups").select("scheduled_for, sent_at").eq("tenant_id", tenantId).not("sent_at", "is", null).gte("sent_at", `${dateRange.from}T00:00:00`).lte("sent_at", `${dateRange.to}T23:59:59`);
    if (error) throw error;
    if (!data || data.length === 0) return 0;
    let totalDelayHours = 0;
    let validCount = 0;
    for (const row of data) {
      const scheduled = new Date(row.scheduled_for).getTime();
      const sent = new Date(row.sent_at!).getTime();
      const delayHours = (sent - scheduled) / (1000 * 60 * 60);
      if (!isNaN(delayHours)) { totalDelayHours += delayHours; validCount++; }
    }
    return validCount === 0 ? 0 : totalDelayHours / validCount;
  },
  formatter: async (v) => Math.round(v).toLocaleString("en-US", { numberingSystem: "latn" }),
};
