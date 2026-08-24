"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useAnalyticsOverview } from "@/domain/analytics/analytics.queries";
import { useTenantId } from "@/core/auth/useTenantId";
import { getAnalyticsKpiLabel } from "@/core/i18n/analyticsMessages";
import { useI18n } from "@/core/i18n/I18nProvider";
import { BarChart3, Users, Calendar, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export function AnalyticsOverviewWidget(_props: WidgetComponentProps) {
  const { userId } = useTenantId();
  const { locale, analytics: t } = useI18n();
  const { data: kpis, isLoading, error } = useAnalyticsOverview(userId, "today");
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (isLoading) return <div className="flex h-32 items-center justify-center" dir={direction}><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>;

  if (error) {
    return <div className="flex flex-col items-center gap-2 py-4 text-red-600" dir={direction}><AlertCircle className="h-8 w-8" /><p className="text-sm">{t.loadError}</p></div>;
  }

  if (!kpis || kpis.length === 0) {
    return <div className="flex flex-col items-center gap-2 py-4 text-gray-400" dir={direction}><BarChart3 className="h-8 w-8" /><p className="text-sm">{t.noData}</p></div>;
  }

  const totalPatients = kpis.find((k) => k.id === "patients.total");
  const totalAppointments = kpis.find((k) => k.id === "appointments.total");
  const revenue = kpis.find((k) => k.id === "revenue.total");

  return (
    <div className="min-w-0 space-y-3" dir={direction}>
      <div className="grid min-w-0 grid-cols-3 gap-3">
        <div className="min-w-0 overflow-hidden rounded-lg bg-blue-50 p-3 text-center"><Users className="mx-auto mb-1 h-5 w-5 text-blue-600" /><p className="break-words text-xl font-bold text-blue-700">{totalPatients?.value ?? "—"}</p><p className="text-xs text-blue-600">{getAnalyticsKpiLabel(locale, "patients.total")}</p></div>
        <div className="min-w-0 overflow-hidden rounded-lg bg-green-50 p-3 text-center"><Calendar className="mx-auto mb-1 h-5 w-5 text-green-600" /><p className="break-words text-xl font-bold text-green-700">{totalAppointments?.value ?? "—"}</p><p className="text-xs text-green-600">{getAnalyticsKpiLabel(locale, "appointments.total")}</p></div>
        <div className="min-w-0 overflow-hidden rounded-lg bg-purple-50 p-3 text-center"><TrendingUp className="mx-auto mb-1 h-5 w-5 text-purple-600" /><p className="break-words text-xl font-bold text-purple-700">{revenue?.value ?? "—"}</p><p className="text-xs text-purple-600">{getAnalyticsKpiLabel(locale, "revenue.total")}</p></div>
      </div>
    </div>
  );
}

export default AnalyticsOverviewWidget;
