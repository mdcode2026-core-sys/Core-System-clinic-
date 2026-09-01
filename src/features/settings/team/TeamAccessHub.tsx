"use client";

import { useState } from "react";
import { ShieldCheck, Users, Settings2, FileText, UserCog, KeyRound, BriefcaseBusiness } from "lucide-react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { usePermissions } from "@/core/permissions/usePermissions";
import { UnifiedUsersManager } from "@/features/settings/users/UnifiedUsersManager";
import { RolesManager } from "@/features/settings/roles/RolesManager";
import { RoleTemplatesManager } from "@/features/settings/templates/RoleTemplatesManager";
import { OverridesManager } from "@/features/settings/overrides/OverridesManager";
import { UserSettingsManager } from "@/features/settings/user/UserSettingsManager";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export function TeamAccessHub() {
  const { locale } = useI18n();
  const { hasPermission } = usePermissions();
  const ar = locale === "ar";
  const [section, setSection] = useState<"users" | "roles" | "advanced">("users");
  const [advancedTool, setAdvancedTool] = useState<"access" | "templates" | "settings" | "lifecycle">("access");
  const topItems = [
    { id: "users" as const, icon: Users, label: ar ? "المستخدمون" : "Users", permission: "users:read" },
    { id: "roles" as const, icon: ShieldCheck, label: ar ? "الأدوار" : "Roles", permission: "roles:read" },
    { id: "advanced" as const, icon: Settings2, label: ar ? "الإعدادات المتقدمة" : "Advanced", permission: "users:read" },
  ].filter(item => hasPermission(item.permission as any));
  const advancedItems = [
    { id: "access" as const, icon: UserCog, label: ar ? "إدارة الوصول والاستثناءات" : "Access administration", description: ar ? "الصلاحيات المباشرة والاستثناءات الفردية." : "Direct permissions and explicit user overrides.", permission: "overrides:manage" },
    { id: "templates" as const, icon: FileText, label: ar ? "قوالب الأدوار" : "Role templates", description: ar ? "قوالب استرشادية قابلة للتعديل." : "Editable advisory role templates.", permission: "templates:manage" },
    { id: "settings" as const, icon: Settings2, label: ar ? "إعدادات المستخدم الشخصية" : "User settings", description: ar ? "تفضيلات العرض الشخصية تبقى منفصلة عن الصلاحيات." : "Personal display preferences remain separate from authorization.", permission: null },
    { id: "lifecycle" as const, icon: KeyRound, label: ar ? "دورة حساب الدخول" : "Login lifecycle", description: ar ? "الدعوة وإعادة التفعيل تتم من ملف المستخدم نفسه." : "Invitation and reactivation are managed from the user's profile.", permission: "users:update" },
  ].filter(item => item.permission === null || hasPermission(item.permission as any));

  return <div className="space-y-5" dir={ar ? "rtl" : "ltr"}>
    <div><h2 className="text-xl font-semibold">{ar ? "إدارة الفريق والوصول" : "Team & Access"}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{ar ? "المستخدم هو نقطة التكوين الأساسية، والأدوار مستقلة، والإدارة المتقدمة تجمع أدوات الوصول المتقدمة دون تكرار المسارات." : "Users are the primary configuration point, roles remain independent, and Advanced groups deep access administration without duplicating workflows."}</p></div>
    <div className="grid gap-3 md:grid-cols-3">{topItems.map(item => { const Icon = item.icon; const active = section === item.id; return <button key={item.id} type="button" onClick={() => setSection(item.id)} className={`rounded-xl border p-4 text-start transition-colors ${active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50"}`}><div className="flex items-center gap-3"><div className="rounded-lg bg-muted p-2"><Icon className="h-5 w-5" /></div><span className="font-semibold">{item.label}</span></div></button>; })}</div>
    {section === "users" && <Card><CardContent className="p-5"><UnifiedUsersManager /></CardContent></Card>}
    {section === "roles" && <Card><CardContent className="p-5"><RolesManager /></CardContent></Card>}
    {section === "advanced" && <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{advancedItems.map(item => { const Icon = item.icon; const active = advancedTool === item.id; return <button key={item.id} type="button" onClick={() => setAdvancedTool(item.id)} className={`rounded-xl border p-4 text-start ${active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50"}`}><div className="flex items-start gap-3"><Icon className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">{item.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></div></div></button>; })}</div>
      <Card><CardContent className="p-5">
        {advancedTool === "access" && <OverridesManager />}
        {advancedTool === "templates" && <RoleTemplatesManager />}
        {advancedTool === "settings" && <UserSettingsManager />}
        {advancedTool === "lifecycle" && <div className="space-y-4"><div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4"><KeyRound className="mt-0.5 h-5 w-5" /><div><h3 className="font-semibold">{ar ? "دعوة وإعادة تفعيل الدخول" : "Invitation & reactivation"}</h3><p className="mt-1 text-sm text-muted-foreground">{ar ? "لا توجد شاشة ثانية لإعداد المستخدم. إنشاء الدعوة وإعادة التفعيل من User Form / Users يحافظان على مسار واحد ويستخدمان Supabase Auth وكلمة المرور التي يحددها المستخدم." : "There is no second user-setup screen. Invitation and reactivation stay in Users/User Form and use Supabase Auth with a password chosen by the user."}</p></div></div><div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4"><BriefcaseBusiness className="mt-0.5 h-5 w-5" /><div><h3 className="font-semibold">{ar ? "عضوية مساحات العمل" : "Workspace membership"}</h3><p className="mt-1 text-sm text-muted-foreground">{ar ? "يتم تعيين مساحة العمل داخل User Form، وتبقى العضوية مستقلة عن الدور والصلاحيات. لا توجد شاشة CRUD مكررة لها." : "Workspace membership is assigned in the User Form and remains independent from role and permissions. No duplicate CRUD surface is created."}</p></div></div></div>}
      </CardContent></Card>
    </>}
  </div>;
}