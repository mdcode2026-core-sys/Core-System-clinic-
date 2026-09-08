"use client";

import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useAnalyticsOverview, useAnalyticsComparison, useAnalyticsTrend, useAnalyticsDrilldown } from "@/domain/analytics/analytics.queries";
import type { DatePreset } from "@/domain/analytics/analytics.types";
import { useI18n } from "@/core/i18n/I18nProvider";
import { KpiGrid } from "./KpiGrid";

const presets: { value: DatePreset; ar: string; en: string }[] = [
  { value: "today", ar: "اليوم", en: "Today" }, { value: "yesterday", ar: "أمس", en: "Yesterday" },
  { value: "this_week", ar: "هذا الأسبوع", en: "This Week" }, { value: "last_week", ar: "الأسبوع الماضي", en: "Last Week" },
  { value: "this_month", ar: "هذا الشهر", en: "This Month" }, { value: "last_month", ar: "الشهر الماضي", en: "Last Month" },
  { value: "this_quarter", ar: "هذا الربع", en: "This Quarter" }, { value: "custom", ar: "نطاق مخصص", en: "Custom Range" },
];

export function AnalyticsDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { locale, analytics: t } = useI18n();
  const [preset, setPreset] = useState<DatePreset>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const customReady = preset !== "custom" || (!!customFrom && !!customTo);
  const { data: kpis, isLoading: kpiLoading, error } = useAnalyticsOverview(user?.id, preset, customFrom || undefined, customTo || undefined);
  const comparison = useAnalyticsComparison(user?.id, "revenue.total", preset, customFrom || undefined, customTo || undefined);
  const trend = useAnalyticsTrend(user?.id, "revenue.total", preset, customFrom || undefined, customTo || undefined);
  const drilldown = useAnalyticsDrilldown(user?.id, "revenue.total", preset, customFrom || undefined, customTo || undefined, customReady);
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (authLoading || kpiLoading) return <div className="space-y-6" dir={direction}><h1 className="text-3xl font-bold">{t.title}</h1><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div></div>;
  if (error) return <div className="space-y-6" dir={direction}><h1 className="text-3xl font-bold">{t.title}</h1><div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">{t.loadError}: {error.message}</div></div>;
  if (!kpis || kpis.length === 0) return <div className="space-y-6" dir={direction}><h1 className="text-3xl font-bold">{t.title}</h1><div className="rounded-lg border p-4 text-muted-foreground">{t.noData}</div></div>;

  const groups = [
    ["patients", t.sections.patients, "patients."], ["appointments", t.sections.appointments, "appointments."], ["queue", t.sections.queue, "queue."], ["revenue", t.sections.revenue, "revenue."], ["invoices", t.sections.invoices, "invoices."], ["inventory", t.sections.inventory, "inventory."], ["followup", t.sections.followup, "followup."],
    ["workforce", locale === "ar" ? "القوى العاملة" : "Workforce", "workforce."], ["communications", locale === "ar" ? "الاتصالات" : "Communications", "communications."], ["coordination", locale === "ar" ? "التنسيق التشغيلي" : "Operational Coordination", "coordination."]
  ] as const;
  const gross = kpis.find((k) => k.id === "revenue.total");
  const trendMax = Math.max(1, ...(trend.data ?? []).map((point) => Math.abs(point.value)));
  return <div className="space-y-8" dir={direction}>
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-end md:justify-between">
      <div><h1 className="text-3xl font-bold">{t.title}</h1><p className="text-sm text-muted-foreground">{locale === "ar" ? "الفترة تحدد أساس الحساب لكل المقاييس الزمنية." : "The selected period defines the time basis for time-bound metrics."}</p></div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm"><span className="mb-1 block text-muted-foreground">{locale === "ar" ? "الفترة" : "Period"}</span><select className="h-9 rounded-md border bg-background px-3" value={preset} onChange={(e) => setPreset(e.target.value as DatePreset)}>{presets.map((p) => <option key={p.value} value={p.value}>{locale === "ar" ? p.ar : p.en}</option>)}</select></label>
        {preset === "custom" ? <><label className="text-sm"><span className="mb-1 block text-muted-foreground">{locale === "ar" ? "من" : "From"}</span><input className="h-9 rounded-md border bg-background px-3" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} /></label><label className="text-sm"><span className="mb-1 block text-muted-foreground">{locale === "ar" ? "إلى" : "To"}</span><input className="h-9 rounded-md border bg-background px-3" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} /></label></> : null}
      </div>
    </div>

    {preset !== "custom" || customReady ? <>
      <section className="space-y-3"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">{locale === "ar" ? "الفوترة: مقارنة واتجاه" : "Billing: comparison & trend"}</h2><p className="text-xs text-muted-foreground">{locale === "ar" ? "الفوترة الإجمالية لا تعني التحصيل." : "Gross invoiced is distinct from collected cash."}</p></div><div className="text-sm text-muted-foreground">{gross?.value ?? "—"}</div></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-lg border p-4"><div className="text-sm text-muted-foreground">{locale === "ar" ? "مقابل الفترة السابقة" : "vs previous period"}</div><div className="mt-1 text-2xl font-semibold">{comparison.data?.changePercent == null ? "—" : `${comparison.data.changePercent.toFixed(1)}%`}</div><div className="mt-1 text-xs text-muted-foreground">{comparison.data ? `${comparison.data.current?.toLocaleString("en-US")} vs ${comparison.data.previous?.toLocaleString("en-US")}` : "—"}</div></div><div className="rounded-lg border p-4"><div className="mb-3 text-sm font-medium">{locale === "ar" ? "الاتجاه اليومي" : "Daily trend"}</div><div className="space-y-2">{(trend.data ?? []).map((point) => <div key={point.date} className="grid grid-cols-[80px_1fr_90px] items-center gap-2 text-xs"><span>{point.date}</span><div className="h-2 overflow-hidden rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${Math.min(100, Math.abs(point.value) / trendMax * 100)}%` }} /></div><span className="text-right tabular-nums">{point.value.toLocaleString("en-US")}</span></div>)}{!trend.data?.length ? <div className="text-xs text-muted-foreground">{locale === "ar" ? "لا يوجد اتجاه لهذا المؤشر الحالي." : "No trend available for this metric."}</div> : null}</div></div></div></section>
      <section className="space-y-3"><h2 className="text-lg font-semibold">{locale === "ar" ? "الأدلة التشغيلية للفوترة" : "Billing operational evidence"}</h2><div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead className="border-b bg-muted/40"><tr><th className="p-3 text-left">{locale === "ar" ? "التاريخ" : "Date"}</th><th className="p-3 text-left">{locale === "ar" ? "رقم الفاتورة" : "Invoice"}</th><th className="p-3 text-left">{locale === "ar" ? "الحالة" : "Status"}</th><th className="p-3 text-right">{locale === "ar" ? "الإجمالي" : "Total"}</th></tr></thead><tbody>{(drilldown.data ?? []).map((row) => <tr key={row.id} className="border-b last:border-0"><td className="p-3">{row.date ?? "—"}</td><td className="p-3">{String(row.fields.invoiceNumber ?? row.id).slice(0, 30)}</td><td className="p-3">{String(row.fields.invoiceStatus ?? "—")}</td><td className="p-3 text-right tabular-nums">{Number(row.value ?? 0).toLocaleString("en-US")}</td></tr>)}{!drilldown.data?.length ? <tr><td colSpan={4} className="p-4 text-muted-foreground">{locale === "ar" ? "لا توجد سجلات مساهمة متاحة لهذا المؤشر." : "No contributing records are available for this metric."}</td></tr> : null}</tbody></table></div></section>
    </> : null}

    {groups.map(([key, label, prefix]) => { const items = kpis.filter((k) => k.id.startsWith(prefix)); if (!items.length) return null; return <section key={key}><h2 className="mb-3 text-lg font-semibold">{label}</h2><KpiGrid kpis={items} /></section>; })}
  </div>;
}
