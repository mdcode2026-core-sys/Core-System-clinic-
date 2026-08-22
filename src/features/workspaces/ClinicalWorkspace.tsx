"use client";

import { useCallback, useEffect, useState } from "react";
import { getQueue } from "@/domain/queue/queue.queries";
import type { EnrichedSession } from "@/domain/queue/queue.types";
import { transitionToClinical, transitionToPendingReception } from "@/domain/queue/workspace.actions";
import { useAuth } from "@/core/auth/AuthContext";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle2, Clock, DoorOpen, RefreshCw, Stethoscope } from "lucide-react";

export function ClinicalWorkspace({ initialQueue = [] }: { initialQueue?: EnrichedSession[] }) {
  const { user, tenantId } = useAuth();
  const [sessions, setSessions] = useState<EnrichedSession[]>(initialQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useQueueSubscription(tenantId || "");

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const queue = await getQueue();
      setSessions(queue.filter((s) => s.doctor_id === user.id || s.lock_holder_id === user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل قائمة العمل السريري");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تنفيذ الإجراء");
    }
  };

  const waiting = sessions.filter((s) => s.session_status === "waiting");
  const current = sessions.find((s) => s.session_status === "in_consultation" && s.lock_holder_id === user?.id);
  const returned = sessions.filter((s) => s.session_status === "pending_close");

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3"><Stethoscope className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold">مساحة العمل السريرية</h1>
              <p className="text-muted-foreground mt-1">العمل الطبي للمستخدم المعيّن، مع handoff واضح إلى مساحة التشغيل</p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} /> تحديث
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {current ? (
        <Card className="border-green-300 ring-1 ring-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><DoorOpen className="h-5 w-5 text-green-600" /> المريض الحالي</CardTitle>
              <Badge>في الإجراء</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xl font-semibold">{current.patient_name || "مريض"}</p>
              <p className="text-sm text-muted-foreground">{current.patient_file_number ? `ملف #${current.patient_file_number}` : ""} {current.room_name ? ` · ${current.room_name}` : ""}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-4 text-sm text-muted-foreground">
              هذه مساحة العمل التشغيلية للجزء الطبي. التفاصيل السريرية الكاملة ستتوسع في المراحل الطبية القادمة دون تغيير handoff الخاص برحلة المريض.
            </div>
            <Button className="w-full" onClick={() => void run(() => transitionToPendingReception(current.id))}>
              <CheckCircle2 className="h-4 w-4 ml-2" /> إنهاء الجزء السريري وإعادة العملية إلى الاستقبال
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <DoorOpen className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">لا يوجد مريض في الإجراء حالياً</p>
            {waiting.length > 0 && (
              <Button className="mt-4" size="lg" onClick={() => void run(() => transitionToClinical(waiting[0].id))}>
                استلام المريض التالي
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> المرضى المعيّنون ({waiting.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {waiting.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">لا يوجد مرضى في الانتظار</p> : waiting.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-medium">{session.patient_name}</p><p className="text-xs text-muted-foreground">انتظار {session.wait_time_minutes ?? 0} دقيقة</p></div>
                <Button size="sm" disabled={!!current} onClick={() => void run(() => transitionToClinical(session.id))}>استلام</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>عاد إلى التشغيل ({returned.length})</CardTitle></CardHeader>
          <CardContent>
            {returned.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">لا توجد عمليات بانتظار الاستقبال</p> : returned.map((session) => (
              <div key={session.id} className="rounded-lg border p-3 mb-2">
                <p className="font-medium">{session.patient_name}</p>
                <p className="text-xs text-muted-foreground">بانتظار الإنهاء التشغيلي في Operation Workspace</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
