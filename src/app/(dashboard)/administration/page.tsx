import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getAssignedWorkspace, workspaceRoute } from "@/core/workspace/currentWorkspace";
import { WorkspaceRenderer } from "@/features/workspace/WorkspaceRenderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

const shortcuts = [
  { key: "team", permission: "users:read", href: "/settings/team-access", ar: "الفريق والوصول", en: "Team & Access", descriptionAr: "إدارة أعضاء الفريق والوصول والصلاحيات.", descriptionEn: "Manage team membership, access and permissions." },
  { key: "clinic", permission: "settings:read", href: "/settings/clinic-profile", ar: "إعدادات العيادة", en: "Clinic Configuration", descriptionAr: "إعدادات العيادة والغرف والتكوين الأساسي.", descriptionEn: "Clinic profile, rooms and core configuration." },
  { key: "notifications", permission: "notifications:manage", href: "/settings/notifications", ar: "الإشعارات", en: "Notifications", descriptionAr: "إدارة قنوات وتفضيلات الإشعارات.", descriptionEn: "Manage notification channels and preferences." },
  { key: "subscription", permission: "subscription:read", href: "/settings/subscription", ar: "الاشتراك والقدرات", en: "Subscription & Capabilities", descriptionAr: "متابعة الاشتراك والقدرات المفعلة للعيادة.", descriptionEn: "Review subscription and enabled capabilities." },
  { key: "audit", permission: "audit:read", href: "/settings/audit", ar: "سجل التدقيق", en: "Audit Activity", descriptionAr: "مراجعة النشاط الإداري وسجل التدقيق.", descriptionEn: "Review administrative activity and audit history." },
  { key: "settings", permission: "settings:read", href: "/settings", ar: "مركز الإعدادات", en: "Settings Center", descriptionAr: "الوصول إلى إعدادات النظام التفصيلية.", descriptionEn: "Open the detailed system configuration center." },
] as const;

export default async function AdministrationWorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignedWorkspace = await getAssignedWorkspace(user.id);
  if (assignedWorkspace !== "administration") redirect(assignedWorkspace ? workspaceRoute(assignedWorkspace) : "/");

  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) redirect("/login");
  const permissions = await getEffectivePermissions(user.id, tenantId);
  const localeCookie = (await import("next/headers")).cookies;
  const locale = (await localeCookie()).get("core-system-locale")?.value === "ar" ? "ar" : "en";
  const availableShortcuts = shortcuts.filter((item) => permissions.includes(item.permission));

  return (
    <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <section className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{locale === "ar" ? "مركز إدارة العيادة" : "CLINIC ADMINISTRATION CONTROL CENTER"}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{locale === "ar" ? "إدارة العيادة" : "Clinic Administration"}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{locale === "ar" ? "متابعة صحة التشغيل، الفريق، الإعدادات، الاشتراك والنشاط الإداري من مساحة العمل المخصصة لك." : "Monitor clinic operations, team access, configuration, subscription and administrative activity from your assigned workspace."}</p>
      </section>

      {availableShortcuts.length > 0 && <section aria-labelledby="administration-shortcuts-heading">
        <div className="mb-3"><h2 id="administration-shortcuts-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{locale === "ar" ? "إجراءات الإدارة" : "Administration Shortcuts"}</h2></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {availableShortcuts.map((item) => <Link key={item.key} href={item.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base">{locale === "ar" ? item.ar : item.en}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{locale === "ar" ? item.descriptionAr : item.descriptionEn}</CardContent></Card>
          </Link>)}
        </div>
      </section>}

      <WorkspaceRenderer workspaceKey="administration" />
    </div>
  );
}
