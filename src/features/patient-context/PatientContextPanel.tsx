"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, CreditCard, ExternalLink, FileClock, MessageSquare, RefreshCw, Stethoscope } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { usePermissions } from "@/core/permissions/usePermissions";
import { useI18n } from "@/core/i18n/I18nProvider";
import { useAgendaEventsFiltered } from "@/domain/agenda/agenda.queries";
import { getTreatmentPlans } from "@/domain/treatment-plan/treatment-plan.actions";
import { listInvoices } from "@/domain/invoicing/invoicing.queries";
import { listFollowups } from "@/domain/followup/followup.queries";
import type { Patient, PatientHistory } from "@/domain/patients/patients.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

interface PatientContextPanelProps { patient: Patient; history: PatientHistory | null | undefined; }
type TreatmentData = Awaited<ReturnType<typeof getTreatmentPlans>>;
type InvoiceData = Awaited<ReturnType<typeof listInvoices>>;
type FollowupData = Awaited<ReturnType<typeof listFollowups>>;

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
  const appointmentFilter = useMemo(() => ({ patientId: patient.id }), [patient.id]);
  const { data: appointments = [], isLoading: appointmentsLoading, refetch: refetchAppointments } = useAgendaEventsFiltered(canAgenda ? tenantId : null, appointmentFilter);
  const [treatment, setTreatment] = useState<TreatmentData>([]);
  const [treatmentLoading, setTreatmentLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({ success: true, data: [] });
  const [followupData, setFollowupData] = useState<FollowupData>({ success: true, data: [] });
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!canTreatment) return;
    setTreatmentLoading(true);
    getTreatmentPlans(patient.id)
      .then((data) => { if (!cancelled) setTreatment(data); })
      .catch(() => { if (!cancelled) setTreatment([]); })
      .finally(() => { if (!cancelled) setTreatmentLoading(false); });
    return () => { cancelled = true; };
  }, [canTreatment, patient.id]);

  const loadFinancialAndFollowup = async () => {
    if (!canInvoices && !canFollowup) return;
    setSummaryLoading(true);
    try {
      const [invoices, followups] = await Promise.all([
        canInvoices ? listInvoices({ patient_id: patient.id }) : Promise.resolve({ success: true as const, data: [] }),
        canFollowup ? listFollowups({ patient_id: patient.id }) : Promise.resolve({ success: true as const, data: [] }),
      ]);
      setInvoiceData(invoices);
      setFollowupData(followups);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => { void loadFinancialAndFollowup(); }, [canInvoices, canFollowup, patient.id]);

  const invoiceRows = invoiceData.success ? invoiceData.data : [];
  const followupRows = followupData.success ? followupData.data : [];
  const openFollowups = followupRows.filter((item) => item.status === "open" || item.status === "in_progress").length;
  const amountDue = invoiceRows.reduce((sum, item) => sum + (item.amount_due_subunits ?? 0), 0);

  return (
    <section className="space-y-4" dir={direction} aria-label={t.title}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="text-base font-semibold">{t.title}</h3><p className="text-xs text-muted-foreground">{t.description}</p></div>
        <Button variant="outline" size="sm" onClick={() => { void refetchAppointments(); void loadFinancialAndFollowup(); }} disabled={appointmentsLoading || summaryLoading}><RefreshCw className={`me-2 h-4 w-4 ${appointmentsLoading || summaryLoading ? "animate-spin" : ""}`} />{t.refresh}</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {canVisits && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Stethoscope className="h-4 w-4" />{t.visits}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{history?.total_visits ?? 0}</div><p className="text-xs text-muted-foreground">{history?.last_visit_date ? `${t.lastVisit}: ${new Date(history.last_visit_date).toLocaleDateString(locale)}` : t.noRecentVisit}</p><div className="mt-2 flex gap-2"><Link className="text-xs underline" href="/clinical">{t.openClinical}</Link><Link className="text-xs underline" href="/operation">{t.openOperation}</Link></div></CardContent></Card>}
        {canAgenda && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4" />{t.appointments}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{appointments.length}</div><p className="text-xs text-muted-foreground">{t.patientFiltered}</p><Link className="mt-2 inline-flex items-center text-xs underline" href={`/agenda?patientId=${encodeURIComponent(patient.id)}`}>{t.openAgenda}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
        {canTreatment && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ClipboardList className="h-4 w-4" />{t.treatment}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{treatment.length}</div><p className="text-xs text-muted-foreground">{treatmentLoading ? t.loading : t.patientFiltered}</p><Link className="mt-2 inline-flex items-center text-xs underline" href={`/treatment-plans?patientId=${encodeURIComponent(patient.id)}`}>{t.openTreatment}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
        {canInvoices && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CreditCard className="h-4 w-4" />{t.financial}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{invoiceRows.length}</div><p className="text-xs text-muted-foreground">{t.amountDue}: {amountDue}</p><Link className="mt-2 inline-flex items-center text-xs underline" href={`/invoices?patientId=${encodeURIComponent(patient.id)}`}>{t.openInvoices}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
      </div>
      {canFollowup && <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FileClock className="h-4 w-4" />{t.followup}</CardTitle></CardHeader><CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold">{openFollowups} {t.openItems}</div><p className="text-xs text-muted-foreground">{followupData.success ? t.patientFiltered : t.loadFailed}</p></div><Link className="inline-flex items-center text-sm underline" href={`/follow-up?patientId=${encodeURIComponent(patient.id)}`}>{t.openFollowup}<ExternalLink className="ms-1 h-3 w-3" /></Link></CardContent></Card>}
      <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4" />{t.communication}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{t.communicationDeferred}</p></CardContent></Card>
    </section>
  );
}
