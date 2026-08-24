// src/features/followup/followup-scheduled-view.tsx
// PJ Stage 9 — scheduled follow-ups view

"use client";

import { updateFollowup } from "@/domain/followup/followup.queries";
import type { FollowupRecord } from "@/domain/followup/followup.types";
import { useI18n } from "@/core/i18n/I18nProvider";

interface Props { records: FollowupRecord[]; canUpdate: boolean; onStatusUpdate: (id: string, status: string) => void; isPending: boolean; }

export function FollowupScheduledView({ records, canUpdate, onStatusUpdate, isPending }: Props) {
  const { locale, followup: t } = useI18n();
  const scheduled = records.filter((record) => record.status === "open" || record.status === "in_progress").sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
  async function cancel(id: string) { const result = await updateFollowup({ followup_id: id, status: "cancelled" }); if (result.success) onStatusUpdate(id, "cancelled"); }
  const actionLabel = (action: FollowupRecord["action_type"]) => t.actions[action];
  return <div className="space-y-3" dir={locale === "ar" ? "rtl" : "ltr"}>{scheduled.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{t.noScheduled}</div> : scheduled.map((record) => <div key={record.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between"><div><div className="font-semibold">{record.patient_name ?? t.unknownPatient}</div><div className="text-sm text-muted-foreground">{actionLabel(record.action_type)} · {new Date(record.scheduled_for).toLocaleString(locale === "ar" ? "ar" : "en-US", { numberingSystem: "latn" })}</div>{record.reason && <div className="mt-1 text-sm">{record.reason}</div>}</div>{canUpdate && (record.status === "open" || record.status === "in_progress") && <button disabled={isPending} onClick={() => void cancel(record.id)} className="rounded-md border px-3 py-1.5 text-sm">{t.cancel}</button>}</div>)}</div>;
}
