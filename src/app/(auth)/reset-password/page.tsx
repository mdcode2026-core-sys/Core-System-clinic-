"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";
import { completeClinicUserActivation } from "@/domain/users/users.actions";
import { authCopy } from "@/core/i18n/authCopy";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function ResetPasswordPage() {
  const { locale } = useI18n();
  const copy = authCopy[locale];
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { const supabase = createClient(); let active = true; const initialiseRecovery = async () => { const query = new URLSearchParams(window.location.search); const code = query.get("code"); if (code) { const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code); if (exchangeError) { if (active) { setError(copy.setupLinkInvalid); setReady(true); } return; } window.history.replaceState({}, document.title, window.location.pathname); } const hash = window.location.hash; const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash); const accessToken = params.get("access_token"); const refreshToken = params.get("refresh_token"); if (accessToken && refreshToken) { const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }); if (sessionError) { if (active) { setError(copy.setupLinkInvalid); setReady(true); } return; } window.history.replaceState({}, document.title, window.location.pathname); } const { data, error: authError } = await supabase.auth.getUser(); if (!active) return; if (authError || !data.user) setError(copy.setupLinkInvalid); setReady(true); }; void initialiseRecovery(); return () => { active = false; }; }, [copy.setupLinkInvalid]);
  async function submit(event: FormEvent) { event.preventDefault(); setError(null); if (password.length < 8) { setError(copy.passwordMin); return; } if (password !== confirm) { setError(copy.passwordMismatch); return; } setSaving(true); const supabase = createClient(); const { error: updateError } = await supabase.auth.updateUser({ password }); if (updateError) { setSaving(false); setError(updateError.message); return; } const result = await completeClinicUserActivation(); if (!result.success) { setSaving(false); setError(result.error || copy.setupFailed); return; } router.replace("/"); router.refresh(); }
  return <Card className="w-full max-w-md" dir={locale === "ar" ? "rtl" : "ltr"}><CardHeader><CardTitle>{copy.setPasswordTitle}</CardTitle></CardHeader><CardContent>{!ready ? <p className="text-sm text-muted-foreground">{copy.checkingLink}</p> : error ? <div className="space-y-4"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="w-full" onClick={() => router.replace("/login")}>{copy.returnLogin}</Button></div> : <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="new-password">{copy.newPassword}</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="confirm-password">{copy.confirmPassword}</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} required /></div><Button className="w-full" disabled={saving}>{saving ? copy.saving : copy.savePassword}</Button></form>}</CardContent></Card>;
}
