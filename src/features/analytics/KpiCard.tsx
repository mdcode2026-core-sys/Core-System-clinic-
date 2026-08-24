"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { KpiResult } from "@/domain/analytics/analytics.types";
import { getAnalyticsKpiLabel } from "@/core/i18n/analyticsMessages";
import { useI18n } from "@/core/i18n/I18nProvider";

interface KpiCardProps { kpi: KpiResult; }

export function KpiCard({ kpi }: KpiCardProps) {
  const { locale } = useI18n();
  return (
    <Card dir={locale === "ar" ? "rtl" : "ltr"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{getAnalyticsKpiLabel(locale, kpi.id)}</CardTitle>
      </CardHeader>
      <CardContent><div className="text-3xl font-bold">{kpi.value}</div></CardContent>
    </Card>
  );
}
