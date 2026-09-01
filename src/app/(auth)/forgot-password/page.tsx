"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/infrastructure/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(null); const supabase = createClient(); const origin = window.location.origin; const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${origin}/reset-password` }); setLoading(false); if (resetError) { setError(resetError.message); return; } setSent(true); }
  return <Card className="w-full max-w-md"><CardHeader><CardTitle>Forgot password</CardTitle></CardHeader><CardContent>{sent ? <div className="space-y-4"><p className="text-sm text-muted-foreground">If an account exists for this email, a password recovery email has been sent.</p><Link href="/login" className="text-sm text-primary hover:underline">Return to sign in</Link></div> : <form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="recovery-email">Email</Label><Input id="recovery-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>{error && <p className="text-sm text-destructive">{error}</p>}<Button className="w-full" disabled={loading}>{loading ? "Sending..." : "Send recovery email"}</Button><div className="text-center"><Link href="/login" className="text-sm text-muted-foreground hover:underline">Back to login</Link></div></form>}</CardContent></Card>;
}
