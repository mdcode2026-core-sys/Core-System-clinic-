import type { Locale } from "./messages";

export const rolesMessages = {
  ar: {
    system: "نظام",
    custom: "مخصص",
    permission: "صلاحية",
    noCustomPermissions: "لا توجد صلاحيات مخصصة لهذا الدور",
    editRoleDetails: "تعديل بيانات الدور",
    deleteRole: "حذف الدور",
    editPermissions: "تعديل الصلاحيات",
    viewPermissions: "عرض الصلاحيات",
  },
  en: {
    system: "System",
    custom: "Custom",
    permission: "permissions",
    noCustomPermissions: "No custom permissions for this role",
    editRoleDetails: "Edit role details",
    deleteRole: "Delete role",
    editPermissions: "Edit permissions",
    viewPermissions: "View permissions",
  },
} as const;

export function getRolesMessages(locale: Locale) { return rolesMessages[locale]; }
