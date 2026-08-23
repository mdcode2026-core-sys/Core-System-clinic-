// src/features/followup/followup-shell.tsx
// PJ Stage 9 — Follow-up Work Management shell

"use client";

import { useState } from "react";
import { FollowupListView } from "./followup-list-view";
import { FollowupScheduledView } from "./followup-scheduled-view";
import { FollowupCreateForm } from "./followup-create-form";
import type { FollowupPatientOption, FollowupRecord } from "@/domain/followup/followup.types";

interface FollowupShellProps { initialList: FollowupRecord[]; initialScheduled: FollowupRecord[]; patients: FollowupPatientOption[]; initialError: string | null; canCreate: boolean; canUpdate: boolean; }

export function FollowupShell({ initialList, initialScheduled, patients, initialError, canCreate, canUpdate }: FollowupShellProps) {
  const [activeTab, setActiveTab] = useState<"work" | "list" | "scheduled">("work");
  const [listData, setListData] = useState(initialList);
  const [scheduledData, setScheduledData] = useState(initialScheduled);
  const [error] = useState<string | null>(initialError);
  const handleStatusUpdate = (updatedId: string, newStatus: string) => {
    const updater = (prev: FollowupRecord[]) => prev.map((f) => f.id === updatedId ? { ...f, status: newStatus as FollowupRecord["status"] } : f);
    setListData(updater); setScheduledData(updater);
  };
  const active = listData.filter((f) => f.status === "open" || f.status === "in_progress");
  const now = Date.now();
  const overdue = active.filter((f) => new Date(f.scheduled_for).getTime() < now);
  const dueToday = active.filter((f) => { const d = new Date(f.scheduled_for); const n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate() && d.getTime() >= now; });
  const upcoming = active.filter((f) => new Date(f.scheduled_for).getTime() > now && !dueToday.includes(f));
  return <div className="w-full space-y-5" dir="rtl">
    {canCreate && <FollowupCreateForm patients={patients} onCreated={() => window.location.reload()} />}
    <div className="grid gap-3 sm:grid-cols-3"><button onClick={() => setActiveTab("work")} className="rounded-lg border bg-card p-4 text-right"><div className="text-sm text-muted-foreground">متابعات متأخرة</div><div className="mt-1 text-2xl font-bold">{overdue.length}</div></button><button onClick={() => setActiveTab("work")} className="rounded-lg border bg-card p-4 text-right"><div className="text-sm text-muted-foreground">مستحقة اليوم</div><div className="mt-1 text-2xl font-bold">{dueToday.length}</div></button><button onClick={() => setActiveTab("work")} className="rounded-lg border bg-card p-4 text-right"><div className="text-sm text-muted-foreground">قادمة</div><div className="mt-1 text-2xl font-bold">{upcoming.length}</div></button></div>
    <div className="flex flex-wrap gap-2 border-b border-border pb-2"><button onClick={() => setActiveTab("work")} className={`rounded-md px-3 py-2 text-sm ${activeTab === "work" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>عمل اليوم</button><button onClick={() => setActiveTab("list")} className={`rounded-md px-3 py-2 text-sm ${activeTab === "list" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>كل المتابعات</button><button onClick={() => setActiveTab("scheduled")} className={`rounded-md px-3 py-2 text-sm ${activeTab === "scheduled" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>مجدولة</button></div>
    {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {activeTab === "work" && <FollowupListView records={active} canUpdate={canUpdate} onStatusUpdate={handleStatusUpdate} isPending={false} />}
    {activeTab === "list" && <FollowupListView records={listData} canUpdate={canUpdate} onStatusUpdate={handleStatusUpdate} isPending={false} />}
    {activeTab === "scheduled" && <FollowupScheduledView records={scheduledData} canUpdate={canUpdate} onStatusUpdate={handleStatusUpdate} isPending={false} />}
  </div>;
}
