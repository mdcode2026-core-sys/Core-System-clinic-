"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/infrastructure/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/core/i18n/I18nProvider";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, auth: t } = useI18n();
  const redirectPath = searchParams.get("redirect") || "/";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError(t.errors.signInFailed);
      setLoading(false);
      return;
    }
    router.push(redirectPath);
    router.refresh();
  }

  return (
    <Card className="cs-surface-raised mx-auto w-full max-w-md rounded-2xl border-[var(--cs-slate-200)] bg-white" dir={locale === "ar" ? "rtl" : "ltr"}>
      <CardHeader className="space-y-5 p-6 pb-4 text-center sm:p-8 sm:pb-5">
        <div className="mx-auto flex h-12 w-full max-w-[11rem] items-center justify-center sm:h-14"><Image src="/brand/clinicsaas-header.svg" alt="ClinicSaaS™" width={190} height={42} priority className="h-auto w-full max-w-[11rem]" /></div>
        <div><CardTitle className="text-[var(--cs-ink-950)] text-2xl font-bold tracking-tight">{t.login}</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--cs-slate-500)]">{locale === "ar" ? "دخول آمن إلى نظام العيادة" : "Secure access to your clinic system"}</p></div>
      </CardHeader>
      <CardContent className="p-6 pt-1 sm:p-8 sm:pt-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div id="login-error" className="cs-login-error rounded-lg border p-3 text-center text-sm leading-6" role="alert">{error}</div>}
          <div className="space-y-2"><Label htmlFor="email" className="text-[var(--cs-ink-950)]">{t.email}</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} required aria-describedby={error ? "login-error" : undefined} className="h-11 rounded-lg border-[var(--cs-slate-300)] bg-white text-[var(--cs-ink-950)] placeholder:text-[var(--cs-slate-500)] focus-visible:ring-[var(--cs-azure-600)]" /></div>
          <div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label htmlFor="password" className="text-[var(--cs-ink-950)]">{t.password}</Label><Link href="/forgot-password" className="cs-interactive rounded text-xs font-medium text-[var(--cs-azure-700)] hover:underline">{locale === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link></div><div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required aria-describedby={error ? "login-error" : undefined} className="h-11 rounded-lg border-[var(--cs-slate-300)] bg-white pe-11 text-[var(--cs-ink-950)] placeholder:text-[var(--cs-slate-500)] focus-visible:ring-[var(--cs-azure-600)]" /><button type="button" aria-label={locale === "ar" ? (showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور") : (showPassword ? "Hide password" : "Show password")} onClick={() => setShowPassword((value) => !value)} className="cs-interactive absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-lg text-[var(--cs-slate-700)] hover:bg-[var(--cs-slate-100)]">{showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button></div></div>
          <Button type="submit" className="h-11 w-full rounded-lg bg-[var(--cs-azure-600)] font-semibold text-white hover:bg-[var(--cs-azure-700)] focus-visible:ring-[var(--cs-azure-600)]" disabled={loading}>{loading ? t.loading : t.submit}</Button>
        </form>
        <div className="mt-5 border-t border-[var(--cs-slate-200)] pt-5 text-center"><Link href="/register" className="cs-interactive rounded text-sm font-medium text-[var(--cs-azure-700)] hover:underline">{t.registerPrompt}</Link></div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  const { auth: t } = useI18n();
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[var(--cs-slate-700)]">{t.pageLoading}</div>}><LoginForm /></Suspense>;
}
