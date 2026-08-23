// src/features/followup/followup-create-form.tsx
// PJ Stage 9 — simple manual follow-up creation

"use client";

import { useState } from "react";
import { createFollowup } from "@/domain/followup/followup.queries";
import type { FollowupActionType, FollowupPatientOption, FollowupType } from "@/domain/followup/followup.types";

interface Props { patients: FollowupPatientOption[]; onCreated: () => void; }
const typeOptions: Array<[FollowupType, string]> = [["post_visit_24h", "بعد الزيارة — 24 ساعة"], ["post_visit_7d", "بعد الزيارة — 7 أيام"], ["reactivation_30d", "إعادة تفعيل — 30 يوم"], ["reactivation_60d", "إعادة تفعيل — 60 يوم"], ["reactivation_90d", "إعادة تفعيل — 90 يوم"], ["custom", "مخصص"]];
const actionOptions: Array<[FollowupActionType, string]> = [["call", "اتصال"], ["whatsapp", "WhatsApp"], ["appointment", "موعد"], ["review", "مراجعة"], ["general", "مهمة"]];

export function FollowupCreateForm({ patients, onCreated }: Props) {
  const [patientId, setPatientId] = useState(""); const [scheduledFor, setScheduledFor] = useState(""); const [followupType, setFollowupType] = useState<FollowupType>("custom"); const [actionType, setActionType] = useState<FollowupActionType>("general"); const [reason, setReason] = useState(""); const [messageBody, setMessageBody] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit() {
    setBusy(true); setError(null);
    const result = await createFollowup({ patient_id: patientId, scheduled_for: new Date(scheduledFor).toISOString(), followup_type: followupType, action_type: actionType, reason: reason || null, channel: actionType === "whatsapp" ? "whatsapp" : null, message_body: messageBody || null });
    if (!result.success) { setError(result.error); setBusy(false); return; }
    setPatientId(""); setScheduledFor(""); setFollowupType("custom"); setActionType("general"); setReason(""); setMessageBody(""); setBusy(false); onCreated();
  }
  return <div className="rounded-lg border bg-card p-4 space-y-4"><div><h2 className="font-semibold">إنشاء متابعة</h2><p className="text-sm text-muted-foreground">أنشئ مهمة متابعة يدوية للعيادة.</p></div>{error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="grid gap-3 md:grid-cols-2"><label className="space-y-1 text-sm"><span>المريض</span><select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3"><option value="">اختر المريض</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} — {patient.phone}</option>)}</select></label><label className="space-y-1 text-sm"><span>موعد المتابعة</span><input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3" /></label><label className="space-y-1 text-sm"><span>نوع المتابعة</span><select value={followupType} onChange={(e) => setFollowupType(e.target.value as FollowupType)} className="h-9 w-full rounded-md border bg-background px-3">{typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-1 text-sm"><span>الإجراء</span><select value={actionType} onChange={(e) => setActionType(e.target.value as FollowupActionType)} className="h-9 w-full rounded-md border bg-background px-3">{actionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="space-y-1 text-sm md:col-span-2"><span>السبب</span><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: الاطمئنان بعد العلاج" className="h-9 w-full rounded-md border bg-background px-3" /></label>{actionType === "whatsapp" && <label className="space-y-1 text-sm md:col-span-2"><span>الرسالة المقترحة</span><textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} rows={3} className="w-full rounded-md border bg-background p-3" placeholder="الرسالة التي سيراجعها الموظف ويرسلها يدوياً" /></label>}</div><button type="button" disabled={busy || !patientId || !scheduledFor} onClick={submit} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "جاري الحفظ..." : "حفظ المتابعة"}</button></div>;
}
