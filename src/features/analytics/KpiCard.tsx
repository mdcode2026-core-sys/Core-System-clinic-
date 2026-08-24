"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { KpiResult } from "@/domain/analytics/analytics.types";
import { getAnalyticsKpiLabel, getAnalyticsKpiUnit } from "@/core/i18n/analyticsMessages";
import { useI18n } from "@/core/i18n/I18nProvider";

interface KpiCardProps { kpi: KpiResult; }

export function KpiCard({ kpi }: KpiCardProps) {
  const { locale } = useI18n();
  const unit = getAnalyticsKpiUnit(locale, kpi.id);
  return (
    <Card className="min-w-0 overflow-hidden" dir={locale === "ar" ? "rtl" : "ltr"}>
      <CardHeader className="min-w-0 pb-2">
        <CardTitle className="break-words text-sm font-medium text-muted-foreground">{getAnalyticsKpiLabel(locale, kpi.id)}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="min-w-0 break-words text-2xl font-bold leading-tight tabular-nums sm:text-3xl">
          {kpi.value}{unit ? <span className="ms-1 text-base font-medium text-muted-foreground sm:text-lg">{unit}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
