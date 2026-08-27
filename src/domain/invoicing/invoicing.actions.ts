"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import type { CreateInvoiceFromSessionInput, CreateManualInvoiceInput, IssueInvoiceInput, RecordPaymentInput, ApplyDiscountInput, CancelInvoiceInput, ActionResult, InvoiceWithItems } from "./invoicing.types";

async function getAuthContext() {
  const supabase = await createClient(); const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" } as const;
  const { data: clinicUser, error } = await supabase.from("clinic_users").select("id, tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (error || !clinicUser || !clinicUser.is_active) return { error: "User not found in clinic_users" } as const;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id } as const;
}
async function requirePermission(userId: string, tenantId: string, permission: string) { return Boolean(tenantId) && await hasEffectivePermission(permission, userId); }

export async function createInvoiceFromSession(input: CreateInvoiceFromSessionInput): Promise<ActionResult<{ invoice_id: string }>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:create"))) return { success: false, error: "Permission denied" };
  const { data: session } = await ctx.supabase.from("clinic_visit_sessions").select("id, tenant_id, patient_id, session_status").eq("id", input.session_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!session) return { success: false, error: "Session not found" };
  if (session.session_status === "cancelled") return { success: false, error: "Cannot invoice a cancelled session" };
  const { data, error } = await ctx.supabase.rpc("create_invoice_from_session", { p_session_id: input.session_id });
  if (error) return { success: false, error: error.message };
  const result = data as { success?: boolean; error?: string; invoice_id?: string };
  if (!result.success || !result.invoice_id) return { success: false, error: result.error ?? "Unable to create invoice" };
  revalidatePath("/invoices"); return { success: true, data: { invoice_id: result.invoice_id } };
}

export async function createManualInvoice(input: CreateManualInvoiceInput): Promise<ActionResult<{ invoice_id: string }>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:create"))) return { success: false, error: "Permission denied" };
  const { data: patient } = await ctx.supabase.from("clinic_patients").select("id").eq("id", input.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!patient) return { success: false, error: "Patient not found" };
  const items = input.items.map((item, index) => ({ tenant_id: ctx.tenantId, invoice_id: "", procedure_id: item.procedure_id ?? null, item_description: item.description.trim(), quantity: item.quantity, unit_price_subunits: item.unit_price_subunits, discount_subunits: item.discount_amount_subunits ?? 0, tax_rate_percent: item.tax_rate_percent ?? 16, tax_subunits: 0, line_total_subunits: 0, sort_order: index }));
  if (items.some((item) => !item.item_description || item.quantity <= 0 || item.unit_price_subunits < 0 || item.discount_subunits < 0)) return { success: false, error: "Invalid invoice item" };
  const { data: invoice, error: invoiceError } = await ctx.supabase.from("clinic_invoices").insert({ tenant_id: ctx.tenantId, patient_id: input.patient_id, session_id: input.session_id ?? null, invoice_date: input.invoice_date ?? new Date().toISOString().slice(0, 10), invoice_status: "draft", payment_terms: input.payment_terms ?? "cash", notes: input.notes ?? null, subtotal_subunits: 0, total_subunits: 0, tax_subunits: 0, discount_subunits: 0, amount_paid_subunits: 0, amount_due_subunits: 0 }).select("id").single();
  if (invoiceError || !invoice) return { success: false, error: invoiceError?.message ?? "Unable to create invoice" };
  if (items.length > 0) {
    const { error: itemError } = await ctx.supabase.from("invoice_items").insert(items.map(({ invoice_id: _unused, ...item }) => ({ ...item, invoice_id: invoice.id })));
    if (itemError) return { success: false, error: itemError.message };
    const { error: recalcError } = await ctx.supabase.rpc("recalculate_invoice_totals", { p_invoice_id: invoice.id });
    if (recalcError) return { success: false, error: recalcError.message };
  }
  revalidatePath("/invoices"); return { success: true, data: { invoice_id: invoice.id } };
}