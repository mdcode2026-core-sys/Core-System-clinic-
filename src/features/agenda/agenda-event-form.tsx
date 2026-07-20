/**
 * Agenda Module — Event Form
 * Create / Edit appointment form
 * Supports: Existing Patient + New Patient (temp)
 * Required: Phone number for all appointments
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
import { Calendar, Clock, User, Stethoscope, DoorOpen, FileText, Phone, Search, UserPlus } from "lucide-react";
import { createAgendaEvent, updateAgendaEvent } from "@/domain/agenda/agenda.actions";
import type { AgendaEventWithRelations } from "@/domain/agenda/agenda.types";

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
  event?: AgendaEventWithRelations | null;
  patients: PatientOption[];
  doctors: DoctorOption[];
  rooms: RoomOption[];
  procedures: ProcedureOption[];
  defaultDate?: string;
}

// ─────────────────────────────────────────
// PATIENT MODE
// ─────────────────────────────────────────

type PatientMode = "search" | "new";

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

  // ─────────────────────────────────────────
  // FORM STATE
  // ─────────────────────────────────────────

  // Patient
  const [patientMode, setPatientMode] = useState<PatientMode>("search");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [tempPatientName, setTempPatientName] = useState("");
  const [tempPatientPhone, setTempPatientPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Other fields
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [procedureId, setProcedureId] = useState<string>("");
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ─────────────────────────────────────────
  // FILTER PATIENTS BY SEARCH
  // ─────────────────────────────────────────

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return false; // Don't show all, only when searching
    return (
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  });

  // ─────────────────────────────────────────
  // LOAD EXISTING DATA IN EDIT MODE
  // ─────────────────────────────────────────

  useEffect(() => {
    if (event) {
      // In edit mode, always use existing patient
      setPatientMode("search");
      setPatientId(event.patient_id || null);
      setTempPatientName("");
      setTempPatientPhone("");
      setSearchQuery("");

      setDoctorId(event.doctor_id || null);
      setRoomId(event.room_id || "");
      setProcedureId(event.procedure_id || "");
      setDate(event.scheduled_start.split("T")[0]);
      setStartTime(event.scheduled_start.split("T")[1]?.slice(0, 5) || "09:00");
      setEndTime(event.scheduled_end.split("T")[1]?.slice(0, 5) || "09:30");
      setNotes(event.notes || "");
    } else {
      // Reset for create mode
      setPatientMode("search");
      setPatientId(null);
      setTempPatientName("");
      setTempPatientPhone("");
      setSearchQuery("");

      setDoctorId(null);
      setRoomId("");
      setProcedureId("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setStartTime("09:00");
      setEndTime("09:30");
      setNotes("");
    }
    setError("");
  }, [event, defaultDate, isOpen]);

  // ─────────────────────────────────────────
  // AUTO-SET END TIME
  // ─────────────────────────────────────────

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

    // Validate patient
    if (patientMode === "search" && !patientId) {
      setError("اختر مريضاً من القائمة أو أضف مريضاً جديداً");
      setIsLoading(false);
      return;
    }

    if (patientMode === "new") {
      if (!tempPatientName.trim()) {
        setError("اسم المريض مطلوب");
        setIsLoading(false);
        return;
      }
      if (!tempPatientPhone.trim()) {
        setError("رقم هاتف المريض مطلوب للتواصل");
        setIsLoading(false);
        return;
      }
    }

    // Validate doctor
    if (!doctorId) {
      setError("اختر الطبيب");
      setIsLoading(false);
      return;
    }

    const scheduledStart = `${date}T${startTime}:00`;
    const scheduledEnd = `${date}T${endTime}:00`;

    const formData = new FormData();
    formData.append("tenant_id", tenantId);

    // Patient data
    if (patientMode === "search" && patientId) {
      formData.append("patient_id", patientId);
    } else {
      // New patient — send temp data
      // TODO: Backend should create temp patient record
      formData.append("temp_patient_name", tempPatientName.trim());
      formData.append("temp_patient_phone", tempPatientPhone.trim());
    }

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

          {/* Patient Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                المريض *
              </Label>
              {!isEditMode && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={patientMode === "search" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPatientMode("search")}
                  >
                    <Search className="w-3 h-3 ml-1" />
                    موجود
                  </Button>
                  <Button
                    type="button"
                    variant={patientMode === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPatientMode("new")}
                  >
                    <UserPlus className="w-3 h-3 ml-1" />
                    جديد
                  </Button>
                </div>
              )}
            </div>

            {/* Search Mode */}
            {patientMode === "search" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                {/* Search Results */}
                {searchQuery.trim() && (
                  <div className="border rounded-md max-h-32 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <div
                          key={p.id}
                          className={`p-2 cursor-pointer hover:bg-muted transition-colors ${
                            patientId === p.id ? "bg-primary/10 border-r-2 border-primary" : ""
                          }`}
                          onClick={() => setPatientId(p.id)}
                        >
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {p.phone}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        لا يوجد مريض بهذا الاسم
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Patient */}
                {patientId && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-sm font-medium text-green-800">
                      ✓ {patients.find((p) => p.id === patientId)?.name}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* New Patient Mode */}
            {patientMode === "new" && (
              <div className="space-y-2">
                <Input
                  placeholder="اسم المريض الكامل *"
                  value={tempPatientName}
                  onChange={(e) => setTempPatientName(e.target.value)}
                />
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="رقم الهاتف للتواصل *"
                    value={tempPatientPhone}
                    onChange={(e) => setTempPatientPhone(e.target.value)}
                    className="pr-10"
                    type="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  سيتم استكمال السجل عند حضور المريض
                </p>
              </div>
            )}
          </div>

          {/* Doctor */}
          <div className="space-y-2">
            <Label htmlFor="doctor" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              الطبيب *
            </Label>
            <Select 
              value={doctorId || ""} 
              onValueChange={(val) => setDoctorId(val || null)}
            >
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
            <Button type="submit" disabled={isLoading || !doctorId}>
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
