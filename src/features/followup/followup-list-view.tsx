// src/features/followup/followup-list-view.tsx
// PJ Stage 9 — Follow-up operational list

"use client";

import { useState } from "react";
import { updateFollowup, completeFollowup } from "@/domain/followup/followup.queries";
import type { FollowupRecord, FollowupStatus } from "@/domain/followup/followup.types";

interface Props { records: FollowupRecord[]; canUpdate: boolean; onStatusUpdate: (id: string, status: string) => void; isPending: boolean; }
const statusLabel: Record<FollowupStatus, string> = { open: "مفتوحة", in_progress: "قيد التنفيذ", completed: "مكتملة", cancelled: "ملغاة", skipped: "متجاوزة" };
const actionLabel: Record<string, string> = { call: "اتصال", whatsapp: "WhatsApp", sms: "SMS", email: "بريد", appointment: "موعد", review: "مراجعة", general: "مهمة" };
function bucket(record: FollowupRecord) {
  if (record.status !== "open" && record.status !== "in_progress") return "closed";
  const now = new Date(); const due = new Date(record.scheduled_for);
  if (due.getTime() < now.getTime()) return "overdue";
  if (due.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

export function FollowupListView({ records, canUpdate, onStatusUpdate, isPending }: Props) {
  const [filter, setFilter] = useState("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [outcomeText, setOutcomeText] = useState("");
  const filtered = records.filter((record) => filter === "active" ? (record.status === "open" || record.status === "in_progress") : filter === "overdue" ? bucket(record) === "overdue" : filter === "today" ? bucket(record) === "today" : filter === "upcoming" ? bucket(record) === "upcoming" : true);

  async function setStatus(id: string, status: FollowupStatus) {
    setUpdatingId(id); const result = await updateFollowup({ followup_id: id, status }); if (result.success) onStatusUpdate(id, status); setUpdatingId(null);
  }
  async function saveResult(record: FollowupRecord) {
    if (!resultText.trim()) return; setUpdatingId(record.id);
    const result = await completeFollowup({ followup_id: record.id, result: resultText.trim(), outcome: outcomeText.trim() || null, next_action_at: null, next_action_type: null });
    if (result.success) { onStatusUpdate(record.id, "completed"); setResultId(null); setResultText(""); setOutcomeText(""); }
    setUpdatingId(null);
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted-foreground">عرض:</span>{[["active", "النشطة"], ["overdue", "متأخرة"], ["today", "اليوم"], ["upcoming", "قادمة"], ["all", "الكل"]].map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-sm ${filter === value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{label}</button>)}<span className="mr-auto text-sm text-muted-foreground">{filtered.length}</span></div>
    {filtered.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">لا توجد متابعات في هذا العرض.</div> : <div className="grid gap-3">{filtered.map((record) => <div key={record.id} className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div className="space-y-1"><div className="font-semibold">{record.patient_name ?? "مريض غير معروف"}</div><div className="text-sm text-muted-foreground">{record.patient_phone ?? ""}</div><div className="flex flex-wrap gap-2 text-sm"><span className="rounded-full border px-2 py-0.5">{actionLabel[record.action_type] ?? record.action_type}</span><span className="rounded-full border px-2 py-0.5">{statusLabel[record.status]}</span><span className="text-muted-foreground">{new Date(record.scheduled_for).toLocaleString("ar-JO")}</span></div>{record.reason && <div className="text-sm">{record.reason}</div>}{record.message_body && <div className="rounded-md bg-muted p-2 text-sm">{record.message_body}</div>}</div>
      {canUpdate && (record.status === "open" || record.status === "in_progress") && <div className="flex flex-wrap gap-2"><button disabled={updatingId === record.id || isPending} onClick={() => setStatus(record.id, "in_progress")} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">بدء العمل</button><button disabled={updatingId === record.id || isPending} onClick={() => setResultId(record.id)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50">تسجيل النتيجة</button><button disabled={updatingId === record.id || isPending} onClick={() => setStatus(record.id, "cancelled")} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">إلغاء</button></div>}</div>
      {resultId === record.id && <div className="rounded-md border bg-background p-3 space-y-3"><textarea value={resultText} onChange={(e) => setResultText(e.target.value)} rows={3} placeholder="ماذا حدث؟" className="w-full rounded-md border p-2 text-sm" /><input value={outcomeText} onChange={(e) => setOutcomeText(e.target.value)} placeholder="النتيجة / Outcome (اختياري)" className="h-9 w-full rounded-md border px-3 text-sm" /><div className="flex gap-2"><button disabled={!resultText.trim() || updatingId === record.id} onClick={() => saveResult(record)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">حفظ وإكمال</button><button onClick={() => setResultId(null)} className="rounded-md border px-3 py-1.5 text-sm">إلغاء</button></div></div>}
    </div>)}</div>}
  </div>;
}
