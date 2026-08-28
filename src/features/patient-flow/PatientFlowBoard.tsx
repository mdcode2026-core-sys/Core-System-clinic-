"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getQueue } from "@/domain/queue/queue.queries";
import { moveFromPatientFlow } from "@/domain/queue/workspace.actions";
import type { EnrichedSession, SessionStatus } from "@/domain/queue/queue.types";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { useAuth } from "@/core/auth/AuthContext";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CheckCircle2, GripVertical, RefreshCw, Search, UserCheck } from "lucide-react";

type PatientFlowContext = "operations" | "clinical" | "administrative";

const copy = {
  ar: {
    operations: "التشغيل", clinical: "المعاينة السريرية", administrative: "الإدارة",
    operationsDescription: "حركة المريض والاستقبال والتوجيه والإغلاق التشغيلي.",
    clinicalDescription: "رؤية الحركة السريرية وتسليم المريض إلى مقدم الخدمة وإعادته للإغلاق التشغيلي.",
    administrativeDescription: "الرؤية الكاملة لمسار المرضى مع التدخل الإداري المصرح به.",
    waiting: "بانتظار الخدمة", inConsultation: "مع مقدم الخدمة", pendingClose: "بانتظار إغلاق الاستقبال", completed: "مكتملة",
    patientFallback: "مريض", provider: "مقدم الخدمة", search: "بحث في المرضى...", refresh: "تحديث", take: "بدء", finish: "إرسال للإغلاق", complete: "إغلاق الزيارة",
    noShow: "لم يحضر", cancel: "إلغاء", invalid: "الانتقال غير مسموح لهذه الواجهة.", failed: "تعذر تنفيذ العملية.", empty: "لا توجد زيارات في هذه الحالة.", readOnly: "هذه الواجهة للعرض فقط؛ لا توجد صلاحية لتعديل حالة الزيارة.",
  },
  en: {
    operations: "Operations", clinical: "Clinical", administrative: "Administrative",
    operationsDescription: "Patient movement, reception, routing, return and operational completion.",
    clinicalDescription: "Clinical movement, provider handoff and return to operational completion.",
    administrativeDescription: "Full patient-path visibility with authorized administrative intervention.",
    waiting: "Waiting", inConsultation: "With Provider", pendingClose: "Pending Reception", completed: "Completed",
    patientFallback: "Patient", provider: "Provider", search: "Search patients...", refresh: "Refresh", take: "Start", finish: "Send to reception", complete: "Complete visit",
    noShow: "No-show", cancel: "Cancel", invalid: "This transition is not allowed from this view.", failed: "The action could not be completed.", empty: "No visits in this state.", readOnly: "This view is read-only; you do not have permission to change visit state.",
  },
} as const;

const allowedTargets: Record<PatientFlowContext, Record<SessionStatus, SessionStatus[]>> = {
  operations: {
    waiting: ["in_consultation", "no_show", "cancelled"],
    in_consultation: [],
    pending_close: ["completed", "cancelled"],
    completed: [], cancelled: [], no_show: [],
  },
  clinical: {
    waiting: ["in_consultation"],
    in_consultation: ["pending_close"],
    pending_close: [], completed: [], cancelled: [], no_show: [],
  },
  administrative: {
    waiting: ["in_consultation", "no_show", "cancelled"],
    in_consultation: ["pending_close", "cancelled"],
    pending_close: ["completed", "cancelled"],
    completed: [], cancelled: [], no_show: [],
  },
};

export function PatientFlowBoard({ context, initialQueue = [] }: { context: PatientFlowContext; initialQueue?: EnrichedSession[] }) {
  const { tenantId } = useAuth();
  const { locale } = useI18n();
  const t = copy[locale === "ar" ? "ar" : "en"];
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
    catch { setError(t.failed); }
    finally { setLoading(false); }
  }, [t.failed]);

  useEffect(() => { void refresh(); }, [refresh]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => [s.patient_name, s.patient_file_number, s.patient_phone, s.doctor_name].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [sessions, search]);

  const move = async (sessionId: string, target: SessionStatus) => {
    setError(null);
    try {
      const updated = await moveFromPatientFlow(sessionId, target, context);
      setSessions((current) => current.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
      void refresh();
    } catch (e) { setError(e instanceof Error ? e.message : t.failed); }
  };

  const dropTarget = async (target: SessionStatus) => {
    if (!draggedId) return;
    const session = sessions.find((s) => s.id === draggedId);
    setDraggedId(null);
    if (!session || !allowedTargets[context][session.session_status].includes(target)) { setError(t.invalid); return; }
    await move(session.id, target);
  };

  const lanes: { status: SessionStatus; title: string }[] = [
    { status: "waiting", title: t.waiting },
    { status: "in_consultation", title: t.inConsultation },
    { status: "pending_close", title: t.pendingClose },
    { status: "completed", title: t.completed },
  ];
  const description = context === "operations" ? t.operationsDescription : context === "clinical" ? t.clinicalDescription : t.administrativeDescription;

  return (
    <div className="space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-3xl font-bold">{context === "operations" ? t.operations : context === "clinical" ? t.clinical : t.administrative}</h1><p className="mt-1 text-muted-foreground">{description}</p></div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`me-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />{t.refresh}</Button>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="relative"><Search className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} className="h-10 w-full rounded-md border bg-background ps-9 pe-3 text-sm" /></div>
      <div className="grid gap-4 xl:grid-cols-4">
        {lanes.map((lane) => {
          const items = visible.filter((s) => s.session_status === lane.status);
          return <section key={lane.status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void dropTarget(lane.status); }} className="min-h-[360px] rounded-xl border bg-muted/20 p-3">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{lane.title}</h2><Badge variant="outline">{items.length}</Badge></div>
            <div className="space-y-3">
              {items.map((session) => {
                const targets = allowedTargets[context][session.session_status];
                const draggable = targets.length > 0;
                return <Card key={session.id} draggable={draggable} onDragStart={() => setDraggedId(session.id)} onDragEnd={() => setDraggedId(null)} className={draggable ? "cursor-grab active:cursor-grabbing" : undefined}>
                  <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="truncate">{session.patient_name || t.patientFallback}</span></CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-2 text-muted-foreground"><span>{session.patient_file_number ? `#${session.patient_file_number}` : t.patientFallback}</span>{session.doctor_name && <span>{session.doctor_name}</span>}{session.room_name && <span>{session.room_name}</span>}</div>
                    {targets.includes("in_consultation") && <Button size="sm" onClick={() => void move(session.id, "in_consultation")}><UserCheck className="me-1 h-4 w-4" />{t.take}</Button>}
                    {targets.includes("pending_close") && <Button size="sm" onClick={() => void move(session.id, "pending_close")}><CheckCircle2 className="me-1 h-4 w-4" />{t.finish}</Button>}
                    {targets.includes("completed") && <Button size="sm" onClick={() => void move(session.id, "completed")}><CheckCircle2 className="me-1 h-4 w-4" />{t.complete}</Button>}
                    {targets.includes("no_show") && <Button size="sm" variant="ghost" onClick={() => void move(session.id, "no_show")}>{t.noShow}</Button>}
                    {targets.includes("cancelled") && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void move(session.id, "cancelled")}>{t.cancel}</Button>}
                    {targets.length === 0 && session.session_status !== "completed" && <p className="text-xs text-muted-foreground">{t.readOnly}</p>}
                  </CardContent>
                </Card>;
              })}
              {items.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">{t.empty}</div>}
            </div>
          </section>;
        })}
      </div>
    </div>
  );
}
