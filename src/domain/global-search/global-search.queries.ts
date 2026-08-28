"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { Permission } from "@/core/permissions/types";

export type GlobalSearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
};

type SearchRow = Record<string, any>;
const MAX_PER_TYPE = 5;

function escapeIlike(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function addUnique(target: GlobalSearchResult[], rows: GlobalSearchResult[]) {
  const seen = new Set(target.map((item) => `${item.type}:${item.id}`));
  for (const row of rows) {
    const key = `${row.type}:${row.id}`;
    if (seen.has(key)) continue;
    target.push(row);
    seen.add(key);
  }
}

async function searchText(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  tenantId: string,
  query: string,
  fields: string[],
  select: string,
): Promise<SearchRow[]> {
  const q = escapeIlike(query);
  const filter = fields.map((field) => `${field}.ilike.%${q}%`).join(",");
  const result = await supabase.from(table).select(select).eq("tenant_id", tenantId).or(filter).limit(MAX_PER_TYPE);
  return (result.data ?? []) as SearchRow[];
}

async function exactPatient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  id: string,
): Promise<SearchRow[]> {
  const { data } = await supabase.from("clinic_patients").select("id, first_name, last_name, first_name_ar, last_name_ar, phone_primary, email, file_number").eq("tenant_id", tenantId).eq("id", id).maybeSingle();
  return data ? [data as SearchRow] : [];
}

