/**
 * Agenda Module — Event Detail
 * View appointment details + change status
 * Delegates all logic to Server Actions
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  DoorOpen,
  FileText,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  updateAgendaEventStatus,
  cancelAgendaEvent,
} from "@/domain/agenda/agenda.actions";
import {
  AgendaEventStatus,
  ValidStateTransitions,
  type AgendaEventWithRelations,
  type AgendaEventStatusValue,
} from "@/domain/agenda/agenda.types";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface AgendaEventDetailProps {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaEventWithRelations | null;
  tenantId: string;
}

// ─────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────

const StatusConfig: Record<
  AgendaEventStatusValue,
  { label: string; color: string; icon: React.ReactNode }
> = {
  scheduled: {
    label: "مجدول",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Calendar className="w-4 h-4" />,
  },
  confirmed: {
    label: "مؤكد",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  arrived: {
    label: "حضر",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <MapPin className="w-4 h-4" />,
  },
  in_session: {
    label: "في الجلسة",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Play className="w-4 h-4" />,
  },
  completed: {
    label: "مكتمل",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  no_show: {
    label: "لم يحضر",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "ملغى",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  rescheduled: {
    label: "معاد جدولته",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <RotateCcw className="w-4 h-4" />,
  },
};

// ─────────────────────────────────────────
// ACTION BUTTONS CONFIG
// ─────────────────────────────────────────

const StatusActions: Record<
  AgendaEventStatusValue,
  { next: AgendaEventStatusValue; label: string; variant: "default" | "outline" | "destructive" }[]
> = {
  scheduled: [
    { next: "confirmed", label: "تأكيد", variant: "default" },
    { next: "cancelled", label: "إلغاء", variant: "destructive" },
  ],
  confirmed: [
    { next: "arrived", label: "تسجيل الحضور", variant: "default" },
    { next: "no_show", label: "لم يحضر", variant: "outline" },
    { next: "cancelled", label: "إلغاء", variant: "destructive" },
  ],
  arrived: [
    { next: "in_session", label: "بدء الجلسة", variant: "default" },
    { next: "cancelled", label: "إلغاء", variant: "destructive" },
  ],
  in_session: [
    { next: "completed", label: "إنهاء الجلسة", variant: "default" },
    { next: "cancelled", label: "إلغاء", variant: "destructive" },
  ],
  completed: [],
  no_show: [
    { next: "rescheduled", label: "إعادة الجدولة", variant: "outline" },
  ],
  cancelled: [
    { next: "scheduled", label: "إعادة الحجز", variant: "outline" },
  ],
  rescheduled: [
    { next: "scheduled", label: "تأكيد الموعد الجديد", variant: "default" },
  ],
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export function AgendaEventDetail({
  isOpen,
  onClose,
  event,
  tenantId,
}: AgendaEventDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!event) return null;

  const statusConfig = StatusConfig[event.status as AgendaEventStatusValue] || StatusConfig.scheduled;
  const actions = StatusActions[event.status as AgendaEventStatusValue] || [];

  // ─────────────────────────────────────────
  // STATUS CHANGE HANDLER
  // ─────────────────────────────────────────

  async function handleStatusChange(newStatus: AgendaEventStatusValue) {
    if (!event) return;
    
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("id", event.id);
    formData.append("status", newStatus);
    formData.append("current_status", event.status ?? "");

    const result = await updateAgendaEventStatus(formData);

    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setIsLoading(false);
  }

  // ─────────────────────────────────────────
  // CANCEL HANDLER
  // ─────────────────────────────────────────

  async function handleCancel() {
    if (!event) return;
    
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("id", event.id);
    formData.append("current_status", event.status ?? "");

    const result = await cancelAgendaEvent(formData);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
      router.refresh();
    }

    setIsLoading(false);
  }

  // ─────────────────────────────────────────
  // FORMAT HELPERS
  // ─────────────────────────────────────────

  function formatDateTime(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateStr = startDate.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    const startTime = startDate.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = endDate.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { dateStr, startTime, endTime };
  }

  const { dateStr, startTime, endTime } = formatDateTime(
    event.scheduled_start,
    event.scheduled_end
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>تفاصيل الموعد</span>
            <Badge className={statusConfig.color} variant="outline">
              <span className="flex items-center gap-1">
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Date & Time */}
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                من {startTime} إلى {endTime}
              </span>
            </div>
          </div>

          <Separator />

          {/* Patient */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>المريض</span>
            </div>
            <p className="font-medium">
              {event.patient
                ? `${event.patient.first_name} ${event.patient.last_name}`
                : "غير معروف"}
            </p>
            {event.patient?.phone_primary && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {event.patient.phone_primary}
              </p>
            )}
          </div>

          {/* Doctor */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="w-4 h-4" />
              <span>الطبيب</span>
            </div>
            <p className="font-medium">
              {event.doctor
                ? event.doctor.full_name
                : "غير معروف"}
              {event.doctor?.specialization && (
                <span className="text-sm text-muted-foreground mr-1">
                  — {event.doctor.specialization}
                </span>
              )}
            </p>
          </div>

          {/* Room */}
          {event.room && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DoorOpen className="w-4 h-4" />
                <span>الغرفة</span>
              </div>
              <p className="font-medium">{event.room.room_name}</p>
            </div>
          )}

          {/* Procedure */}
          {event.procedure && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>الإجراء</span>
              </div>
              <p className="font-medium">{event.procedure.procedure_name}</p>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>ملاحظات</span>
                </div>
                <p className="text-sm text-muted-foreground">{event.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Status Actions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">إجراءات</p>
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action.next}
                  variant={action.variant}
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleStatusChange(action.next)}
                >
                  {action.label}
                </Button>
              ))}
              {/* Special cancel button for states not in actions */}
              {![
                "scheduled",
                "confirmed",
                "arrived",
                "in_session",
              ].includes(event.status ?? "") && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isLoading}
                  onClick={handleCancel}
                >
                  إلغاء
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
