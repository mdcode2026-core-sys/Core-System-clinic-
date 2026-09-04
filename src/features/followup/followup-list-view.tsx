// src/features/followup/followup-list-view.tsx
// PJ Stage 9 — Follow-up operational list

"use client";

import { useEffect, useState } from "react";
import { updateFollowup, completeFollowup } from "@/domain/followup/followup.queries";
import type { FollowupRecord, FollowupStatus } from "@/domain/followup/followup.types";
import { useI18n } from "@/core/i18n/I18nProvider";

interface Props { records: FollowupRecord[]; canUpdate: boolean; onStatusUpdate: (id: string, status: string) => void; isPending: boolean; }
function bucket(record: FollowupRecord) {
  if (record.status !== "open" && record.status !== "in_progress") return "closed";
  const now = new Date();
  const due = new Date(record.scheduled_for);
  if (due.getTime() < now.getTime()) return "overdue";
  if (due.toDateString() === now.toDateString()) return "today";
  return "upcoming";
}

export function FollowupListView({ records, canUpdate, onStatusUpdate, isPending }: Props) {
  const { locale, followup: t } = useI18n();
  const [filter, setFilter] = useState("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const [outcomeText, setOutcomeText] = useState("");
  const [nextActionType, setNextActionType] = useState("none");
  const [nextActionAt, setNextActionAt] = useState("");

  useEffect(() => {
    const onWorkFilter = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (["overdue", "today", "upcoming"].includes(value)) setFilter(value);
    };
    window.addEventListener("followup-work-filter", onWorkFilter);
    return () => window.removeEventListener("followup-work-filter", onWorkFilter);
  }, []);

  const filtered = records.filter((record) =>
    filter === "active" ? (record.status === "open" || record.status === "in_progress") :
    filter === "overdue" ? bucket(record) === "overdue" :
    filter === "today" ? bucket(record) === "today" :
    filter === "upcoming" ? bucket(record) === "upcoming" : true
  );

  async function setStatus(id: string, status: FollowupStatus) {
    setUpdatingId(id);
    const result = await updateFollowup({ followup_id: id, status });
    if (result.success) onStatusUpdate(id, status);
    setUpdatingId(null);
  }

  function openResult(record: FollowupRecord) {
    setResultId(record.id);
    setResultText("");
    setOutcomeText("");
    setNextActionType("none");
    setNextActionAt("");
  }

  async function saveResult(record: FollowupRecord) {
    if (!resultText.trim()) return;
    if (nextActionType !== "none" && !nextActionAt) return;
    setUpdatingId(record.id);
    const result = await completeFollowup({
      followup_id: record.id,
      result: resultText.trim(),
      outcome: outcomeText.trim() || null,
      next_action_at: nextActionType === "none" ? null : new Date(nextActionAt).toISOString(),
      next_action_type: nextActionType === "none" ? null : nextActionType,
    });
    if (result.success) {
      onStatusUpdate(record.id, "completed");
      setResultId(null);
      setResultText("");
      setOutcomeText("");
      setNextActionType("none");
      setNextActionAt("");
    }
    setUpdatingId(null);
  }

  const actionLabel = (action: FollowupRecord["action_type"]) => t.actions[action];
  const nextCopy = locale === "ar"
    ? { title: "الخطوة التالية", none: "لا توجد خطوة أخرى", followup: "متابعة مرة أخرى", date: "موعد الخطوة التالية" }
    : { title: "Next step", none: "No further action", followup: "Follow up again", date: "Next step date" };

  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{t.view}</span>
      {[["active", t.active], ["overdue", t.overdue], ["today", t.today], ["upcoming", t.upcoming], ["all", t.all]].map(([value, label]) =>
        <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-sm ${filter === value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{label}</button>
      )}
      <span className="ms-auto text-sm text-muted-foreground">{filtered.length.toLocaleString("en-US", { numberingSystem: "latn" })}</span>
    </div>

    {filtered.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">{t.noInView}</div> :
      <div className="grid gap-3">
        {filtered.map((record) => <div key={record.id} className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="font-semibold">{record.patient_name ?? t.unknownPatient}</div>
              {record.patient_phone && <div className="text-sm text-muted-foreground">{record.patient_phone}</div>}
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border px-2 py-0.5">{actionLabel(record.action_type)}</span>
                <span className="rounded-full border px-2 py-0.5">{t.status[record.status]}</span>
                <span className="text-muted-foreground">{new Date(record.scheduled_for).toLocaleString(locale === "ar" ? "ar" : "en-US", { numberingSystem: "latn" })}</span>
              </div>
              {record.reason && <div className="text-sm">{record.reason}</div>}
              {record.message_body && <div className="rounded-md bg-muted p-2 text-sm">{record.message_body}</div>}
              {record.status === "completed" && record.next_action_at && <div className="text-sm text-muted-foreground">{nextCopy.title}: {new Date(record.next_action_at).toLocaleString(locale === "ar" ? "ar" : "en-US", { numberingSystem: "latn" })}</div>}
            </div>

            {canUpdate && (record.status === "open" || record.status === "in_progress") && <div className="flex shrink-0 flex-wrap gap-2">
              {record.status === "open" && <button type="button" disabled={updatingId === record.id || isPending} onClick={() => void setStatus(record.id, "in_progress")} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">{t.start}</button>}
              <button type="button" disabled={updatingId === record.id || isPending} onClick={() => openResult(record)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50">{t.recordResult}</button>
              <button type="button" disabled={updatingId === record.id || isPending} onClick={() => void setStatus(record.id, "cancelled")} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">{t.cancel}</button>
            </div>}
          </div>

          {resultId === record.id && <div className="space-y-3 rounded-md border bg-background p-3">
            <textarea value={resultText} onChange={(e) => setResultText(e.target.value)} rows={3} placeholder={t.whatHappened} className="w-full rounded-md border p-2 text-sm" />
            <input value={outcomeText} onChange={(e) => setOutcomeText(e.target.value)} placeholder={t.outcome} className="h-9 w-full rounded-md border px-3 text-sm" />
            <div className="grid gap-2 sm:grid-cols-2">
              <select value={nextActionType} onChange={(e) => setNextActionType(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm" aria-label={nextCopy.title}>
                <option value="none">{nextCopy.none}</option>
                <option value="followup">{nextCopy.followup}</option>
              </select>
              {nextActionType !== "none" && <input type="datetime-local" value={nextActionAt} onChange={(e) => setNextActionAt(e.target.value)} aria-label={nextCopy.date} className="h-9 rounded-md border px-3 text-sm" />}
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={!resultText.trim() || (nextActionType !== "none" && !nextActionAt) || updatingId === record.id} onClick={() => void saveResult(record)} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50">{t.saveComplete}</button>
              <button type="button" onClick={() => setResultId(null)} className="rounded-md border px-3 py-1.5 text-sm">{t.cancel}</button>
            </div>
          </div>}
        </div>)}
      </div>}
  </div>;
}
