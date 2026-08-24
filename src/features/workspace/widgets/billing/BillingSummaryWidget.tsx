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

  if (isLoading) return <div className="flex h-32 items-center justify-center" dir={locale === "ar" ? "rtl" : "ltr"}><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>;
  if (error) return <div className="flex flex-col items-center gap-2 py-4 text-red-600" dir={locale === "ar" ? "rtl" : "ltr"}><AlertCircle className="h-8 w-8" /><p className="text-sm">{w.billing.loadFailed}</p></div>;
  if (!summary) return <div className="flex flex-col items-center gap-2 py-4 text-gray-400" dir={locale === "ar" ? "rtl" : "ltr"}><FileText className="h-8 w-8" /><p className="text-sm">{w.billing.noData}</p></div>;

  return <div className="space-y-3" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg bg-green-50 p-3 text-center"><p className="text-xl font-bold text-green-700">{currency ? formatCurrency(summary.totalRevenue, currency, locale) : "—"}</p><p className="text-xs text-green-600">{w.billing.collectedRevenue}</p></div>
      <div className="rounded-lg bg-blue-50 p-3 text-center"><p className="text-xl font-bold text-blue-700">{summary.paidInvoicesCount.toLocaleString("en-US", { numberingSystem: "latn" })}</p><p className="text-xs text-blue-600">{w.billing.paidInvoices}</p></div>
      <div className="rounded-lg bg-yellow-50 p-3 text-center"><p className="text-xl font-bold text-yellow-700">{currency ? formatCurrency(summary.outstandingAmount, currency, locale) : "—"}</p><p className="text-xs text-yellow-600">{w.billing.outstanding} ({summary.outstandingCount.toLocaleString("en-US", { numberingSystem: "latn" })})</p></div>
    </div>
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"><span className="text-xs text-gray-600">{w.billing.period}</span><span className="text-xs font-medium text-gray-800">{w.billing[summary.periodKey]}</span></div>
  </div>;
}

export default BillingSummaryWidget;
