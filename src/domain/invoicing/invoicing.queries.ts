"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import type { InvoiceListFilters, InvoiceListItem, InvoiceWithItems, PatientOption, ProcedureOption, SessionOption, ActionResult } from "./invoicing.types";

type InvoiceItemRow = Record<string, unknown> & { item_description?: string | null; item_description_ar?: string | null; procedure_id?: string | null };

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" } as const;
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) return { error: "User not found" } as const;
  return { supabase, user, tenantId: clinicUser.tenant_id } as const;
}

export async function listInvoices(filters: InvoiceListFilters = {}): Promise<ActionResult<InvoiceListItem[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await hasEffectivePermission("invoices:read", ctx.user.id))) return { success: false, error: "Permission denied" };
  let query = ctx.supabase.from("clinic_invoices").select("id, invoice_number, invoice_date, invoice_status, total_subunits, amount_paid_subunits, amount_due_subunits, patient_id").eq("tenant_id", ctx.tenantId);
  if (filters.patient_id) query = query.eq("patient_id", filters.patient_id);
  if (filters.status) query = query.eq("invoice_status", filters.status);
  if (filters.date_from) query = query.gte("invoice_date", filters.date_from);
  if (filters.date_to) query = query.lte("invoice_date", filters.date_to);
  if (filters.session_id) query = query.eq("session_id", filters.session_id);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  const rows = data ?? [];
  if (rows.length === 0) return { success: true, data: [] };

  const patientIds = [...new Set(rows.map((x) => x.patient_id).filter(Boolean))];
  const invoiceIds = rows.map((x) => x.id);
  const [{ data: patients, error: patientError }, { data: itemRows, error: itemError }] = await Promise.all([
    ctx.supabase.from("clinic_patients").select("id, first_name, last_name").eq("tenant_id", ctx.tenantId).in("id", patientIds),
    ctx.supabase.from("invoice_items").select("invoice_id").eq("tenant_id", ctx.tenantId).in("invoice_id", invoiceIds),
  ]);
  if (patientError) return { success: false, error: patientError.message };
  if (itemError) return { success: false, error: itemError.message };
  const patientName = Object.fromEntries((patients ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim()]));
  const itemCounts: Record<string, number> = {};
  for (const item of itemRows ?? []) itemCounts[item.invoice_id] = (itemCounts[item.invoice_id] ?? 0) + 1;

  return { success: true, data: rows.map((invoice) => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    invoice_status: invoice.invoice_status as InvoiceListItem["invoice_status"],
    patient_name: patientName[invoice.patient_id] ?? "Unknown",
    total_subunits: invoice.total_subunits,
    amount_paid_subunits: invoice.amount_paid_subunits,
    amount_due_subunits: invoice.amount_due_subunits,
    item_count: itemCounts[invoice.id] ?? 0,
  })) };
}

export async function getInvoiceById(invoiceId: string): Promise<ActionResult<InvoiceWithItems>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await hasEffectivePermission("invoices:read", ctx.user.id))) return { success: false, error: "Permission denied" };

  const { data: invoice, error: invoiceError } = await ctx.supabase.from("clinic_invoices").select("*").eq("id", invoiceId).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (invoiceError || !invoice) return { success: false, error: invoiceError?.message ?? "Invoice not found" };

  const [patientResult, sessionResult, itemsResult, paymentsResult] = await Promise.all([
    invoice.patient_id ? ctx.supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("id", invoice.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    invoice.session_id ? ctx.supabase.from("clinic_visit_sessions").select("id, session_status, session_started_at").eq("id", invoice.session_id).eq("tenant_id", ctx.tenantId).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ctx.supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId).eq("tenant_id", ctx.tenantId),
    ctx.supabase.from("invoice_payments").select("*").eq("invoice_id", invoiceId).eq("tenant_id", ctx.tenantId),
  ]);
  if (patientResult.error) return { success: false, error: patientResult.error.message };
  if (sessionResult.error) return { success: false, error: sessionResult.error.message };
  if (itemsResult.error) return { success: false, error: itemsResult.error.message };
  if (paymentsResult.error) return { success: false, error: paymentsResult.error.message };

  const rawItems = (itemsResult.data ?? []) as InvoiceItemRow[];
  const procedureIds = [...new Set(rawItems.map((x) => x.procedure_id).filter((x): x is string => Boolean(x)))];
  const { data: procedures, error: proceduresError } = procedureIds.length
    ? await ctx.supabase.from("clinic_procedures").select("id, procedure_name").eq("tenant_id", ctx.tenantId).in("id", procedureIds)
    : { data: [], error: null };
  if (proceduresError) return { success: false, error: proceduresError.message };
  const procedureName = Object.fromEntries((procedures ?? []).map((x) => [x.id, x.procedure_name]));
  const items = rawItems.map((item) => ({
    ...item,
    description: item.item_description,
    description_ar: item.item_description_ar,
    ...(item.procedure_id ? { procedure: { procedure_name: procedureName[item.procedure_id] ?? null } } : {}),
  }));
  const patient = patientResult.data ? { ...patientResult.data } : null;
  const session = sessionResult.data ? { ...sessionResult.data } : null;
  return { success: true, data: { ...invoice, patient, session, items, payments: paymentsResult.data ?? [] } as unknown as InvoiceWithItems };
}

export async function getUninvoicedSessions(): Promise<ActionResult<SessionOption[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await hasEffectivePermission("invoices:create", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_visit_sessions").select(`id, session_status, session_started_at, patient:patient_id(id, first_name, last_name, phone_primary)`).eq("tenant_id", ctx.tenantId).not("session_status", "in", '("cancelled","no_show")').order("session_started_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []).map((s) => ({ id: s.id, patient: s.patient?.[0] ?? null, session_started_at: s.session_started_at })) };
}

export async function getClinicProcedures(): Promise<ActionResult<ProcedureOption[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Permission denied" };
  if (!(await hasEffectivePermission("invoices:create", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_procedures").select("id, procedure_name, base_price_subunits, tax_rate_percent, tax_included").eq("tenant_id", ctx.tenantId).eq("is_active", true).order("procedure_name");
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as ProcedureOption[] };
}

export async function getPatientsList(): Promise<ActionResult<PatientOption[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" } as ActionResult<PatientOption[]>;
  if (!(await hasEffectivePermission("invoices:create", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", ctx.tenantId).is("deleted_at", null).order("first_name");
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
