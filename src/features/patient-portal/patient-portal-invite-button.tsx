"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { createPatientPortalInvitation, type PortalChannel } from "@/domain/patient-portal/portal.actions";

export function PatientPortalInviteButton({ patientId, hasEmail, hasPhone }: { patientId: string; hasEmail: boolean; hasPhone: boolean }) {
  const [channel, setChannel] = useState<PortalChannel>(hasEmail ? "email" : "whatsapp");
  const [fallback, setFallback] = useState<PortalChannel | "">(hasEmail && hasPhone ? "sms" : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function invite() {
    setBusy(true);
    setMessage("");
    const result = await createPatientPortalInvitation({ patientId, channel, fallbackChannel: fallback || null });
    setBusy(false);
    setMessage(result.success ? "Invitation queued." : result.error ?? "Invitation failed");
  }

  const canPhone = hasPhone;
  const canEmail = hasEmail;
  if (!canPhone && !canEmail) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <select className="h-9 rounded-md border bg-background px-2 text-xs" value={channel} onChange={(e) => setChannel(e.target.value as PortalChannel)} disabled={busy} aria-label="Patient Portal channel">
        {canEmail && <option value="email">Email</option>}
        {canPhone && <option value="whatsapp">WhatsApp</option>}
        {canPhone && <option value="sms">SMS</option>}
      </select>
      <select className="h-9 rounded-md border bg-background px-2 text-xs" value={fallback} onChange={(e) => setFallback(e.target.value as PortalChannel | "")} disabled={busy} aria-label="Patient Portal fallback channel">
        <option value="">No fallback</option>
        {canEmail && channel !== "email" && <option value="email">Email fallback</option>}
        {canPhone && channel !== "whatsapp" && <option value="whatsapp">WhatsApp fallback</option>}
        {canPhone && channel !== "sms" && <option value="sms">SMS fallback</option>}
      </select>
      <Button variant="outline" size="sm" onClick={invite} disabled={busy}>{busy ? "Sending…" : "Portal invite"}</Button>
      {message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}
    </div>
  );
}
