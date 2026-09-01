"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";
import { completeClinicUserActivation } from "@/domain/users/users.actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter(); const [ready, setReady] = useState(false); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  useEffect(() => { const supabase = createClient(); supabase.auth.getUser().then(({ data, error: authError }) => { if (authError || !data.user) setError("This recovery link is invalid or expired."); setReady(true); }); }, []);
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(null); if (password.length < 8) { setError("Password must be at least 8 characters."); return; } if (password !== confirm) { setError("Passwords do not match."); return; } setSaving(true); const supabase = createClient(); const { error: updateError } = await supabase.auth.updateUser({ password }); if (updateError) { setSaving(false); setError(updateError.message); return; } await completeClinicUserActivation(); setSaving(false); router.replace("/"); router.refresh(); }
  return <Card className="w-full max-w-md"><CardHeader><CardTitle>Set a new password</CardTitle></CardHeader><CardContent>{!ready ? <p className="text-sm text-muted-foreground">Checking recovery link...</p> : error && !password ? <div className="space-y-4"><p className="text-sm text-destructive">{error}</p><Button variant="outline" className="w-full" onClick={() => router.replace("/login")}>Return to login</Button></div> : <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} required /></div>{error && <p className="text-sm text-destructive">{error}</p>}<Button className="w-full" disabled={saving}>{saving ? "Saving..." : "Save password"}</Button></form>}</CardContent></Card>;
}
