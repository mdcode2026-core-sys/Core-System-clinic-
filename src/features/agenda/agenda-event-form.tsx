/**
 * Agenda Module — Event Form
 * Create / Edit appointment form
 * Delegates all logic to Server Actions
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Calendar, Clock, User, Stethoscope, DoorOpen, FileText } from "lucide-react";
import { createAgendaEvent, updateAgendaEvent } from "@/domain/agenda/agenda.actions";
import type { AgendaEventRow, AgendaEventWithRelations } from "@/domain/agenda/agenda.types";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface PatientOption {
  id: string;
  name: string;
  phone: string;
}

interface DoctorOption {
  id: string;
  name: string;
  specialization: string | null;
}

interface RoomOption {
  id: string;
  name: string;
}

interface ProcedureOption {
  id: string;
  name: string;
  duration: number;
}

interface AgendaEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  userId: string;
  event?: AgendaEventWithRelations | null; // null = create mode
  patients: PatientOption[];
  doctors: DoctorOption[];
  rooms: RoomOption[];
  procedures: ProcedureOption[];
  defaultDate?: string; // YYYY-MM-DD
}

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export function AgendaEventForm({
  isOpen,
  onClose,
  tenantId,
  userId,
  event,
  patients,
  doctors,
  rooms,
  procedures,
  defaultDate,
}: AgendaEventFormProps) {
  const router = useRouter();
  const isEditMode = !!event;

  // Form state
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [procedureId, setProcedureId] = useState("");
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing data in edit mode
  useEffect(() => {
    if (event) {
      setPatientId(event.patient_id);
      setDoctorId(event.doctor_id);
      setRoomId(event.room_id || "");
      setProcedureId(event.procedure_id || "");
      setDate(event.scheduled_start.split("T")[0]);
      setStartTime(event.scheduled_start.split("T")[1]?.slice(0, 5) || "09:00");
      setEndTime(event.scheduled_end.split("T")[1]?.slice(0, 5) || "09:30");
      setNotes(event.notes || "");
    } else {
      // Reset for create mode
      setPatientId("");
      setDoctorId("");
      setRoomId("");
      setProcedureId("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setStartTime("09:00");
      setEndTime("09:30");
      setNotes("");
    }
    setError("");
  }, [event, defaultDate, isOpen]);

  // Auto-set end time based on procedure duration
  useEffect(() => {
    if (!isEditMode && procedureId && startTime) {
      const proc = procedures.find((p) => p.id === procedureId);
      if (proc) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes);
        const endDate = new Date(startDate.getTime() + proc.duration * 60000);
        const endHours = String(endDate.getHours()).padStart(2, "0");
        const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
        setEndTime(`${endHours}:${endMinutes}`);
      }
    }
  }, [procedureId, startTime, isEditMode, procedures]);

  // ─────────────────────────────────────────
  // SUBMIT HANDLER
  // ─────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const scheduledStart = `${date}T${startTime}:00`;
    const scheduledEnd = `${date}T${endTime}:00`;

    const formData = new FormData();
    formData.append("tenant_id", tenantId);
    formData.append("patient_id", patientId);
    formData.append("doctor_id", doctorId);
    if (roomId) formData.append("room_id", roomId);
    if (procedureId) formData.append("procedure_id", procedureId);
    formData.append("scheduled_start", scheduledStart);
    formData.append("scheduled_end", scheduledEnd);
    if (notes) formData.append("notes", notes);
    formData.append("created_by", userId);

    if (isEditMode && event) {
      formData.append("id", event.id);
      const result = await updateAgendaEvent(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        router.refresh();
      }
    } else {
      const result = await createAgendaEvent(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
        router.refresh();
      }
    }

    setIsLoading(false);
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isEditMode ? "تعديل موعد" : "موعد جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Patient */}
          <div className="space-y-2">
            <Label htmlFor="patient" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              المريض *
            </Label>
            <Select value={patientId} onValueChange={setPatientId} required>
              <SelectTrigger id="patient">
                <SelectValue placeholder="اختر المريض" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor */}
          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              الطبيب *
            </Label>
            <Select value={doctorId} onValueChange={setDoctorId} required>
              <SelectTrigger id="doctor">
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                    {d.specialization ? ` — ${d.specialization}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room */}
          <div className="space-y-2">
            <Label htmlFor="room" className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4" />
              الغرفة
            </Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger id="room">
                <SelectValue placeholder="اختر الغرفة (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون غرفة</SelectItem>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procedure */}
          <div className="space-y-2">
            <Label htmlFor="procedure" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الإجراء
            </Label>
            <Select value={procedureId} onValueChange={setProcedureId}>
              <SelectTrigger id="procedure">
                <SelectValue placeholder="اختر الإجراء (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون إجراء</SelectItem>
                {procedures.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.duration} دقيقة)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              التاريخ *
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                من *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                إلى *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading || !patientId || !doctorId}>
              {isLoading
                ? "جاري الحفظ..."
                : isEditMode
                ? "حفظ التعديلات"
                : "إنشاء الموعد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
