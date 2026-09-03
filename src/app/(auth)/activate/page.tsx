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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

export default function ActivateAccountPage() {
  const { locale } = useI18n();
  const copy = authCopy[locale];
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { const supabase = createClient(); let active = true; const load = async () => { const query = new URLSearchParams(window.location.search); const code = query.get("code"); if (code) { const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code); if (exchangeError) { if (active) { setError(copy.activationLinkInvalid); setReady(true); } return; } window.history.replaceState({}, document.title, window.location.pathname); } const hash = window.location.hash; const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash); const accessToken = params.get("access_token"); const refreshToken = params.get("refresh_token"); if (accessToken && refreshToken) { const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }); if (sessionError) { if (active) { setError(copy.activationLinkInvalid); setReady(true); } return; } window.history.replaceState({}, document.title, window.location.pathname); } const { data: { user } } = await supabase.auth.getUser(); if (!active) return; if (user) { setEmail(user.email ?? null); setReady(true); } else { setError(copy.activationLinkInvalid); setReady(true); } }; const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (session?.user) { setEmail(session.user.email ?? null); setReady(true); } }); void load(); return () => { active = false; listener.subscription.unsubscribe(); }; }, [copy.activationLinkInvalid]);
  async function handleSubmit(event: FormEvent) { event.preventDefault(); setError(null); if (password.length < 8) { setError(copy.passwordMin); return; } if (password !== confirmPassword) { setError(copy.passwordMismatch); return; } setSaving(true); const supabase = createClient(); const { error: updateError } = await supabase.auth.updateUser({ password }); if (updateError) { setSaving(false); setError(updateError.message); return; } const result = await completeClinicUserActivation(); if (!result.success) { setSaving(false); setError(result.error || copy.activationFailed); return; } router.replace("/"); router.refresh(); }
  return <Card className="w-full max-w-md" dir={locale === "ar" ? "rtl" : "ltr"}><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />{copy.activateTitle}</CardTitle><CardDescription>{email ? copy.activationDescriptionWithEmail(email) : copy.activationDescription}</CardDescription></CardHeader><CardContent>{!ready ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : error && !email ? <div className="space-y-4"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" className="w-full" onClick={() => router.replace("/login")}>{copy.returnSignIn}</Button></div> : <form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label htmlFor="activation-password">{copy.newPassword}</Label><div className="relative"><Input id="activation-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="pe-10" /><button type="button" aria-label={showPassword ? copy.hidePassword : copy.showPassword} onClick={() => setShowPassword(value => !value)} className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div className="space-y-2"><Label htmlFor="activation-confirm-password">{copy.confirmPassword}</Label><div className="relative"><Input id="activation-confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} className="pe-10" /><button type="button" aria-label={showConfirmPassword ? copy.hidePassword : copy.showPassword} onClick={() => setShowConfirmPassword(value => !value)} className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>{error && <p className="text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full" disabled={saving}>{saving ? copy.activating : copy.activateAccount}</Button></form>}</CardContent></Card>;
}
