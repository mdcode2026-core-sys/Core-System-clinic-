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

export default function PatientsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [agendaPatientId, setAgendaPatientId] = useState<string | null>(null);
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const { tenantId, userId } = useTenantId();

  const { data: doctors = [] } = useDoctors(tenantId);
  const { data: rooms = [] } = useRooms(tenantId);
  const { data: procedures = [] } = useProcedures(tenantId);
  const { data: patients = [] } = usePatients(tenantId);

  const doctorOptions = doctors.map((d) => ({
    id: d.id,
    name: d.full_name,
    specialization: d.specialization,
  }));

  const roomOptions = rooms.map((r) => ({
    id: r.id,
    name: r.room_name,
  }));

  const procedureOptions = procedures.map((p) => ({
    id: p.id,
    name: p.procedure_name,
    duration: p.standard_duration_minutes,
  }));

  const patientOptions = patients.map((p) => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
    phone: p.phone_primary,
  }));

  function handleBookAppointment(patientId: string) {
    setAgendaPatientId(patientId);
    setIsAgendaOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">المرضى</h1>
        {!permsLoading && hasPermission("patients:create") && (
          <Button onClick={() => setIsFormOpen(true)}>
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة مريض
          </Button>
        )}
      </div>

      <PatientList onBookAppointment={handleBookAppointment} />

      {/* New Patient Form Modal */}
      <PatientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => setIsFormOpen(false)}
      />

      {/* Agenda Form for Booking Appointment */}
      <AgendaEventForm
        isOpen={isAgendaOpen}
        onClose={() => {
          setIsAgendaOpen(false);
          setAgendaPatientId(null);
        }}
        tenantId={tenantId || ""}
        userId={userId || ""}
        patients={patientOptions}
        doctors={doctorOptions}
        rooms={roomOptions}
        procedures={procedureOptions}
        defaultPatientId={agendaPatientId || undefined}
      />
    </div>
  );
}
