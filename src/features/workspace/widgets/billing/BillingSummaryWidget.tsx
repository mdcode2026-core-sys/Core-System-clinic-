"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useBillingSummary } from "@/domain/invoicing/useBillingSummary";
import { useTenantId } from "@/core/auth/useTenantId";
import { FileText, AlertCircle, Loader2 } from "lucide-react";

// NOTE: this widget shows 3 figures backed by existing, documented report
// queries (ARCHITECTURE_DECISIONS.md — Reports catalog: Revenue Summary,
// Paid Invoices, Outstanding Invoices). A 4th figure the original widget
// showed — "average invoice" — has no defined calculation anywhere in the
// codebase or documentation (average of paid invoices? of all issued
// invoices? weighted how?) and was removed rather than invented. See final
// report: BLOCKED / DECISION REQUIRED.

export function BillingSummaryWidget(_props: WidgetComponentProps) {
  const { tenantId } = useTenantId();
  const { data: summary, isLoading, error } = useBillingSummary(tenantId);

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
        <p className="text-sm">{error instanceof Error ? error.message : "فشل تحميل بيانات الفواتير"}</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-gray-400">
        <FileText className="h-8 w-8" />
        <p className="text-sm">لا توجد بيانات فوترة</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-xl font-bold text-green-700">
            {(summary.totalRevenue / 100).toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-green-600">الإيرادات المحصّلة</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{summary.paidInvoicesCount}</p>
          <p className="text-xs text-blue-600">فواتير مدفوعة</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-3 text-center">
          <p className="text-xl font-bold text-yellow-700">
            {(summary.outstandingAmount / 100).toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-yellow-600">مستحق ({summary.outstandingCount})</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-600">الفترة</span>
        <span className="text-xs font-medium text-gray-800">{summary.periodLabel}</span>
      </div>
    </div>
  );
}

export default BillingSummaryWidget;
