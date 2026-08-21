"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { ClinicProfileForm } from "@/features/settings/ClinicProfileForm";
import { RolesManager } from "@/features/settings/roles/RolesManager";
import { UsersManager } from "@/features/settings/users/UsersManager";
import { OverridesManager } from "@/features/settings/overrides/OverridesManager";

import { AuditLogManager } from "@/features/settings/audit";
import { SystemPreferencesManager } from "@/features/settings/system";
import { NotificationsManager } from "@/features/settings/notifications";
import { SubscriptionCenter } from "@/features/settings/subscriptions";
import { ProceduresManager } from "@/features/settings/procedures";
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  FileText,
  UserCog,
  Bell,
  CreditCard,
  ClipboardList,
  Settings,
  Stethoscope,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard, permission: null },
  { id: "clinic-profile", label: "ملف العيادة", icon: Building2, permission: "settings:read" },
  { id: "users", label: "المستخدمين", icon: Users, permission: "users:read" },
  { id: "roles", label: "الأدوار", icon: ShieldCheck, permission: "roles:read" },
  { id: "templates", label: "القوالب", icon: FileText, permission: "templates:manage" },
  { id: "overrides", label: "التجاوزات", icon: UserCog, permission: "overrides:manage" },
  { id: "notifications", label: "التنبيهات", icon: Bell, permission: "notifications:manage" },
  { id: "subscription", label: "الاشتراك", icon: CreditCard, permission: "subscription:read" },
  { id: "audit", label: "السجل", icon: ClipboardList, permission: "audit:read" },
  { id: "procedures", label: "الخدمات الطبية", icon: Stethoscope, permission: "procedures:read" },
  { id: "system", label: "النظام", icon: Settings, permission: "settings:update" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
      </div>
    );
  }

  const visibleTabs = tabs.filter((t) => t.permission === null || hasPermission(t.permission as any));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "clinic-profile" && <ClinicProfileForm />}
        {activeTab === "users" && <UsersManager />}
        {activeTab === "roles" && <RolesManager />}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "overrides" && <OverridesTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "subscription" && <SubscriptionTab />}
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "procedures" && <ProceduresTab />}
        {activeTab === "system" && <SystemPreferencesTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">نظرة عامة على الإعدادات</h2>
      <p className="text-muted-foreground">
        اختر قسماً من الأقسام أعلاه لإدارة إعدادات العيادة.
      </p>
    </div>
  );
}

function TemplatesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">قوالب الأدوار</h2>
      <p className="text-muted-foreground">
        تم دمج إدارة قوالب الأدوار في قسم{" "}
        <span className="font-medium text-foreground">&quot;الأدوار&quot;</span>.
        انتقل إلى تبويب &quot;الأدوار&quot; لإنشاء وإدارة الأدوار المخصصة وصلاحياتها.
      </p>
    </div>
  );
}

function OverridesTab() {
  return <OverridesManager />;
}

function NotificationsTab() {
  return <NotificationsManager />;
}

function SubscriptionTab() {
  return <SubscriptionCenter />;
}

function AuditTab() {
  return <AuditLogManager />;
}

function ProceduresTab() {
  return <ProceduresManager />;
}

function SystemPreferencesTab() {
  return <SystemPreferencesManager />;
}
