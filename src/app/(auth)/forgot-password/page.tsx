"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/infrastructure/supabase/client";
import { useI18n } from "@/core/i18n/I18nProvider";
import { authCopy } from "@/core/i18n/authCopy";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const copy = authCopy[locale];
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(null); const supabase = createClient(); const origin = window.location.origin; const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${origin}/reset-password` }); setLoading(false); if (resetError) { setError(resetError.message); return; } setSent(true); }
  return <Card className="w-full max-w-md" dir={locale === "ar" ? "rtl" : "ltr"}><CardHeader><CardTitle>{copy.forgotPassword}</CardTitle></CardHeader><CardContent>{sent ? <div className="space-y-4"><p className="text-sm text-muted-foreground">{copy.recoverySent}</p><Link href="/login" className="text-sm text-primary hover:underline">{copy.returnSignIn}</Link></div> : <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="recovery-email">{copy.email}</Label><Input id="recovery-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />{error && <p className="text-sm text-destructive">{error}</p>}</div><Button className="w-full" disabled={loading}>{loading ? copy.sending : copy.sendRecovery}</Button><div className="text-center"><Link href="/login" className="text-sm text-muted-foreground hover:underline">{copy.backToLogin}</Link></div></form>}</CardContent></Card>;
}
