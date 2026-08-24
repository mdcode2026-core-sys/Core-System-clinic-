import type { Locale } from "./messages";

export const authMessages = {
  ar: { login: "تسجيل الدخول", email: "البريد الإلكتروني", password: "كلمة المرور", loading: "جاري الدخول...", submit: "دخول", registerPrompt: "ليس لديك حساب؟ سجل الآن", pageLoading: "جاري التحميل..." },
  en: { login: "Sign in", email: "Email", password: "Password", loading: "Signing in...", submit: "Sign in", registerPrompt: "Don't have an account? Register now", pageLoading: "Loading..." },
} as const satisfies Record<Locale, unknown>;
export function getAuthMessages(locale: Locale) { return authMessages[locale]; }
