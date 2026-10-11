#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const checks = [];
function check(name, condition, detail = "") {
  checks.push({ name, status: condition ? "PASS" : "FAIL", detail });
}
function read(path) {
  if (!existsSync(path)) throw new Error(`REQUIRED_FILE_MISSING=${path}`);
  return readFileSync(path, "utf8");
}
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "coverage"].includes(entry.name)) return [];
      return walk(path);
    }
    return /\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name) ? [path] : [];
  });
}

const commandMigration = read("supabase/migrations/20261010100000_csapi_gate04_agenda_command_boundary.sql");
const auditMigration = read("supabase/migrations/20261010110000_csapi_gate04_agenda_audit_completion.sql");
const aclMigration = read("supabase/migrations/20261010120000_csapi_gate04_agenda_write_acl_lockdown.sql");
const mutationService = read("src/domain/agenda/agenda.mutation-service.ts");
const actions = read("src/domain/agenda/agenda.actions.ts");
const queries = read("src/domain/agenda/agenda.queries.ts");
const commandClient = read("src/infrastructure/supabase/agenda-command.ts");
const requirements = read("src/domain/agenda/procedure-resource-requirements.ts");
const availability = read("src/domain/agenda/availability.engine.ts");
const conflicts = read("src/domain/agenda/conflict.engine.ts");
const quick = read("src/features/workspace/widgets/agenda/QuickAppointmentWidget.tsx");
const apiRoute = read("src/app/api/agenda/events/route.ts");
const apiRequiredBlock = apiRoute.slice(apiRoute.indexOf("function required("), apiRoute.indexOf("export async function POST"));
const agendaForm = read("src/features/agenda/agenda-event-form.tsx");
const agendaPage = read("src/app/(dashboard)/agenda/page.tsx");
const patientsPage = read("src/app/(dashboard)/patients/page.tsx");
const patientForm = read("src/features/patients/patient-form.tsx");

