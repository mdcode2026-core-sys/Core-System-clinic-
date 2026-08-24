"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/core/i18n/I18nProvider";
import { createClient } from "@/infrastructure/supabase/client";
import { claimPatientPortalInvitation } from "@/domain/patient-portal/portal.actions";

export default function PortalActivation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, portal: p } = useI18n();
  const token = searchParams.get("token") ?? "";
  const channel = (searchParams.get("channel") ?? "email") as "email" | "sms" | "whatsapp";
  const supabase = useMemo(() => createClient(), []);
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const isEmail = channel === "email";
  const direction = locale === "ar" ? "rtl" : "ltr";

  async function sendCode() {
    setBusy(true);
    setMessage("");
    const normalized = isEmail ? identifier.trim().toLowerCase() : identifier.trim();
    const result = isEmail
      ? await supabase.auth.signInWithOtp({ email: normalized, options: { shouldCreateUser: true } })
      : await supabase.auth.signInWithOtp({ phone: normalized, options: { channel: channel === "whatsapp" ? "whatsapp" : "sms" } });

    setBusy(false);
    if (result.error) {
      setMessage(p.authRequired);
      return;
    }
    setSent(true);
    setMessage(isEmail ? p.verificationSentEmail : p.verificationSentPhone);
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
      setMessage(p.invalidInvitation);
      return;
    }

    const claim = await claimPatientPortalInvitation(token);
    setBusy(false);
    if (!claim.success) {
      setMessage(claim.error ?? p.activationFailed);
      return;
    }
    router.replace("/portal");
  }

  if (!token) {
    return <main className="mx-auto max-w-lg p-6" dir={direction}><h1 className="text-2xl font-semibold">{p.invalidInvitation}</h1><p className="mt-2 text-sm text-muted-foreground">{p.missingToken}</p></main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center p-6" dir={direction}>
      <section className="w-full rounded-2xl border bg-background p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">CORE SYSTEM</p>
        <h1 className="mt-2 text-2xl font-semibold">{p.activateTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{isEmail ? p.activationHintEmail : p.activationHintPhone}</p>

        <label className="mt-6 block text-sm font-medium">{isEmail ? p.email : p.phone}</label>
        <input className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2" value={identifier} onChange={(e) => setIdentifier(e.target.value)} disabled={busy || sent} autoComplete={isEmail ? "email" : "tel"} />

        {!sent ? (
          <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" onClick={sendCode} disabled={busy || !identifier.trim()}>
            {busy ? p.sending : isEmail ? p.sendEmailCode : channel === "whatsapp" ? p.sendWhatsAppCode : p.sendSmsCode}
          </button>
        ) : (
          <>
            <label className="mt-4 block text-sm font-medium">{p.verificationCode}</label>
            <input className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2 tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" />
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50" onClick={verify} disabled={busy || code.trim().length < 4}>
              {busy ? p.activating : p.activatePortal}
            </button>
          </>
        )}

        {message && <p className="mt-4 text-sm text-muted-foreground" role="status">{message}</p>}
      </section>
    </main>
  );
}
