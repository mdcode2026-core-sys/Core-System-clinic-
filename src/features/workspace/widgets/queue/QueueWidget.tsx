"use client";

import { useState, useEffect } from "react";
import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useQueueStats } from "@/domain/queue/queue.queries";
import { createClient } from "@/infrastructure/supabase/client";
import { Clock, AlertCircle, Loader2 } from "lucide-react";

export function QueueWidget(_props: WidgetComponentProps) {
  const [user, setUser] = useState<{ user_metadata?: { tenant_id?: string } } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const tenantId = user?.user_metadata?.tenant_id;

  const { data: stats, isLoading, error } = useQueueStats(tenantId ?? "");

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-red-600">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error.message || "فشل تحميل بيانات الدور"}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-gray-400">
        <Clock className="h-8 w-8" />
        <p className="text-sm">لا توجد بيانات</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.total_waiting ?? 0}</p>
          <p className="text-xs text-blue-600">في الانتظار</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.total_in_progress ?? 0}</p>
          <p className="text-xs text-green-600">قيد التنفيذ</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">{stats.total_completed ?? 0}</p>
          <p className="text-xs text-purple-600">مكتمل</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <p className="text-2xl font-bold text-orange-700">{stats.total_noshow ?? 0}</p>
          <p className="text-xs text-orange-600">لم يحضر</p>
        </div>
      </div>

      {stats.avg_wait_minutes !== undefined && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-xs text-gray-600">متوسط وقت الانتظار</span>
          <span className="text-sm font-semibold text-gray-800">
            {stats.avg_wait_minutes} دقيقة
          </span>
        </div>
      )}
    </div>
  );
}

export default QueueWidget;
