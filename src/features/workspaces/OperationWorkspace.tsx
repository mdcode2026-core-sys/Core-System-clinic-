"use client";

import { useCallback, useEffect, useState } from "react";
import { getQueue } from "@/domain/queue/queue.queries";
import type { EnrichedSession, SessionStatus } from "@/domain/queue/queue.types";
import { completeFromReception, markNoShowFromReception, cancelFromReception, registerPatientArrival, reorderWaitingFromReception } from "@/domain/queue/workspace.actions";
import { useAuth } from "@/core/auth/AuthContext";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, GripVertical, CheckCircle2, Search, RefreshCw, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";

export function OperationWorkspace({ initialQueue = [] }: { initialQueue?: EnrichedSession[] }) {
  const { tenantId } = useAuth();
  const { terminology: t, locale } = useI18n();
  const o = t.operation;
  const [sessions, setSessions] = useState<EnrichedSession[]>(initialQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useQueueSubscription(tenantId || "");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setSessions(await getQueue()); }
    catch (e) { setError(e instanceof Error ? e.message : o.loadFailed); }
    finally { setLoading(false); }
  }, [o.loadFailed]);

  useEffect(() => {
    let active = true;
    void getQueue().then(next => { if (active) setSessions(next); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : o.loadFailed); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [o.loadFailed]);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try { await fn(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : o.actionFailed); }
  };

  const visible = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [s.patient_name, s.patient_file_number, s.patient_phone, s.doctor_name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q));
  });

  const waitingByLane = (lane: string | undefined) =>
    sessions
      .filter((s) => s.session_status === "waiting" && (s.lane ?? "general") === (lane ?? "general"))
      .sort((a, b) => {
        const positionA = a.queue_position ?? Number.MAX_SAFE_INTEGER;
        const positionB = b.queue_position ?? Number.MAX_SAFE_INTEGER;
        if (positionA !== positionB) return positionA - positionB;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

  const reorder = async (session: EnrichedSession, delta: -1 | 1) => {
    const lane = session.lane ?? "general";
    const laneItems = waitingByLane(lane);
    const currentIndex = laneItems.findIndex((item) => item.id === session.id);
    if (currentIndex < 0) return;
    const targetPosition = Math.max(1, (session.queue_position ?? currentIndex + 1) + delta);
    if (delta < 0 && currentIndex === 0) return;
    if (delta > 0 && currentIndex === laneItems.length - 1) return;
    await run(() => reorderWaitingFromReception(session.id, targetPosition));
  };

  const dropTarget = async (target: SessionStatus) => {
    if (!draggedId) return;
    const session = sessions.find((s) => s.id === draggedId);
    setDraggedId(null);
    if (!session || session.session_status === target) return;
    if (session.session_status !== "pending_close" || target !== "completed") {
      setError(o.invalidTransition);
      return;
    }
    await run(() => completeFromReception(session.id));
  };

  const laneSessions = (status: SessionStatus) => {
    const filtered = visible.filter((s) => s.session_status === status);
    if (status !== "waiting") return filtered;
    return filtered.sort((a, b) => {
      const laneCompare = String(a.lane ?? "general").localeCompare(String(b.lane ?? "general"));
      if (laneCompare !== 0) return laneCompare;
      const posA = a.queue_position ?? Number.MAX_SAFE_INTEGER;
      const posB = b.queue_position ?? Number.MAX_SAFE_INTEGER;
      if (posA !== posB) return posA - posB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  };

  const lanes = [
    { status: "waiting" as const, title: o.waiting, description: o.waitingDescription },
    { status: "in_consultation" as const, title: o.inConsultation, description: o.inConsultationDescription },
    { status: "pending_close" as const, title: o.pendingClose, description: o.pendingCloseDescription },
    { status: "completed" as const, title: o.completed, description: o.completedDescription },
  ];

  return <div className="space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
      <div><h1 className="text-3xl font-bold">{o.title}</h1><p className="text-muted-foreground mt-1">{o.description}</p></div>
      <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
        <RefreshCw className={`h-4 w-4 me-2 ${loading ? "animate-spin" : ""}`} /> {o.refresh}
      </Button>
    </div>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="relative"><Search className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={o.searchPlaceholder} className="h-10 w-full rounded-md border bg-background ps-9 pe-3 text-sm" /></div>
    <div className="grid gap-4 xl:grid-cols-4">
      {lanes.map((lane) => {
        const items = laneSessions(lane.status);
        return <section key={lane.status}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); void dropTarget(lane.status); }}
          className="min-h-[420px] rounded-xl border bg-muted/20 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div><h2 className="font-semibold">{lane.title}</h2><p className="text-xs text-muted-foreground mt-1">{lane.description}</p></div>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="space-y-3">
            {items.map((session) => {
              const laneWaiting = session.session_status === "waiting" ? waitingByLane(session.lane) : [];
              const currentIndex = laneWaiting.findIndex((item) => item.id === session.id);
              const position = session.queue_position ?? (currentIndex >= 0 ? currentIndex + 1 : undefined);
              return <Card key={session.id}
                draggable={session.session_status === "pending_close"}
                onDragStart={() => setDraggedId(session.id)}
                onDragEnd={() => setDraggedId(null)}
                className={session.session_status === "pending_close" ? "cursor-grab active:cursor-grabbing" : undefined}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{session.patient_name || o.patientFallback}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2 text-muted-foreground">
                    {session.patient_file_number && <span>#{session.patient_file_number}</span>}
                    {session.doctor_name && <span>{session.doctor_name}</span>}
                    {session.room_name && <span>{session.room_name}</span>}
                    {session.session_status === "waiting" && <span>{locale === "ar" ? "المسار" : "Lane"}: {session.lane ?? "general"} · {locale === "ar" ? "الدور" : "Position"}: {position ?? "—"}</span>}
                  </div>
                  {session.session_status === "waiting" && <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" disabled={!!search || currentIndex === 0} onClick={() => void reorder(session, -1)} aria-label={locale === "ar" ? "رفع المريض في الطابور" : "Move patient up"}>
                      <ChevronUp className="h-4 w-4 me-1" />{locale === "ar" ? "تقديم" : "Move up"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={!!search || currentIndex === laneWaiting.length - 1} onClick={() => void reorder(session, 1)} aria-label={locale === "ar" ? "خفض المريض في الطابور" : "Move patient down"}>
                      <ChevronDown className="h-4 w-4 me-1" />{locale === "ar" ? "تأخير" : "Move down"}
                    </Button>
                    <details className="relative">
                      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />{locale === "ar" ? "المزيد" : "More"}
                      </summary>
                      <div className="absolute end-0 z-10 flex min-w-44 flex-col gap-1 rounded-md border bg-background p-2 shadow-lg">
                        <Button size="sm" variant="outline" className="justify-start" onClick={() => void run(() => registerPatientArrival({ sessionId: session.id, patient_id: session.patient_id }))}>{o.registerArrival}</Button>
                        <Button size="sm" variant="ghost" className="justify-start" onClick={() => void run(() => markNoShowFromReception(session.id))}>{o.noShow}</Button>
                        <Button size="sm" variant="ghost" className="justify-start text-destructive" onClick={() => void run(() => cancelFromReception(session.id))}>{o.cancel}</Button>
                      </div>
                    </details>
                  </div>}
                  {session.session_status === "in_consultation" && <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">{o.clinicalWaiting}</div>}
                  {session.session_status === "pending_close" && <Button size="sm" className="w-full" onClick={() => void run(() => completeFromReception(session.id))}><CheckCircle2 className="h-4 w-4 me-1" /> {o.completeFromReception}</Button>}
                  {session.session_status === "completed" && <div className="flex items-center gap-2 text-green-700 text-xs"><CheckCircle2 className="h-4 w-4" /> {o.completed}</div>}
                  {session.session_status === "waiting" && session.wait_time_minutes !== undefined && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {o.wait} {session.wait_time_minutes} {o.minutes}</div>}
                </CardContent>
              </Card>;
            })}
            {items.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">{o.noOperations}</div>}
          </div>
        </section>;
      })}
    </div>
    <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">{o.handoffNote}</div>
  </div>;
}
