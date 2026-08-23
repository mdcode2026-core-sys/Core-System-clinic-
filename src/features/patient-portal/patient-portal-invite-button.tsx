"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { createPatientPortalInvitation, type PortalChannel } from "@/domain/patient-portal/portal.actions";
import { getPatientPortalAvailability, type PortalAvailability } from "@/domain/patient-portal/portal-access.actions";

export function PatientPortalInviteButton({ patientId, tenantId, hasEmail, hasPhone }: { patientId: string; tenantId: string; hasEmail: boolean; hasPhone: boolean }) {
  const [availability, setAvailability] = useState<PortalAvailability | null>(null);
  const [channel, setChannel] = useState<PortalChannel>(hasEmail ? "email" : "whatsapp");
  const [fallback, setFallback] = useState<PortalChannel | "">("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { let active = true; getPatientPortalAvailability(tenantId).then((result) => { if (active) setAvailability(result); }); return () => { active = false; }; }, [tenantId]);
  const channels: PortalChannel[] = availability ? [availability.email && hasEmail ? "email" : null, availability.whatsapp && hasPhone ? "whatsapp" : null, availability.sms && hasPhone ? "sms" : null].filter(Boolean) as PortalChannel[] : [];
  useEffect(() => { if (channels.length && !channels.includes(channel)) setChannel(channels[0]); }, [availability, hasEmail, hasPhone, channel, channels.length]);

  async function invite() { setBusy(true); setMessage(""); const result = await createPatientPortalInvitation({ clinicPatientId: patientId, channel, fallbackChannel: fallback || null }); setBusy(false); setMessage(result.success ? "Invitation queued." : result.error ?? "Invitation failed"); }
  if (!hasPhone && !hasEmail) return null;
  if (availability === null) return <span className="text-xs text-muted-foreground">Checking Patient Portal…</span>;
  if (!availability.portal) return <span className="text-xs text-muted-foreground">Patient Portal unavailable for this clinic</span>;
  if (!channels.length) return <span className="text-xs text-muted-foreground">No enabled Patient Portal channel</span>;

  return <div className="flex flex-wrap items-center gap-1">
    <select className="h-9 rounded-md border bg-background px-2 text-xs" value={channel} onChange={(e) => setChannel(e.target.value as PortalChannel)} disabled={busy} aria-label="Patient Portal channel">{channels.map((item) => <option key={item} value={item}>{item === "email" ? "Email" : item === "whatsapp" ? "WhatsApp" : "SMS"}</option>)}</select>
    <select className="h-9 rounded-md border bg-background px-2 text-xs" value={fallback} onChange={(e) => setFallback(e.target.value as PortalChannel | "")} disabled={busy}><option value="">No fallback</option>{channels.filter((item) => item !== channel).map((item) => <option key={item} value={item}>{item === "email" ? "Email fallback" : item === "whatsapp" ? "WhatsApp fallback" : "SMS fallback"}</option>)}</select>
    <Button variant="outline" size="sm" onClick={invite} disabled={busy}>{busy ? "Sending…" : "Portal invite"}</Button>
    {message && <span className="text-xs text-muted-foreground" role="status">{message}</span>}
  </div>;
}
