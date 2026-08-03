// src/features/followup/followup-shell.tsx
// Package 3.1.9 — Follow-up Feature Shell
// Two views: List + Scheduled. Status update only. No delivery automation.
// Note: Tabs component not available in shared/ui; using plain buttons.

"use client";

import { useState } from "react";
import { FollowupListView } from "./followup-list-view";
import { FollowupScheduledView } from "./followup-scheduled-view";
import type { FollowupRecord } from "@/domain/followup/followup.types";

interface FollowupShellProps {
  initialList: FollowupRecord[];
  initialScheduled: FollowupRecord[];
  initialError: string | null;
  canUpdate: boolean;
}

export function FollowupShell({
  initialList,
  initialScheduled,
  initialError,
  canUpdate,
}: FollowupShellProps) {
  const [activeTab, setActiveTab] = useState<"list" | "scheduled">("list");
  const [listData, setListData] = useState<FollowupRecord[]>(initialList);
  const [scheduledData, setScheduledData] = useState<FollowupRecord[]>(initialScheduled);
  const [error, setError] = useState<string | null>(initialError);

  const handleStatusUpdate = (updatedId: string, newStatus: string) => {
    const updater = (prev: FollowupRecord[]) =>
      prev.map((f) => (f.id === updatedId ? { ...f, delivery_status: newStatus as any } : f));

    setListData(updater);
    setScheduledData(updater);
  };

  return (
    <div className="w-full" dir="rtl">
      {/* Tab buttons — plain HTML since Tabs component not in shared/ui */}
      <div className="flex border-b border-border mb-4">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "list"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          قائمة المتابعات
        </button>
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "scheduled"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          مجدولة
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {activeTab === "list" && (
        <FollowupListView
          records={listData}
          canUpdate={canUpdate}
          onStatusUpdate={handleStatusUpdate}
          isPending={false}
        />
      )}

      {activeTab === "scheduled" && (
        <FollowupScheduledView
          records={scheduledData}
          canUpdate={canUpdate}
          onStatusUpdate={handleStatusUpdate}
          isPending={false}
        />
      )}
    </div>
  );
}
