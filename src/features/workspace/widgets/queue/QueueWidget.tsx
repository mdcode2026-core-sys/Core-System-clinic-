"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useQueueStats } from "@/domain/queue/queue.hooks";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Clock, AlertCircle, Loader2 } from "lucide-react";

export function QueueWidget(_props: WidgetComponentProps) {
  const { tenantId } = useTenantId();
  const { locale, queue: t } = useI18n();
  const { data: stats, isLoading, error } = useQueueStats(tenantId ?? "");
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (isLoading) return <div className="flex h-32 items-center justify-center" dir={direction}><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>;
  if (error) return <div className="flex flex-col items-center gap-2 py-4 text-red-600" dir={direction}><AlertCircle className="h-8 w-8" /><p className="text-sm">{t.actionFailed}</p></div>;
  if (!stats) return <div className="flex flex-col items-center gap-2 py-4 text-gray-400" dir={direction}><Clock className="h-8 w-8" /><p className="text-sm">{t.noPatients}</p></div>;

  return <div className="min-w-0 space-y-3" dir={direction}>
    <div className="grid min-w-0 grid-cols-2 gap-3">
      <div className="min-w-0 overflow-hidden rounded-lg bg-blue-50 p-3 text-center"><p className="break-words text-2xl font-bold text-blue-700">{stats.total_waiting ?? 0}</p><p className="break-words text-xs text-blue-600">{t.totalWaiting}</p></div>
      <div className="min-w-0 overflow-hidden rounded-lg bg-green-50 p-3 text-center"><p className="break-words text-2xl font-bold text-green-700">{stats.total_in_consultation ?? 0}</p><p className="break-words text-xs text-green-600">{t.totalConsultation}</p></div>
      <div className="min-w-0 overflow-hidden rounded-lg bg-purple-50 p-3 text-center"><p className="break-words text-2xl font-bold text-purple-700">{stats.total_completed_today ?? 0}</p><p className="break-words text-xs text-purple-600">{t.completedToday}</p></div>
      <div className="min-w-0 overflow-hidden rounded-lg bg-orange-50 p-3 text-center"><p className="break-words text-2xl font-bold text-orange-700">{stats.total_no_show_today ?? 0}</p><p className="break-words text-xs text-orange-600">{t.noShow}</p></div>
    </div>
    {stats.avg_wait_time_minutes !== undefined && <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"><span className="text-xs text-gray-600">{t.averageWait}</span><span className="shrink-0 text-sm font-semibold text-gray-800">{stats.avg_wait_time_minutes} {locale === "ar" ? "دقيقة" : "minutes"}</span></div>}
  </div>;
}

export default QueueWidget;
