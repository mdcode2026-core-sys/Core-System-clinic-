"use client";

import { useState } from "react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { ClinicProfileForm } from "@/features/settings/ClinicProfileForm";

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
    <div className="space-y-6" dir="rtl">
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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">نظرة عامة على الإعدادات</h2>
      <p className="text-muted-foreground">
        اختر قسماً من الأقسام أعلاه لإدارة إعدادات العيادة.
      </p>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">إدارة المستخدمين</h2>
      <p className="text-muted-foreground">M2.3 — User Management implementation placeholder.</p>
    </div>
  );
}

function RolesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">الأدوار والصلاحيات</h2>
      <p className="text-muted-foreground">M2.2 — Roles & Permissions implementation placeholder.</p>
    </div>
  );
}

function TemplatesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">قوالب الصلاحيات المخصصة</h2>
      <p className="text-muted-foreground">M2.5 — Custom Templates implementation placeholder.</p>
    </div>
  );
}

function OverridesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">تجاوزات الصلاحيات الفردية</h2>
      <p className="text-muted-foreground">M2.4 — Permission Overrides implementation placeholder.</p>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">تفضيلات التنبيهات</h2>
      <p className="text-muted-foreground">M2.7 — Notification Preferences implementation placeholder.</p>
    </div>
  );
}

function SubscriptionTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">مركز الاشتراك</h2>
      <p className="text-muted-foreground">M2.8 — Subscription Center implementation placeholder.</p>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">سجل النشاط والتدقيق</h2>
      <p className="text-muted-foreground">M2.9 — Audit / Activity implementation placeholder.</p>
    </div>
  );
}

function SystemPreferencesTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">تفضيلات النظام</h2>
      <p className="text-muted-foreground">M2.6 — System Preferences (integrated into M2.1) placeholder.</p>
    </div>
  );
}
