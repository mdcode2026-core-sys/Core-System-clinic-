"use client";

// src/features/doctor/MyQueueView.tsx
// Phase 4 — Queue Management Module
// Doctor-specific queue view

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { getQueue } from "@/domain/queue/queue.queries";
import {
  callNextPatient,
  completeVisit,
  holdVisit,
  resumeVisit,
} from "@/domain/queue/queue.actions";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Stethoscope,
  DoorOpen,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Clock,
  Phone,
  Users,
} from "lucide-react";
import { EnrichedSession } from "@/domain/queue/queue.types";

interface MyQueueViewProps {
  tenantId: string;
  initialQueue?: EnrichedSession[];
}

export function MyQueueView({ tenantId, initialQueue = [] }: MyQueueViewProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<EnrichedSession[]>(initialQueue);
  const [isLoading, setIsLoading] = useState(initialQueue.length === 0);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useQueueSubscription(tenantId);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const allSessions = await getQueue(tenantId);
      const mySessions = allSessions.filter(
        (s) => s.doctor_id === user.id || s.lock_holder_id === user.id
      );
      setSessions(mySessions);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, user]);

  useEffect(() => {
    if (initialQueue.length === 0) {
      fetchData();
    }
  }, [fetchData, initialQueue.length]);

  const handleAction = async (action: string, sessionId: string) => {
    setIsProcessing((prev) => ({ ...prev, [sessionId]: true }));
    setErrorMessage(null);
    try {
      switch (action) {
        case "call":
          await callNextPatient(sessionId);
          break;
        case "complete":
          await completeVisit(sessionId);
          break;
        case "hold":
          await holdVisit(sessionId);
          break;
        case "resume":
          await resumeVisit(sessionId);
          break;
      }
      await fetchData();
    } catch (error: any) {
      setErrorMessage(error.message || "Action failed");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const myWaiting = sessions.filter((s) => s.session_status === "waiting");
  const myCurrent = sessions.find((s) => s.session_status === "in_consultation" && s.lock_holder_id === user?.id);
  const myOnHold = sessions.filter((s) => s.session_status === "in_consultation" && !s.lock_holder_id);
  const myCompletedToday = sessions.filter((s) => s.session_status === "completed");

  if (!user) return null;
  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-full">
          <Stethoscope className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">قائمة الكشف الخاصة بي</h1>
          <p className="text-muted-foreground">
            {myWaiting.length} في الانتظار · {myCompletedToday.length} مكتمل اليوم
          </p>
        </div>
      </div>

      {myCurrent ? (
        <Card className="border-green-300 ring-1 ring-green-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DoorOpen className="h-5 w-5 text-green-600" />
                المريض الحالي
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">في الكشف</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="text-xl font-semibold">{myCurrent.patient_name || "غير معروف"}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  {myCurrent.patient_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {myCurrent.patient_phone}
                    </span>
                  )}
                  {myCurrent.patient_file_number && (
                    <span>ملف: #{myCurrent.patient_file_number}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAction("hold", myCurrent.id)} disabled={isProcessing[myCurrent.id]} variant="outline">
                  <PauseCircle className="h-4 w-4 ml-1" />تعليق
                </Button>
                <Button onClick={() => handleAction("complete", myCurrent.id)} disabled={isProcessing[myCurrent.id]} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 ml-1" />إنهاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <DoorOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">لا يوجد مريض حالياً</p>
            {myWaiting.length > 0 && (
              <Button className="mt-4" size="lg" onClick={() => handleAction("call", myWaiting[0].id)} disabled={isProcessing[myWaiting[0].id]}>
                <DoorOpen className="h-4 w-4 ml-1" />استدعاء المريض التالي
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {myOnHold.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PauseCircle className="h-4 w-4 text-purple-500" />
              معلق ({myOnHold.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myOnHold.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <span className="font-medium">{session.patient_name}</span>
                <Button size="sm" variant="outline" onClick={() => handleAction("resume", session.id)} disabled={isProcessing[session.id]}>
                  <PlayCircle className="h-3 w-3 ml-1" />استئناف
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />قائمة الانتظار
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myWaiting.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">لا يوجد مرضى في الانتظار</p>
          ) : (
            <div className="space-y-2">
              {myWaiting.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                    <div>
                      <p className="font-medium">{session.patient_name}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{session.wait_time_minutes}د
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAction("call", session.id)} disabled={isProcessing[session.id] || !!myCurrent}>
                    استدعاء
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
