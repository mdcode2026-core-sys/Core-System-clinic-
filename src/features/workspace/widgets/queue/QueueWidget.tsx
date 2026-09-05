"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useQueueStats } from "@/domain/queue/queue.hooks";
import { useTenantId } from "@/core/auth/useTenantId";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissions } from "@/core/permissions/usePermissions";
import { Clock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function QueueWidget(_props: WidgetComponentProps) {
  const { tenantId } = useTenantId();
  const { locale, queue: t } = useI18n();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { data: stats, isLoading, error } = useQueueStats(tenantId ?? "");
  const direction = locale === "ar" ? "rtl" : "ltr";
  const canManageAdministrativeFlow = hasPermission("patient_flow:administrative");

  if (isLoading) return <div className="flex h-32 items-center justify-center" dir={direction}><Loader2 className="h-6 w-6 animate-spin" /></div>;
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
    {!permissionsLoading && canManageAdministrativeFlow && <Link href="/patient-flow/administrative" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
      {locale === "ar" ? "فتح إدارة رحلة المريض" : "Open Patient Flow Administration"}
      <ArrowRight className="h-4 w-4" />
    </Link>}
  </div>;
}

export default QueueWidget;
