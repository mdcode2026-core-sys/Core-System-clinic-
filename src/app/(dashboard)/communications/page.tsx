import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { createCommunicationRequest, createConversation, sendInternalMessage } from "@/domain/communications/communications.actions";

export default async function CommunicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("communications:read" as never)) redirect("/");
  const ar = (await cookies()).get("core-system-locale")?.value === "ar";
  const [{ data: conversations }, { data: requests }, { data: users }] = await Promise.all([
    supabase.from("communication_conversations").select("id,subject,kind,status,created_at,clinic_patient_id").eq("tenant_id", tenantId).order("updated_at", { ascending: false }).limit(20),
    supabase.from("communication_requests").select("id,title,priority,status,due_at,created_at").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(20),
    supabase.from("clinic_users").select("id,full_name,email").eq("tenant_id", tenantId).eq("is_active", true).is("deleted_at", null).order("full_name"),
  ]);

  async function addConversation(formData: FormData): Promise<void> { "use server"; await createConversation({ subject: String(formData.get("subject") || ""), recipientUserId: String(formData.get("recipient") || "") || undefined }); }
  async function addRequest(formData: FormData): Promise<void> { "use server"; await createCommunicationRequest({ title: String(formData.get("title") || ""), details: String(formData.get("details") || "") || undefined, assigneeUserId: String(formData.get("assignee") || "") || null, priority: (String(formData.get("priority") || "normal") as "low" | "normal" | "high" | "urgent") }); }
  async function addMessage(formData: FormData): Promise<void> { "use server"; await sendInternalMessage({ conversationId: String(formData.get("conversation") || ""), body: String(formData.get("body") || "") }); }

  return <div className="space-y-8">
    <header><h1 className="text-2xl font-bold">{ar ? "الاتصالات" : "Communications"}</h1><p className="mt-1 text-sm text-muted-foreground">{ar ? "رسائل داخلية واتصالات مرتبطة بالسياق وطلبات تشغيلية دون إنشاء محرك مهام موازٍ." : "Internal communication, contextual messages and operational requests without creating a second task engine."}</p></header>
    <div className="grid gap-6 xl:grid-cols-3">
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "محادثة جديدة" : "New conversation"}</h2><form action={addConversation} className="space-y-2"><input name="subject" placeholder={ar ? "الموضوع" : "Subject"} className="w-full rounded border p-2"/><select name="recipient" className="w-full rounded border p-2"><option value="">{ar ? "المستلم" : "Recipient"}</option>{(users ?? []).map((u:any)=><option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}</select><button className="w-full rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "بدء المحادثة" : "Start conversation"}</button></form></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "رسالة" : "Message"}</h2><form action={addMessage} className="space-y-2"><select name="conversation" required className="w-full rounded border p-2"><option value="">{ar ? "المحادثة" : "Conversation"}</option>{(conversations ?? []).map((c:any)=><option key={c.id} value={c.id}>{c.subject || (ar ? "بدون موضوع" : "No subject")}</option>)}</select><textarea name="body" required rows={4} placeholder={ar ? "اكتب الرسالة" : "Write a message"} className="w-full rounded border p-2"/><button className="w-full rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "إرسال" : "Send"}</button></form></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "طلب تشغيلي" : "Operational request"}</h2><form action={addRequest} className="space-y-2"><input name="title" required placeholder={ar ? "عنوان الطلب" : "Request title"} className="w-full rounded border p-2"/><textarea name="details" rows={3} placeholder={ar ? "التفاصيل" : "Details"} className="w-full rounded border p-2"/><select name="assignee" className="w-full rounded border p-2"><option value="">{ar ? "تعيين لاحقًا" : "Assign later"}</option>{(users ?? []).map((u:any)=><option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}</select><select name="priority" className="w-full rounded border p-2"><option value="normal">{ar ? "عادي" : "Normal"}</option><option value="low">{ar ? "منخفض" : "Low"}</option><option value="high">{ar ? "مرتفع" : "High"}</option><option value="urgent">{ar ? "عاجل" : "Urgent"}</option></select><button className="w-full rounded bg-primary px-4 py-2 text-primary-foreground">{ar ? "إنشاء الطلب" : "Create request"}</button></form></section>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "المحادثات الأخيرة" : "Recent conversations"}</h2><div className="divide-y">{(conversations ?? []).map((c:any)=><div key={c.id} className="flex justify-between gap-3 py-3"><span>{c.subject || (ar ? "بدون موضوع" : "No subject")}</span><span className="text-sm text-muted-foreground">{c.kind} · {c.status}</span></div>)}{!(conversations ?? []).length && <p className="text-sm text-muted-foreground">{ar ? "لا توجد محادثات بعد." : "No conversations yet."}</p>}</div></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-lg font-semibold">{ar ? "الطلبات التشغيلية" : "Operational requests"}</h2><div className="divide-y">{(requests ?? []).map((r:any)=><div key={r.id} className="flex justify-between gap-3 py-3"><span>{r.title}</span><span className="text-sm text-muted-foreground">{r.priority} · {r.status}</span></div>)}{!(requests ?? []).length && <p className="text-sm text-muted-foreground">{ar ? "لا توجد طلبات بعد." : "No requests yet."}</p>}</div></section>
    </div>
  </div>;
}
