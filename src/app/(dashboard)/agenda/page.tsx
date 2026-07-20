/**
 * Agenda Module — Main Page
 * Central Scheduling Engine
 * Integrates: Calendar, Form, Detail, Queries
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus, CalendarDays, Loader2 } from "lucide-react";
import { AgendaCalendar } from "@/features/agenda/agenda-calendar";
import { AgendaEventForm } from "@/features/agenda/agenda-event-form";
import { AgendaEventDetail } from "@/features/agenda/agenda-event-detail";
import {
  useAgendaEventsWithRelations,
  useInvalidateAgenda,
} from "@/domain/agenda/agenda.queries";
import { usePatients } from "@/domain/patients/patients.queries";
import type {
  AgendaEventWithRelations,
  CalendarRange,
} from "@/domain/agenda/agenda.types";
import type { ClinicPatient } from "@/infrastructure/supabase/database.types";

// ─────────────────────────────────────────
// MOCK DATA (will be replaced with real queries)
// TODO: Replace with useDoctors, useRooms, useProcedures queries
// ─────────────────────────────────────────

const MOCK_DOCTORS = [
  { id: "doc-1", name: "د. أحمد محمد", specialization: "جلدية" },
  { id: "doc-2", name: "د. سارة علي", specialization: "تجميل" },
];

const MOCK_ROOMS = [
  { id: "room-1", name: "غرفة 1" },
  { id: "room-2", name: "غرفة 2" },
];

const MOCK_PROCEDURES = [
  { id: "proc-1", name: "تنظيف بشرة", duration: 30 },
  { id: "proc-2", name: "ليزر", duration: 60 },
];

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export default function AgendaPage() {
  const router = useRouter();

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarRange, setCalendarRange] = useState<CalendarRange | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEventWithRelations | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string>("");

  // ─────────────────────────────────────────
  // TENANT & USER (from localStorage for now)
  // TODO: Replace with Auth context
  // ─────────────────────────────────────────

  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Get tenant_id from localStorage (set during login)
    const storedTenantId = localStorage.getItem("tenant_id");
    const storedUserId = localStorage.getItem("user_id");
    if (storedTenantId) setTenantId(storedTenantId);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  // ─────────────────────────────────────────
  // CALCULATE WEEK RANGE
  // ─────────────────────────────────────────

  useEffect(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    setCalendarRange({
      start: startOfWeek.toISOString(),
      end: endOfWeek.toISOString(),
    });
  }, [currentDate]);

  // ─────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────

  const { data: events = [], isLoading: eventsLoading } =
    useAgendaEventsWithRelations(tenantId, calendarRange);

  const { data: patientsData = [], isLoading: patientsLoading } =
    usePatients(tenantId);

  const invalidateAgenda = useInvalidateAgenda();

  // ─────────────────────────────────────────
  // FORMAT PATIENTS FOR FORM
  // ─────────────────────────────────────────

  const patientOptions = (patientsData as ClinicPatient[]).map((p) => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
    phone: p.phone_primary,
  }));

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  const handleEventClick = useCallback((event: AgendaEventWithRelations) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  }, []);

  const handleTimeSlotClick = useCallback((date: string, hour: number) => {
    setSelectedEvent(null);
    setFormDefaultDate(date);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedEvent(null);
    setFormDefaultDate("");
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleEditFromDetail = useCallback(() => {
    setIsDetailOpen(false);
    setIsFormOpen(true);
  }, []);

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  const isLoading = eventsLoading || patientsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">الأجندة</h1>
            <p className="text-sm text-muted-foreground">
              إدارة المواعيد والجدولة
            </p>
          </div>
        </div>
        <Button onClick={() => { setSelectedEvent(null); setFormDefaultDate(""); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          موعد جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {events.filter((e) => e.status === "scheduled").length}
            </div>
            <div className="text-xs text-muted-foreground">مجدول</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.status === "confirmed").length}
            </div>
            <div className="text-xs text-muted-foreground">مؤكد</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {events.filter((e) => e.status === "in_session").length}
            </div>
            <div className="text-xs text-muted-foreground">في الجلسة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {events.filter((e) => e.status === "completed").length}
            </div>
            <div className="text-xs text-muted-foreground">مكتمل</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>التقويم الأسبوعي</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground">جاري التحميل...</span>
            </div>
          ) : (
            <AgendaCalendar
              events={events}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Event Form Modal */}
      <AgendaEventForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        tenantId={tenantId || ""}
        userId={userId}
        event={selectedEvent}
        patients={patientOptions}
        doctors={MOCK_DOCTORS}
        rooms={MOCK_ROOMS}
        procedures={MOCK_PROCEDURES}
        defaultDate={formDefaultDate || undefined}
      />

      {/* Event Detail Modal */}
      <AgendaEventDetail
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        event={selectedEvent}
        tenantId={tenantId || ""}
      />
    </div>
  );
}
