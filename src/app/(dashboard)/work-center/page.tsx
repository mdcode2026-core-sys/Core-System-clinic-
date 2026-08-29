import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { createWorkItem } from "@/domain/journey-coordination/work.actions";

export default async function WorkCenterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("work:read" as never)) redirect("/");
  const ar = (await cookies()).get("core-system-locale")?.value === "ar";
  const [{ data: work }, { data: users }] = await Promise.all([
    supabase.from("operational_work_items").select("id,kind,title,details,status,priority,due_at,assignee_clinic_user_id,patient_id,created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(50),
    supabase.from("clinic_users").select("id,full_name,email").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("full_name"),
  ]);
  async function addWork(formData: FormData): Promise<void> { "use server"; await createWorkItem({ kind: String(formData.get("kind") || "task") as "task" | "request" | "handoff" | "next_action" | "escalation", title: String(formData.get("title") || ""), details: String(formData.get("details") || "") || undefined, assigneeId: String(formData.get("assignee") || "") || null, priority: String(formData.get("priority") || "normal") as "low" | "normal" | "high" | "urgent" }); }
  return <div className="space-y-8">
    <header><h1 className="text-2xl font-bold">{ar ? "مركز العمل" : "Work Center"}</h1><p className="mt-1 text-sm text-muted-foreground">{ar ? "المهام والطلبات والتسليمات والإجراءات التالية في طبقة عمل عامة، مع بقاء ملكية الرحلات والمواعيد والموارد في نطاقاتها الأصلية." : "Tasks, requests, handoffs and next actions in one general work layer while journeys, appointments and resources retain their domain ownership."}</p></header>
    <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "إنشاء عمل" : "Create work"}</h2><form action={addWork} className="grid gap-2 md:grid-cols-4"><select name="kind" className="rounded border p-2"><option value="task">{ar ? "مهمة" : "Task"}</option><option value="request">{ar ? "طلب" : "Request"}</option><option value="handoff">{ar ? "تسليم" : "Handoff"}</option><option value="next_action">{ar ? "إجراء تالٍ" : "Next action"}</option><option value="escalation">{ar ? "تصعيد" : "Escalation"}</option></select><input name="title" required placeholder={ar ? "العنوان" : "Title"} className="rounded border p-2"/><select name="assignee" className="rounded border p-2"><option value="">{ar ? "غير معين" : "Unassigned"}</option>{(users ?? []).map((u:any)=><option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}</select><select name="priority" className="rounded border p-2"><option value="normal">{ar ? "عادي" : "Normal"}</option><option value="low">{ar ? "منخفض" : "Low"}</option><option value="high">{ar ? "مرتفع" : "High"}</option><option value="urgent">{ar ? "عاجل" : "Urgent"}</option></select><textarea name="details" rows={2} placeholder={ar ? "التفاصيل" : "Details"} className="rounded border p-2 md:col-span-3"/><button className="rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "إنشاء" : "Create"}</button></form></section>
    <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "العمل المفتوح" : "Open work"}</h2><div className="divide-y">{(work ?? []).map((w:any)=><div key={w.id} className="grid gap-2 py-3 md:grid-cols-[1fr_auto_auto] md:items-center"><div><div className="font-medium">{w.title}</div><div className="text-sm text-muted-foreground">{w.kind} · {w.status}{w.details ? ` · ${w.details}` : ""}</div></div><span className="text-sm text-muted-foreground">{w.priority}</span><span className="text-sm text-muted-foreground">{w.due_at ? new Date(w.due_at).toLocaleDateString() : (ar ? "بدون موعد" : "No due date")}</span></div>)}{!(work ?? []).length && <p className="text-sm text-muted-foreground">{ar ? "لا يوجد عمل مسجل بعد." : "No work recorded yet."}</p>}</div></section>
  </div>;
}
