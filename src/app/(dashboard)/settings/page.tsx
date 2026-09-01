"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import { ClinicProfileForm } from "@/features/settings/ClinicProfileForm";
import { TeamAccessHub } from "@/features/settings/team/TeamAccessHub";
import { AuditLogManager } from "@/features/settings/audit";
import { SystemPreferencesManager } from "@/features/settings/system";
import { NotificationsManager } from "@/features/settings/notifications";
import { SubscriptionCenter } from "@/features/settings/subscriptions";
import { ProceduresManager } from "@/features/settings/procedures";
import { RoomsManager } from "@/features/settings/rooms";
import { UserSettingsManager } from "@/features/settings/user/UserSettingsManager";
import { LayoutDashboard, Building2, ShieldCheck, Bell, CreditCard, ClipboardList, Settings, Stethoscope, DoorOpen, UserRound, Search, ChevronRight, ChevronLeft, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

const tabs = [
  { id: "overview", icon: LayoutDashboard, permission: null, key: "overview", group: "overview" },
  { id: "clinic-profile", icon: Building2, permission: "settings:read", key: "clinic", group: "clinic" },
  { id: "rooms", icon: DoorOpen, permission: "settings:read", key: "rooms", group: "clinic" },
  { id: "team-access", icon: ShieldCheck, permission: "settings:read", key: "teamAccess", group: "team" },
  { id: "user-settings", icon: UserRound, permission: null, key: "user", group: "personal" },
  { id: "notifications", icon: Bell, permission: "notifications:manage", key: "notifications", group: "system" },
  { id: "system", icon: Settings, permission: "settings:update", key: "preferences", group: "system" },
  { id: "subscription", icon: CreditCard, permission: "subscription:read", key: "subscription", group: "subscription" },
  { id: "audit", icon: ClipboardList, permission: "audit:read", key: "audit", group: "audit" },
  { id: "procedures", icon: Stethoscope, permission: "procedures:read", key: "procedures", group: "master" },
] as const;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [search, setSearch] = useState("");
  const { hasPermission, isLoading } = usePermissions();
  const { admin: a, locale } = useI18n();
  const ar = locale === "ar";

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="ms-3 text-muted-foreground">{a.users.loading}</span></div>;

  const visible = tabs.filter(tab => tab.permission === null || hasPermission(tab.permission as any));
  const visibleIds = new Set<string>(visible.map(tab => tab.id));
  const labels: Record<string, string> = ar ? {
    overview: "نظرة عامة", clinic: "ملف العيادة", rooms: "الغرف والموارد", teamAccess: "الفريق والوصول", user: "إعداداتي", notifications: "الإشعارات", preferences: "تفضيلات النظام", subscription: "الاشتراك", audit: "التدقيق والنشاط", procedures: "الخدمات والإجراءات",
  } : {
    overview: "Overview", clinic: "Clinic Profile", rooms: "Rooms & Resources", teamAccess: "Team & Access", user: "My Settings", notifications: "Notifications", preferences: "System Preferences", subscription: "Subscription", audit: "Audit & Activity", procedures: "Services & Procedures",
  };

  const groups = [
    { id: "clinic", title: ar ? "العيادة والموارد" : "Clinic & Resources" },
    { id: "team", title: ar ? "الفريق والوصول" : "Team & Access" },
    { id: "system", title: ar ? "النظام والتفضيلات" : "System & Preferences" },
    { id: "subscription", title: ar ? "الاشتراك" : "Subscription" },
    { id: "audit", title: ar ? "التدقيق والنشاط" : "Audit & Activity" },
    { id: "master", title: ar ? "المكتبة الطبية والخدمات" : "Medical Master & Services" },
    { id: "personal", title: ar ? "شخصي" : "Personal" },
  ];

  const matchesSearch = (tab: (typeof tabs)[number]) => {
    if (!search.trim()) return true;
    const q = search.trim().toLocaleLowerCase(ar ? "ar" : "en");
    return `${labels[tab.key] ?? tab.key} ${tab.id}`.toLocaleLowerCase(ar ? "ar" : "en").includes(q);
  };
  const filteredGroups = groups.map(group => ({ ...group, tabs: visible.filter(tab => tab.group === group.id && matchesSearch(tab)) })).filter(group => group.tabs.length > 0);
  const overviewCards = [
    { id: "clinic-profile", icon: Building2, title: ar ? "العيادة" : "Clinic", description: ar ? "هوية العيادة وبياناتها الأساسية والموارد المرتبطة بها." : "Clinic identity, profile, and operational resources.", action: labels.clinic },
    { id: "team-access", icon: ShieldCheck, title: labels.teamAccess, description: ar ? "إنشاء وإدارة أعضاء الفريق وحساباتهم وأدوارهم ومساحات عملهم وصلاحياتهم." : "Create and manage team members, login accounts, roles, workspaces, and access.", action: labels.teamAccess },
    { id: "system", icon: SlidersHorizontal, title: ar ? "النظام" : "System", description: ar ? "اللغة والمنطقة والتفضيلات والإشعارات." : "Language, regional preferences, notifications, and system behavior.", action: labels.preferences },
    { id: "subscription", icon: CreditCard, title: ar ? "الاشتراك" : "Subscription", description: ar ? "خطة العيادة والاشتراك والقدرات المتاحة." : "Clinic plan, subscription, and enabled capabilities.", action: labels.subscription },
    { id: "audit", icon: ClipboardList, title: ar ? "التدقيق والنشاط" : "Audit & Activity", description: ar ? "مراجعة الأنشطة والتغييرات القابلة للتدقيق." : "Review auditable activity and configuration changes.", action: labels.audit },
    { id: "procedures", icon: Stethoscope, title: ar ? "الخدمات والإجراءات" : "Services & Procedures", description: ar ? "الوصول إلى مكتبة الخدمات والإجراءات الطبية." : "Access the medical service and procedure catalog.", action: labels.procedures },
  ].filter(card => visibleIds.has(card.id));

  const activeLabel = labels[visible.find(tab => tab.id === activeTab)?.key ?? "overview"];
  const navigate = (id: string) => { if (visibleIds.has(id)) setActiveTab(id); };

  return <div className="space-y-5" dir={ar ? "rtl" : "ltr"}>
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-medium text-muted-foreground">{ar ? "الإدارة" : "Administration"}</p><h1 className="mt-1 text-2xl font-bold tracking-tight">{a.settings.title}</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{ar ? "إدارة إعدادات العيادة والفريق والنظام من مساحة واحدة واضحة." : "Manage clinic, team, and system settings from one clear administration space."}</p></div><div className="relative w-full lg:w-80"><Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={ar ? "ابحث في الإعدادات..." : "Search settings..."} className="ps-9" aria-label={ar ? "البحث في الإعدادات" : "Search settings"} /></div></div>
    <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="rounded-xl border bg-card p-2 lg:sticky lg:top-4 lg:self-start" aria-label={ar ? "تنقل الإعدادات" : "Settings navigation"}>
        <button onClick={() => navigate("overview")} className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${activeTab === "overview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><LayoutDashboard className="h-4 w-4 shrink-0" /><span>{labels.overview}</span></button>
        <div className="space-y-4 px-1 py-2">{filteredGroups.map(group => <div key={group.id}><p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</p><div className="space-y-0.5">{group.tabs.map(tab => { const Icon = tab.icon; const active = activeTab === tab.id; return <button key={tab.id} onClick={() => navigate(tab.id)} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm ${active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} aria-current={active ? "page" : undefined}><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{labels[tab.key]}</span></button>; })}</div></div>)}</div>
      </aside>
      <main className="min-w-0 space-y-5">
        {activeTab === "overview" && <><Card><CardContent className="p-6"><div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold">{ar ? "مركز إدارة العيادة" : "Clinic administration"}</h2><p className="mt-1 text-sm text-muted-foreground">{ar ? "ابدأ من القسم الذي تريد إدارته. تظهر هنا فقط المساحات التي تملك صلاحية الوصول إليها." : "Start with the area you want to manage. Only sections you are authorized to access are shown."}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{ar ? "مساحة الإدارة" : "Administration"}</span></div></CardContent></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{overviewCards.map(card => { const Icon = card.icon; return <Card key={card.id} className="transition-shadow hover:shadow-sm"><CardContent className="flex h-full flex-col p-5"><div className="flex items-start gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div><div className="min-w-0"><h3 className="font-semibold">{card.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{card.description}</p></div></div><button onClick={() => navigate(card.id)} className="mt-5 inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline"><span>{card.action}</span>{ar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button></CardContent></Card>; })}</div></>}
        {activeTab === "team-access" && <TeamAccessHub />}
        {activeTab === "clinic-profile" && <ClinicProfileForm />}
        {activeTab === "notifications" && <NotificationsManager />}
        {activeTab === "subscription" && <SubscriptionCenter />}
        {activeTab === "audit" && <AuditLogManager />}
        {activeTab === "procedures" && <ProceduresManager />}
        {activeTab === "rooms" && <RoomsManager />}
        {activeTab === "system" && <SystemPreferencesManager />}
        {activeTab === "user-settings" && <UserSettingsManager />}
        {activeTab !== "overview" && activeTab !== "team-access" && !visibleIds.has(activeTab) && <Card><CardContent className="p-6 text-sm text-muted-foreground">{ar ? "لا توجد صلاحية للوصول إلى هذا القسم." : "You do not have permission to access this section."}</CardContent></Card>}
        {activeTab !== "overview" && activeTab !== "team-access" && visibleIds.has(activeTab) && <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{ar ? "الإعدادات" : "Settings"}</span><span>/</span><span>{activeLabel}</span></div>}
      </main>
    </div>
  </div>;
}
