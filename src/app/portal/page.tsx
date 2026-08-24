import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEntitlement, hasCapability } from "@/core/entitlements/entitlementEngine";
import { PatientFileDownloadButton } from "@/features/patient-portal/patient-file-download-button";
import { PatientMessaging } from "@/features/patient-portal/patient-messaging";
import { getPortalMessages } from "@/core/i18n/portalMessages";
import type { Locale } from "@/core/i18n/messages";

function resolveLocale(value: string | undefined): Locale {
  return value === "ar" || value === "en" ? value : "en";
}

export default async function PatientPortalPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("core-system-locale")?.value ?? cookieStore.get("tenant-language")?.value);
  const messages = getPortalMessages(locale);
  const numberLocale = locale === "ar" ? "ar-u-nu-latn" : "en-u-nu-latn";
  const direction = locale === "ar" ? "rtl" : "ltr";
  const formatDateTime = (value: string) => new Intl.DateTimeFormat(numberLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const formatNumber = (value: number) => new Intl.NumberFormat(numberLocale, { useGrouping: true }).format(value);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/activate");
  const { data: identity } = await supabase.from("patient_identities").select("id,status").eq("auth_user_id", user.id).maybeSingle();
  if (!identity || identity.status !== "active") return <main className="mx-auto max-w-lg p-6" dir={direction}><h1 className="text-2xl font-semibold">{messages.title}</h1><p className="mt-2 text-sm text-muted-foreground">{messages.portalIdentityInactive}</p></main>;
  const { data: relationship } = await supabase.from("patient_clinic_relationships").select("tenant_id,clinic_patient_id,status").eq("patient_identity_id", identity.id).eq("status", "active").limit(1).maybeSingle();
  if (!relationship) return <main className="mx-auto max-w-lg p-6" dir={direction}><h1 className="text-2xl font-semibold">{messages.title}</h1><p className="mt-2 text-sm text-muted-foreground">{messages.noClinicRelationship}</p></main>;
  const portalEnabled = await hasEntitlement(relationship.tenant_id, "patient_portal");
  if (!portalEnabled || !(await hasCapability(relationship.tenant_id, "patient_portal.access"))) return <main className="mx-auto max-w-lg p-6" dir={direction}><h1 className="text-2xl font-semibold">{messages.title}</h1><p className="mt-2 text-sm text-muted-foreground">{messages.clinicPortalDisabled}</p></main>;
  const advancedEnabled = await hasEntitlement(relationship.tenant_id, "patient_experience.advanced");
  const { data: patient } = await supabase.from("clinic_patients").select("first_name,last_name,email,phone_primary,file_number").eq("id", relationship.clinic_patient_id).eq("tenant_id", relationship.tenant_id).maybeSingle();
  if (!patient) return <main className="mx-auto max-w-lg p-6" dir={direction}><h1 className="text-2xl font-semibold">{messages.title}</h1><p className="mt-2 text-sm text-muted-foreground">{messages.patientRecordUnavailable}</p></main>;
  const now = new Date().toISOString();
  const { data: appointments } = await supabase.from("master_agenda_events").select("id,event_type,visit_type,scheduled_start,scheduled_end,status,room_id,doctor_id").eq("patient_id", relationship.clinic_patient_id).eq("tenant_id", relationship.tenant_id).gte("scheduled_start", now).neq("status", "cancelled").order("scheduled_start", { ascending: true }).limit(20);
  const { data: releases } = await supabase.from("patient_portal_medical_file_releases").select("medical_file_id,expires_at,medical_files(original_filename,file_kind,size_bytes,created_at)").eq("clinic_patient_id", relationship.clinic_patient_id).eq("tenant_id", relationship.tenant_id).eq("status", "active").order("released_at", { ascending: false });

  return <main className="min-h-screen bg-muted/20 p-6" dir={direction}><div className="mx-auto max-w-4xl">
    <header className="rounded-2xl border bg-background p-6 shadow-sm"><p className="text-sm font-medium text-muted-foreground">CORE SYSTEM</p><h1 className="mt-1 text-3xl font-semibold">{messages.title}</h1><p className="mt-2 text-sm text-muted-foreground">{messages.secureAccess}</p></header>
    <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm"><h2 className="text-xl font-semibold">{messages.profile}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><div><span className="text-xs text-muted-foreground">{messages.name}</span><p className="font-medium">{patient.first_name} {patient.last_name}</p></div><div><span className="text-xs text-muted-foreground">{messages.fileNumber}</span><p className="font-medium">{patient.file_number ?? "—"}</p></div><div><span className="text-xs text-muted-foreground">{messages.email}</span><p className="font-medium">{patient.email ?? "—"}</p></div><div><span className="text-xs text-muted-foreground">{messages.phone}</span><p className="font-medium">{patient.phone_primary}</p></div></div></section>
    <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm"><h2 className="text-xl font-semibold">{messages.appointments}</h2>{!appointments?.length ? <p className="mt-2 text-sm text-muted-foreground">{messages.noUpcomingAppointments}</p> : <div className="mt-4 space-y-3">{appointments.map((appointment) => { const status = appointment.status ? messages.appointmentStatus[appointment.status as keyof typeof messages.appointmentStatus] ?? messages.scheduled : messages.appointmentStatus.scheduled; const type = appointment.visit_type ? messages.appointmentType[appointment.visit_type as keyof typeof messages.appointmentType] ?? messages.appointments : messages.appointments; return <div key={appointment.id} className="rounded-xl border p-4"><p className="font-medium">{formatDateTime(appointment.scheduled_start)}</p><p className="mt-1 text-xs text-muted-foreground">{type} · {status}</p></div>; })}</div>}</section>
    <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm"><h2 className="text-xl font-semibold">{messages.medicalFiles}</h2>{!releases?.length ? <p className="mt-2 text-sm text-muted-foreground">{messages.noReleasedFiles}</p> : <div className="mt-4 space-y-3">{releases.map((release) => { const file = Array.isArray(release.medical_files) ? release.medical_files[0] : release.medical_files; if (!file) return null; return <div key={release.medical_file_id} className="flex items-center justify-between gap-4 rounded-xl border p-4"><div className="min-w-0"><p className="truncate font-medium">{file.original_filename}</p><p className="text-xs text-muted-foreground">{file.file_kind} · {formatNumber(Number(file.size_bytes))} {messages.bytes}</p></div><PatientFileDownloadButton tenantId={relationship.tenant_id} medicalFileId={release.medical_file_id} /></div>; })}</div>}</section>
    {advancedEnabled ? <section className="mt-6"><PatientMessaging tenantId={relationship.tenant_id} /></section> : <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm"><h2 className="font-semibold">{messages.advancedExperience}</h2><p className="mt-2 text-sm text-muted-foreground">{messages.advancedExperienceDescription}</p></section>}
    <section className="mt-6 rounded-2xl border bg-background p-6 shadow-sm"><h2 className="font-semibold">{messages.security}</h2><p className="mt-2 text-sm text-muted-foreground">{messages.securityDescription}</p></section>
  </div></main>;
}
