"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/core/auth/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/core/i18n/I18nProvider";

function RegisterForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [fullName, setFullName] = useState(""); const [clinicName, setClinicName] = useState(""); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false); const router = useRouter(); const { locale, auth: t } = useI18n();
  async function handleSubmit(formData: FormData) { setLoading(true); setError(null); const result = await signUp(formData); if (result?.error) { setError(result.error); setLoading(false); return; } router.push("/check-email"); router.refresh(); }
  return <Card className="w-full max-w-md border-slate-700 bg-slate-800/80 backdrop-blur" dir={locale === "ar" ? "rtl" : "ltr"}><CardHeader className="space-y-4 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Stethoscope className="h-8 w-8 text-primary" /></div><CardTitle className="text-2xl text-white">{t.register}</CardTitle></CardHeader><CardContent><form action={handleSubmit} className="space-y-4">{error && <div className="rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>}<div className="space-y-2"><Label htmlFor="full_name" className="text-white">{t.fullName}</Label><Input id="full_name" name="full_name" type="text" placeholder={t.fullNamePlaceholder} value={fullName} onChange={e => setFullName(e.target.value)} required className="border-slate-600 bg-slate-900 text-white" /></div><div className="space-y-2"><Label htmlFor="clinic_name" className="text-white">{t.clinicName}</Label><Input id="clinic_name" name="clinic_name" type="text" placeholder={t.clinicNamePlaceholder} value={clinicName} onChange={e => setClinicName(e.target.value)} required className="border-slate-600 bg-slate-900 text-white" /></div><div className="space-y-2"><Label htmlFor="email" className="text-white">{t.email}</Label><Input id="email" name="email" type="email" placeholder="admin@clinic.com" value={email} onChange={e => setEmail(e.target.value)} required className="border-slate-600 bg-slate-900 text-white" /></div><div className="space-y-2"><Label htmlFor="password" className="text-white">{t.password}</Label><Input id="password" name="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="border-slate-600 bg-slate-900 text-white" /></div><Button type="submit" className="w-full" disabled={loading}>{loading ? t.createLoading : t.createSubmit}</Button></form><div className="mt-4 text-center"><Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">{t.haveAccount}</Link></div></CardContent></Card>;
}
export default function RegisterPage() { const { auth: t } = useI18n(); return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-white">{t.pageLoading}</div></div>}><RegisterForm /></Suspense>; }
