"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { KeyRound, Loader2 } from "lucide-react";

export default function ActivateAccountPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (user) {
        setEmail(user.email ?? null);
        setReady(true);
      } else {
        setError("The activation link is invalid or has expired. Please ask the clinic administrator to send a new activation link.");
        setReady(true);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setEmail(session.user.email ?? null);
        setReady(true);
      }
    });

    void load();
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSaving(false);
      setError(updateError.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" />Activate your account</CardTitle>
      <CardDescription>{email ? `Complete your clinic account for ${email} by choosing your own password.` : "Complete your clinic account by choosing your own password."}</CardDescription>
    </CardHeader>
    <CardContent>
      {!ready ? <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div> : error && !email ? <div className="space-y-4"><p className="text-sm text-destructive">{error}</p><Button type="button" variant="outline" className="w-full" onClick={() => router.replace("/login")}>Return to sign in</Button></div> : <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="activation-password">New password</Label><Input id="activation-password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
        <div className="space-y-2"><Label htmlFor="activation-confirm-password">Confirm password</Label><Input id="activation-confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={saving}>{saving ? "Activating..." : "Activate account"}</Button>
      </form>}
    </CardContent>
  </Card>;
}
