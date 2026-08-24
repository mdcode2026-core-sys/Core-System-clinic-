"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useAuth } from "@/core/auth/AuthContext";
import { getQueue } from "@/domain/queue/queue.queries";
import { callNextPatient, completeVisit, holdVisit, resumeVisit } from "@/domain/queue/queue.actions";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Stethoscope, DoorOpen, CheckCircle2, PauseCircle, PlayCircle, Clock, Phone } from "lucide-react";
import { EnrichedSession } from "@/domain/queue/queue.types";

export function MyQueueView() {
  const { user, tenantId } = useAuth();
  const { messages, locale } = useI18n();
  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useQueueSubscription(tenantId);

  const loadMySessions = useCallback(async (currentUserId: string) => { const allSessions = await getQueue(); return allSessions.filter((s) => s.doctor_id === currentUserId || s.lock_holder_id === currentUserId); }, []);
  const fetchData = useCallback(async () => { if (!tenantId || !user) return; setIsLoading(true); setErrorMessage(null); try { setSessions(await loadMySessions(user.id)); } catch { setErrorMessage(messages.common.unexpectedError); } finally { setIsLoading(false); } }, [tenantId, user, loadMySessions, messages.common.unexpectedError]);

  useEffect(() => {
    if (!tenantId || !user) return; let cancelled = false;
    async function load() { setIsLoading(true); setErrorMessage(null); try { const mySessions = await loadMySessions(user!.id); if (!cancelled) setSessions(mySessions); } catch { if (!cancelled) setErrorMessage(messages.common.unexpectedError); } finally { if (!cancelled) setIsLoading(false); } }
    load(); return () => { cancelled = true; };
  }, [tenantId, user, loadMySessions, messages.common.unexpectedError]);

  const handleAction = async (action: string, sessionId: string) => { setIsProcessing((prev) => ({ ...prev, [sessionId]: true })); setErrorMessage(null); try { switch (action) { case "call": await callNextPatient(sessionId); break; case "complete": await completeVisit(sessionId); break; case "hold": await holdVisit(sessionId); break; case "resume": await resumeVisit(sessionId); break; } await fetchData(); } catch { setErrorMessage(messages.common.unexpectedError); } finally { setIsProcessing((prev) => ({ ...prev, [sessionId]: false })); } };

  const myWaiting = sessions.filter((s) => s.session_status === "waiting");
  const myCurrent = sessions.find((s) => s.session_status === "in_consultation" && s.lock_holder_id === user?.id);
  const myOnHold = sessions.filter((s) => s.session_status === "in_consultation" && !s.lock_holder_id);
  const myCompletedToday = sessions.filter((s) => s.session_status === "completed");
  const direction = locale === "ar" ? "rtl" : "ltr";

  if (!tenantId || !user) return null;
  if (isLoading) return <div className="p-8 text-center" dir={direction}>{messages.common.loading}</div>;

  return <div className="p-6 space-y-6 max-w-4xl mx-auto" dir={direction}>
    {errorMessage && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{errorMessage}</div>}
    <div className="flex items-center gap-3"><div className="p-3 bg-primary/10 rounded-full"><Stethoscope className="h-6 w-6 text-primary" /></div><div><h1 className="text-2xl font-bold">{messages.doctorQueue.title}</h1><p className="text-muted-foreground">{myWaiting.length} {messages.doctorQueue.waitingCount} · {myCompletedToday.length} {messages.doctorQueue.completedToday}</p></div></div>

    {myCurrent ? <Card className="border-green-300 ring-1 ring-green-200"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg"><DoorOpen className="h-5 w-5 text-green-600" />{messages.doctorQueue.currentPatient}</CardTitle><Badge className="bg-green-100 text-green-800">{messages.doctorQueue.inExam}</Badge></div></CardHeader><CardContent><div className="flex flex-col md:flex-row md:items-center gap-4"><div className="flex-1"><p className="text-xl font-semibold">{myCurrent.patient_name || messages.doctorQueue.unknownPatient}</p><div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">{myCurrent.patient_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{myCurrent.patient_phone}</span>}{myCurrent.patient_file_number && <span>{messages.doctorQueue.file}: #{myCurrent.patient_file_number}</span>}</div></div><div className="flex gap-2"><Button onClick={() => handleAction("hold", myCurrent.id)} disabled={isProcessing[myCurrent.id]} variant="outline"><PauseCircle className="h-4 w-4 me-1" />{messages.doctorQueue.hold}</Button><Button onClick={() => handleAction("complete", myCurrent.id)} disabled={isProcessing[myCurrent.id]} className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="h-4 w-4 me-1" />{messages.doctorQueue.complete}</Button></div></div></CardContent></Card> : <Card className="border-dashed"><CardContent className="p-8 text-center"><DoorOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-muted-foreground">{messages.doctorQueue.noCurrent}</p>{myWaiting.length > 0 && <Button className="mt-4" size="lg" onClick={() => handleAction("call", myWaiting[0].id)} disabled={isProcessing[myWaiting[0].id]}><DoorOpen className="h-4 w-4 me-1" />{messages.doctorQueue.callNext}</Button>}</CardContent></Card>}

    {myOnHold.length > 0 && <Card><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><PauseCircle className="h-4 w-4 text-purple-500" />{messages.doctorQueue.onHold} ({myOnHold.length})</CardTitle></CardHeader><CardContent className="space-y-2">{myOnHold.map((session) => <div key={session.id} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg"><span className="font-medium">{session.patient_name}</span><Button size="sm" variant="outline" onClick={() => handleAction("resume", session.id)} disabled={isProcessing[session.id]}><PlayCircle className="h-3 w-3 me-1" />{messages.doctorQueue.resume}</Button></div>)}</CardContent></Card>}

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />{messages.doctorQueue.waitingList}</CardTitle></CardHeader><CardContent>{myWaiting.length === 0 ? <p className="text-center text-muted-foreground py-4">{messages.doctorQueue.noWaiting}</p> : <div className="space-y-2">{myWaiting.map((session, index) => <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"><div className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold">{index + 1}</div><div><p className="font-medium">{session.patient_name}</p><div className="flex gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.wait_time_minutes}{messages.doctorQueue.minutesShort}</span></div></div></div><Button size="sm" onClick={() => handleAction("call", session.id)} disabled={isProcessing[session.id] || !!myCurrent}>{messages.doctorQueue.call}</Button></div>)}</div>}</CardContent></Card>
  </div>;
}
