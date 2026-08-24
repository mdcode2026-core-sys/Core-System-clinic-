"use client";

import type { WidgetComponentProps } from "@/core/workspace/workspace.types";
import { useBillingSummary } from "@/domain/invoicing/useBillingSummary";
import { useTenantId } from "@/core/auth/useTenantId";
import { useSystemPreferences } from "@/domain/system-preferences";
import { useI18n } from "@/core/i18n/I18nProvider";
import { formatCurrency } from "@/shared/utils/currency";
import { FileText, AlertCircle, Loader2 } from "lucide-react";

export function BillingSummaryWidget(_props: WidgetComponentProps) {
  const { tenantId } = useTenantId();
  const { locale, workspace: w } = useI18n();
  const { data: summary, isLoading, error } = useBillingSummary(tenantId);
  const { data: preferences } = useSystemPreferences(tenantId);
  const currency = preferences?.currency;
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (isLoading) return <div className="flex h-32 items-center justify-center" dir={direction}><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>;
  if (error) return <div className="flex flex-col items-center gap-2 py-4 text-red-600" dir={direction}><AlertCircle className="h-8 w-8" /><p className="text-sm">{w.billing.loadFailed}</p></div>;
  if (!summary) return <div className="flex flex-col items-center gap-2 py-4 text-gray-400" dir={direction}><FileText className="h-8 w-8" /><p className="text-sm">{w.billing.noData}</p></div>;

  return <div className="min-w-0 space-y-3" dir={direction}>
    <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
      <div className="min-w-0 overflow-hidden rounded-lg bg-green-50 p-2 text-center sm:p-3"><p className="break-words text-base font-bold leading-tight text-green-700 sm:text-xl">{currency ? formatCurrency(summary.totalRevenue, currency, locale) : "—"}</p><p className="break-words text-xs text-green-600">{w.billing.collectedRevenue}</p></div>
      <div className="min-w-0 overflow-hidden rounded-lg bg-blue-50 p-2 text-center sm:p-3"><p className="break-words text-base font-bold leading-tight text-blue-700 sm:text-xl">{summary.paidInvoicesCount.toLocaleString("en-US", { numberingSystem: "latn" })}</p><p className="break-words text-xs text-blue-600">{w.billing.paidInvoices}</p></div>
      <div className="min-w-0 overflow-hidden rounded-lg bg-yellow-50 p-2 text-center sm:p-3"><p className="break-words text-base font-bold leading-tight text-yellow-700 sm:text-xl">{currency ? formatCurrency(summary.outstandingAmount, currency, locale) : "—"}</p><p className="break-words text-xs text-yellow-600">{w.billing.outstanding} ({summary.outstandingCount.toLocaleString("en-US", { numberingSystem: "latn" })})</p></div>
    </div>
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2"><span className="text-xs text-gray-600">{w.billing.period}</span><span className="break-words text-end text-xs font-medium text-gray-800">{w.billing[summary.periodKey]}</span></div>
  </div>;
}

export default BillingSummaryWidget;
