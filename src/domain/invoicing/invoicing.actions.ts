"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import type { CreateInvoiceFromSessionInput, CreateManualInvoiceInput, IssueInvoiceInput, RecordPaymentInput, ApplyDiscountInput, CancelInvoiceInput, ActionResult, InvoiceWithItems } from "./invoicing.types";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
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

export async function issueInvoice(input: IssueInvoiceInput): Promise<ActionResult<{ invoice_number: string }>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:issue"))) return { success: false, error: "Permission denied" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id, invoice_status, invoice_number").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!invoice) return { success: false, error: "Invoice not found" }; if (invoice.invoice_status !== "draft") return { success: false, error: "Only draft invoices can be issued" };
  const { data, error } = await ctx.supabase.rpc("issue_invoice", { p_invoice_id: input.invoice_id }); if (error) return { success: false, error: error.message };
  const result = data as { success?: boolean; error?: string; invoice_number?: string }; if (!result.success) return { success: false, error: result.error ?? "Unable to issue invoice" };
  revalidatePath(`/invoices/${input.invoice_id}`); revalidatePath("/invoices"); return { success: true, data: { invoice_number: result.invoice_number ?? invoice.invoice_number ?? input.invoice_id.slice(0, 8) } };
}

export async function recordPayment(input: RecordPaymentInput): Promise<ActionResult<{ payment_id: string }>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:payment"))) return { success: false, error: "Permission denied" };
  if (!Number.isInteger(input.amount_subunits) || input.amount_subunits <= 0) return { success: false, error: "Payment amount must be positive" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id, invoice_status, total_subunits, amount_paid_subunits").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!invoice) return { success: false, error: "Invoice not found" }; if (["cancelled", "refunded", "draft"].includes(invoice.invoice_status ?? "")) return { success: false, error: "Invoice is not payable" };
  const remaining = invoice.total_subunits - invoice.amount_paid_subunits; if (input.amount_subunits > remaining) return { success: false, error: "Payment exceeds remaining balance" };
  if (input.installment_id) {
    const { data: installment } = await ctx.supabase.from("financial_installments").select("id, amount_subunits, amount_paid_subunits, invoice_id").eq("id", input.installment_id).eq("tenant_id", ctx.tenantId).maybeSingle();
    if (!installment) return { success: false, error: "Installment not found" };
    if (installment.invoice_id && installment.invoice_id !== input.invoice_id) return { success: false, error: "Installment is linked to another invoice" };
    if (input.amount_subunits > installment.amount_subunits - installment.amount_paid_subunits) return { success: false, error: "Payment exceeds installment balance" };
  }
  const { data, error } = await ctx.supabase.rpc("record_invoice_payment", { p_tenant_id: ctx.tenantId, p_invoice_id: input.invoice_id, p_amount_subunits: input.amount_subunits, p_payment_method: input.payment_method, p_payment_reference: input.reference_number ?? null, p_notes: input.notes ?? null, p_collected_by: ctx.clinicUser.id });
  if (error) return { success: false, error: error.message }; const result = data as { success?: boolean; error?: string; payment_id?: string };
  if (!result.success || !result.payment_id) return { success: false, error: result.error ?? "Unable to record payment" };
  if (input.installment_id) {
    const { data: allocation, error: allocationError } = await ctx.supabase.rpc("apply_payment_to_installment", { p_tenant_id: ctx.tenantId, p_installment_id: input.installment_id, p_amount_subunits: input.amount_subunits });
    if (allocationError || !(allocation as { success?: boolean })?.success) return { success: false, error: allocationError?.message ?? "Unable to allocate installment payment" };
    await ctx.supabase.from("invoice_payments").update({ installment_id: input.installment_id }).eq("id", result.payment_id).eq("tenant_id", ctx.tenantId);
  }
  revalidatePath(`/invoices/${input.invoice_id}`); revalidatePath("/invoices"); return { success: true, data: { payment_id: result.payment_id } };
}

export async function applyDiscount(input: ApplyDiscountInput): Promise<ActionResult<void>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" }; if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:discount"))) return { success: false, error: "Permission denied" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle(); if (!invoice) return { success: false, error: "Invoice not found" };
  const { data: canEdit } = await ctx.supabase.rpc("can_edit_invoice", { p_invoice_id: input.invoice_id }); if (!canEdit) return { success: false, error: "Invoice can no longer be edited" };
  const { error } = await ctx.supabase.from("clinic_invoices").update({ discount_approved_by: ctx.clinicUser.id, discount_reason: input.discount_reason, discount_subunits: input.discount_amount_subunits ?? 0 }).eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId); if (error) return { success: false, error: error.message };
  const { error: recalcError } = await ctx.supabase.rpc("recalculate_invoice_totals", { p_invoice_id: input.invoice_id }); if (recalcError) return { success: false, error: recalcError.message };
  revalidatePath(`/invoices/${input.invoice_id}`); return { success: true, data: undefined };
}

export async function cancelInvoice(input: CancelInvoiceInput): Promise<ActionResult<void>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" }; if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:cancel"))) return { success: false, error: "Permission denied" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle(); if (!invoice) return { success: false, error: "Invoice not found" };
  const { data, error } = await ctx.supabase.rpc("cancel_invoice", { p_invoice_id: input.invoice_id }); if (error) return { success: false, error: error.message }; const result = data as { success?: boolean; error?: string };
  if (!result.success) return { success: false, error: result.error ?? "Unable to cancel invoice" }; revalidatePath(`/invoices/${input.invoice_id}`); revalidatePath("/invoices"); return { success: true, data: undefined };
}

export async function getInvoiceWithDetails(invoiceId: string): Promise<ActionResult<InvoiceWithItems>> {
  const ctx = await getAuthContext(); if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" }; if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:read"))) return { success: false, error: "Permission denied" };
  const { data: invoice, error } = await ctx.supabase.from("clinic_invoices").select(`*, patient:patient_id(id, first_name, last_name, phone_primary), session:session_id(id, session_status, session_started_at)`).eq("id", invoiceId).eq("tenant_id", ctx.tenantId).maybeSingle(); if (error || !invoice) return { success: false, error: error?.message ?? "Invoice not found" };
  const { data: items, error: itemsError } = await ctx.supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId).eq("tenant_id", ctx.tenantId).order("sort_order"); if (itemsError) return { success: false, error: itemsError.message };
  const { data: payments, error: paymentsError } = await ctx.supabase.from("invoice_payments").select("*").eq("invoice_id", invoiceId).eq("tenant_id", ctx.tenantId).order("payment_date", { ascending: false }); if (paymentsError) return { success: false, error: paymentsError.message };
  return { success: true, data: { ...invoice, items: (items ?? []).map((item) => ({ ...item, description: item.item_description, description_ar: item.item_description_ar })), payments: payments ?? [] } as unknown as InvoiceWithItems };
}
