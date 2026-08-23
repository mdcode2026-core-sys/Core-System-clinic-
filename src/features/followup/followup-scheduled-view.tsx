// src/features/followup/followup-scheduled-view.tsx
// PJ Stage 9 — scheduled follow-ups view

"use client";

import { updateFollowup } from "@/domain/followup/followup.queries";
import type { FollowupRecord } from "@/domain/followup/followup.types";

interface Props { records: FollowupRecord[]; canUpdate: boolean; onStatusUpdate: (id: string, status: string) => void; isPending: boolean; }

export function FollowupScheduledView({ records, canUpdate, onStatusUpdate, isPending }: Props) {
  const scheduled = records.filter((record) => record.status === "open" || record.status === "in_progress").sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
  async function cancel(id: string) { const result = await updateFollowup({ followup_id: id, status: "cancelled" }); if (result.success) onStatusUpdate(id, "cancelled"); }
  return <div className="space-y-3">{scheduled.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">لا توجد متابعات مجدولة.</div> : scheduled.map((record) => <div key={record.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">{record.patient_name ?? "مريض غير معروف"}</div><div className="text-sm text-muted-foreground">{record.action_type} · {new Date(record.scheduled_for).toLocaleString("ar-JO")}</div>{record.reason && <div className="mt-1 text-sm">{record.reason}</div>}</div>{canUpdate && (record.status === "open" || record.status === "in_progress") && <button disabled={isPending} onClick={() => cancel(record.id)} className="rounded-md border px-3 py-1.5 text-sm">إلغاء</button>}</div>)}</div>;
}
