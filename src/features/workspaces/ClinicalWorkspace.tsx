"use client";

import { useCallback, useEffect, useState } from "react";
import { getQueue } from "@/domain/queue/queue.queries";
import type { EnrichedSession } from "@/domain/queue/queue.types";
import { transitionToClinical } from "@/domain/queue/workspace.actions";
import { addVisitProcedure, finishClinicalVisit, getClinicalProcedures, getClinicalVisit, removeVisitProcedure, saveClinicalVisit } from "@/domain/visit/visit.actions";
import type { ClinicalVisitRecord } from "@/domain/visit/visit.types";
import { useAuth } from "@/core/auth/AuthContext";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle2, Clock, DoorOpen, RefreshCw, Stethoscope, UserRound } from "lucide-react";

type ProcedureOption = { id: string; procedure_name: string; procedure_name_ar: string | null };

export function ClinicalWorkspace({ initialQueue = [] }: { initialQueue?: EnrichedSession[] }) {
  const { user, tenantId } = useAuth();
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
    setLoading(true);
    setError(null);
    try {
      const queue = await getQueue();
      setSessions(queue.filter((s) => s.session_status === "waiting" || s.session_status === "in_consultation" || s.session_status === "pending_close"));
      const active = queue.find((s) => s.session_status === "in_consultation" && s.lock_holder_id === user.id);
      if (active) {
        const visit = await getClinicalVisit(active.id);
        setCurrent(visit);
        if (visit) {
          setExamination(visit.examination);
          setFindings(visit.findings);
          setDecision(visit.decision);
        }
      } else {
        setCurrent(null);
      }
      if (procedures.length === 0) setProcedures(await getClinicalProcedures());
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل مساحة العمل السريرية");
    } finally {
      setLoading(false);
    }
  }, [user, procedures.length]);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try { await fn(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر تنفيذ الإجراء"); }
  };

  const startNext = async (session: EnrichedSession) => {
    await run(async () => { await transitionToClinical(session.id); });
  };

  const save = async () => {
    if (!current) return;
    setSaving(true); setError(null);
    try { await saveClinicalVisit(current.id, { examination, findings, decision }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر حفظ الزيارة"); }
    finally { setSaving(false); }
  };

  const finish = async () => {
    if (!current) return;
    setSaving(true); setError(null);
    try { await finishClinicalVisit(current.id, { examination, findings, decision }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر إنهاء الزيارة"); }
    finally { setSaving(false); }
  };

  const addProcedure = async () => {
    if (!current || !selectedProcedure) return;
    await run(async () => { await addVisitProcedure(current.id, selectedProcedure); setSelectedProcedure(""); });
  };

  const waiting = sessions.filter((s) => s.session_status === "waiting");
  const returned = sessions.filter((s) => s.session_status === "pending_close");

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3"><Stethoscope className="h-6 w-6 text-primary" /></div>
          <div><h1 className="text-3xl font-bold">مساحة العمل السريرية</h1><p className="text-muted-foreground mt-1">الزيارة السريرية والفحص والنتائج والقرار الطبي</p></div>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} /> تحديث</Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {current ? (
        <div className="space-y-4">
          <Card className="border-primary/30">
            <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> سياق الزيارة</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4 text-sm">
              <div><span className="text-muted-foreground">المريض</span><p className="font-semibold">{current.patient_name || "مريض"}</p><p className="text-xs text-muted-foreground">{current.patient_file_number || "بدون رقم ملف"}</p></div>
              <div><span className="text-muted-foreground">المقدم</span><p className="font-semibold">{current.doctor_name || "غير محدد"}</p></div>
              <div><span className="text-muted-foreground">الغرفة</span><p className="font-semibold">{current.room_name || "غير محددة"}</p></div>
              <div><span className="text-muted-foreground">الموعد</span><p className="font-semibold">{current.agenda_event_id ? "مرتبط بموعد" : "زيارة بدون موعد"}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الفحص السريري</CardTitle></CardHeader>
            <CardContent><textarea value={examination} onChange={(e) => setExamination(e.target.value)} placeholder="سجل الفحص الذي تم إجراؤه..." className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Findings — النتائج</CardTitle></CardHeader>
            <CardContent><textarea value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="سجل النتائج والملاحظات السريرية..." className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Decision — القرار الطبي</CardTitle></CardHeader>
            <CardContent><textarea value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="سجل القرار الطبي الناتج عن الفحص..." className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary" /></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الإجراءات المرتبطة بالزيارة</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <select value={selectedProcedure} onChange={(e) => setSelectedProcedure(e.target.value)} className="min-h-10 flex-1 rounded-md border bg-background px-3 text-sm">
                  <option value="">اختر إجراءً...</option>
                  {procedures.map((p) => <option key={p.id} value={p.id}>{p.procedure_name_ar || p.procedure_name}</option>)}
                </select>
                <Button onClick={() => void addProcedure()} disabled={!selectedProcedure}>إضافة</Button>
              </div>
              {current.procedures.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد إجراءات مرتبطة بهذه الزيارة.</p> : current.procedures.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>{p.procedure_name} × {p.quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => void run(() => removeVisitProcedure(p.id))}>إزالة</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => void save()} disabled={saving} className="flex-1">حفظ الزيارة</Button>
            <Button onClick={() => void finish()} disabled={saving} className="flex-1"><CheckCircle2 className="h-4 w-4 ml-2" /> إنهاء الزيارة وإعادتها لمساحة التشغيل</Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <DoorOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد زيارة سريرية نشطة حالياً</p>
            {waiting.length > 0 && <Button className="mt-4" size="lg" onClick={() => void startNext(waiting[0])}>استلام المريض التالي</Button>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> المرضى المنتظرون ({waiting.length})</CardTitle></CardHeader><CardContent className="space-y-2">
          {waiting.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">لا يوجد مرضى في الانتظار</p> : waiting.map((session) => <div key={session.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{session.patient_name}</p><p className="text-xs text-muted-foreground">{session.doctor_name || "مقدم غير محدد"} · انتظار {session.wait_time_minutes ?? 0} دقيقة</p></div><Button size="sm" disabled={!!current || !!session.lock_holder_id} onClick={() => void startNext(session)}>استلام</Button></div>)}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>عاد إلى التشغيل ({returned.length})</CardTitle></CardHeader><CardContent>{returned.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">لا توجد زيارات بانتظار الإنهاء التشغيلي</p> : returned.map((session) => <div key={session.id} className="rounded-lg border p-3 mb-2"><p className="font-medium">{session.patient_name}</p><p className="text-xs text-muted-foreground">بانتظار الإنهاء في Operation Workspace</p></div>)}</CardContent></Card>
      </div>
    </div>
  );
}
