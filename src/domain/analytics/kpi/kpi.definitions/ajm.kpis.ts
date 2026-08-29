import type { KpiDefinition } from "../../analytics.types";

const count = async (supabase: any, table: string, tenantId: string, from: string, to: string, status?: string) => {
  let q = supabase.from(table).select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", `${from}T00:00:00.000Z`).lt("created_at", `${to}T00:00:00.000Z`);
  if (status) q = q.eq("status", status);
  const { count: value, error } = await q;
  if (error) throw error;
  return value ?? 0;
};

const formatter = (value: number) => String(value);

export const workforceEmployeesKpi: KpiDefinition = { id: "workforce.employees", nameAr: "الموظفون", category: "workforce", calculator: (s,t,r) => count(s as any,"workforce_employees",t,r.from,r.to), formatter };
export const workforceAttendanceKpi: KpiDefinition = { id: "workforce.attendance", nameAr: "سجلات الحضور", category: "workforce", calculator: (s,t,r) => count(s as any,"workforce_attendance",t,r.from,r.to), formatter };
export const communicationsMessagesKpi: KpiDefinition = { id: "communications.messages", nameAr: "الرسائل", category: "communications", calculator: (s,t,r) => count(s as any,"communication_messages",t,r.from,r.to), formatter };
export const communicationsRequestsKpi: KpiDefinition = { id: "communications.requests", nameAr: "طلبات الاتصالات", category: "communications", calculator: (s,t,r) => count(s as any,"communication_requests",t,r.from,r.to), formatter };
export const coordinationOpenWorkKpi: KpiDefinition = { id: "coordination.open_work", nameAr: "العمل المفتوح", category: "coordination", calculator: (s,t) => count(s as any,"operational_work_items",t,"1970-01-01","2999-12-31","open"), formatter };
export const coordinationCompletedWorkKpi: KpiDefinition = { id: "coordination.completed_work", nameAr: "العمل المكتمل", category: "coordination", calculator: (s,t,r) => count(s as any,"operational_work_items",t,r.from,r.to,"completed"), formatter };
