"use client";

// src/features/reception/LiveQueueBoard.tsx
// Package 3.1.4 — Queue Permission Migration
// Added permission guards to all action buttons

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { usePermissions } from "@/core/permissions/usePermissions";
import { getQueue, getQueueStats, getActiveDoctors } from "@/domain/queue/queue.queries";
import {
  callNextPatient,
  completeVisit,
  markNoShow,
  cancelVisit,
  holdVisit,
  resumeVisit,
} from "@/domain/queue/queue.actions";
import { useQueueSubscription } from "@/shared/hooks/useQueue";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Search,
  Phone,
  Clock,
  DoorOpen,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  XCircle,
  UserX,
} from "lucide-react";
import { EnrichedSession, QueueStats, SessionStatus } from "@/domain/queue/queue.types";

interface LiveQueueBoardProps {
  initialSessions?: EnrichedSession[];
  initialStats?: QueueStats | null;
  initialDoctors?: { id: string; full_name: string; specialization: string | null }[];
  canUpdateSession?: boolean;
}

function getStatusConfig(status: SessionStatus) {
  const configs: Record<SessionStatus, { label: string; color: string }> = {
    waiting: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800" },
    in_consultation: { label: "في الكشف", color: "bg-green-100 text-green-800" },
    pending_close: { label: "بانتظار الإغلاق", color: "bg-blue-100 text-blue-800" },
    completed: { label: "مكتمل", color: "bg-gray-100 text-gray-800" },
    cancelled: { label: "ملغى", color: "bg-red-100 text-red-800" },
    no_show: { label: "لم يحضر", color: "bg-orange-100 text-orange-800" },
  };
  return configs[status] || { label: status, color: "bg-gray-100" };
}

export function LiveQueueBoard({
  initialSessions = [],
  initialStats = null,
  initialDoctors = [],
  canUpdateSession = false,
}: LiveQueueBoardProps) {
  const { user, tenantId } = useAuth();
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const [sessions, setSessions] = useState<EnrichedSession[]>(initialSessions);
  const [stats, setStats] = useState<QueueStats | null>(initialStats);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [isLoading, setIsLoading] = useState(initialSessions.length === 0);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SessionStatus | "all">("all");

  useQueueSubscription(tenantId);

  const effectiveCanUpdate = canUpdateSession || hasPermission("sessions:update");

  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [allSessions, newStats, newDoctors] = await Promise.all([
        getQueue(),
        getQueueStats(),
        getActiveDoctors(),
      ]);
      setSessions(allSessions);
      setStats(newStats);
      setDoctors(newDoctors);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (initialSessions.length === 0) {
      fetchData();
    }
  }, [fetchData, initialSessions.length]);

  const handleAction = async (action: string, sessionId: string) => {
    if (!effectiveCanUpdate) {
      setErrorMessage("ليس لديك صلاحية لتنفيذ هذا الإجراء");
      return;
    }
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
        case "no_show":
          await markNoShow(sessionId);
          break;
        case "cancel":
          await cancelVisit(sessionId);
          break;
      }
      await fetchData();
    } catch (error: any) {
      setErrorMessage(error.message || "Action failed");
    } finally {
      setIsProcessing((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeFilter !== "all" && s.session_status !== activeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.patient_name?.toLowerCase().includes(q) ?? false) ||
      (s.patient_file_number?.includes(q) ?? false) ||
      (s.patient_phone?.includes(q) ?? false)
    );
  });

  const waitingCount = sessions.filter((s) => s.session_status === "waiting").length;
  const inConsultationCount = sessions.filter((s) => s.session_status === "in_consultation").length;

  if (isLoading || permsLoading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total_waiting}</p>
              <p className="text-xs text-muted-foreground">في الانتظار</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total_in_consultation}</p>
              <p className="text-xs text-muted-foreground">في الكشف</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total_completed_today}</p>
              <p className="text-xs text-muted-foreground">مكتمل اليوم</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.avg_wait_time_minutes}د</p>
              <p className="text-xs text-muted-foreground">متوسط الانتظار</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو رقم الملف أو الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-9 text-right"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: `الكل (${sessions.length})` },
          { key: "waiting", label: `في الانتظار (${waitingCount})` },
          { key: "in_consultation", label: `في الكشف (${inConsultationCount})` },
          { key: "completed", label: "مكتمل" },
        ].map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.key as SessionStatus | "all")}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              لا يوجد مرضى
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const statusConfig = getStatusConfig(session.session_status);
            const isProcessingSession = isProcessing[session.id];

            return (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          {session.patient_name || "مريض غير معروف"}
                        </span>
                        {session.patient_file_number && (
                          <Badge variant="outline">#{session.patient_file_number}</Badge>
                        )}
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {session.patient_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {session.patient_phone}
                          </span>
                        )}
                        {session.doctor_name && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.doctor_name}
                          </span>
                        )}
                        {session.room_name && (
                          <span>الغرفة: {session.room_name}</span>
                        )}
                        {session.wait_time_minutes !== undefined && (
                          <span className={session.wait_time_minutes > 30 ? "text-red-600 font-medium" : ""}>
                            {session.wait_time_minutes}د انتظار
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {session.session_status === "waiting" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction("call", session.id)}
                          disabled={isProcessingSession || !effectiveCanUpdate}
                        >
                          <DoorOpen className="h-3 w-3 ml-1" />
                          استدعاء
                        </Button>
                      )}
                      {session.session_status === "in_consultation" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("hold", session.id)}
                            disabled={isProcessingSession || !effectiveCanUpdate}
                          >
                            <PauseCircle className="h-3 w-3 ml-1" />
                            تعليق
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAction("complete", session.id)}
                            disabled={isProcessingSession || !effectiveCanUpdate}
                          >
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                            إنهاء
                          </Button>
                        </>
                      )}
                      {session.session_status === "in_consultation" && !session.lock_holder_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction("resume", session.id)}
                          disabled={isProcessingSession || !effectiveCanUpdate}
                        >
                          <PlayCircle className="h-3 w-3 ml-1" />
                          استئناف
                        </Button>
                      )}
                      {(session.session_status === "waiting" || session.session_status === "in_consultation") && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("no_show", session.id)}
                            disabled={isProcessingSession || !effectiveCanUpdate}
                          >
                            <UserX className="h-3 w-3 ml-1" />
                            لم يحضر
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction("cancel", session.id)}
                            disabled={isProcessingSession || !effectiveCanUpdate}
                          >
                            <XCircle className="h-3 w-3 ml-1" />
                            إلغاء
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
