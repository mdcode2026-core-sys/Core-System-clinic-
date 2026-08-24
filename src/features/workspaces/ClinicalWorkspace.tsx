"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQueue } from "@/domain/queue/queue.queries";
import type { EnrichedSession } from "@/domain/queue/queue.types";
import { transitionToClinical } from "@/domain/queue/workspace.actions";
import { addVisitProcedure, finishClinicalVisit, getClinicalProcedures, getClinicalVisit, removeVisitProcedure, saveClinicalVisit } from "@/domain/visit/visit.actions";
import type { ClinicalVisitRecord } from "@/domain/visit/visit.types";
import { useAuth } from "@/core/auth/AuthContext";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { CheckCircle2, Clock, DoorOpen, RefreshCw, Stethoscope, UserRound } from "lucide-react";
import { MedicalFilesPanel } from "@/features/medical-files/ui/MedicalFilesPanel";

type ProcedureOption = { id: string; procedure_name: string; procedure_name_ar: string | null };

export function ClinicalWorkspace({ initialQueue = [] }: { initialQueue?: EnrichedSession[] }) {
  const router = useRouter();
  const { user, tenantId } = useAuth();
  const { terminology: t } = useI18n();
  const c = t.clinical;
  const [sessions, setSessions] = useState<EnrichedSession[]>(initialQueue);
  const [current, setCurrent] = useState<ClinicalVisitRecord | null>(null);
  const [procedures, setProcedures] = useState<ProcedureOption[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState("");
  const [examination, setExamination] = useState("");
  const [findings, setFindings] = useState("");
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useQueueSubscription(tenantId || "");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      const queue = await getQueue();
      setSessions(queue.filter((s) => s.session_status === "waiting" || s.session_status === "in_consultation" || s.session_status === "pending_close"));
      const active = queue.find((s) => s.session_status === "in_consultation" && s.lock_holder_id === user.id);
      if (active) {
        const visit = await getClinicalVisit(active.id);
        setCurrent(visit);
        if (visit) { setExamination(visit.examination); setFindings(visit.findings); setDecision(visit.decision); }
      } else setCurrent(null);
      if (procedures.length === 0) setProcedures(await getClinicalProcedures());
    } catch (e) { console.error("[ClinicalWorkspace] refresh failed", e); setError(c.loadFailed); }
    finally { setLoading(false); }
  }, [user, procedures.length, c.loadFailed]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) void refresh(); });
    return () => { cancelled = true; };
  }, [refresh]);

  const run = async (fn: () => Promise<unknown>) => { setError(null); try { await fn(); await refresh(); } catch (e) { console.error("[ClinicalWorkspace] action failed", e); setError(c.actionFailed); } };
  const startNext = async (session: EnrichedSession) => { await run(async () => { await transitionToClinical(session.id); }); };
  const save = async () => { if (!current) return; setSaving(true); setError(null); try { await saveClinicalVisit(current.id, { examination, findings, decision }); await refresh(); } catch (e) { console.error("[ClinicalWorkspace] save failed", e); setError(c.saveFailed); } finally { setSaving(false); } };
  const finish = async () => { if (!current) return; setSaving(true); setError(null); try { await finishClinicalVisit(current.id, { examination, findings, decision }); await refresh(); } catch (e) { console.error("[ClinicalWorkspace] finish failed", e); setError(c.finishFailed); } finally { setSaving(false); } };
  const addProcedure = async () => { if (!current || !selectedProcedure) return; await run(async () => { await addVisitProcedure(current.id, selectedProcedure); setSelectedProcedure(""); }); };
  const waiting = sessions.filter((s) => s.session_status === "waiting");
  const returned = sessions.filter((s) => s.session_status === "pending_close");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-full bg-primary/10 p-3"><Stethoscope className="h-6 w-6 text-primary" /></div><div><h1 className="text-3xl font-bold">{c.title}</h1><p className="text-muted-foreground mt-1">{c.description}</p></div></div><div className="flex gap-2"><Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-4 w-4 me-2 ${loading ? "animate-spin" : ""}`} /> {c.refresh}</Button>{current && <Button variant="outline" onClick={() => router.push(`/treatment-plans?patientId=${encodeURIComponent(current.patient_id)}&visitId=${encodeURIComponent(current.id)}`)}>{c.treatmentPlan}</Button>}{current && <Button variant="outline" onClick={() => router.push(`/follow-up?patientId=${encodeURIComponent(current.patient_id)}&sessionId=${encodeURIComponent(current.id)}`)}>{c.followUp}</Button>}</div></div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {current ? (
        <div className="space-y-4">
          <Card className="border-primary/30"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> {c.visitContext}</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-4 text-sm"><div><span className="text-muted-foreground">{c.patient}</span><p className="font-semibold">{current.patient_name || c.patientFallback}</p><p className="text-xs text-muted-foreground">{current.patient_file_number || c.noFileNumber}</p></div><div><span className="text-muted-foreground">{c.provider}</span><p className="font-semibold">{current.doctor_name || c.unspecified}</p></div><div><span className="text-muted-foreground">{c.room}</span><p className="font-semibold">{current.room_name || c.unspecifiedRoom}</p></div><div><span className="text-muted-foreground">{c.appointment}</span><p className="font-semibold">{current.agenda_event_id ? c.linkedAppointment : c.walkIn}</p></div></CardContent></Card>
          <MedicalFilesPanel patientId={current.patient_id} visitId={current.id} />
          <Card><CardHeader><CardTitle>{c.examination}</CardTitle></CardHeader><CardContent><textarea value={examination} onChange={(e) => setExamination(e.target.value)} placeholder={c.examinationPlaceholder} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></CardContent></Card>
          <Card><CardHeader><CardTitle>{c.findings}</CardTitle></CardHeader><CardContent><textarea value={findings} onChange={(e) => setFindings(e.target.value)} placeholder={c.findingsPlaceholder} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></CardContent></Card>
          <Card><CardHeader><CardTitle>{c.decision}</CardTitle></CardHeader><CardContent><textarea value={decision} onChange={(e) => setDecision(e.target.value)} placeholder={c.decisionPlaceholder} className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></CardContent></Card>
          <Card><CardHeader><CardTitle>{c.procedures}</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><select value={selectedProcedure} onChange={(e) => setSelectedProcedure(e.target.value)} className="min-h-10 flex-1 rounded-md border bg-background px-3 text-sm"><option value="">{c.selectProcedure}</option>{procedures.map((p) => <option key={p.id} value={p.id}>{p.procedure_name_ar || p.procedure_name}</option>)}</select><Button onClick={() => void addProcedure()} disabled={!selectedProcedure}>{c.add}</Button></div>{current.procedures.length === 0 ? <p className="text-sm text-muted-foreground">{c.noProcedures}</p> : current.procedures.map((p) => <div key={p.id} className="flex items-center justify-between rounded-md border p-3 text-sm"><span>{p.procedure_name} × {p.quantity}</span><Button variant="ghost" size="sm" onClick={() => void run(() => removeVisitProcedure(p.id))}>{c.remove}</Button></div>)}</CardContent></Card>
          <div className="flex flex-col sm:flex-row gap-3"><Button variant="outline" onClick={() => void save()} disabled={saving} className="flex-1">{c.saveVisit}</Button><Button onClick={() => void finish()} disabled={saving} className="flex-1"><CheckCircle2 className="h-4 w-4 me-2" /> {c.finishVisit}</Button></div>
        </div>
      ) : <Card><CardContent className="p-8 text-center"><DoorOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground" /><p className="text-muted-foreground">{c.noActiveVisit}</p>{waiting.length > 0 && <Button className="mt-4" size="lg" onClick={() => void startNext(waiting[0])}>{c.takeNext}</Button>}</CardContent></Card>}
      <div className="grid gap-4 lg:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> {c.waitingPatients} ({waiting.length})</CardTitle></CardHeader><CardContent className="space-y-2">{waiting.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">{c.noWaiting}</p> : waiting.map((session) => <div key={session.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{session.patient_name}</p><p className="text-xs text-muted-foreground">{session.doctor_name || c.providerUnspecified} · {c.wait} {session.wait_time_minutes ?? 0} {c.minutes}</p></div><Button size="sm" disabled={!!current || !!session.lock_holder_id} onClick={() => void startNext(session)}>{c.take}</Button></div>)}</CardContent></Card><Card><CardHeader><CardTitle>{c.returnedToOperation} ({returned.length})</CardTitle></CardHeader><CardContent>{returned.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">{c.noPendingClose}</p> : returned.map((session) => <div key={session.id} className="rounded-lg border p-3 mb-2"><p className="font-medium">{session.patient_name}</p><p className="text-xs text-muted-foreground">{c.pendingOperationClose}</p></div>)}</CardContent></Card></div>
    </div>
  );
}
