// src/features/workspace/widgets/analytics/AnalyticsOverviewWidget.tsx
// Widget: analytics-overview — "Analytics Overview" (name fixed by Owner decision)
// Category: Analytics | Layer: 3
// Thin wrapper around existing analytics.queries.ts — zero new business logic.
// Per §6: "Uses only the Analytics Engine. Never implements independent calculations."

"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useAnalyticsOverview } from "@/domain/analytics/analytics.queries";
import { useAuth } from "@/lib/supabase/useAuth";
import { BarChart3, TrendingUp, Users, Calendar, AlertCircle, Loader2 } from "lucide-react";

export function AnalyticsOverviewWidget(_props: WidgetComponentProps) {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  const { data: overview, isLoading, error } = useAnalyticsOverview(tenantId ?? "");

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
        <p className="text-sm">{error.message || "فشل تحميل التحليلات"}</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-gray-400">
        <BarChart3 className="h-8 w-8" />
        <p className="text-sm">لا توجد بيانات تحليلية</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-blue-600" />
          <p className="text-xl font-bold text-blue-700">
            {overview.total_patients ?? 0}
          </p>
          <p className="text-xs text-blue-600">إجمالي المرضى</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <Calendar className="mx-auto mb-1 h-5 w-5 text-green-600" />
          <p className="text-xl font-bold text-green-700">
            {overview.total_appointments ?? 0}
          </p>
          <p className="text-xs text-green-600">المواعيد</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-purple-600" />
          <p className="text-xl font-bold text-purple-700">
            {overview.revenue?.toLocaleString("ar-SA") ?? 0}
          </p>
          <p className="text-xs text-purple-600">الإيرادات</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <BarChart3 className="mx-auto mb-1 h-5 w-5 text-orange-600" />
          <p className="text-xl font-bold text-orange-700">
            {overview.conversion_rate ?? 0}%
          </p>
          <p className="text-xs text-orange-600">معدل التحويل</p>
        </div>
      </div>

      {overview.period && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-xs text-gray-600">الفترة</span>
          <span className="text-xs font-medium text-gray-800">{overview.period}</span>
        </div>
      )}
    </div>
  );
}

export default AnalyticsOverviewWidget;
