"use client";

import { useCallback, useEffect, useState } from "react";
import { getQueue } from "@/domain/queue/queue.queries";
import type { EnrichedSession, SessionStatus } from "@/domain/queue/queue.types";
import { completeFromReception, markNoShowFromReception, cancelFromReception, moveFromOperation, registerPatientArrival } from "@/domain/queue/workspace.actions";
import { useAuth } from "@/core/auth/AuthContext";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, GripVertical, UserCheck, CheckCircle2, Search, RefreshCw } from "lucide-react";

const lanes: { status: SessionStatus; title: string; description: string }[] = [
  { status: "waiting", title: "في الانتظار", description: "وصل المريض وينتظر التوجيه" },
  { status: "in_consultation", title: "مع مقدم الخدمة", description: "العملية موجودة لدى Clinical Workspace" },
  { status: "pending_close", title: "بانتظار الاستقبال", description: "عاد المريض من Clinical Workspace" },
  { status: "completed", title: "مكتمل", description: "تم إنهاء الزيارة تشغيلياً" },
];

export function OperationWorkspace({ initialQueue = [] }: { initialQueue?: EnrichedSession[] }) {
  const { tenantId } = useAuth();
  const [sessions, setSessions] = useState<EnrichedSession[]>(initialQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useQueueSubscription(tenantId || "");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await getQueue());
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل حركة المرضى");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try { await fn(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "تعذر تنفيذ العملية"); }
  };

  const visible = sessions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [s.patient_name, s.patient_file_number, s.patient_phone, s.doctor_name].filter(Boolean).some((value) => String(value).toLowerCase().includes(q));
  });

  const dropTarget = async (target: SessionStatus) => {
    if (!draggedId) return;
    const session = sessions.find((s) => s.id === draggedId);
    setDraggedId(null);
    if (!session || session.session_status === target) return;
    const allowed = (session.session_status === "waiting" && target === "in_consultation") || (session.session_status === "pending_close" && target === "completed");
    if (!allowed) { setError("هذا الانتقال لا يتم من شاشة التشغيل؛ يجب أن يمر عبر مساحة العمل المختصة"); return; }
    await run(() => moveFromOperation(session.id, target));
  };

  const laneSessions = (status: SessionStatus) => visible.filter((s) => s.session_status === status);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <div><h1 className="text-3xl font-bold">مساحة العمل التشغيلية</h1><p className="text-muted-foreground mt-1">إدارة حركة المريض من الوصول وحتى إعادة الاستلام وإنهاء الزيارة</p></div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} /> تحديث</Button>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="relative"><Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالمريض أو رقم الملف أو الطبيب..." className="h-10 w-full rounded-md border bg-background pr-9 pl-3 text-sm" /></div>
      <div className="grid gap-4 xl:grid-cols-4">
        {lanes.map((lane) => {
          const items = laneSessions(lane.status);
          return <section key={lane.status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void dropTarget(lane.status); }} className="min-h-[420px] rounded-xl border bg-muted/20 p-3">
            <div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold">{lane.title}</h2><p className="text-xs text-muted-foreground mt-1">{lane.description}</p></div><Badge variant="outline">{items.length}</Badge></div>
            <div className="space-y-3">
              {items.map((session) => <Card key={session.id} draggable={session.session_status !== "completed"} onDragStart={() => setDraggedId(session.id)} onDragEnd={() => setDraggedId(null)} className="cursor-grab active:cursor-grabbing">
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="truncate">{session.patient_name || "مريض"}</span></CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2 text-muted-foreground">{session.patient_file_number && <span>#{session.patient_file_number}</span>}{session.doctor_name && <span>{session.doctor_name}</span>}{session.room_name && <span>{session.room_name}</span>}</div>
                  {session.session_status === "waiting" && <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void run(() => moveFromOperation(session.id, "in_consultation"))}><UserCheck className="h-4 w-4 ml-1" /> توجيه للطبيب</Button>
                    <Button size="sm" variant="outline" onClick={() => void run(() => registerPatientArrival({ sessionId: session.id, patient_id: session.patient_id }))}>تسجيل الوصول</Button>
                    <Button size="sm" variant="ghost" onClick={() => void run(() => markNoShowFromReception(session.id))}>لم يحضر</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => void run(() => cancelFromReception(session.id))}>إلغاء</Button>
                  </div>}
                  {session.session_status === "in_consultation" && <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-800">العملية لدى Clinical Workspace. تنتظر عودتها إلى الاستقبال.</div>}
                  {session.session_status === "pending_close" && <Button size="sm" className="w-full" onClick={() => void run(() => completeFromReception(session.id))}><CheckCircle2 className="h-4 w-4 ml-1" /> إنهاء الزيارة من الاستقبال</Button>}
                  {session.session_status === "completed" && <div className="flex items-center gap-2 text-green-700 text-xs"><CheckCircle2 className="h-4 w-4" /> مكتمل</div>}
                  {session.session_status === "waiting" && session.wait_time_minutes !== undefined && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> انتظار {session.wait_time_minutes} دقيقة</div>}
                </CardContent>
              </Card>)}
              {items.length === 0 && <div className="rounded-lg border border-dashed p-8 text-center text-xs text-muted-foreground">لا توجد عمليات</div>}
            </div>
          </section>;
        })}
      </div>
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">السحب والإفلات يغيّر الحالة المحفوظة فقط للانتقالات التشغيلية المسموح بها. الانتقال إلى العمل السريري والعودة منه يظل handoff بين مساحتي العمل ولا يتجاوز صلاحيات المستخدم.</div>
    </div>
  );
}
