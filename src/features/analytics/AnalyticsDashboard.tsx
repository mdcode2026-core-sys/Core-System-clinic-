"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { useAnalyticsOverview } from "@/domain/analytics/analytics.queries";
import { KpiGrid } from "./KpiGrid";

export function AnalyticsDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: kpis, isLoading: kpiLoading, error } = useAnalyticsOverview(user?.id, "today");

  if (authLoading || kpiLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        خطأ في تحميل التحليلات: {error.message}
      </div>
    );
  }

  if (!kpis || kpis.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-muted-foreground">
        لا توجد بيانات تحليلية متاحة
      </div>
    );
  }

  const patients = kpis.filter((k) => k.id.startsWith("patients."));
  const appointments = kpis.filter((k) => k.id.startsWith("appointments."));
  const queue = kpis.filter((k) => k.id.startsWith("queue."));
  const revenue = kpis.filter((k) => k.id.startsWith("revenue."));
  const invoices = kpis.filter((k) => k.id.startsWith("invoices."));
  const inventory = kpis.filter((k) => k.id.startsWith("inventory."));
  const followup = kpis.filter((k) => k.id.startsWith("followup."));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">المرضى</h2>
        <KpiGrid kpis={patients} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">المواعيد</h2>
        <KpiGrid kpis={appointments} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">الطابور</h2>
        <KpiGrid kpis={queue} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">الإيرادات</h2>
        <KpiGrid kpis={revenue} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">الفواتير</h2>
        <KpiGrid kpis={invoices} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">المخزون</h2>
        <KpiGrid kpis={inventory} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">المتابعة</h2>
        <KpiGrid kpis={followup} />
      </section>
    </div>
  );
}
