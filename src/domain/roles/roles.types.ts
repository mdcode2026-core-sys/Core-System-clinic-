"use client";

import type { Permission } from "@/core/permissions/types";

/**
 * M2.2 — Roles & Permissions Types
 *
 * Architecture per ADR-001:
 * - is_system_role = true  → CORE SYSTEM provided template (immutable)
 * - is_system_role = false + tenant_id set → tenant-customized role
 * - role_template_id on clinic_users links a user to their role configuration
 */

export interface Role {
  id: string;
  role_key: string;
  role_name: string;
  role_name_ar: string | null;
  description: string | null;
  is_system_role: boolean;
  tenant_id: string | null;
  created_at: string | null;
}

export interface PermissionRow {
  id: string;
  permission_key: Permission;
  permission_name: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  permission_key: Permission;
  permission_name: string;
  resource: string;
  action: string;
}

export interface RoleWithPermissions extends Role {
  permissions: PermissionRow[];
}

export interface UpdateRolePermissionsInput {
  roleId: string;
  permissionIds: string[];
}

/**
 * Human-readable permission groups for UI display.
 * Maps resource → { labelAr, icon?, description? }
 */
export const PERMISSION_GROUPS: Record<string, { labelAr: string; description?: string }> = {
  patients: { labelAr: "المرضى", description: "إدارة سجلات المرضى" },
  sessions: { labelAr: "الجلسات", description: "إدارة الجلسات والزيارات" },
  agenda: { labelAr: "الأجندة", description: "المواعيد والتقويم" },
  invoices: { labelAr: "الفواتير", description: "الفوترة والمدفوعات" },
  inventory: { labelAr: "المخزون", description: "إدارة المخزون والمستلزمات" },
  analytics: { labelAr: "التحليلات", description: "التقارير التحليلية" },
  users: { labelAr: "المستخدمين", description: "إدارة مستخدمي العيادة" },
  settings: { labelAr: "الإعدادات", description: "إعدادات العيادة" },
  audit: { labelAr: "السجل", description: "سجل النشاط والتدقيق" },
  reports: { labelAr: "التقارير", description: "التقارير التشغيلية" },
  followup: { labelAr: "المتابعة", description: "متابعة ما بعد الزيارة" },
  roles: { labelAr: "الأدوار", description: "إدارة الأدوار والصلاحيات" },
  templates: { labelAr: "القوالب", description: "قوالب الصلاحيات" },
  overrides: { labelAr: "التجاوزات", description: "تجاوزات الصلاحيات الفردية" },
  subscription: { labelAr: "الاشتراك", description: "معلومات الاشتراك" },
  notifications: { labelAr: "التنبيهات", description: "إعدادات التنبيهات" },
};

/**
 * Action labels in Arabic for UI display
 */
export const ACTION_LABELS: Record<string, string> = {
  read: "عرض",
  create: "إنشاء",
  update: "تعديل",
  delete: "حذف",
  manage: "إدارة",
};
