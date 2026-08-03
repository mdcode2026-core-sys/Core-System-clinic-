// src/features/followup/followup-shell.tsx
// Package 3.1.9 — Follow-up Feature Shell
// Tabs: List View + Scheduled View. Status update only. No delivery automation.

"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [listData, setListData] = useState<FollowupRecord[]>(initialList);
  const [scheduledData, setScheduledData] = useState<FollowupRecord[]>(initialScheduled);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = (updatedId: string, newStatus: string) => {
    // Optimistic local update
    const updater = (prev: FollowupRecord[]) =>
      prev.map((f) => (f.id === updatedId ? { ...f, delivery_status: newStatus as any } : f));

    setListData(updater);
    setScheduledData(updater);
  };

  return (
    <Tabs defaultValue="list" className="w-full" dir="rtl">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="list">قائمة المتابعات</TabsTrigger>
        <TabsTrigger value="scheduled">مجدولة</TabsTrigger>
      </TabsList>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <TabsContent value="list" className="mt-4">
        <FollowupListView
          records={listData}
          canUpdate={canUpdate}
          onStatusUpdate={handleStatusUpdate}
          isPending={isPending}
        />
      </TabsContent>

      <TabsContent value="scheduled" className="mt-4">
        <FollowupScheduledView
          records={scheduledData}
          canUpdate={canUpdate}
          onStatusUpdate={handleStatusUpdate}
          isPending={isPending}
        />
      </TabsContent>
    </Tabs>
  );
}
