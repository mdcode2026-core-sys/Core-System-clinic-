import type { KpiDefinition } from "../../analytics.types";
import { kpiFormatter } from "../kpi.formatter";

const sentStatuses = ["sent", "delivered", "read"];

export const followupCompletionRateKpi: KpiDefinition = {
  id: "followup.completion_rate", nameAr: "معدل إنجاز المتابعات", category: "followup", dateBasis: "followup_scheduled_for", sourceTables: ["retention_followups"], supportsDateFilter: true,
  businessDefinition: "المتابعات المجدولة داخل الفترة والتي انتقلت إلى delivery status مرسل/مسلم/مقروء ÷ كل المتابعات المجدولة داخل الفترة. لا توجد حالة completed مستقلة في النموذج الحالي.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("retention_followups").select("delivery_status").eq("tenant_id", tenantId).is("deleted_at", null).gte("scheduled_for", dateRange.startAt).lt("scheduled_for", dateRange.endAtExclusive);
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) return 0;
    return (rows.filter((r: any) => sentStatuses.includes(r.delivery_status ?? "")).length / rows.length) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const followupResponseRateKpi: KpiDefinition = {
  id: "followup.response_rate", nameAr: "معدل استجابة المتابعات", category: "followup", dateBasis: "followup_sent_at", sourceTables: ["retention_followups"], supportsDateFilter: true,
  businessDefinition: "المتابعات المرسلة داخل الفترة التي response_received = true ÷ المتابعات المرسلة داخل الفترة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("retention_followups").select("response_received, delivery_status").eq("tenant_id", tenantId).is("deleted_at", null).in("delivery_status", sentStatuses).gte("sent_at", dateRange.startAt).lt("sent_at", dateRange.endAtExclusive);
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) return 0;
    return (rows.filter((r: any) => r.response_received === true).length / rows.length) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const overdueFollowupRateKpi: KpiDefinition = {
  id: "followup.overdue_rate", nameAr: "معدل المتابعات المتأخرة", category: "followup", dateBasis: "followup_scheduled_for", sourceTables: ["retention_followups"], supportsDateFilter: false,
  businessDefinition: "المتابعات pending التي تجاوز scheduled_for ÷ جميع المتابعات pending حالياً.",
  calculator: async (supabase, tenantId) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("retention_followups").select("scheduled_for").eq("tenant_id", tenantId).is("deleted_at", null).eq("delivery_status", "pending");
    if (error) throw error;
    const rows = data ?? [];
    if (!rows.length) return 0;
    return (rows.filter((r: any) => r.scheduled_for < now).length / rows.length) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const patientRetentionRateKpi: KpiDefinition = {
  id: "followup.patient_retention_rate", nameAr: "معدل الاحتفاظ بالمرضى", category: "followup", dateBasis: "session_event", sourceTables: ["clinic_visit_sessions"], supportsDateFilter: true,
  businessDefinition: "نسبة المرضى العائدين وفق prior qualifying clinical activity + selected-period qualifying activity بين المرضى ذوي النشاط السريري المكتمل في الفترة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data: current, error: err1 } = await supabase.from("clinic_visit_sessions").select("patient_id").eq("tenant_id", tenantId).eq("session_status", "completed").is("deleted_at", null).gte("visit_closed_at", dateRange.startAt).lt("visit_closed_at", dateRange.endAtExclusive);
    if (err1) throw err1;
    const patients = [...new Set((current ?? []).map((r: any) => r.patient_id).filter(Boolean))];
    if (!patients.length) return 0;
    const { data: previous, error: err2 } = await supabase.from("clinic_visit_sessions").select("patient_id").eq("tenant_id", tenantId).eq("session_status", "completed").is("deleted_at", null).lt("visit_closed_at", dateRange.startAt).in("patient_id", patients as string[]);
    if (err2) throw err2;
    const priorPatients = new Set((previous ?? []).map((r: any) => r.patient_id).filter(Boolean));
    return (priorPatients.size / patients.length) * 100;
  }, formatter: kpiFormatter.percentage,
};

export const avgFollowupDelayKpi: KpiDefinition = {
  id: "followup.avg_delay", nameAr: "متوسط تأخير المتابعة", category: "followup", dateBasis: "followup_sent_at", sourceTables: ["retention_followups"], supportsDateFilter: true,
  businessDefinition: "متوسط التأخير غير السالب بالساعات بين scheduled_for و sent_at للمتابعات المرسلة داخل الفترة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { data, error } = await supabase.from("retention_followups").select("scheduled_for, sent_at").eq("tenant_id", tenantId).is("deleted_at", null).not("sent_at", "is", null).gte("sent_at", dateRange.startAt).lt("sent_at", dateRange.endAtExclusive);
    if (error) throw error;
    const rows = data ?? [];
    let total = 0; let count = 0;
    for (const row of rows as any[]) {
      const delayHours = (new Date(row.sent_at).getTime() - new Date(row.scheduled_for).getTime()) / 3600000;
      if (Number.isFinite(delayHours)) { total += Math.max(0, delayHours); count++; }
    }
    return count ? total / count : 0;
  }, formatter: async (v) => Math.round(v).toLocaleString("en-US", { numberingSystem: "latn" }),
};
