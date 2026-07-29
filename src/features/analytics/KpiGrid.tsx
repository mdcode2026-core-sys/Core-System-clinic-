"use client";

import { KpiCard } from "./KpiCard";
import type { KpiResult } from "@/domain/analytics/analytics.types";

interface KpiGridProps {
  kpis: KpiResult[];
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
