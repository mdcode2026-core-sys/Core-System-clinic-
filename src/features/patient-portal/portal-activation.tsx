"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";
import { claimPatientPortalInvitation } from "@/domain/patient-portal/portal.actions";

export default function PortalActivation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const channel = (searchParams.get("channel") ?? "email") as "email" | "sms" | "whatsapp";
  const supabase = useMemo(() => createClient(), []);
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const isEmail = channel === "email";

  async function sendCode() {
    setBusy(true);
    setMessage("");
    const normalized = isEmail ? identifier.trim().toLowerCase() : identifier.trim();
    const result = isEmail
      ? await supabase.auth.signInWithOtp({ email: normalized, options: { shouldCreateUser: true } })
      : await supabase.auth.signInWithOtp({ phone: normalized, options: { channel: channel === "whatsapp" ? "whatsapp" : "sms" } });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setSent(true);
    setMessage(isEmail ? "A verification code was sent to your email." : "A verification code was sent to your phone.");
  }

  async function verify() {
    setBusy(true);
    setMessage("");
    const normalized = isEmail ? identifier.trim().toLowerCase() : identifier.trim();
    const result = isEmail
      ? await supabase.auth.verifyOtp({ email: normalized, token: code.trim(), type: "email" })
      : await supabase.auth.verifyOtp({ phone: normalized, token: code.trim(), type: "sms" });

    if (result.error) {
      setBusy(false);
      setMessage(result.error.message);
      return;
    }

    const claim = await claimPatientPortalInvitation(token);
    setBusy(false);
    if (!claim.success) {
      setMessage(claim.error ?? "Activation failed");
      return;
    }
    router.replace("/portal");
  }

  if (!token) {
    return <main className="mx-auto max-w-lg p-6"><h1 className="text-2xl font-semibold">Invalid invitation</h1><p className="mt-2 text-sm text-muted-foreground">This invitation link is missing its secure token.</p></main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6">
      <section className="w-full rounded-2xl border bg-background p-6 shadow-sm" dir="auto">
        <p className="text-sm font-medium text-muted-foreground">CORE SYSTEM</p>
        <h1 className="mt-2 text-2xl font-semibold">Activate Patient Portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use the same {isEmail ? "email address" : "phone number"} that the clinic used for this invitation.</p>

        <label className="mt-6 block text-sm font-medium">{isEmail ? "Email" : "Phone"}</label>
        <input className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2" value={identifier} onChange={(e) => setIdentifier(e.target.value)} disabled={busy || sent} autoComplete={isEmail ? "email" : "tel"} />

        {!sent ? (
          <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" onClick={sendCode} disabled={busy || !identifier.trim()}>
            {busy ? "Sending…" : `Send ${isEmail ? "email" : channel === "whatsapp" ? "WhatsApp" : "SMS"} code`}
          </button>
        ) : (
          <>
            <label className="mt-4 block text-sm font-medium">Verification code</label>
            <input className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2 tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" />
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" onClick={verify} disabled={busy || code.trim().length < 4}>
              {busy ? "Activating…" : "Activate portal"}
            </button>
          </>
        )}

        {message && <p className="mt-4 text-sm text-muted-foreground" role="status">{message}</p>}
      </section>
    </main>
  );
}
