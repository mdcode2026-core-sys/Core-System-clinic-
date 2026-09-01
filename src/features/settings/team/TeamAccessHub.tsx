"use client";

import { useState } from "react";
import { Users, ShieldCheck, FileText, UserCog } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissions } from "@/core/permissions/usePermissions";
import { UsersManager } from "@/features/settings/users/UsersManager";
import { RolesManager } from "@/features/settings/roles/RolesManager";
import { RoleTemplatesManager } from "@/features/settings/templates/RoleTemplatesManager";
import { OverridesManager } from "@/features/settings/overrides/OverridesManager";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export function TeamAccessHub() {
  const { locale } = useI18n();
  const { hasPermission } = usePermissions();
  const ar = locale === "ar";
  const [section, setSection] = useState<"members" | "roles" | "templates" | "overrides">("members");
  const items = [
    { id: "members" as const, icon: Users, label: ar ? "أعضاء الفريق" : "Team members", permission: "users:read", description: ar ? "الهوية، الدور، مساحة العمل، وحساب الدخول لكل عضو." : "Identity, role, workspace, and login account for every member." },
    { id: "roles" as const, icon: ShieldCheck, label: ar ? "الأدوار والصلاحيات" : "Roles & permissions", permission: "roles:read", description: ar ? "تعريف الأدوار الأساسية والصلاحيات التي تمنحها." : "Define roles and the baseline permissions they grant." },
    { id: "templates" as const, icon: FileText, label: ar ? "قوالب الأدوار" : "Role templates", permission: "templates:manage", description: ar ? "قوالب استرشادية قابلة للتعديل عند إنشاء الأدوار." : "Editable advisory templates for starting role configurations." },
    { id: "overrides" as const, icon: UserCog, label: ar ? "الوصول والاستثناءات" : "Access & overrides", permission: "overrides:manage", description: ar ? "منح أو سحب صلاحية محددة لمستخدم عند الحاجة." : "Explicit grants or revokes for individual users when needed." },
  ].filter(item => hasPermission(item.permission as any));

  return <div className="space-y-5" dir={ar ? "rtl" : "ltr"}>
    <div><h2 className="text-xl font-semibold">{ar ? "إدارة الفريق والوصول" : "Team & Access"}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{ar ? "نقطة إدارة واحدة لكل ما يتعلق بأعضاء العيادة: من إنشاء الحساب وتحديد الدور ومساحة العمل إلى إدارة نموذج الصلاحيات والاستثناءات." : "One management surface for clinic members: onboarding, login accounts, roles, workspaces, permissions, and exceptions."}</p></div>
    <div className="grid gap-3 md:grid-cols-4">{items.map(item => { const Icon = item.icon; const active = section === item.id; return <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`rounded-xl border p-4 text-start transition-colors ${active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50"}`}><div className="flex items-start gap-3"><div className={`rounded-lg p-2 ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><p className="font-semibold">{item.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></div></div></button>; })}</div>
    <Card><CardContent className="p-5">
      {section === "members" && <UsersManager />}
      {section === "roles" && <RolesManager />}
      {section === "templates" && <RoleTemplatesManager />}
      {section === "overrides" && <OverridesManager />}
      {items.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">{ar ? "لا توجد صلاحيات لإدارة الفريق." : "You do not have permission to manage team access."}</div>}
    </CardContent></Card>
  </div>;
}
