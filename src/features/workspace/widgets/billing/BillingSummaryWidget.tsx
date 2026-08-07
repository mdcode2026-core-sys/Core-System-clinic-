// src/features/workspace/widgets/billing/BillingSummaryWidget.tsx
// Widget: billing-summary — "Billing Summary" (name fixed by Owner decision)
// Category: Informational | Layer: 3
// Thin wrapper around existing invoicing.queries.ts — zero new business logic.

"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useInvoiceSummary } from "@/domain/invoicing/invoicing.queries";
import { useAuth } from "@/lib/supabase/useAuth";
import { DollarSign, FileText, TrendingUp, AlertCircle, Loader2 } from "lucide-react";

export function BillingSummaryWidget(_props: WidgetComponentProps) {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id;

  const { data: summary, isLoading, error } = useInvoiceSummary(tenantId ?? "");

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
        <p className="text-sm">{error.message || "فشل تحميل بيانات الفواتير"}</p>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">
            {summary.total_revenue?.toLocaleString("ar-SA") ?? 0}
          </p>
          <p className="text-xs text-green-600">إجمالي الإيرادات</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">
            {summary.total_invoices ?? 0}
          </p>
          <p className="text-xs text-blue-600">عدد الفواتير</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-3 text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {summary.pending_amount?.toLocaleString("ar-SA") ?? 0}
          </p>
          <p className="text-xs text-yellow-600">مبالغ معلقة</p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {summary.average_invoice?.toLocaleString("ar-SA") ?? 0}
          </p>
          <p className="text-xs text-purple-600">متوسط الفاتورة</p>
        </div>
      </div>

      {summary.period && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <span className="text-xs text-gray-600">الفترة</span>
          <span className="text-xs font-medium text-gray-800">{summary.period}</span>
        </div>
      )}
    </div>
  );
}

export default BillingSummaryWidget;
