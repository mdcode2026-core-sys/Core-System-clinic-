"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import {
  Building2,
  Users,
  Shield,
  FileText,
  Sliders,
  Bell,
  CreditCard,
  ClipboardList,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

type SettingsTab = 
  | "overview"
  | "clinic-profile"
  | "users"
  | "roles"
  | "templates"
  | "overrides"
  | "notifications"
  | "subscription"
  | "audit"
  | "system";

const tabs: { id: SettingsTab; label: string; labelAr: string; icon: React.ElementType; permission: string | null }[] = [
  { id: "overview", label: "Overview", labelAr: "نظرة عامة", icon: LayoutDashboard, permission: "settings:read" },
  { id: "clinic-profile", label: "Clinic Profile", labelAr: "ملف العيادة", icon: Building2, permission: "settings:read" },
  { id: "users", label: "Users", labelAr: "المستخدمون", icon: Users, permission: "users:read" },
  { id: "roles", label: "Roles & Permissions", labelAr: "الأدوار والصلاحيات", icon: Shield, permission: "roles:read" },
  { id: "templates", label: "Templates", labelAr: "القوالب", icon: FileText, permission: "templates:manage" },
  { id: "overrides", label: "Permission Overrides", labelAr: "تجاوزات الصلاحيات", icon: Sliders, permission: "overrides:manage" },
  { id: "notifications", label: "Notifications", labelAr: "التنبيهات", icon: Bell, permission: "notifications:manage" },
  { id: "subscription", label: "Subscription", labelAr: "الاشتراك", icon: CreditCard, permission: "subscription:read" },
  { id: "audit", label: "Audit / Activity", labelAr: "السجل والنشاط", icon: ClipboardList, permission: "audit:read" },
  { id: "system", label: "System Preferences", labelAr: "تفضيلات النظام", icon: Settings, permission: "settings:update" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const visibleTabs = tabs.filter((t) => t.permission === null || hasPermission(t.permission as any));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8 space-x-reverse overflow-x-auto" aria-label="Tabs">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.labelAr}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "clinic-profile" && <ClinicProfileTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "roles" && <RolesTab />}
        {activeTab === "templates" && <TemplatesTab />}
        {activeTab === "overrides" && <OverridesTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "subscription" && <SubscriptionTab />}
        {activeTab === "audit" && <AuditTab />}
        {activeTab === "system" && <SystemPreferencesTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">نظرة عامة على الإعدادات</h2>
      <p className="text-muted-foreground">اختر قسماً من الأقسام أعلاه لإدارة إعدادات العيادة.</p>
    </div>
  );
}

function ClinicProfileTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">ملف العيادة</h2>
      <p className="text-muted-foreground">M2.1 — Clinic Profile implementation placeholder.</p>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">إدارة المستخدمين</h2>
      <p className="text-muted-foreground">M2.3 — User Management implementation placeholder.</p>
    </div>
  );
}

function RolesTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">الأدوار والصلاحيات</h2>
      <p className="text-muted-foreground">M2.2 — Roles & Permissions implementation placeholder.</p>
    </div>
  );
}

function TemplatesTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">قوالب الصلاحيات المخصصة</h2>
      <p className="text-muted-foreground">M2.5 — Custom Templates implementation placeholder.</p>
    </div>
  );
}

function OverridesTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">تجاوزات الصلاحيات الفردية</h2>
      <p className="text-muted-foreground">M2.4 — Permission Overrides implementation placeholder.</p>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">تفضيلات التنبيهات</h2>
      <p className="text-muted-foreground">M2.7 — Notification Preferences implementation placeholder.</p>
    </div>
  );
}

function SubscriptionTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">مركز الاشتراك</h2>
      <p className="text-muted-foreground">M2.8 — Subscription Center implementation placeholder.</p>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">سجل النشاط والتدقيق</h2>
      <p className="text-muted-foreground">M2.9 — Audit / Activity implementation placeholder.</p>
    </div>
  );
}

function SystemPreferencesTab() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">تفضيلات النظام</h2>
      <p className="text-muted-foreground">M2.6 — System Preferences (integrated into M2.1) placeholder.</p>
    </div>
  );
}
