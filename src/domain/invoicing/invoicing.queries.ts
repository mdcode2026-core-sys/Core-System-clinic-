"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import type { InvoiceListFilters, InvoiceListItem, InvoiceWithItems, PatientOption, ProcedureOption, SessionOption, ActionResult } from "./invoicing.types";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" } as const;
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) return { error: "User not found" } as const;
  return { supabase, user, tenantId: clinicUser.tenant_id } as const;
}

export async function listInvoices(filters: InvoiceListFilters = {}): Promise<ActionResult<InvoiceListItem[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error };
  if (!(await hasEffectivePermission("invoices:read", ctx.user.id))) return { success: false, error: "Permission denied" };
  let query = ctx.supabase.from("clinic_invoices").select(`id, invoice_number, invoice_date, invoice_status, total_subunits, amount_paid_subunits, amount_due_subunits, patient:patient_id(id, first_name, last_name), items:invoice_items(count)`).eq("tenant_id", ctx.tenantId);
  if (filters.patient_id) query = query.eq("patient_id", filters.patient_id);
  if (filters.status) query = query.eq("invoice_status", filters.status);
  if (filters.date_from) query = query.gte("invoice_date", filters.date_from);
  if (filters.date_to) query = query.lte("invoice_date", filters.date_to);
  if (filters.session_id) query = query.eq("session_id", filters.session_id);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []).map((invoice) => ({ id: invoice.id, invoice_number: invoice.invoice_number, invoice_date: invoice.invoice_date, invoice_status: invoice.invoice_status as InvoiceListItem["invoice_status"], patient_name: invoice.patient?.[0] ? `${invoice.patient[0].first_name} ${invoice.patient[0].last_name}` : "Unknown", total_subunits: invoice.total_subunits, amount_paid_subunits: invoice.amount_paid_subunits, amount_due_subunits: invoice.amount_due_subunits, item_count: invoice.items?.[0]?.count ?? 0 })) };
}

export async function getInvoiceById(invoiceId: string): Promise<ActionResult<InvoiceWithItems>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error };
  if (!(await hasEffectivePermission("invoices:read", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_invoices").select(`*, patient:patient_id(id, first_name, last_name, phone_primary), session:session_id(id, session_status, session_started_at), items:invoice_items(*, procedure:procedure_id(procedure_name)), payments:invoice_payments(*)`).eq("id", invoiceId).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (error || !data) return { success: false, error: error?.message ?? "Invoice not found" };
  const items = (data.items ?? []).map((item) => ({ ...item, description: item.item_description, description_ar: item.item_description_ar }));
  return { success: true, data: { ...data, items, payments: data.payments ?? [] } as unknown as InvoiceWithItems };
}

export async function getUninvoicedSessions(): Promise<ActionResult<SessionOption[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error };
  if (!(await hasEffectivePermission("invoices:create", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_visit_sessions").select(`id, session_status, session_started_at, patient:patient_id(id, first_name, last_name, phone_primary)`).eq("tenant_id", ctx.tenantId).not("session_status", "in", '("cancelled","no_show")').order("session_started_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []).map((s) => ({ id: s.id, patient: s.patient?.[0] ?? null, session_started_at: s.session_started_at })) };
}

export async function getClinicProcedures(): Promise<ActionResult<ProcedureOption[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error };
  if (!(await hasEffectivePermission("invoices:create", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_procedures").select("id, procedure_name, base_price_subunits, tax_rate_percent, tax_included").eq("tenant_id", ctx.tenantId).eq("is_active", true).order("procedure_name");
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as ProcedureOption[] };
}

export async function getPatientsList(): Promise<ActionResult<PatientOption[]>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error };
  if (!(await hasEffectivePermission("invoices:create", ctx.user.id))) return { success: false, error: "Permission denied" };
  const { data, error } = await ctx.supabase.from("clinic_patients").select("id, first_name, last_name, phone_primary").eq("tenant_id", ctx.tenantId).is("deleted_at", null).order("first_name");
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
