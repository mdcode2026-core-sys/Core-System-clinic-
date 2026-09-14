// src/app/(dashboard)/page.tsx
// Home is the ordinary clinic user's landing page. Workspace is a separate work surface.
// Home remains a general overview/awareness surface; Workspace remains the execution surface.

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  CalendarDays,
  Bell,
  MessageCircle,
  ClipboardList,
  UsersRound,
  BriefcaseBusiness,
} from "lucide-react";
import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { getQueueStats } from "@/domain/queue/queue.queries";
import {
  ExperienceContextCard,
  ExperienceIntro,
  ExperienceMetricLink,
  ExperiencePage,
} from "@/shared/components/ui/experience";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");

  const permissions = await getEffectivePermissions(user.id, tenantId);
  const locale =
    (await cookies()).get("core-system-locale")?.value === "ar" ? "ar" : "en";
  const ar = locale === "ar";
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  ).toISOString();

  const [{ count: appointmentsCount }, queueStats] = await Promise.all([
    permissions.includes("agenda:read")
      ? supabase
          .from("master_agenda_events")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId)
          .gte("scheduled_start", start)
          .lt("scheduled_start", end)
          .neq("status", "cancelled")
      : Promise.resolve({ count: null }),
    permissions.includes("sessions:read") ||
    permissions.includes("workspace:operation") ||
    permissions.includes("workspace:clinical")
      ? getQueueStats()
      : Promise.resolve({
          total_waiting: 0,
          total_in_consultation: 0,
          total_completed_today: 0,
          total_no_show_today: 0,
          avg_wait_time_minutes: 0,
          longest_wait_minutes: 0,
        }),
  ]);

  const cards = [
    {
      icon: CalendarDays,
      label: ar ? "مواعيد اليوم" : "Today's appointments",
      value: appointmentsCount ?? 0,
      href: "/agenda",
      show: permissions.includes("agenda:read"),
    },
    {
      icon: UsersRound,
      label: ar ? "المرضى في الانتظار" : "Patients waiting",
      value: queueStats.total_waiting,
      href: "/workspace",
      show:
        permissions.includes("sessions:read") ||
        permissions.includes("workspace:operation") ||
        permissions.includes("workspace:clinical"),
    },
    {
      icon: ClipboardList,
      label: ar ? "قيد المعاينة" : "In clinical work",
      value: queueStats.total_in_consultation,
      href: "/workspace",
      show:
        permissions.includes("sessions:read") ||
        permissions.includes("workspace:clinical"),
    },
    {
      icon: UsersRound,
      label: ar ? "مكتمل اليوم" : "Completed today",
      value: queueStats.total_completed_today,
      href: "/workspace",
      show:
        permissions.includes("sessions:read") ||
        permissions.includes("workspace:operation") ||
        permissions.includes("workspace:clinical"),
    },
  ].filter((card) => card.show);

  const contextLinks = [
    {
      icon: Bell,
      title: ar ? "التنبيهات والتذكيرات" : "Notifications & reminders",
      description: ar
        ? "معلومات مختصرة عن ما قد يحتاج انتباهك اليوم."
        : "A lightweight summary of items that may need your attention today.",
      href: null,
      show: true,
    },
    {
      icon: MessageCircle,
      title: ar ? "الاتصالات الداخلية" : "Internal communications",
      description: ar
        ? "الوصول إلى الاتصالات المصرح بها داخل العيادة."
        : "Access authorized internal clinic communications.",
      href: "/communications",
      show: permissions.includes("communications:read"),
    },
    {
      icon: BriefcaseBusiness,
      title: ar ? "مركز العمل" : "Work Center",
      description: ar
        ? "راجع الأعمال والطلبات المسندة إليك."
        : "Review assigned work and requests.",
      href: "/work-center",
      show: permissions.includes("work:read"),
    },
    {
      icon: UsersRound,
      title: ar ? "معلومات بوابة المريض" : "Patient Portal information",
      description: ar
        ? "الوصول إلى معلومات بوابة المريض المتاحة للنظام."
        : "Access available Patient Portal information.",
      href: "/portal",
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <ExperiencePage dir={ar ? "rtl" : "ltr"}>
      <ExperienceIntro>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {ar ? "نظرة عامة" : "Overview"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {ar ? "الرئيسية" : "Home"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {ar
            ? "راجع أهم ما يخص يومك، ثم انتقل مباشرة إلى مساحة العمل أو المجال المناسب لتنفيذ المهمة."
            : "Review what matters for your day, then go directly to the appropriate workspace or domain to do the work."}
        </p>
      </ExperienceIntro>

      {cards.length > 0 && (
        <section aria-labelledby="home-daily-context">
          <h2 id="home-daily-context" className="mb-3 text-lg font-semibold">
            {ar ? "اليوم" : "Today"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <ExperienceMetricLink
                  key={card.label}
                  href={card.href}
                  icon={<Icon className="h-5 w-5" aria-hidden="true" />}
                  value={card.value}
                  label={card.label}
                />
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="home-context">
        <h2 id="home-context" className="mb-3 text-lg font-semibold">
          {ar ? "معلومات العمل" : "Work context"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {contextLinks.map((item) => {
            const Icon = item.icon;
            return (
              <ExperienceContextCard
                key={item.title}
                href={item.href}
                icon={<Icon className="h-5 w-5" aria-hidden="true" />}
                title={item.title}
                description={item.description}
              />
            );
          })}
        </div>
      </section>
    </ExperiencePage>
  );
}
