import type { Locale } from "./messages";

export const auditMessages = {
  ar: {
    searchLabel: "بحث", searchPlaceholder: "الإجراء أو الجدول أو السبب...", allActions: "كل الإجراءات", allTables: "كل الجداول", from: "من", to: "إلى", clearFilters: "مسح الفلاتر", record: "السجل", previous: "السابق", next: "التالي",
    actions: { create: "إنشاء", insert: "إنشاء", update: "تعديل", edit: "تعديل", delete: "حذف", remove: "حذف", login: "دخول" },
    unknownAction: "إجراء غير معروف", unknownResource: "مورد آخر", unknownRole: "دور غير معروف",
    roles: { super_admin: "مدير المنصة", clinic_admin: "مدير العيادة", doctor: "طبيب", nurse: "تمريض", receptionist: "استقبال", accounting: "محاسبة" },
    resources: { patients: "المرضى", appointments: "المواعيد", clinic_users: "مستخدمو العيادة", roles: "الأدوار", permissions: "الصلاحيات", role_permissions: "صلاحيات الأدوار", audit_trail: "سجل النشاط", master_tenants: "العيادات", invoices: "الفواتير", inventory_items: "أصناف المخزون", inventory_transactions: "حركات المخزون", treatment_plans: "خطط العلاج", treatment_plan_items: "عناصر خطط العلاج", medical_files: "الملفات الطبية", follow_ups: "المتابعات", notifications: "التنبيهات", notification_preferences: "تفضيلات التنبيهات" }
  },
  en: {
    searchLabel: "Search", searchPlaceholder: "Action, table, reason...", allActions: "All actions", allTables: "All tables", from: "From", to: "To", clearFilters: "Clear filters", record: "Record", previous: "Previous", next: "Next",
    actions: { create: "Create", insert: "Create", update: "Update", edit: "Update", delete: "Delete", remove: "Delete", login: "Login" },
    unknownAction: "Other action", unknownResource: "Other resource", unknownRole: "Other role",
    roles: { super_admin: "Platform Admin", clinic_admin: "Clinic Admin", doctor: "Doctor", nurse: "Nurse", receptionist: "Reception", accounting: "Accounting" },
    resources: { patients: "Patients", appointments: "Appointments", clinic_users: "Clinic Users", roles: "Roles", permissions: "Permissions", role_permissions: "Role Permissions", audit_trail: "Activity Log", master_tenants: "Clinics", invoices: "Invoices", inventory_items: "Inventory Items", inventory_transactions: "Inventory Transactions", treatment_plans: "Treatment Plans", treatment_plan_items: "Treatment Plan Items", medical_files: "Medical Files", follow_ups: "Follow-ups", notifications: "Notifications", notification_preferences: "Notification Preferences" }
  }
} as const satisfies Record<Locale, unknown>;

export function getAuditMessages(locale: Locale) { return auditMessages[locale]; }
