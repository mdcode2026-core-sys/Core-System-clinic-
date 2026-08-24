import type { Locale } from "./messages";

export type RoleErrorCode =
  | "UNAUTHORIZED"
  | "TENANT_RESOLUTION_FAILED"
  | "PERMISSION_DENIED"
  | "ROLE_NOT_FOUND"
  | "SYSTEM_ROLE_IMMUTABLE"
  | "ROLE_WRONG_TENANT"
  | "PERMISSIONS_VALIDATION_FAILED"
  | "ROLE_PERMISSIONS_UPDATE_FAILED"
  | "ROLE_PERMISSIONS_SAVE_FAILED"
  | "ROLE_KEY_TOO_SHORT"
  | "ROLE_KEY_INVALID"
  | "ROLE_KEY_VALIDATION_FAILED"
  | "ROLE_KEY_EXISTS"
  | "ROLE_CREATE_FAILED"
  | "ROLE_PERMISSION_ASSIGN_FAILED"
  | "ROLE_UPDATE_FAILED"
  | "ROLE_DELETE_FAILED"
  | "ROLE_USAGE_CHECK_FAILED"
  | "ROLE_IN_USE"
  | "UNKNOWN";

const messages: Record<Locale, Record<RoleErrorCode, string>> = {
  ar: {
    UNAUTHORIZED: "يرجى تسجيل الدخول للمتابعة.", TENANT_RESOLUTION_FAILED: "تعذر تحديد العيادة الحالية.", PERMISSION_DENIED: "ليس لديك الصلاحية المطلوبة لتنفيذ هذه العملية.", ROLE_NOT_FOUND: "لم يتم العثور على الدور.", SYSTEM_ROLE_IMMUTABLE: "لا يمكن تعديل أو حذف أدوار النظام.", ROLE_WRONG_TENANT: "هذا الدور لا ينتمي إلى العيادة الحالية.", PERMISSIONS_VALIDATION_FAILED: "تعذر التحقق من الصلاحيات.", ROLE_PERMISSIONS_UPDATE_FAILED: "تعذر تحديث صلاحيات الدور.", ROLE_PERMISSIONS_SAVE_FAILED: "تعذر حفظ صلاحيات الدور.", ROLE_KEY_TOO_SHORT: "يجب أن يتكون مفتاح الدور من حرفين على الأقل.", ROLE_KEY_INVALID: "يمكن أن يحتوي مفتاح الدور على الأحرف الإنجليزية الصغيرة والأرقام والشرطة السفلية فقط.", ROLE_KEY_VALIDATION_FAILED: "تعذر التحقق من مفتاح الدور.", ROLE_KEY_EXISTS: "يوجد دور بهذا المفتاح بالفعل في العيادة.", ROLE_CREATE_FAILED: "تعذر إنشاء الدور.", ROLE_PERMISSION_ASSIGN_FAILED: "تعذر تعيين الصلاحيات الأولية للدور.", ROLE_UPDATE_FAILED: "تعذر تحديث الدور.", ROLE_DELETE_FAILED: "تعذر حذف الدور.", ROLE_USAGE_CHECK_FAILED: "تعذر التحقق من استخدام الدور.", ROLE_IN_USE: "لا يمكن حذف هذا الدور لأنه مخصص لمستخدمين حاليين. يرجى إعادة تعيين المستخدمين إلى دور آخر أولاً.", UNKNOWN: "حدث خطأ غير متوقع." },
  en: {
    UNAUTHORIZED: "Please sign in to continue.", TENANT_RESOLUTION_FAILED: "The current clinic could not be resolved.", PERMISSION_DENIED: "You do not have the required permission for this action.", ROLE_NOT_FOUND: "The role was not found.", SYSTEM_ROLE_IMMUTABLE: "System roles cannot be modified or deleted.", ROLE_WRONG_TENANT: "This role does not belong to the current clinic.", PERMISSIONS_VALIDATION_FAILED: "The permissions could not be validated.", ROLE_PERMISSIONS_UPDATE_FAILED: "The role permissions could not be updated.", ROLE_PERMISSIONS_SAVE_FAILED: "The role permissions could not be saved.", ROLE_KEY_TOO_SHORT: "The role key must be at least 2 characters.", ROLE_KEY_INVALID: "The role key may contain only lowercase letters, numbers, and underscores.", ROLE_KEY_VALIDATION_FAILED: "The role key could not be validated.", ROLE_KEY_EXISTS: "A role with this key already exists in your clinic.", ROLE_CREATE_FAILED: "The role could not be created.", ROLE_PERMISSION_ASSIGN_FAILED: "The role's initial permissions could not be assigned.", ROLE_UPDATE_FAILED: "The role could not be updated.", ROLE_DELETE_FAILED: "The role could not be deleted.", ROLE_USAGE_CHECK_FAILED: "Role usage could not be checked.", ROLE_IN_USE: "This role cannot be deleted because it is assigned to current users. Reassign those users to another role first.", UNKNOWN: "An unexpected error occurred." },
};

export function getRoleErrorMessage(locale: Locale, code: string | null | undefined) {
  return messages[locale][code as RoleErrorCode] ?? messages[locale].UNKNOWN;
}
