import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { createCommunicationRequest, createConversation, sendInternalMessage, updateCommunicationRequest } from "@/domain/communications/communications.actions";

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<{ patientId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("communications:read" as never)) redirect("/");
  const ar = (await cookies()).get("core-system-locale")?.value === "ar";
  const params = await searchParams;
  const patientId = params.patientId?.trim() || null;

  let conversationsQuery = supabase.from("communication_conversations").select("id,subject,kind,status,created_at,clinic_patient_id,patient:clinic_patients(first_name,last_name)").eq("tenant_id", tenantId).order("updated_at", { ascending: false }).limit(30);
  let requestsQuery = supabase.from("communication_requests").select("id,title,priority,status,due_at,created_at,clinic_patient_id,patient:clinic_patients(first_name,last_name)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(30);
  if (patientId) {
    conversationsQuery = conversationsQuery.eq("clinic_patient_id", patientId);
    requestsQuery = requestsQuery.eq("clinic_patient_id", patientId);
  }

  const patientScope = patientId
    ? supabase.from("clinic_patients").select("id,first_name,last_name,phone_primary,preferred_channel").eq("tenant_id", tenantId).eq("id", patientId).is("deleted_at", null).maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const [{ data: conversations }, { data: requests }, { data: users }, { data: patients }, { data: messages }, { data: contextPatient }] = await Promise.all([
    conversationsQuery,
    requestsQuery,
    supabase.from("clinic_users").select("id,full_name,email").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("full_name"),
    supabase.from("clinic_patients").select("id,first_name,last_name,phone_primary,preferred_channel").eq("tenant_id", tenantId).is("deleted_at", null).order("first_name").limit(200),
    supabase.from("communication_messages").select("id,conversation_id,body,message_kind,created_at,sender:clinic_users(full_name,email)").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(50),
    patientScope,
  ]);

  async function addConversation(fd: FormData) {
    "use server";
    await createConversation({ subject: String(fd.get("subject") || ""), recipientUserId: String(fd.get("recipient") || "") || undefined, clinicPatientId: String(fd.get("patient") || "") || undefined });
  }
  async function addRequest(fd: FormData) {
    "use server";
    await createCommunicationRequest({ title: String(fd.get("title") || ""), details: String(fd.get("details") || "") || undefined, assigneeUserId: String(fd.get("assignee") || "") || null, clinicPatientId: String(fd.get("patient") || "") || null, priority: String(fd.get("priority") || "normal") as any });
  }
  async function addMessage(fd: FormData) {
    "use server";
    await sendInternalMessage({ conversationId: String(fd.get("conversation") || ""), body: String(fd.get("body") || "") });
  }
  async function changeRequest(fd: FormData) {
    "use server";
    await updateCommunicationRequest({ id: String(fd.get("id")), status: String(fd.get("status")) as any, outcome: String(fd.get("outcome") || "") || null });
  }

  const patientRows = patients ?? [];
  const convRows = conversations ?? [];
  const contextName = contextPatient ? `${contextPatient.first_name} ${contextPatient.last_name}`.trim() : null;

  return <div className="space-y-8" dir={ar ? "rtl" : "ltr"}>
    <header><h1 className="text-2xl font-bold">{ar ? "الاتصالات والتنسيق" : "Communications & Coordination"}</h1><p className="mt-1 text-sm text-muted-foreground">{ar ? "سجل اتصالات المرضى والرسائل الداخلية والطلبات التشغيلية مع إبقاء ملكية المواعيد والرحلة والموارد في نطاقاتها الأصلية." : "Patient communication, internal messages and operational requests while appointments, journey and resources retain their domain ownership."}</p>{patientId && <div className="mt-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm">{contextName ? `${ar ? "سياق المريض" : "Patient context"}: ${contextName}` : (ar ? "سياق المريض المحدد غير موجود أو غير متاح." : "The selected patient context is unavailable.")}</div>}</header>
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "اتصال جديد" : "New communication"}</h2><form action={addConversation} className="space-y-2"><select name="kind" className="w-full rounded border p-2"><option value="patient">Patient</option><option value="internal">Internal</option></select><select name="patient" defaultValue={patientId ?? ""} className="w-full rounded border p-2"><option value="">Patient (optional for internal)</option>{patientRows.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} · {p.phone_primary || ""}</option>)}</select><input name="subject" placeholder={ar ? "الموضوع" : "Subject"} className="w-full rounded border p-2"/><select name="recipient" className="w-full rounded border p-2"><option value="">Linked staff member</option>{(users ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}</select><button className="w-full rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "بدء الاتصال" : "Start communication"}</button></form></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "رسالة / سجل اتصال" : "Message / contact record"}</h2><form action={addMessage} className="space-y-2"><select name="conversation" required className="w-full rounded border p-2"><option value="">Conversation</option>{convRows.map((c: any) => <option key={c.id} value={c.id}>{c.subject || "No subject"}{c.patient ? ` · ${c.patient.first_name} ${c.patient.last_name}` : ""}</option>)}</select><textarea name="body" required rows={5} placeholder={ar ? "اكتب الاتصال الهاتفي أو الرسالة أو الملاحظة" : "Record the phone call, message or note"} className="w-full rounded border p-2"/><button className="w-full rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "تسجيل" : "Record"}</button></form></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "طلب تشغيلي" : "Operational request"}</h2><form action={addRequest} className="space-y-2"><input name="title" required placeholder={ar ? "عنوان الطلب" : "Request title"} className="w-full rounded border p-2"/><textarea name="details" rows={3} placeholder={ar ? "التفاصيل" : "Details"} className="w-full rounded border p-2"/><select name="patient" defaultValue={patientId ?? ""} className="w-full rounded border p-2"><option value="">Related patient</option>{patientRows.map((p: any) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}</select><select name="assignee" className="w-full rounded border p-2"><option value="">Assign later</option>{(users ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}</select><select name="priority" className="w-full rounded border p-2"><option value="normal">Normal</option><option value="low">Low</option><option value="high">High</option><option value="urgent">Urgent</option></select><button className="w-full rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "إنشاء الطلب" : "Create request"}</button></form></section>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "سجل الاتصالات والرسائل" : "Communication history"}</h2><div className="divide-y">{convRows.map((c: any) => <div key={c.id} className="py-3"><div className="flex justify-between gap-3"><span className="font-medium">{c.subject || "No subject"}{c.patient && <span className="text-sm text-muted-foreground"> · {c.patient.first_name} {c.patient.last_name}</span>}</span><span className="text-sm text-muted-foreground">{c.kind} · {c.status}</span></div>{(messages ?? []).filter((m: any) => m.conversation_id === c.id).slice(0, 3).map((m: any) => <p key={m.id} className="mt-1 text-sm text-muted-foreground">{m.body}</p>)}</div>)}{!convRows.length && <p className="text-sm text-muted-foreground">{patientId ? (ar ? "لا توجد اتصالات لهذا المريض." : "No communications for this patient.") : (ar ? "لا توجد اتصالات بعد." : "No communications yet.")}</p>}</div></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "الطلبات التشغيلية" : "Operational requests"}</h2><div className="space-y-3">{(requests ?? []).map((r: any) => <div key={r.id} className="rounded-lg border p-3"><div className="flex justify-between gap-3"><span>{r.title}{r.patient && <span className="text-sm text-muted-foreground"> · {r.patient.first_name} {r.patient.last_name}</span>}</span><span className="text-sm text-muted-foreground">{r.priority}</span></div><form action={changeRequest} className="mt-2 flex gap-2"><input type="hidden" name="id" value={r.id}/><select name="status" defaultValue={r.status} className="flex-1 rounded border p-2 text-sm"><option value="accepted">Accepted</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select><input name="outcome" placeholder="Outcome" className="flex-1 rounded border p-2 text-sm"/><button className="rounded border px-3 text-sm">Update</button></form></div>)}{!(requests ?? []).length && <p className="text-sm text-muted-foreground">{patientId ? (ar ? "لا توجد طلبات لهذا المريض." : "No requests for this patient.") : (ar ? "لا توجد طلبات بعد." : "No requests yet.")}</p>}</div></section>
    </div>
  </div>;
}
