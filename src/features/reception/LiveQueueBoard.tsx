"use client";

// src/features/reception/LiveQueueBoard.tsx
// Phase 4 — Queue Management Module
// Full queue board for reception staff

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/core/auth/AuthContext";
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
  Users,
  Clock,
  DoorOpen,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Search,
  Stethoscope,
  Phone,
  AlertTriangle,
  Activity,
  Timer,
} from "lucide-react";
import { EnrichedSession, SessionStatus, QueueStats } from "@/domain/queue/queue.types";

interface LiveQueueBoardProps {
  tenantId?: string;
  initialQueue?: EnrichedSession[];
  initialStats?: QueueStats | null;
  initialDoctors?: { id: string; full_name: string; specialization: string | null }[];
}

export function LiveQueueBoard({ tenantId: propTenantId, initialQueue = [], initialStats = null, initialDoctors = [] }: LiveQueueBoardProps) {
  const { tenantId: authTenantId } = useAuth();
  const tenantId = propTenantId || authTenantId;

  const [sessions, setSessions] = useState<EnrichedSession[]>(initialQueue);
  const [stats, setStats] = useState<QueueStats | null>(initialStats);
  const [doctors, setDoctors] = useState<{ id: string; full_name: string; specialization: string | null }[]>(initialDoctors);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "waiting" | "in_consultation" | "completed">("all");
  const [isLoading, setIsLoading] = useState(initialQueue.length === 0);
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Realtime subscription
  useQueueSubscription(tenantId || "");

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!tenantId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [queueData, statsData, doctorsData] = await Promise.all([
        getQueue(tenantId),
        getQueueStats(tenantId),
        getActiveDoctors(tenantId),
      ]);
      setSessions(queueData);
      setStats(statsData);
      setDoctors(doctorsData);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    if (initialQueue.length === 0) {
      fetchData();
    }
  }, [fetchData, initialQueue.length, tenantId]);

  // Handle actions
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
        case "noshow":
          await markNoShow(sessionId);
          break;
        case "cancel":
          await cancelVisit(sessionId);
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

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = session.patient_name?.toLowerCase().includes(query);
      const matchPhone = session.patient_phone?.includes(query);
      const matchFile = session.patient_file_number?.toLowerCase().includes(query);
      if (!matchName && !matchPhone && !matchFile) return false;
    }
    if (selectedDoctor !== "all" && session.doctor_id !== selectedDoctor) return false;
    if (activeFilter === "waiting") return session.session_status === "waiting";
    if (activeFilter === "in_consultation") return session.session_status === "in_consultation";
    if (activeFilter === "completed") return session.session_status === "completed" || session.session_status === "pending_close";
    return true;
  });

  const waitingCount = sessions.filter((s) => s.session_status === "waiting").length;
  const inConsultationCount = sessions.filter((s) => s.session_status === "in_consultation").length;

  const getStatusConfig = (status: SessionStatus) => {
    switch (status) {
      case "waiting":
        return { color: "bg-amber-100 text-amber-800 border-amber-200", label: "في الانتظار" };
      case "in_consultation":
        return { color: "bg-green-100 text-green-800 border-green-200", label: "في الكشف" };
      case "pending_close":
        return { color: "bg-blue-100 text-blue-800 border-blue-200", label: "بانتظار الإغلاق" };
      case "completed":
        return { color: "bg-slate-100 text-slate-800 border-slate-200", label: "مكتمل" };
      case "no_show":
        return { color: "bg-red-100 text-red-800 border-red-200", label: "لم يحضر" };
      case "cancelled":
        return { color: "bg-gray-100 text-gray-800 border-gray-200", label: "ملغى" };
    }
  };

  if (!tenantId) return <div className="p-8 text-center">جاري التحميل...</div>;

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">في الانتظار</p>
                <p className="text-2xl font-bold">{stats.total_waiting}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">في الكشف</p>
                <p className="text-2xl font-bold">{stats.total_in_consultation}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مكتمل اليوم</p>
                <p className="text-2xl font-bold">{stats.total_completed_today}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Timer className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">متوسط الانتظار</p>
                <p className="text-2xl font-bold">{stats.avg_wait_time_minutes}د</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو رقم الملف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 text-right"
          />
        </div>
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="all">جميع الأطباء</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Buttons */}
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
            onClick={() => setActiveFilter(filter.key as any)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لا يوجد مرضى</p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => {
            const statusConfig = getStatusConfig(session.session_status);
            const isProcessingSession = isProcessing[session.id];

            return (
              <Card
                key={session.id}
                className={`border-r-4 transition-all hover:shadow-md ${
                  session.session_status === "waiting" ? "border-r-amber-500" :
                  session.session_status === "in_consultation" ? "border-r-emerald-500" :
                  "border-r-slate-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{session.patient_name || "مريض غير معروف"}</span>
                        {session.patient_file_number && (
                          <span className="text-xs text-muted-foreground">#{session.patient_file_number}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {session.patient_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {session.patient_phone}
                          </span>
                        )}
                        {session.doctor_name && (
                          <span className="flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            {session.doctor_name}
                          </span>
                        )}
                        {session.room_name && <span>الغرفة: {session.room_name}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                      {session.session_status === "waiting" && session.wait_time_minutes !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className={session.wait_time_minutes > 30 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                            {session.wait_time_minutes}د
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.session_status === "waiting" && (
                        <Button size="sm" onClick={() => handleAction("call", session.id)} disabled={isProcessingSession}>
                          <DoorOpen className="h-3 w-3 ml-1" />استدعاء
                        </Button>
                      )}
                      {session.session_status === "in_consultation" && (
                        <>
                          <Button size="sm" onClick={() => handleAction("complete", session.id)} disabled={isProcessingSession} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-3 w-3 ml-1" />إنهاء
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAction("hold", session.id)} disabled={isProcessingSession}>
                            <PauseCircle className="h-3 w-3 ml-1" />تعليق
                          </Button>
                        </>
                      )}
                      {session.session_status === "waiting" && (
                        <Button size="sm" variant="ghost" onClick={() => handleAction("noshow", session.id)} disabled={isProcessingSession}>
                          <XCircle className="h-3 w-3 ml-1" />لم يحضر
                        </Button>
                      )}
                      {(session.session_status === "waiting" || session.session_status === "in_consultation") && (
                        <Button size="sm" variant="ghost" onClick={() => handleAction("cancel", session.id)} disabled={isProcessingSession} className="text-destructive">
                          إلغاء
                        </Button>
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
