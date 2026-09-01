"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Eye, EyeOff, Stethoscope } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/core/i18n/I18nProvider";

function LoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const router = useRouter(); const searchParams = useSearchParams(); const { locale, auth: t } = useI18n(); const redirectPath = searchParams.get("redirect") || "/";
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(null); const supabase = createClient(); const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password }); if (authError || !data.user) { setError(t.errors.signInFailed); setLoading(false); return; } router.push(redirectPath); router.refresh(); }
  return <Card className="w-full max-w-md border-slate-700 bg-slate-800/80 backdrop-blur" dir={locale === "ar" ? "rtl" : "ltr"}><CardHeader className="space-y-4 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Stethoscope className="h-8 w-8 text-primary" /></div><CardTitle className="text-2xl text-white">{t.login}</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4">{error && <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>}<div className="space-y-2"><Label htmlFor="email" className="text-white">{t.email}</Label><Input id="email" name="email" type="email" placeholder={t.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} required className="border-slate-600 bg-slate-900 text-white" /></div><div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="password" className="text-white">{t.password}</Label><Link href="/forgot-password" className="text-xs text-blue-400 hover:underline">{locale === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link></div><div className="relative"><Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="border-slate-600 bg-slate-900 pe-10 text-white" /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-slate-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><Button type="submit" className="w-full" disabled={loading}>{loading ? t.loading : t.submit}</Button></form><div className="mt-4 text-center"><Link href="/register" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">{t.registerPrompt}</Link></div></CardContent></Card>;
}
export default function LoginPage() { const { auth: t } = useI18n(); return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-white">{t.pageLoading}</div></div>}><LoginForm /></Suspense>; }
