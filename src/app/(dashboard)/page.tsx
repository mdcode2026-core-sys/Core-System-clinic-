// src/app/(dashboard)/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, UsersRound } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getQueueStats } from "@/domain/queue/queue.queries";
import { HomeIdentityBanner } from "@/features/home/HomeIdentityBanner";
import { HomeWeather } from "@/features/home/HomeWeather";
import { HomeWorkspaceTransitionLink } from "@/features/home/HomeWorkspaceTransitionLink";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const locale = (await cookies()).get("core-system-locale")?.value === "ar" ? "ar" : "en";
  const ar = locale === "ar";
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  const [{ data: clinicUser }, { data: tenant }, queueStats] = await Promise.all([
    supabase.from("clinic_users").select("id,full_name,full_name_ar,tenant_id").eq("auth_user_id", user.id).eq("tenant_id", tenantId).limit(1).maybeSingle(),
    supabase.from("master_tenants").select("clinic_name,clinic_name_ar,logo_url,address,country_code").eq("id", tenantId).maybeSingle(),
    permissions.includes("sessions:read") || permissions.includes("workspace:operation") || permissions.includes("workspace:clinical") ? getQueueStats() : Promise.resolve({ total_waiting: 0, total_in_consultation: 0, total_completed_today: 0, total_no_show_today: 0, avg_wait_time_minutes: 0, longest_wait_minutes: 0 }),
  ]);
  const appointmentQuery = permissions.includes("agenda:read") ? supabase.from("master_agenda_events").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("doctor_id", clinicUser?.id ?? "").gte("scheduled_start", start).lt("scheduled_start", end).neq("status", "cancelled") : null;
  const appointmentsCount = appointmentQuery ? (await appointmentQuery).count ?? 0 : 0;
  const displayName = ar ? clinicUser?.full_name_ar || clinicUser?.full_name || user.email || "" : clinicUser?.full_name || user.email || "";
  const clinicName = ar ? tenant?.clinic_name_ar || tenant?.clinic_name || "ClinicSaaS" : tenant?.clinic_name || tenant?.clinic_name_ar || "ClinicSaaS";
  const hasWorkspace = permissions.includes("sessions:read") || permissions.includes("workspace:operation") || permissions.includes("workspace:clinical");
  const hasAttention = hasWorkspace && queueStats.total_waiting > 0;
  const metrics = [
    { icon: CalendarDays, label: ar ? "مواعيدك اليوم" : "Your appointments", value: appointmentsCount, href: clinicUser?.id ? `/agenda?doctorId=${encodeURIComponent(clinicUser.id)}` : "/agenda", show: permissions.includes("agenda:read"), testId: "home-today-appointments" },
    { icon: UsersRound, label: ar ? "في الانتظار" : "Waiting", value: queueStats.total_waiting, href: "/workspace", show: hasWorkspace, testId: "home-today-waiting" },
    { icon: Clock3, label: ar ? "قيد العمل" : "In clinical work", value: queueStats.total_in_consultation, href: "/workspace", show: permissions.includes("sessions:read") || permissions.includes("workspace:clinical"), testId: "home-today-clinical" },
    { icon: CheckCircle2, label: ar ? "مكتمل" : "Completed", value: queueStats.total_completed_today, href: "/workspace", show: permissions.includes("sessions:read") || permissions.includes("workspace:operation") || permissions.includes("workspace:clinical"), testId: "home-today-completed" },
  ].filter((item) => item.show);
  return (
    <div className="cs-page-canvas mx-auto w-full max-w-[1600px] space-y-6" dir={ar ? "rtl" : "ltr"}>
      <HomeIdentityBanner isArabic={ar} clinicName={clinicName} clinicLogoUrl={tenant?.logo_url} displayName={displayName} weather={<HomeWeather address={tenant?.address} countryCode={tenant?.country_code} isArabic={ar} />} />
      {metrics.length > 0 ? <section aria-labelledby="home-today-title"><div className="mb-2 flex items-baseline justify-between gap-3"><h2 id="home-today-title" className="text-lg font-semibold tracking-tight text-[var(--cs-ink-950)]">{ar ? "اليوم" : "Today"}</h2><span className="text-xs text-[var(--cs-slate-500)]">{ar ? "نظرة يومية" : "Daily view"}</span></div><div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[var(--cs-slate-200)] bg-white md:grid-cols-4" data-testid="home-today-actions">{metrics.map((metric, index) => { const Icon = metric.icon; return <Link key={metric.label} href={metric.href} data-testid={metric.testId} aria-label={`${metric.label}: ${metric.value}`} className={`cs-interactive group flex min-h-[68px] items-center gap-3 px-3 py-3 text-start transition-colors hover:bg-[var(--cs-slate-50)] focus-visible:z-10 md:min-h-[76px] md:px-4 ${index > 0 ? "border-s border-[var(--cs-slate-200)]" : ""} ${index === 2 ? "max-md:border-s-0 max-md:border-t" : ""} ${index === 3 ? "max-md:border-t" : ""}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cs-azure-100)] text-[var(--cs-azure-700)] group-hover:bg-[var(--cs-azure-200)]"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[var(--cs-slate-600)]">{metric.label}</span><span className="mt-0.5 block text-xl font-bold tabular-nums text-[var(--cs-ink-950)]">{metric.value}</span></span></Link>; })}</div></section> : null}
      {hasAttention ? <section aria-labelledby="home-attention-title" className="cs-surface rounded-xl border-s-4 border-s-[var(--cs-cyan-600)] p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-cyan-700)]">{ar ? "انتباه" : "Attention"}</p><h2 id="home-attention-title" className="mt-1 text-base font-semibold text-[var(--cs-ink-950)]">{ar ? `${queueStats.total_waiting} ${queueStats.total_waiting === 1 ? "مريض بانتظار الخدمة" : "مرضى بانتظار الخدمة"}` : `${queueStats.total_waiting} patient${queueStats.total_waiting === 1 ? "" : "s"} waiting`}</h2><p className="mt-1 text-sm text-[var(--cs-slate-500)]">{ar ? "افتح مساحة العمل لمتابعة الطابور." : "Open Workspace to manage the queue."}</p></div><HomeWorkspaceTransitionLink compact /></div></section> : null}
      <section aria-labelledby="home-destinations-title"><div className="mb-2"><h2 id="home-destinations-title" className="text-lg font-semibold tracking-tight text-[var(--cs-ink-950)]">{ar ? "التالي" : "Next"}</h2></div><div className="grid gap-2 sm:grid-cols-2">{hasWorkspace ? <div className="cs-surface rounded-xl p-3.5 sm:p-4"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold text-[var(--cs-ink-950)]">{ar ? "مساحة العمل" : "Workspace"}</p><p className="mt-0.5 truncate text-xs text-[var(--cs-slate-500)]">{ar ? "ابدأ التنفيذ" : "Start active work"}</p></div><HomeWorkspaceTransitionLink compact /></div></div> : null}{permissions.includes("agenda:read") ? <Link href={clinicUser?.id ? `/agenda?doctorId=${encodeURIComponent(clinicUser.id)}` : "/agenda"} aria-label={ar ? "فتح التقويم" : "Open Calendar"} className="cs-surface cs-interactive flex min-h-[64px] items-center gap-3 rounded-xl p-3.5 sm:p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--cs-azure-100)] text-[var(--cs-azure-700)]"><CalendarDays className="h-[18px] w-[18px]" aria-hidden="true" /></span><span className="min-w-0"><span className="block text-sm font-semibold text-[var(--cs-ink-950)]">{ar ? "التقويم" : "Calendar"}</span><span className="mt-0.5 block truncate text-xs text-[var(--cs-slate-500)]">{ar ? "عرض المواعيد والجدول" : "View appointments and schedule"}</span></span></Link> : null}</div></section>
    </div>
  );
}
