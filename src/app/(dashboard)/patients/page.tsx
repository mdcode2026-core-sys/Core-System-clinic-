"use client";

import { useState } from "react";
import { useTenantId } from "@/core/auth/useTenantId";
import { PatientList } from "@/features/patients/patient-list";
import { PatientForm } from "@/features/patients/patient-form";
import { AgendaEventForm } from "@/features/agenda/agenda-event-form";
import { useDoctors, useRooms, useProcedures } from "@/domain/agenda/agenda.queries";
import { usePatients } from "@/domain/patients/patients.queries";
import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";

export default function PatientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [agendaPatientId, setAgendaPatientId] = useState<string | null>(null);
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const { tenantId, userId } = useTenantId();
  const { messages } = useI18n();
  const t = messages.patients;

  const { data: doctors = [] } = useDoctors(tenantId);
  const { data: rooms = [] } = useRooms(tenantId);
  const { data: procedures = [] } = useProcedures(tenantId);
  const { data: patients = [] } = usePatients(tenantId);
  const doctorOptions = doctors.map((d) => ({ id: d.id, name: d.full_name, specialization: d.specialization }));
  const roomOptions = rooms.map((r) => ({ id: r.id, name: r.room_name }));
  const procedureOptions = procedures.map((p) => ({ id: p.id, name: p.procedure_name, duration: p.standard_duration_minutes }));
  const patientOptions = patients.map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}`, phone: p.phone_primary }));
  function handleBookAppointment(patientId: string) { setAgendaPatientId(patientId); setIsAgendaOpen(true); }

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      {!permsLoading && hasPermission("patients:create") && <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto"><UserPlus className="w-4 h-4 ml-2" />{t.add}</Button>}
    </div>
    <PatientList onBookAppointment={handleBookAppointment} />
    <PatientForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={() => setIsFormOpen(false)} />
    <AgendaEventForm isOpen={isAgendaOpen} onClose={() => { setIsAgendaOpen(false); setAgendaPatientId(null); }} tenantId={tenantId || ""} userId={userId || ""} patients={patientOptions} doctors={doctorOptions} rooms={roomOptions} procedures={procedureOptions} defaultPatientId={agendaPatientId || undefined} />
  </div>;
}
