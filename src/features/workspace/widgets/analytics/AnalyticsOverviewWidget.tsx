"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useAnalyticsOverview } from "@/domain/analytics/analytics.queries";
import { useTenantId } from "@/core/auth/useTenantId";
import { BarChart3, Users, Calendar, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

// NOTE: real useAnalyticsOverview(authUserId, datePreset) returns KpiResult[]
// (the full registered KPI set), not a single summary object. This widget
// picks out the 3 KPIs that already exist in the registry and match the
// original widget's intent (kpi.registry.ts / patient.kpis.ts,
// appointment.kpis.ts, revenue.kpis.ts):
//   patients.total, appointments.total, revenue.total
// A 4th figure the original widget showed — "conversion_rate" — has no
// matching KPI anywhere in the registry and no definition in documentation
// (conversion from what to what?). Removed rather than invented. See final
// report: BLOCKED / DECISION REQUIRED.

export function AnalyticsOverviewWidget(_props: WidgetComponentProps) {
  const { userId } = useTenantId();

  const { data: kpis, isLoading, error } = useAnalyticsOverview(userId, "today");

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
        <p className="text-sm">{error instanceof Error ? error.message : "فشل تحميل التحليلات"}</p>
      </div>
    );
  }

  if (!kpis || kpis.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-gray-400">
        <BarChart3 className="h-8 w-8" />
        <p className="text-sm">لا توجد بيانات تحليلية</p>
      </div>
    );
  }

  const totalPatients = kpis.find((k) => k.id === "patients.total");
  const totalAppointments = kpis.find((k) => k.id === "appointments.total");
  const revenue = kpis.find((k) => k.id === "revenue.total");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-blue-600" />
          <p className="text-xl font-bold text-blue-700">{totalPatients?.value ?? "—"}</p>
          <p className="text-xs text-blue-600">إجمالي المرضى</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <Calendar className="mx-auto mb-1 h-5 w-5 text-green-600" />
          <p className="text-xl font-bold text-green-700">{totalAppointments?.value ?? "—"}</p>
          <p className="text-xs text-green-600">المواعيد</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-purple-600" />
          <p className="text-xl font-bold text-purple-700">{revenue?.value ?? "—"}</p>
          <p className="text-xs text-purple-600">الإيرادات</p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsOverviewWidget;
