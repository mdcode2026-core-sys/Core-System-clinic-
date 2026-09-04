"use client";

import { useState } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { FollowupListView } from "./followup-list-view";
import { FollowupScheduledView } from "./followup-scheduled-view";
import { FollowupCreateForm } from "./followup-create-form";
import type { FollowupPatientOption, FollowupRecord } from "@/domain/followup/followup.types";

interface FollowupShellProps {
  initialList: FollowupRecord[];
  initialScheduled: FollowupRecord[];
  patients: FollowupPatientOption[];
  initialError: string | null;
  canCreate: boolean;
  canUpdate: boolean;
}

export function FollowupShell({ initialList, initialScheduled, patients, initialError, canCreate, canUpdate }: FollowupShellProps) {
  const { locale, admin: a, followup: t } = useI18n();
  const [activeTab, setActiveTab] = useState<"work" | "list" | "scheduled">("work");
  const [listData, setListData] = useState(initialList);
  const [scheduledData, setScheduledData] = useState(initialScheduled);
  const [showCreate, setShowCreate] = useState(false);
  const [now] = useState(() => Date.now());

  const active = listData.filter((f) => f.status === "open" || f.status === "in_progress");
  const overdue = active.filter((f) => new Date(f.scheduled_for).getTime() < now);
  const dueToday = active.filter((f) => {
    const d = new Date(f.scheduled_for);
    const n = new Date(now);
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate() && d.getTime() >= now;
  });
  const upcoming = active.filter((f) => new Date(f.scheduled_for).getTime() > now && !dueToday.includes(f));

  const copy = {
    create: t.create.title,
    createHint: t.create.description,
    closeCreate: t.cancel,
    workIntro: t.pageDescription,
    overdue: t.overdue,
    today: t.today,
    upcoming: t.upcoming,
    work: a.followup.todayWork,
    all: a.followup.all,
    scheduled: a.followup.scheduled,
  };

  const handleStatusUpdate = (updatedId: string, newStatus: string) => {
    const updater = (prev: FollowupRecord[]) => prev.map((f) => f.id === updatedId ? { ...f, status: newStatus as FollowupRecord["status"] } : f);
    setListData(updater);
    setScheduledData(updater);
  };

  const openWorkBucket = (bucket: "overdue" | "today" | "upcoming") => {
    setActiveTab("work");
    window.dispatchEvent(new CustomEvent("followup-work-filter", { detail: bucket }));
  };

  return (
    <div className="w-full space-y-5" dir={locale === "ar" ? "rtl" : "ltr"}>
      {initialError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{initialError}</div>}

      <section className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{copy.work}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{copy.workIntro}</p>
          </div>
          {canCreate && (
            <button type="button" onClick={() => setShowCreate((value) => !value)} aria-expanded={showCreate} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              {showCreate ? copy.closeCreate : copy.create}
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={() => openWorkBucket("overdue")} className="rounded-lg border p-4 text-start hover:bg-muted/50">
            <div className="text-sm text-muted-foreground">{copy.overdue}</div>
            <div className="mt-1 text-2xl font-bold">{overdue.length}</div>
          </button>
          <button type="button" onClick={() => openWorkBucket("today")} className="rounded-lg border p-4 text-start hover:bg-muted/50">
            <div className="text-sm text-muted-foreground">{copy.today}</div>
            <div className="mt-1 text-2xl font-bold">{dueToday.length}</div>
          </button>
          <button type="button" onClick={() => openWorkBucket("upcoming")} className="rounded-lg border p-4 text-start hover:bg-muted/50">
            <div className="text-sm text-muted-foreground">{copy.upcoming}</div>
            <div className="mt-1 text-2xl font-bold">{upcoming.length}</div>
          </button>
        </div>

        {showCreate && canCreate && (
          <div className="mt-4 border-t pt-4">
            <p className="mb-3 text-sm text-muted-foreground">{copy.createHint}</p>
            <FollowupCreateForm patients={patients} onCreated={() => window.location.reload()} />
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <button type="button" onClick={() => setActiveTab("work")} className={`rounded-md px-3 py-2 text-sm ${activeTab === "work" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{copy.work}</button>
        <button type="button" onClick={() => setActiveTab("list")} className={`rounded-md px-3 py-2 text-sm ${activeTab === "list" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{copy.all}</button>
        <button type="button" onClick={() => setActiveTab("scheduled")} className={`rounded-md px-3 py-2 text-sm ${activeTab === "scheduled" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{copy.scheduled}</button>
      </div>

      {activeTab === "work" && <FollowupListView records={active} canUpdate={canUpdate} onStatusUpdate={handleStatusUpdate} isPending={false} />}
      {activeTab === "list" && <FollowupListView records={listData} canUpdate={canUpdate} onStatusUpdate={handleStatusUpdate} isPending={false} />}
      {activeTab === "scheduled" && <FollowupScheduledView records={scheduledData} canUpdate={canUpdate} onStatusUpdate={handleStatusUpdate} isPending={false} />}
    </div>
  );
}
