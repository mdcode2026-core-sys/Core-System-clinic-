"use client";

import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { usePermissions } from "@/core/permissions/usePermissions";
import { usePatients, useDeletePatient } from "@/domain/patients/patients.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Search, Pencil, Trash2, Phone, Eye, LogIn } from "lucide-react";
import { checkInPatient } from "@/domain/queue/queue.actions";
import { PatientForm } from "./patient-form";
import { PatientDetail } from "./patient-detail";
import type { Patient } from "@/domain/patients/patients.types";
import { useI18n } from "@/core/i18n/I18nProvider";

interface PatientListProps { onAdd?: () => void; onBookAppointment?: (patientId: string) => void; }

export function PatientList({ onAdd, onBookAppointment }: PatientListProps) {
  const { tenantId } = useAuth();
  const { data: patients, isLoading } = usePatients(tenantId);
  const deletePatient = useDeletePatient();
  const { hasPermission, isLoading: permsLoading } = usePermissions();
  const { messages } = useI18n();
  const t = messages.patients;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailPatientId, setDetailPatientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const filteredPatients = patients?.filter((patient) => { const query = searchQuery.toLowerCase(); const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase(); return fullName.includes(query) || patient.phone_primary.includes(query) || (patient.email && patient.email.toLowerCase().includes(query)); });
  const getStatusBadge = (status: string) => { const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = { active:"default", inactive:"secondary", archived:"outline", blocked:"destructive" }; const labels: Record<string,string> = { active:t.active, inactive:t.inactive, archived:t.archived, blocked:t.blocked }; return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>; };
  const handleEdit = (patient: Patient) => { setSelectedPatient(patient); setIsFormOpen(true); };
  const handleViewDetail = (patientId: string) => { setDetailPatientId(patientId); setIsDetailOpen(true); };
  async function handleQuickCheckIn(patientId: string) { setCheckingInId(patientId); try { await checkInPatient({ patient_id: patientId }); } catch (err: any) { console.error("Check-in failed:", err); } finally { setCheckingInId(null); } }
  const handleDelete = (patient: Patient) => { if (confirm(t.confirmDelete)) deletePatient.mutate({ id: patient.id, tenantId: patient.tenant_id }); };
  if (isLoading) return <Card><CardContent className="p-8 text-center text-muted-foreground">{t.loading}</CardContent></Card>;
  return <div className="space-y-4">
    <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10 h-12 text-base" /></div>
    <Card><CardHeader className="pb-3"><CardTitle className="text-lg">{t.list} ({filteredPatients?.length || 0})</CardTitle></CardHeader><CardContent>
      {(!filteredPatients || filteredPatients.length === 0) ? <div className="text-center py-8 text-muted-foreground">{t.noMatches}</div> : <div className="space-y-3">{filteredPatients.map((patient) => <div key={patient.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1"><div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><span className="text-primary font-bold text-lg">{patient.first_name[0]}{patient.last_name[0]}</span></div><div className="min-w-0 flex-1"><div className="font-medium truncate">{patient.first_name} {patient.last_name}</div><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{patient.phone_primary}</span></div></div></div>
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0"><div className="sm:hidden">{getStatusBadge(patient.patient_status)}</div><div className="flex items-center gap-1">
          {!permsLoading && hasPermission("sessions:create") && <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => handleQuickCheckIn(patient.id)} disabled={checkingInId === patient.id} title={t.checkIn}><LogIn className="w-5 h-5" /></Button>}
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => handleViewDetail(patient.id)} title={t.view}><Eye className="w-5 h-5" /></Button>
          {!permsLoading && hasPermission("patients:update") && <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => handleEdit(patient)} title={t.edit}><Pencil className="w-5 h-5" /></Button>}
          {!permsLoading && hasPermission("patients:delete") && <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(patient)} title={t.delete}><Trash2 className="w-5 h-5" /></Button>}
        </div></div>
      </div>)}</div>}
    </CardContent></Card>
    <PatientForm patient={selectedPatient} isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelectedPatient(null); }} onSuccess={() => { setIsFormOpen(false); setSelectedPatient(null); }} />
    <PatientDetail patientId={detailPatientId} isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setDetailPatientId(null); }} onBookAppointment={onBookAppointment} />
  </div>;
}
