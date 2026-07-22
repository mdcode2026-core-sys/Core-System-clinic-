// ============================================================
// src/domain/invoicing/invoicing.queries.ts
// Phase 5 — Invoice Query Functions
// ============================================================

import { createClient } from "@/infrastructure/supabase/server";
import type { InvoiceListFilters, InvoiceListItem, ActionResult } from "./invoicing.types";

// -----------------------------------------------------------
// List Invoices
// -----------------------------------------------------------

export async function listInvoices(
  filters: InvoiceListFilters = {}
): ActionResult<InvoiceListItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clinicUser) {
    return { success: false, error: "User not found" };
  }

  const tenantId = clinicUser.tenant_id;

  let query = supabase
    .from("clinic_invoices")
    .select(`
      id,
      invoice_number,
      invoice_date,
      invoice_status,
      total_subunits,
      amount_paid_subunits,
      amount_due_subunits,
      patient:patient_id(id, first_name, last_name),
      items:invoice_items(count)
    `)
    .eq("tenant_id", tenantId);

  if (filters.patient_id) {
    query = query.eq("patient_id", filters.patient_id);
  }

  if (filters.status) {
    query = query.eq("invoice_status", filters.status);
  }

  if (filters.date_from) {
    query = query.gte("invoice_date", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("invoice_date", filters.date_to);
  }

  if (filters.session_id) {
    query = query.eq("session_id", filters.session_id);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  const items: InvoiceListItem[] = (data ?? []).map((invoice: any) => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    invoice_status: invoice.invoice_status,
    patient_name: invoice.patient
      ? `${invoice.patient.first_name} ${invoice.patient.last_name}`
      : "Unknown",
    total_subunits: invoice.total_subunits,
    amount_paid_subunits: invoice.amount_paid_subunits,
    amount_due_subunits: invoice.amount_due_subunits,
    item_count: invoice.items?.[0]?.count ?? 0,
  }));

  return { success: true, data: items };
}

// -----------------------------------------------------------
// Get Invoice by ID
// -----------------------------------------------------------

export async function getInvoiceById(invoiceId: string): ActionResult<any> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clinicUser) {
    return { success: false, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("clinic_invoices")
    .select(`
      *,
      patient:patient_id(id, first_name, last_name, phone_primary),
      session:session_id(id, session_status, session_started_at),
      items:invoice_items(*, procedure:procedure_id(procedure_name)),
      payments:invoice_payments(*, received_by:received_by(full_name))
    `)
    .eq("id", invoiceId)
    .eq("tenant_id", clinicUser.tenant_id)
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Invoice not found" };
  }

  return { success: true, data };
}

// -----------------------------------------------------------
// Get Uninvoiced Sessions
// -----------------------------------------------------------

export async function getUninvoicedSessions(): ActionResult<any[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clinicUser) {
    return { success: false, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("clinic_visit_sessions")
    .select(`
      id,
      session_status,
      session_started_at,
      session_ended_at,
      patient:patient_id(id, first_name, last_name, phone_primary),
      doctor:doctor_id(full_name)
    `)
    .eq("tenant_id", clinicUser.tenant_id)
    .not("session_status", "in", '("cancelled","no_show")')
    .order("session_started_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

// -----------------------------------------------------------
// Get Clinic Procedures
// -----------------------------------------------------------

export async function getClinicProcedures(): ActionResult<any[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clinicUser) {
    return { success: false, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("clinic_procedures")
    .select("*")
    .eq("tenant_id", clinicUser.tenant_id)
    .eq("is_active", true)
    .order("procedure_name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

// -----------------------------------------------------------
// Get Patients List
// -----------------------------------------------------------

export async function getPatientsList(): ActionResult<any[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: clinicUser } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clinicUser) {
    return { success: false, error: "User not found" };
  }

  const { data, error } = await supabase
    .from("clinic_patients")
    .select("id, first_name, last_name, phone_primary")
    .eq("tenant_id", clinicUser.tenant_id)
    .is("deleted_at", null)
    .order("first_name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}