export async function searchGlobal(query: string, locale: "ar" | "en"): Promise<{ success: true; results: GlobalSearchResult[] } | { success: false; error: string }> {
  const normalized = query.trim();
  if (normalized.length < 2) return { success: true, results: [] };

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId) return { success: false, error: "Tenant not found" };

  const permissions = new Set(await getEffectivePermissions(user.id, tenantId));
  const has = (permission: Permission) => permissions.has(permission);
  const results: GlobalSearchResult[] = [];

  let patientRows: SearchRow[] = has("patients:read")
    ? await searchText(supabase, "clinic_patients", tenantId, normalized, ["first_name", "last_name", "first_name_ar", "last_name_ar", "phone_primary", "phone_secondary", "email", "file_number"], "id, first_name, last_name, first_name_ar, last_name_ar, phone_primary, email, file_number")
    : [];
  if (has("patients:read") && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    patientRows = [...patientRows, ...(await exactPatient(supabase, tenantId, normalized))];
  }
  addUnique(results, patientRows.map((row) => ({
    id: row.id,
    type: "patient",
    title: locale === "ar" && row.first_name_ar ? `${row.first_name_ar} ${row.last_name_ar ?? ""}`.trim() : `${row.first_name} ${row.last_name}`.trim(),
    subtitle: row.file_number ? `#${row.file_number} · ${row.phone_primary ?? row.email ?? ""}` : (row.phone_primary ?? row.email ?? ""),
    href: `/patients?patientId=${encodeURIComponent(row.id)}`,
  })));
  const patientIds = [...new Set(patientRows.map((row) => row.id as string))];

  const staffRows: SearchRow[] = has("users:read")
    ? await searchText(supabase, "clinic_users", tenantId, normalized, ["full_name", "full_name_ar", "email", "employee_code", "phone", "specialization", "role"], "id, full_name, full_name_ar, email, employee_code, phone, role")
    : [];
  addUnique(results, staffRows.map((row) => ({ id: row.id, type: "staff", title: locale === "ar" && row.full_name_ar ? row.full_name_ar : row.full_name, subtitle: `${row.role ?? ""}${row.email ? ` · ${row.email}` : ""}`, href: "/settings" })));
  const doctorIds = staffRows.filter((row) => String(row.role).toLowerCase() === "doctor").map((row) => row.id as string);

  const jobs: Promise<unknown>[] = [];
  if (has("invoices:read")) {
    jobs.push(searchText(supabase, "clinic_invoices", tenantId, normalized, ["invoice_number", "notes", "payment_terms", "invoice_status"], "id, invoice_number, invoice_status, total_subunits, amount_due_subunits, patient_id, invoice_date"));
    if (patientIds.length) jobs.push(supabase.from("clinic_invoices").select("id, invoice_number, invoice_status, total_subunits, amount_due_subunits, patient_id, invoice_date").eq("tenant_id", tenantId).in("patient_id", patientIds).limit(MAX_PER_TYPE));
    jobs.push(searchText(supabase, "invoice_payments", tenantId, normalized, ["payment_reference", "transaction_id", "payment_method", "notes"], "id, invoice_id, amount_subunits, payment_method, payment_reference, transaction_id, payment_date"));
    jobs.push(searchText(supabase, "financial_plans", tenantId, normalized, ["status", "notes"], "id, patient_id, treatment_plan_id, status, total_amount_subunits, patient_responsibility_subunits, currency, created_at"));
    if (patientIds.length) jobs.push(supabase.from("financial_plans").select("id, patient_id, treatment_plan_id, status, total_amount_subunits, patient_responsibility_subunits, currency, created_at").eq("tenant_id", tenantId).in("patient_id", patientIds).limit(MAX_PER_TYPE));
    jobs.push(searchText(supabase, "financial_installments", tenantId, normalized, ["status", "notes"], "id, financial_plan_id, installment_no, due_date, amount_subunits, amount_paid_subunits, status, invoice_id"));
  }
  if (has("insurance:read")) {
    jobs.push(searchText(supabase, "patient_insurance_profiles", tenantId, normalized, ["payer_name", "policy_number", "member_number", "coverage_summary", "status", "reconciliation_status", "notes"], "id, patient_id, payer_name, policy_number, member_number, status, reconciliation_status"));
    if (patientIds.length) jobs.push(supabase.from("patient_insurance_profiles").select("id, patient_id, payer_name, policy_number, member_number, status, reconciliation_status").eq("tenant_id", tenantId).in("patient_id", patientIds).limit(MAX_PER_TYPE));
    jobs.push(searchText(supabase, "insurance_claims", tenantId, normalized, ["claim_reference", "status", "notes"], "id, patient_id, invoice_id, claim_reference, status, amount_claimed_subunits, amount_reconciled_subunits"));
  }
  if (has("agenda:read")) {
    jobs.push(searchText(supabase, "master_agenda_events", tenantId, normalized, ["booking_notes", "event_type", "visit_type", "status"], "id, patient_id, doctor_id, scheduled_start, status, event_type, visit_type"));
    if (patientIds.length) jobs.push(supabase.from("master_agenda_events").select("id, patient_id, doctor_id, scheduled_start, status, event_type, visit_type").eq("tenant_id", tenantId).in("patient_id", patientIds).limit(MAX_PER_TYPE));
    if (doctorIds.length) jobs.push(supabase.from("master_agenda_events").select("id, patient_id, doctor_id, scheduled_start, status, event_type, visit_type").eq("tenant_id", tenantId).in("doctor_id", doctorIds).limit(MAX_PER_TYPE));
  }
  if (has("treatment_plans:read")) {
    jobs.push(searchText(supabase, "clinic_treatment_plans", tenantId, normalized, ["title", "diagnosis_summary", "goals", "status"], "id, patient_id, title, status, start_date, target_end_date"));
    if (patientIds.length) jobs.push(supabase.from("clinic_treatment_plans").select("id, patient_id, title, status, start_date, target_end_date").eq("tenant_id", tenantId).in("patient_id", patientIds).limit(MAX_PER_TYPE));
  }
  if (has("procedures:read")) jobs.push(searchText(supabase, "clinic_procedures", tenantId, normalized, ["procedure_name", "procedure_name_ar", "procedure_code", "category", "specialty", "service_type"], "id, procedure_name, procedure_name_ar, procedure_code, category, specialty"));
  if (has("inventory:read")) jobs.push(searchText(supabase, "inventory_items", tenantId, normalized, ["name", "name_ar", "unit"], "id, name, name_ar, current_stock, unit"));
  if (has("purchasing:read")) {
    jobs.push(searchText(supabase, "suppliers", tenantId, normalized, ["name", "name_ar", "contact_name", "phone", "email", "tax_identifier", "notes"], "id, name, name_ar, contact_name, phone, email, status"));
    jobs.push(searchText(supabase, "purchase_orders", tenantId, normalized, ["order_number", "status", "notes"], "id, order_number, supplier_id, order_date, expected_date, status, total_subunits"));
  }
  if (has("medical_files:read")) {
    jobs.push(searchText(supabase, "medical_files", tenantId, normalized, ["original_filename", "file_kind", "mime_type", "extension", "storage_status"], "id, patient_id, original_filename, file_kind, mime_type, created_at"));
    if (patientIds.length) jobs.push(supabase.from("medical_files").select("id, patient_id, original_filename, file_kind, mime_type, created_at").eq("tenant_id", tenantId).in("patient_id", patientIds).limit(MAX_PER_TYPE));
  }

  const settled = await Promise.all(jobs);
  const rows = (value: unknown): SearchRow[] => Array.isArray(value) ? value.flatMap(rows) : Array.isArray((value as { data?: unknown[] })?.data) ? ((value as { data: unknown[] }).data as SearchRow[]) : [];

  for (const row of settled.flatMap(rows)) {
    if (row.invoice_number !== undefined) addUnique(results, [{ id: row.id, type: "invoice", title: row.invoice_number || `Invoice ${row.id.slice(0, 8)}`, subtitle: `${row.invoice_status ?? ""} · ${row.invoice_date ?? ""}`, href: `/invoices/${encodeURIComponent(row.id)}` }]);
    if (row.payment_reference !== undefined) addUnique(results, [{ id: row.id, type: "payment", title: row.payment_reference || row.transaction_id || `Payment ${row.id.slice(0, 8)}`, subtitle: `${row.payment_method ?? ""} · ${row.payment_date ?? ""}`, href: "/financial-resources/payments" }]);
    if (row.total_amount_subunits !== undefined) addUnique(results, [{ id: row.id, type: "financialPlan", title: `Financial Plan ${row.id.slice(0, 8)}`, subtitle: `${row.status ?? ""} · ${row.currency ?? ""}`, href: "/financial-resources/financial-plans" }]);
    if (row.installment_no !== undefined) addUnique(results, [{ id: row.id, type: "installment", title: `Installment #${row.installment_no}`, subtitle: `${row.status ?? ""} · ${row.due_date ?? ""}`, href: "/financial-resources/financial-plans/installments" }]);
    if (row.payer_name !== undefined) addUnique(results, [{ id: row.id, type: "insurance", title: row.payer_name, subtitle: `${row.policy_number ?? row.member_number ?? ""} · ${row.status ?? ""}`, href: "/financial-resources/insurance" }]);
    if (row.claim_reference !== undefined) addUnique(results, [{ id: row.id, type: "claim", title: row.claim_reference || `Claim ${row.id.slice(0, 8)}`, subtitle: `${row.status ?? ""}`, href: "/financial-resources/insurance/claims" }]);
    if (row.title !== undefined && row.patient_id !== undefined) addUnique(results, [{ id: row.id, type: "treatmentPlan", title: row.title || `Treatment Plan ${row.id.slice(0, 8)}`, subtitle: `${row.status ?? ""} · ${row.start_date ?? ""}`, href: "/treatment-plans" }]);
    if (row.procedure_name !== undefined) addUnique(results, [{ id: row.id, type: "procedure", title: locale === "ar" && row.procedure_name_ar ? row.procedure_name_ar : row.procedure_name, subtitle: `${row.procedure_code ?? ""}${row.category ? ` · ${row.category}` : ""}`, href: "/settings" }]);
    if (row.current_stock !== undefined) addUnique(results, [{ id: row.id, type: "inventory", title: locale === "ar" && row.name_ar ? row.name_ar : row.name, subtitle: `${row.current_stock} ${row.unit ?? ""}`, href: "/inventory" }]);
    if (row.contact_name !== undefined && row.name !== undefined) addUnique(results, [{ id: row.id, type: "supplier", title: locale === "ar" && row.name_ar ? row.name_ar : row.name, subtitle: `${row.contact_name ?? ""}${row.phone ? ` · ${row.phone}` : ""}`, href: "/financial-resources/purchasing/suppliers" }]);
    if (row.order_number !== undefined) addUnique(results, [{ id: row.id, type: "purchaseOrder", title: row.order_number || `PO ${row.id.slice(0, 8)}`, subtitle: `${row.status ?? ""} · ${row.order_date ?? ""}`, href: "/financial-resources/purchasing" }]);
    if (row.original_filename !== undefined) addUnique(results, [{ id: row.id, type: "medicalFile", title: row.original_filename || `Medical file ${row.id.slice(0, 8)}`, subtitle: `${row.file_kind ?? ""} · ${row.mime_type ?? ""}`, href: "/clinical" }]);
    if (row.scheduled_start !== undefined) addUnique(results, [{ id: row.id, type: "appointment", title: `${row.event_type ?? "Appointment"} · ${row.visit_type ?? ""}`.trim(), subtitle: `${row.scheduled_start ?? ""} · ${row.status ?? ""}`, href: "/agenda" }]);
  }

  return { success: true, results: results.slice(0, 40) };
}
