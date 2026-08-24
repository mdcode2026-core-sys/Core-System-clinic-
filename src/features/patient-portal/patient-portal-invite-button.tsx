"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { createPatientPortalInvitation, type PortalChannel } from "@/domain/patient-portal/portal.actions";
import { getPatientPortalAvailability, type PortalAvailability } from "@/domain/patient-portal/portal-access.actions";

export function PatientPortalInviteButton({ patientId, tenantId, hasEmail, hasPhone }: { patientId: string; tenantId: string; hasEmail: boolean; hasPhone: boolean }) {
  const [availability, setAvailability] = useState<PortalAvailability | null>(null);
  const [channel, setChannel] = useState<PortalChannel>(hasEmail ? "email" : "whatsapp");
  const [fallback, setFallback] = useState<PortalChannel | "">("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getPatientPortalAvailability(tenantId).then((result) => {
      if (active) setAvailability(result);
    }).catch(() => {
      if (active) {
        setAvailability({ portal: false, email: false, sms: false, whatsapp: false });
        setMessage("Unable to check Patient Portal availability");
      }
    });
    return () => { active = false; };
  }, [tenantId]);

  const channels = useMemo<PortalChannel[]>(() => {
    if (!availability) return [];
    return [
      availability.email ? "email" : null,
      availability.whatsapp ? "whatsapp" : null,
      availability.sms ? "sms" : null,
    ].filter(Boolean) as PortalChannel[];
  }, [availability]);

  const channelHasDestination = (item: PortalChannel) => item === "email" ? hasEmail : hasPhone;
  const sendableChannels = channels.filter(channelHasDestination);

  useEffect(() => {
    if (sendableChannels.length && !sendableChannels.includes(channel)) setChannel(sendableChannels[0]);
    if (!channels.includes(channel) && channels.length) setChannel(channels[0]);
    if (!channels.length) setFallback("");
    else if (fallback && !channels.includes(fallback)) setFallback("");
  }, [channels, sendableChannels, channel, fallback]);

  async function invite() {
    setBusy(true);
    setMessage("");
    try {
      if (!channelHasDestination(channel)) {
        setMessage(channel === "email" ? "Patient has no email address" : "Patient has no phone number");
        return;
      }
      const result = await createPatientPortalInvitation({
        clinicPatientId: patientId,
        channel,
        fallbackChannel: fallback || null,
      });
      setMessage(result.success ? "Invitation queued." : result.error ?? "Invitation failed");
    } catch (error) {
      console.error("Patient Portal invitation failed:", error);
      setMessage(error instanceof Error ? error.message : "Invitation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!hasPhone && !hasEmail) return null;
  if (availability === null) return <span className="text-xs text-muted-foreground">Checking Patient Portal…</span>;
  if (!availability.portal) return <span className="text-xs text-muted-foreground">Patient Portal unavailable for this clinic</span>;
  if (!channels.length) return <span className="text-xs text-muted-foreground">No enabled Patient Portal channel</span>;

  return <div className="flex flex-wrap items-center gap-1">
    <select className="h-9 rounded-md border bg-background px-2 text-xs" value={channel} onChange={(e) => setChannel(e.target.value as PortalChannel)} disabled={busy} aria-label="Patient Portal channel">
      {channels.map((item) => <option key={item} value={item} disabled={!channelHasDestination(item)}>{item === "email" ? "Email" : item === "whatsapp" ? "WhatsApp" : "SMS"}{!channelHasDestination(item) ? " (no destination)" : ""}</option>)}
    </select>
    <select className="h-9 rounded-md border bg-background px-2 text-xs" value={fallback} onChange={(e) => setFallback(e.target.value as PortalChannel | "")} disabled={busy} aria-label="Patient Portal fallback channel">
      <option value="">No fallback</option>
      {channels.filter((item) => item !== channel).map((item) => <option key={item} value={item} disabled={!channelHasDestination(item)}>{item === "email" ? "Email fallback" : item === "whatsapp" ? "WhatsApp fallback" : "SMS fallback"}{!channelHasDestination(item) ? " (no destination)" : ""}</option>)}
    </select>
    <Button variant="outline" size="sm" onClick={invite} disabled={busy || !channelHasDestination(channel)}>{busy ? "Sending…" : "Portal invite"}</Button>
    {message && <span className="text-xs text-muted-foreground" role="status" aria-live="polite">{message}</span>}
  </div>;
}
