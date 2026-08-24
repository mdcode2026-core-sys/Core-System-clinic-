"use client";

import { useAuth } from "@/core/auth/AuthContext";
import { useAnalyticsOverview } from "@/domain/analytics/analytics.queries";
import { useI18n } from "@/core/i18n/I18nProvider";
import { KpiGrid } from "./KpiGrid";

export function AnalyticsDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { locale, analytics: t } = useI18n();
  const { data: kpis, isLoading: kpiLoading, error } = useAnalyticsOverview(user?.id, "today");

  if (authLoading || kpiLoading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" dir={locale === "ar" ? "rtl" : "ltr"}>{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>;
  if (error) return <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive" dir={locale === "ar" ? "rtl" : "ltr"}>{t.loadError}: {error.message}</div>;
  if (!kpis || kpis.length === 0) return <div className="rounded-lg border p-4 text-muted-foreground" dir={locale === "ar" ? "rtl" : "ltr"}>{t.noData}</div>;

  const groups = [
    ["patients", t.sections.patients, "patients."], ["appointments", t.sections.appointments, "appointments."], ["queue", t.sections.queue, "queue."], ["revenue", t.sections.revenue, "revenue."], ["invoices", t.sections.invoices, "invoices."], ["inventory", t.sections.inventory, "inventory."], ["followup", t.sections.followup, "followup."]
  ] as const;

  return <div className="space-y-8" dir={locale === "ar" ? "rtl" : "ltr"}>{groups.map(([key, label, prefix]) => { const items = kpis.filter((k) => k.id.startsWith(prefix)); return <section key={key}><h2 className="mb-3 text-lg font-semibold">{label}</h2><KpiGrid kpis={items} /></section>; })}</div>;
}
