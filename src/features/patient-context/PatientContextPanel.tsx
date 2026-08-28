"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ClipboardList, CreditCard, ExternalLink, FileClock, MessageSquare, RefreshCw, Stethoscope } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useAgendaEventsFiltered } from "@/domain/agenda/agenda.queries";
import { getTreatmentPlans } from "@/domain/treatment-plan/treatment-plan.actions";
import { listInvoices } from "@/domain/invoicing/invoicing.queries";
import { listFollowups } from "@/domain/followup/followup.queries";
import type { Patient, PatientHistory } from "@/domain/patients/patients.types";
import { PatientPortalInviteButton } from "@/features/patient-portal/patient-portal-invite-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

interface PatientContextPanelProps { patient: Patient; history: PatientHistory | null | undefined; }

export function PatientContextPanel({ patient, history }: PatientContextPanelProps) {
  const { tenantId } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { locale, messages } = useI18n();
  const t = messages.patientContext;
  const direction = locale === "ar" ? "rtl" : "ltr";
  const canAgenda = !permissionsLoading && hasPermission("agenda:read");
  const canTreatment = !permissionsLoading && hasPermission("treatment_plans:read");
  const canInvoices = !permissionsLoading && hasPermission("invoices:read");
  const canFollowup = !permissionsLoading && hasPermission("followup:read");
  const canVisits = !permissionsLoading && hasPermission("visits:read");
  const canPatientRead = !permissionsLoading && hasPermission("patients:read");
  const appointmentFilter = useMemo(() => ({ patientId: patient.id }), [patient.id]);
  const agendaQuery = useAgendaEventsFiltered(canAgenda ? tenantId : null, appointmentFilter);
  const treatmentQuery = useQuery({ queryKey: ["patient-context", "treatment-plans", patient.id], queryFn: () => getTreatmentPlans(patient.id), enabled: canTreatment });
  const invoiceQuery = useQuery({ queryKey: ["patient-context", "invoices", patient.id], queryFn: () => listInvoices({ patient_id: patient.id }), enabled: canInvoices });
  const followupQuery = useQuery({ queryKey: ["patient-context", "followups", patient.id], queryFn: () => listFollowups({ patient_id: patient.id }), enabled: canFollowup });
  const appointments = agendaQuery.data ?? [];
  const treatment = treatmentQuery.data ?? [];
  const invoiceData = invoiceQuery.data ?? { success: true as const, data: [] };
  const followupData = followupQuery.data ?? { success: true as const, data: [] };
  const invoiceRows = invoiceData.success ? invoiceData.data : [];
  const followupRows = followupData.success ? followupData.data : [];
  const openFollowups = followupRows.filter((item) => item.status === "open" || item.status === "in_progress").length;
  const amountDue = invoiceRows.reduce((sum, item) => sum + (item.amount_due_subunits ?? 0), 0);
  const isRefreshing = agendaQuery.isFetching || treatmentQuery.isFetching || invoiceQuery.isFetching || followupQuery.isFetching;
  const refresh = () => { void agendaQuery.refetch(); void treatmentQuery.refetch(); void invoiceQuery.refetch(); void followupQuery.refetch(); };

  return (
    <section className="space-y-4" dir={direction} aria-label={t.title}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-base font-semibold">{t.title}</h3><p className="text-xs text-muted-foreground">{t.description}</p></div><Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}><RefreshCw className={`me-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />{t.refresh}</Button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {canVisits && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Stethoscope className="h-4 w-4" />{t.visits}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{history?.total_visits ?? 0}</div><p className="text-xs text-muted-foreground">{history?.last_visit_date ? `${t.lastVisit}: ${new Date(history.last_visit_date).toLocaleDateString(locale)}` : t.noRecentVisit}</p><div className="mt-2 flex gap-2"><Link className="text-xs underline" href="/clinical">{t.openClinical}</Link><Link className="text-xs underline" href="/operation">{t.openOperation}</Link></div></CardContent></Card>}
        {canAgenda && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4" />{t.appointments}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{appointments.length}</div><p className="text-xs text-muted-foreground">{t.patientFiltered}</p><Link className="mt-2 inline-flex items-center text-xs underline" href={`/agenda?patientId=${encodeURIComponent(patient.id)}`}>{t.openAgenda}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
        {canTreatment && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ClipboardList className="h-4 w-4" />{t.treatment}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{treatment.length}</div><p className="text-xs text-muted-foreground">{treatmentQuery.isLoading ? t.loading : t.patientFiltered}</p><Link className="mt-2 inline-flex items-center text-xs underline" href={`/treatment-plans?patientId=${encodeURIComponent(patient.id)}`}>{t.openTreatment}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
        {canInvoices && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4" />{t.financial}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{invoiceRows.length}</div><p className="text-xs text-muted-foreground">{t.amountDue}: {amountDue}</p><Link className="mt-2 inline-flex items-center text-xs underline" href={`/invoices?patientId=${encodeURIComponent(patient.id)}`}>{t.openInvoices}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
      </div>
      {canFollowup && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FileClock className="h-4 w-4" />{t.followup}</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold">{openFollowups} {t.openItems}</div><p className="text-xs text-muted-foreground">{followupData.success ? t.patientFiltered : t.loadFailed}</p></div><Link className="inline-flex items-center text-sm underline" href={`/follow-up?patientId=${encodeURIComponent(patient.id)}`}>{t.openFollowup}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
      {canPatientRead && tenantId && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ExternalLink className="h-4 w-4" />{t.portal}</CardTitle></CardHeader><CardContent><PatientPortalInviteButton patientId={patient.id} tenantId={tenantId} hasEmail={Boolean(patient.email)} hasPhone={Boolean(patient.phone_primary)} /></CardContent></Card>}
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4" />{t.communication}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t.communicationDeferred}</p></CardContent></Card>
    </section>
  );
}
