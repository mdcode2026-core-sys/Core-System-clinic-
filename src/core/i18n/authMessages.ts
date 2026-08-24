import type { Locale } from "./messages";

export const authMessages = {
  ar: { login: "تسجيل الدخول", email: "البريد الإلكتروني", password: "كلمة المرور", loading: "جاري الدخول...", submit: "دخول", registerPrompt: "ليس لديك حساب؟ سجل الآن", pageLoading: "جاري التحميل...", register: "إنشاء حساب جديد", fullName: "الاسم الكامل", clinicName: "اسم العيادة", fullNamePlaceholder: "محمد أحمد", clinicNamePlaceholder: "عيادة النور", createLoading: "جاري الإنشاء...", createSubmit: "إنشاء حساب", haveAccount: "لديك حساب؟ سجل الدخول" },
  en: { login: "Sign in", email: "Email", password: "Password", loading: "Signing in...", submit: "Sign in", registerPrompt: "Don't have an account? Register now", pageLoading: "Loading...", register: "Create account", fullName: "Full name", clinicName: "Clinic name", fullNamePlaceholder: "John Smith", clinicNamePlaceholder: "Example Clinic", createLoading: "Creating...", createSubmit: "Create account", haveAccount: "Already have an account? Sign in" },
} as const satisfies Record<Locale, unknown>;
export function getAuthMessages(locale: Locale) { return authMessages[locale]; }
