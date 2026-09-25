"use client";

import { useState, useCallback, useMemo, useContext, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/core/i18n/I18nProvider";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Plus, CalendarDays, Loader2, X } from "lucide-react";
import { AgendaCalendar } from "@/features/agenda/agenda-calendar";
import { AgendaEventForm } from "@/features/agenda/agenda-event-form";
import { AgendaEventDetail } from "@/features/agenda/agenda-event-detail";
import { useAgendaEventsWithRelations, useDoctors, useRooms, useResources, useProcedures } from "@/domain/agenda/agenda.queries";
import { usePatients } from "@/domain/patients/patients.queries";
import { AuthContext } from "@/core/auth/AuthContext";
import { createClient } from "@/infrastructure/supabase/client";
import type { AgendaEventWithRelations, CalendarRange } from "@/domain/agenda/agenda.types";
import type { Patient } from "@/domain/patients/patients.types";

export default function AgendaPage() {
  const auth = useContext(AuthContext);
  const { locale, messages } = useI18n();
  const t = messages.agenda;
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId");
  const doctorId = searchParams.get("doctorId");
  const bookingWorkItemId = searchParams.get("bookingWorkItemId");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEventWithRelations | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState("");
  const [tenantTimezone, setTenantTimezone] = useState("UTC");
  const tenantId = auth?.tenantId ?? null;
  const userId = auth?.user?.id ?? "";

  useEffect(() => {
    let cancelled = false;
    if (!tenantId) return undefined;
    const supabase = createClient();
    void supabase.from("master_tenants").select("timezone").eq("id", tenantId).maybeSingle().then(({ data }) => {
      if (!cancelled && data?.timezone) setTenantTimezone(data.timezone);
    });
    return () => { cancelled = true; };
  }, [tenantId]);

  const calendarRange = useMemo<CalendarRange>(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }, [currentDate]);

  const { data: events = [], isLoading: eventsLoading } = useAgendaEventsWithRelations(tenantId, calendarRange);
  const { data: patientsData = [], isLoading: patientsLoading } = usePatients(tenantId);
  const { data: doctorsData = [], isLoading: doctorsLoading } = useDoctors(tenantId);
  const { data: roomsData = [], isLoading: roomsLoading } = useRooms(tenantId);
  const { data: resourcesData = [], isLoading: resourcesLoading } = useResources(tenantId);
  const { data: proceduresData = [], isLoading: proceduresLoading } = useProcedures(tenantId);

  const visibleEvents = useMemo(() => events.filter((event) => (!patientId || event.patient_id === patientId) && (!doctorId || event.doctor_id === doctorId)), [doctorId, events, patientId]);
  const contextPatient = useMemo(() => (patientId ? (patientsData as Patient[]).find((patient) => patient.id === patientId) : null), [patientId, patientsData]);
  const contextDoctor = useMemo(() => (doctorId ? doctorsData.find((doctor) => doctor.id === doctorId) : null), [doctorId, doctorsData]);
  const patientOptions = (patientsData as Patient[]).map((patient) => ({ id: patient.id, name: `${patient.first_name} ${patient.last_name}`, phone: patient.phone_primary }));
  const doctorOptions = doctorsData.map((doctor) => ({ id: doctor.id, name: doctor.full_name, specialization: doctor.specialization }));
  const roomOptions = roomsData.map((room) => ({ id: room.id, name: room.room_name }));
  const resourceOptions = resourcesData.map((resource) => ({ id: resource.id, name: resource.resource_name, type: resource.resource_type }));
  const procedureOptions = proceduresData.map((procedure) => ({ id: procedure.id, name: procedure.procedure_name, duration: procedure.standard_duration_minutes }));

  const handleEventClick = useCallback((event: AgendaEventWithRelations) => { setSelectedEvent(event); setIsDetailOpen(true); }, []);
  const handleTimeSlotClick = useCallback((date: string) => { setSelectedEvent(null); setFormDefaultDate(date); setIsFormOpen(true); }, []);
  const closeForm = useCallback(() => { setIsFormOpen(false); setSelectedEvent(null); setFormDefaultDate(""); }, []);
  const closeDetail = useCallback(() => { setIsDetailOpen(false); setSelectedEvent(null); }, []);
  const clearContext = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("patientId");
    next.delete("doctorId");
    next.delete("bookingWorkItemId");
    next.delete("treatmentPlanItemId");
    router.push(next.toString() ? `/agenda?${next.toString()}` : "/agenda");
  }, [router, searchParams]);
  useEffect(() => { if (bookingWorkItemId) { setSelectedEvent(null); setFormDefaultDate(""); setIsFormOpen(true); } }, [bookingWorkItemId]);

  const isLoading = eventsLoading || patientsLoading || doctorsLoading || roomsLoading || resourcesLoading || proceduresLoading;

  return (
    <div className="cs-page-canvas space-y-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><CalendarDays className="h-8 w-8 text-[var(--cs-azure-600)]" /><div><h1 className="text-2xl font-bold text-[var(--cs-ink-950)]">{t.title}</h1><p className="text-sm text-[var(--cs-slate-500)]">{t.description}</p></div></div>
        <Button onClick={() => { setSelectedEvent(null); setFormDefaultDate(""); setIsFormOpen(true); }} className="bg-[var(--cs-azure-600)] text-white hover:bg-[var(--cs-azure-700)]"><Plus className="me-2 h-4 w-4" />{t.newAppointment}</Button>
      </div>

      {(contextPatient || contextDoctor || bookingWorkItemId) && <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--cs-slate-200)] bg-[var(--cs-slate-100)] p-3"><Badge variant="secondary">{bookingWorkItemId ? (locale === "ar" ? "حجز من الإجراء التالي" : "Next-action booking") : contextPatient ? t.patientFilter : locale === "ar" ? "سياق الطبيب" : "Doctor context"}</Badge><span className="text-sm font-medium text-[var(--cs-ink-950)]">{contextPatient ? `${contextPatient.first_name} ${contextPatient.last_name}` : locale === "ar" ? contextDoctor?.full_name_ar || contextDoctor?.full_name : contextDoctor?.full_name}</span><Button variant="ghost" size="sm" className="ms-auto" onClick={clearContext}><X className="me-1 h-4 w-4" />{t.clearPatientFilter}</Button></div>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Stat value={visibleEvents.filter((event) => event.status === "scheduled").length} label={t.scheduled} /><Stat value={visibleEvents.filter((event) => event.status === "confirmed").length} label={t.confirmed} /><Stat value={visibleEvents.filter((event) => event.status === "in_session").length} label={t.inSession} /><Stat value={visibleEvents.filter((event) => event.status === "completed").length} label={t.completed} /></div>

      <Card className="rounded-2xl border-[var(--cs-slate-200)] shadow-[var(--cs-shadow-xs)]"><CardHeader><CardTitle className="text-[var(--cs-ink-950)]">{t.weeklyCalendar}</CardTitle></CardHeader><CardContent>{isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--cs-azure-600)]" /><span className="ms-2 text-[var(--cs-slate-500)]">{t.loading}</span></div> : <AgendaCalendar events={visibleEvents} currentDate={currentDate} timeZone={tenantTimezone} onDateChange={setCurrentDate} onEventClick={handleEventClick} onTimeSlotClick={handleTimeSlotClick} />}</CardContent></Card>

      <AgendaEventForm isOpen={isFormOpen} onClose={closeForm} tenantId={tenantId || ""} userId={userId} tenantTimezone={tenantTimezone} event={selectedEvent} patients={patientOptions} doctors={doctorOptions} rooms={roomOptions} resources={resourceOptions} procedures={procedureOptions} defaultDate={formDefaultDate || undefined} defaultPatientId={patientId || undefined} bookingWorkItemId={bookingWorkItemId || undefined} />
      <AgendaEventDetail isOpen={isDetailOpen} onClose={closeDetail} event={selectedEvent} tenantId={tenantId || ""} userId={userId} tenantTimezone={tenantTimezone} patients={patientOptions} doctors={doctorOptions} rooms={roomOptions} resources={resourceOptions} procedures={procedureOptions} />
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <Card className="rounded-xl border-[var(--cs-slate-200)] shadow-none"><CardContent className="p-4"><div className="text-2xl font-bold text-[var(--cs-ink-950)]">{value}</div><div className="text-xs text-[var(--cs-slate-500)]">{label}</div></CardContent></Card>;
}
