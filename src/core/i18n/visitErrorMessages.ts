import type { Locale } from "./messages";

const visitErrors = {
  ar: {
    NOT_AUTHENTICATED: "انتهت جلسة المصادقة. يرجى تسجيل الدخول مرة أخرى.",
    NO_TENANT: "لم يتم تعيين عيادة لهذا المستخدم.",
    PERMISSION_DENIED: "ليس لديك الصلاحية لتنفيذ هذا الإجراء.",
    PROCEDURE_FETCH_FAILED: "تعذر تحميل الإجراءات الطبية.",
    EMPTY_DOCUMENTATION: "لا يمكن حفظ الزيارة بدون توثيق سريري.",
    VISIT_SAVE_FAILED: "تعذر حفظ الزيارة.",
    INVALID_QUANTITY: "يجب أن تكون الكمية عدداً صحيحاً موجباً.",
    VISIT_NOT_ACTIVE: "الزيارة ليست نشطة حالياً.",
    PROCEDURE_SAVE_FAILED: "تعذر حفظ الإجراء.",
    PROCEDURE_REMOVE_FAILED: "تعذر إزالة الإجراء.",
    UNKNOWN: "تعذر إكمال العملية."
  },
  en: {
    NOT_AUTHENTICATED: "Your authentication session has expired. Please sign in again.",
    NO_TENANT: "No clinic is assigned to this user.",
    PERMISSION_DENIED: "You do not have permission to perform this action.",
    PROCEDURE_FETCH_FAILED: "Unable to load clinical procedures.",
    EMPTY_DOCUMENTATION: "The visit cannot be saved without clinical documentation.",
    VISIT_SAVE_FAILED: "Unable to save the visit.",
    INVALID_QUANTITY: "Quantity must be a positive integer.",
    VISIT_NOT_ACTIVE: "The visit is not currently active.",
    PROCEDURE_SAVE_FAILED: "Unable to save the procedure.",
    PROCEDURE_REMOVE_FAILED: "Unable to remove the procedure.",
    UNKNOWN: "The operation could not be completed."
  }
} as const satisfies Record<Locale, Record<string, string>>;

export function getVisitErrorMessage(locale: Locale, code: string | null | undefined) {
  return visitErrors[locale][code as keyof typeof visitErrors[typeof locale]] ?? visitErrors[locale].UNKNOWN;
}
