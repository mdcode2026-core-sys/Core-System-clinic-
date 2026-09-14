// src/app/(dashboard)/page.tsx
// Home is the general awareness/entry surface. Workspace remains the execution surface.
// The page intentionally keeps specialist work inside authoritative destinations.

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
    supabase
      .from("clinic_users")
      .select("id,full_name,full_name_ar,tenant_id")
      .eq("auth_user_id", user.id)
      .eq("tenant_id", tenantId)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("master_tenants")
      .select("clinic_name,clinic_name_ar,logo_url,address,country_code")
      .eq("id", tenantId)
      .maybeSingle(),
    permissions.includes("sessions:read") || permissions.includes("workspace:operation") || permissions.includes("workspace:clinical")
      ? getQueueStats()
      : Promise.resolve({ total_waiting: 0, total_in_consultation: 0, total_completed_today: 0, total_no_show_today: 0, avg_wait_time_minutes: 0, longest_wait_minutes: 0 }),
  ]);

  const appointmentQuery = permissions.includes("agenda:read")
    ? supabase
        .from("master_agenda_events")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("doctor_id", clinicUser?.id ?? "")
        .gte("scheduled_start", start)
        .lt("scheduled_start", end)
        .neq("status", "cancelled")
    : null;

  const appointmentsCount = appointmentQuery ? (await appointmentQuery).count ?? 0 : 0;
  const displayName = ar ? clinicUser?.full_name_ar || clinicUser?.full_name || user.email || "" : clinicUser?.full_name || user.email || "";
  const clinicName = ar ? tenant?.clinic_name_ar || tenant?.clinic_name || "ClinicSaaS" : tenant?.clinic_name || tenant?.clinic_name_ar || "ClinicSaaS";
  const hasWorkspace = permissions.includes("sessions:read") || permissions.includes("workspace:operation") || permissions.includes("workspace:clinical");
  const hasAttention = hasWorkspace && queueStats.total_waiting > 0;

  const metrics = [
    {
      icon: CalendarDays,
      label: ar ? "مواعيد اليوم" : "Today's appointments",
      value: appointmentsCount,
      description: ar ? "المواعيد المرتبطة بسياقك المهني اليوم." : "Appointments relevant to your professional context today.",
      href: clinicUser?.id ? `/agenda?doctorId=${encodeURIComponent(clinicUser.id)}` : "/agenda",
      show: permissions.includes("agenda:read"),
    },
    {
      icon: UsersRound,
      label: ar ? "المرضى في الانتظار" : "Patients waiting",
      value: queueStats.total_waiting,
      description: ar ? "حالة الانتظار الحالية في العيادة." : "Current waiting status across the clinic.",
      href: "/workspace",
      show: hasWorkspace,
    },
    {
      icon: Clock3,
      label: ar ? "قيد المعاينة" : "In clinical work",
      value: queueStats.total_in_consultation,
      description: ar ? "الجلسات الموجودة حاليًا في العمل السريري." : "Sessions currently in clinical work.",
      href: "/workspace",
      show: permissions.includes("sessions:read") || permissions.includes("workspace:clinical"),
    },
    {
      icon: CheckCircle2,
      label: ar ? "مكتمل اليوم" : "Completed today",
      value: queueStats.total_completed_today,
      description: ar ? "ما تم إنجازه ضمن يوم العمل الحالي." : "Completed work for the current clinic day.",
      href: "/workspace",
      show: permissions.includes("sessions:read") || permissions.includes("workspace:operation") || permissions.includes("workspace:clinical"),
    },
  ].filter((item) => item.show);

  return (
    <div className="cs-page-canvas mx-auto w-full max-w-[1600px] space-y-6" dir={ar ? "rtl" : "ltr"}>
      <HomeIdentityBanner
        isArabic={ar}
        clinicName={clinicName}
        clinicLogoUrl={tenant?.logo_url}
        displayName={displayName}
        hasWorkspace={hasWorkspace}
        weather={<HomeWeather address={tenant?.address} countryCode={tenant?.country_code} isArabic={ar} />}
      />

      {metrics.length > 0 ? (
        <section aria-labelledby="home-today-title">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="home-today-title" className="text-xl font-semibold tracking-tight text-[var(--cs-ink-950)]">{ar ? "اليوم" : "Today"}</h2>
              <p className="mt-1 text-sm text-[var(--cs-slate-500)]">{ar ? "لمحة عملية عن يومك الآن." : "A focused view of your working day right now."}</p>
            </div>
          </div>

          <div className="cs-surface overflow-hidden rounded-2xl">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Link
                  key={metric.label}
                  href={metric.href}
                  className={`cs-interactive group flex min-h-[76px] items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--cs-slate-50)] sm:px-5 ${index > 0 ? "border-t border-[var(--cs-slate-200)]" : ""}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--cs-azure-100)] text-[var(--cs-azure-700)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--cs-ink-950)]">{metric.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--cs-slate-500)]">{metric.description}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-2xl font-bold tabular-nums text-[var(--cs-ink-950)]">{metric.value}</span>
                    <span aria-hidden="true" className="hidden text-sm font-semibold text-[var(--cs-azure-600)] sm:block">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {hasAttention ? (
        <section aria-labelledby="home-attention-title" className="cs-surface rounded-2xl border-s-4 border-s-[var(--cs-cyan-600)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-cyan-700)]">{ar ? "انتباه" : "Attention"}</p>
              <h2 id="home-attention-title" className="mt-1 text-base font-semibold text-[var(--cs-ink-950)]">{ar ? `${queueStats.total_waiting} ${queueStats.total_waiting === 1 ? "مريض بانتظار الخدمة" : "مرضى بانتظار الخدمة"}` : `${queueStats.total_waiting} patient${queueStats.total_waiting === 1 ? "" : "s"} waiting`}</h2>
              <p className="mt-1 text-sm text-[var(--cs-slate-500)]">{ar ? "افتح مساحة العمل لمتابعة الطابور والإجراء التالي." : "Open Workspace to manage the queue and take the next action."}</p>
            </div>
            <HomeWorkspaceTransitionLink compact />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="home-destinations-title" className="grid gap-4 sm:grid-cols-2">
        <div className="cs-surface rounded-2xl p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cs-cyan-700)]">{ar ? "التالي" : "Next"}</p>
          <h2 id="home-destinations-title" className="mt-1 text-lg font-semibold text-[var(--cs-ink-950)]">{ar ? "انتقل إلى مكان العمل المناسب" : "Go to the right work surface"}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--cs-slate-500)]">{ar ? "تبقى التفاصيل التنفيذية داخل مساحة العمل والأنظمة المتخصصة، بينما تبقى الرئيسية بسيطة." : "Execution stays inside Workspace and specialist systems, while Home stays simple."}</p>
        </div>
        {hasWorkspace ? <div className="cs-surface cs-interactive rounded-2xl p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--cs-ink-950)]">{ar ? "مساحة العمل" : "Workspace"}</p><p className="mt-2 text-sm leading-6 text-[var(--cs-slate-500)]">{ar ? "ابدأ العمل الفعلي من السياق المناسب لك." : "Enter active work with the context relevant to you."}</p></div><HomeWorkspaceTransitionLink compact /></div></div> : null}
        {permissions.includes("agenda:read") ? (
          <Link href={clinicUser?.id ? `/agenda?doctorId=${encodeURIComponent(clinicUser.id)}` : "/agenda"} className="cs-surface cs-interactive rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-[var(--cs-ink-950)]">{ar ? "الجدول المرتبط بك" : "Your agenda context"}</p><p className="mt-2 text-sm leading-6 text-[var(--cs-slate-500)]">{ar ? "افتح Agenda مع الحفاظ على سياقك الحالي." : "Open Agenda while preserving your current context."}</p></div>
              <span aria-hidden="true" className="text-sm font-semibold text-[var(--cs-azure-600)]">→</span>
            </div>
          </Link>
        ) : null}
      </section>
    </div>
  );
}
