import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getAnalyticsOverview } from "@/domain/analytics/analytics.actions";
import { KpiGrid } from "@/features/analytics/KpiGrid";
import { getDashboardMessages } from "@/core/i18n/dashboardMessages";
import type { Locale } from "@/core/i18n/messages";
import type { KpiResult } from "@/domain/analytics/analytics.types";

const dashboardGroups = [
  { key: "patients", ids: 2 },
  { key: "appointments", ids: 2 },
  { key: "queue", ids: 1 },
  { key: "revenue", ids: 2 },
  { key: "invoices", ids: 2 },
  { key: "inventory", ids: 1 },
  { key: "followup", ids: 1 },
] as const;

export default async function ManagementDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");

  const permissions = await getEffectivePermissions(user.id, tenantId);
  if (!permissions.includes("analytics:read")) redirect("/");

  const localeCookie = (await cookies()).get("core-system-locale")?.value;
  const locale: Locale = localeCookie === "ar" ? "ar" : "en";
  const t = getDashboardMessages(locale);
  const kpis = await getAnalyticsOverview(user.id, "today");

  const groups = dashboardGroups
    .map(({ key, ids }) => ({ key, items: kpis.filter((kpi) => kpi.id.startsWith(`${key}.`)).slice(0, ids) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{t.management}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t.description}</p>
          </div>
          <a href="/analytics" className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
            {t.openAnalytics}
          </a>
        </div>
      </header>

      {groups.length === 0 ? (
        <section className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">{t.noData}</section>
      ) : (
        groups.map((group) => (
          <section key={group.key} aria-labelledby={`dashboard-${group.key}`}>
            <h2 id={`dashboard-${group.key}`} className="mb-3 text-lg font-semibold">{t.sections[group.key as keyof typeof t.sections]}</h2>
            <KpiGrid kpis={group.items as KpiResult[]} />
          </section>
        ))
      )}
    </div>
  );
}
