"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { KpiResult } from "@/domain/analytics/analytics.types";

interface KpiCardProps {
  kpi: KpiResult;
}

export function KpiCard({ kpi }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.nameAr}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{kpi.value}</div>
      </CardContent>
    </Card>
  );
}
