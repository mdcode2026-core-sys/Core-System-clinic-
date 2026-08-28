"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { PatientPortalInviteButton } from "@/features/patient-portal/patient-portal-invite-button";
import type { Patient } from "@/domain/patients/patients.types";
import { useI18n } from "@/core/i18n/I18nProvider";

interface PatientListProps { onAdd?: () => void; onBookAppointment?: (patientId: string) => void; }

export function PatientList({ onAdd, onBookAppointment }: PatientListProps) {
  const { tenantId } = useAuth(); const { data: patients, isLoading } = usePatients(tenantId); const deletePatient = useDeletePatient(); const { hasPermission, isLoading: permsLoading } = usePermissions(); const { locale, messages } = useI18n(); const t = messages.patients; const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(""); const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null); const [detailPatientId, setDetailPatientId] = useState<string | null>(null); const [isFormOpen, setIsFormOpen] = useState(false); const [isDetailOpen, setIsDetailOpen] = useState(false); const [checkingInId, setCheckingInId] = useState<string | null>(null);

  useEffect(() => {
    const patientId = searchParams.get("patientId");
    const search = searchParams.get("search");
    if (search) setSearchQuery(search);
    if (patientId) { setDetailPatientId(patientId); setIsDetailOpen(true); }
  }, [searchParams]);

  const filteredPatients = patients?.filter(patient => { const query = searchQuery.toLowerCase(); const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase(); const arabicName = `${patient.first_name_ar ?? ""} ${patient.last_name_ar ?? ""}`.toLowerCase(); return fullName.includes(query) || arabicName.includes(query) || patient.phone_primary.includes(query) || Boolean(patient.email?.toLowerCase().includes(query)) || Boolean(patient.file_number?.toLowerCase().includes(query)); });
  const getStatusBadge = (status: string) => { const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = { active: "default", inactive: "secondary", archived: "outline", blocked: "destructive" }; const labels: Record<string, string> = { active: t.active, inactive: t.inactive, archived: t.archived, blocked: t.blocked }; return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>; };
  const handleEdit = (patient: Patient) => { setSelectedPatient(patient); setIsFormOpen(true); }; const handleViewDetail = (patientId: string) => { setDetailPatientId(patientId); setIsDetailOpen(true); };
  async function handleQuickCheckIn(patientId: string) { setCheckingInId(patientId); try { await checkInPatient({ patient_id: patientId }); } catch (err) { console.error("Check-in failed:", err); } finally { setCheckingInId(null); } }
  const handleDelete = (patient: Patient) => { if (window.confirm(t.confirmDelete)) deletePatient.mutate({ id: patient.id, tenantId: patient.tenant_id }); };
  if (isLoading) return <Card><CardContent className="p-8 text-center text-muted-foreground">{t.loading}</CardContent></Card>;
  return <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}><div className="relative"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder={t.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-12 ps-10 text-base" /></div><Card><CardHeader className="pb-3"><CardTitle className="text-lg">{t.list} ({filteredPatients?.length || 0})</CardTitle></CardHeader><CardContent>{!filteredPatients || filteredPatients.length === 0 ? <div className="py-8 text-center text-muted-foreground">{t.noMatches}</div> : <div className="space-y-3">{filteredPatients.map(patient => <div key={patient.id} className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10"><span className="text-lg font-bold text-primary">{patient.first_name[0]}{patient.last_name[0]}</span></div><div className="min-w-0 flex-1"><div className="truncate font-medium">{patient.first_name} {patient.last_name}</div><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{patient.phone_primary}</span></div></div></div><div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2 sm:justify-end sm:border-t-0 sm:pt-0"><div className="sm:hidden">{getStatusBadge(patient.patient_status)}</div><PatientPortalInviteButton patientId={patient.id} tenantId={tenantId ?? ""} hasEmail={Boolean(patient.email)} hasPhone={Boolean(patient.phone_primary)} /><div className="flex items-center gap-1">{!permsLoading && hasPermission("sessions:create") && <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => void handleQuickCheckIn(patient.id)} disabled={checkingInId === patient.id} title={t.checkIn}><LogIn className="h-5 w-5" /></Button>}<Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => handleViewDetail(patient.id)} title={t.view}><Eye className="h-5 w-5" /></Button>{!permsLoading && hasPermission("patients:update") && <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={() => handleEdit(patient)} title={t.edit}><Pencil className="h-5 w-5" /></Button>}{!permsLoading && hasPermission("patients:delete") && <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(patient)} title={t.delete}><Trash2 className="h-5 w-5" /></Button>}</div></div></div>)}</div>}</CardContent></Card><PatientForm patient={selectedPatient} isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelectedPatient(null); }} onSuccess={() => { setIsFormOpen(false); setSelectedPatient(null); }} /><PatientDetail patientId={detailPatientId} isOpen={isDetailOpen} onClose={() => { setIsDetailOpen(false); setDetailPatientId(null); }} onBookAppointment={onBookAppointment} /></div>;
}
