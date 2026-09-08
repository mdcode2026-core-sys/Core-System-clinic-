import type { KpiDefinition } from "../../analytics.types";

const formatter = (value: number) => String(value);

export const workforceEmployeesKpi: KpiDefinition = {
  id: "workforce.employees", nameAr: "الموظفون النشطون", category: "workforce",
  dateBasis: "current_state", sourceTables: ["workforce_employees"], supportsDateFilter: false,
  businessDefinition: "عدد الموظفين ذوي الحالة active حالياً ضمن المستأجر.",
  calculator: async (supabase, tenantId) => {
    const { count, error } = await supabase.from("workforce_employees").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "active");
    if (error) throw error;
    return count ?? 0;
  }, formatter,
};

export const workforceAttendanceKpi: KpiDefinition = {
  id: "workforce.attendance", nameAr: "سجلات الحضور", category: "workforce",
  dateBasis: "attendance_date", sourceTables: ["workforce_attendance"], supportsDateFilter: true,
  businessDefinition: "عدد سجلات الحضور حسب attendance_date داخل الفترة المختارة.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("workforce_attendance").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("attendance_date", dateRange.from).lte("attendance_date", dateRange.to);
    if (error) throw error;
    return count ?? 0;
  }, formatter,
};

export const communicationsMessagesKpi: KpiDefinition = {
  id: "communications.messages", nameAr: "الرسائل", category: "communications",
  dateBasis: "created_at", sourceTables: ["communication_messages"], supportsDateFilter: true,
  businessDefinition: "عدد الرسائل التي أنشئت خلال الفترة المختارة حسب created_at.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("communication_messages").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive);
    if (error) throw error;
    return count ?? 0;
  }, formatter,
};

export const communicationsRequestsKpi: KpiDefinition = {
  id: "communications.requests", nameAr: "طلبات الاتصالات", category: "communications",
  dateBasis: "created_at", sourceTables: ["communication_requests"], supportsDateFilter: true,
  businessDefinition: "عدد طلبات الاتصالات المنشأة خلال الفترة المختارة حسب created_at.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("communication_requests").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive);
    if (error) throw error;
    return count ?? 0;
  }, formatter,
};

export const coordinationOpenWorkKpi: KpiDefinition = {
  id: "coordination.open_work", nameAr: "العمل المفتوح", category: "coordination",
  dateBasis: "current_state", sourceTables: ["operational_work_items"], supportsDateFilter: false,
  businessDefinition: "عدد عناصر العمل التي حالتها open حالياً ضمن المستأجر.",
  calculator: async (supabase, tenantId) => {
    const { count, error } = await supabase.from("operational_work_items").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "open");
    if (error) throw error;
    return count ?? 0;
  }, formatter,
};

export const coordinationCompletedWorkKpi: KpiDefinition = {
  id: "coordination.completed_work", nameAr: "العمل المكتمل", category: "coordination",
  dateBasis: "created_at", sourceTables: ["operational_work_items"], supportsDateFilter: true,
  businessDefinition: "عدد عناصر العمل التي اكتملت خلال الفترة، مقاسة بتاريخ إنشاء عنصر العمل باعتباره أساس الفترة لهذا المؤشر الحالي.",
  calculator: async (supabase, tenantId, dateRange) => {
    const { count, error } = await supabase.from("operational_work_items").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "completed").gte("created_at", dateRange.startAt).lt("created_at", dateRange.endAtExclusive);
    if (error) throw error;
    return count ?? 0;
  }, formatter,
};