const requiredCommands = [
  "agenda_create_appointment",
  "agenda_update_appointment",
  "agenda_transition_appointment",
  "agenda_cancel_appointment",
];
for (const name of requiredCommands) {
  check(`db-command-exists:${name}`, commandMigration.includes(`FUNCTION public.${name}(`));
  check(`db-command-server-only-acl:${name}`,
    new RegExp(`REVOKE ALL ON FUNCTION public\\.${name}\\([^;]+FROM PUBLIC, anon, authenticated`, "s").test(commandMigration) &&
    new RegExp(`GRANT EXECUTE ON FUNCTION public\\.${name}\\([^;]+TO service_role`, "s").test(commandMigration));
}
check("db-commands-security-definer", (commandMigration.match(/SECURITY DEFINER/g) || []).length >= 4);
check("db-commands-controlled-search-path", (commandMigration.match(/SET search_path = pg_catalog, public/g) || []).length >= 4);
check("db-command-permission-checks", (commandMigration.match(/get_effective_permissions\(/g) || []).length >= 4);
check("db-command-tenant-scoping", /p.tenant_id = p_tenant_id/.test(commandMigration) && /u.tenant_id = p_tenant_id/.test(commandMigration));
check("db-command-state-guards", commandMigration.includes("AGENDA_STATE_CONFLICT") && commandMigration.includes("AGENDA_INVALID_STATUS_TRANSITION"));
check("db-no-reschedule-from-terminal-states", /p_reschedule AND p_expected_status NOT IN \('scheduled', 'confirmed', 'no_show', 'cancelled', 'rescheduled'\)/.test(commandMigration));
check("api-accepts-provider-optional-request", !apiRequiredBlock.includes("doctor_id") && apiRoute.split("doctorId: body.doctor_id?.trim() || null").length - 1 >= 2);
check("main-agenda-form-derives-requirement-after-state", agendaForm.indexOf("const[procedureId,setProcedureId]=useState") < agendaForm.indexOf("const selectedProcedure=procedures.find"));
check("main-agenda-form-uses-provider-requirements", agendaForm.includes("isProviderRequired(selectedProcedure?.provider_type)") && agendaForm.includes("if(!doctorId&&providerRequired)") && agendaForm.includes("doctor_id:doctorId||null"));
check("main-agenda-form-rebooks-cancelled-appointment", agendaForm.includes('event.status==="cancelled"') && agendaForm.includes("shouldReschedule(event,date,startTime,endTime,tenantTimezone)"));
check("provider-requirements-reach-all-agenda-form-entry-points", agendaPage.includes("provider_type: procedure.provider_type") && patientsPage.includes("provider_type: p.provider_type"));

check("agenda-command-client-is-server-only", commandClient.includes('import "server-only"') && commandClient.includes("SUPABASE_SERVICE_ROLE_KEY"));
check("agenda-command-rebinds-effective-actor", commandMigration.split("request.jwt.claim.sub").length - 1 >= 4 && commandMigration.split("get_effective_permissions(").length - 1 >= 4);
check("canonical-service-calls-protected-commands", requiredCommands.every((name) => mutationService.includes(`"${name}"`)));
check("status-cancellation-uses-dedicated-command", mutationService.includes('newStatus === AgendaEventStatus.CANCELLED') && mutationService.includes('invokeAgendaCommand("agenda_cancel_appointment"'));
check("mutation-service-is-server-only", mutationService.startsWith('import "server-only";'));
check("no-show-reschedule-keeps-lifecycle-intent", agendaForm.includes('event.status==="no_show"') && agendaForm.includes("shouldReschedule(event,date,startTime,endTime,tenantTimezone)"));
check("server-actions-delegate-to-canonical-service",
  actions.includes("createAgendaEventMutation") &&
  actions.includes("updateAgendaEventMutation") &&
  actions.includes("updateAgendaEventStatusMutation") &&
  actions.includes("cancelAgendaEventMutation"));
check("canonical-service-no-direct-table-writes",
  !/\.from\(\s*["'`]master_agenda_events["'`]\s*\)\s*\.\s*(?:insert|update|delete|upsert)\s*\(/s.test(mutationService));
check("browser-hooks-no-appointment-writes",
  !/export function use(?:Create|Update|Cancel)AgendaEvent[^\n]*useMutation/.test(queries) &&
  !/\.from\(\s*["'`]master_agenda_events["'`]\s*\)\s*\.\s*(?:insert|update|delete|upsert)\s*\(/s.test(queries));

const directWritePattern = /\.from\(\s*["'`]master_agenda_events["'`]\s*\)\s*\.\s*(?:insert|update|delete|upsert)\s*\(/gs;
const directWriters = [];
for (const path of walk("src")) {
  const content = readFileSync(path, "utf8");
  directWritePattern.lastIndex = 0;
  if (directWritePattern.test(content)) directWriters.push(path);
}
check("no-active-direct-appointment-write-surface", directWriters.length === 0, directWriters.join(","));

check("audit-insert-and-update-trigger",
  /CREATE TRIGGER tr_audit_agenda\s+AFTER INSERT OR UPDATE ON public\.master_agenda_events/s.test(auditMigration));
check("audit-reuses-canonical-table", auditMigration.includes("INSERT INTO public.audit_trail") && !/CREATE TABLE/i.test(auditMigration));
check("audit-revalidates-authenticated-actor", auditMigration.includes("cu.auth_user_id = auth.uid()") && auditMigration.includes("app.agenda_actor_id"));
check("audit-classifies-create-update-status-cancel-reschedule",
  ["CREATE", "UPDATE", "STATUS_CHANGE", "CANCEL", "RESCHEDULE"].every((word) => auditMigration.includes(`'${word}'`)));
check("audit-does-not-expand-other-domain-behavior",
  auditMigration.includes("IF TG_TABLE_NAME <> 'master_agenda_events' THEN") &&
  auditMigration.includes("IF TG_OP = 'UPDATE' THEN"));

check("acl-removes-direct-write-policies",
  ["rls_master_agenda_events_insert", "rls_master_agenda_events_update", "rls_master_agenda_events_delete"].every((name) => aclMigration.includes(name)));
check("acl-revokes-direct-write-privileges",
  /REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER[\s\S]+FROM PUBLIC, anon, authenticated, service_role/.test(aclMigration));
check("acl-retains-select-only",
  /GRANT SELECT ON TABLE public\.master_agenda_events TO authenticated, service_role/.test(aclMigration));

check("booking-requirement-consumer-contract", requirements.includes("export interface BookingRequirementSet"));
check("procedure-type-is-tenant-scoped-and-active",
  requirements.includes('.eq("tenant_id", tenantId)') &&
  requirements.includes('.eq("is_active", true)') &&
  requirements.includes('.is("deleted_at", null)'));
check("provider-optionality-shared", requirements.includes("export function isProviderRequired"));
check("resource-default-policy-exclusive", requirements.includes('mode: "exclusive"') && requirements.includes("capacity: 1"));
check("no-historical-resource-model-resurrection", !/CREATE TABLE.*clinic_procedure_resources/is.test(commandMigration + auditMigration + aclMigration));
check("availability-skips-provider-only-when-optional",
  availability.includes("providerRequired") && availability.includes("AGENDA_PROVIDER_REQUIRED"));
check("update-excludes-current-event-from-availability",
  availability.includes("excludeEventId") && availability.includes("query.neq(\"id\",excludeEventId)"));
check("conflict-engine-still-checks-without-provider",
  !conflicts.includes("if (!tenantId || !doctorId || !patientId") && conflicts.includes('ids.doctorId && event.doctor_id === ids.doctorId'));

check("quick-appointment-keeps-tenant-wall-clock",
  quick.includes('fd.set("scheduled_start", form.start_time)') &&
  quick.includes('fd.set("scheduled_end", scheduledEndLocal)') &&
  !quick.includes('new Date(form.start_time).toISOString()'));
check("quick-appointment-honors-provider-optional", quick.includes("required={providerRequired}"));
check("quick-appointment-submits-notes", quick.includes('fd.set("notes", form.notes.trim())'));
check("quick-appointment-uses-procedure-duration", quick.includes("selectedProcedure!.standard_duration_minutes"));

check("agenda-new-patient-routes-to-canonical-registration", agendaForm.includes('router.push("/patients?registerForBooking=1")'));
check("registration-query-opens-canonical-patient-form", patientsPage.includes('searchParams.get("registerForBooking") === "1"') && patientsPage.includes("useState(registerForBooking)"));
check("registration-success-returns-selected-patient-to-agenda", patientsPage.includes("setAgendaPatientId(patientId); setIsAgendaOpen(true)") && patientsPage.includes("defaultPatientId={agendaPatientId || undefined}"));
check("patient-form-propagates-canonical-patient-id", patientForm.split("result.data?.id ?? result.patient_id").length - 1 >= 2);
check("quick-appointment-searches-and-selects-tenant-scoped-patient", quick.includes("usePatients(tenantId, patientSearch)") && quick.includes("setForm((f) => ({ ...f, patient_id: patient.id }))"));
check("quick-appointment-requires-selected-record-not-manual-id", quick.includes("if (!form.patient_id ||") && !/name=["']patient_id/.test(quick));

const followupList = read("src/features/followup/followup-list-view.tsx");
const followupScheduled = read("src/features/followup/followup-scheduled-view.tsx");
check("followup-appointment-action-routes-to-agenda",
  followupList.includes("followupRequestId=\u0024{encodeURIComponent(record.id)}") &&
  followupScheduled.includes("followupRequestId=\u0024{encodeURIComponent(record.id)}"));
check("agenda-opens-booking-form-from-followup-request",
  agendaPage.includes('searchParams.get("followupRequestId")') &&
  agendaPage.includes("Boolean(bookingWorkItemId || followupRequestId)") &&
  agendaPage.includes("defaultPatientId={patientId || undefined}"));
check("followup-agenda-entry-keeps-owning-domain-context",
  agendaPage.includes("followupRequestId ? t.followupRequest") &&
  agendaPage.includes('next.delete("followupRequestId")'));

const failures = checks.filter((item) => item.status === "FAIL");
console.log(JSON.stringify({
  audit: "csapi-gate04-static-audit",
  completed_at: new Date().toISOString(),
  status: failures.length ? "FAIL" : "PASS",
  passed: checks.length - failures.length,
  failed: failures.length,
  checks,
}, null, 2));
if (failures.length) process.exitCode = 1;
