"use server";

import { revalidatePath } from "next/cache";
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

async function requirePermission(userId: string, tenantId: string, permission: string) {
  return Boolean(tenantId) && await hasEffectivePermission(permission, userId);
}

function readRpcResult(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? data as Record<string, unknown> : {};
}

export async function createInvoiceFromSession(input: CreateInvoiceFromSessionInput): Promise<ActionResult<{ invoice_id: string }>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:create"))) return { success: false, error: "Permission denied" };
  const { data: session } = await ctx.supabase.from("clinic_visit_sessions").select("id, patient_id, session_status").eq("id", input.session_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!session) return { success: false, error: "Session not found" };
  if (session.session_status === "cancelled") return { success: false, error: "Cannot invoice a cancelled session" };
  const { data, error } = await ctx.supabase.rpc("create_invoice_from_session", { p_session_id: input.session_id });
  if (error) return { success: false, error: error.message };
  const result = readRpcResult(data);
  if (result.success !== true || typeof result.invoice_id !== "string") return { success: false, error: typeof result.error === "string" ? result.error : "Unable to create invoice" };
  revalidatePath("/invoices");
  return { success: true, data: { invoice_id: result.invoice_id } };
}

export async function createManualInvoice(input: CreateManualInvoiceInput): Promise<ActionResult<{ invoice_id: string }>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:create"))) return { success: false, error: "Permission denied" };
  const items = input.items.map((item) => ({
    procedure_id: item.procedure_id ?? null,
    description: item.description,
    quantity: item.quantity,
    unit_price_subunits: item.unit_price_subunits,
    discount_amount_subunits: item.discount_amount_subunits ?? 0,
    discount_percent: item.discount_percent ?? null,
    tax_rate_percent: item.tax_rate_percent ?? null,
  }));
  const { data, error } = await ctx.supabase.rpc("create_manual_invoice", {
    p_tenant_id: ctx.tenantId,
    p_patient_id: input.patient_id,
    p_session_id: input.session_id ?? null,
    p_invoice_date: input.invoice_date ?? new Date().toISOString().slice(0, 10),
    p_payment_terms: input.payment_terms ?? "cash",
    p_notes: input.notes ?? null,
    p_created_by: ctx.clinicUser.id,
    p_items: items,
  });
  if (error) return { success: false, error: error.message };
  const result = readRpcResult(data);
  if (result.success !== true || typeof result.invoice_id !== "string") return { success: false, error: typeof result.error === "string" ? result.error : "Unable to create invoice" };
  revalidatePath("/invoices");
  return { success: true, data: { invoice_id: result.invoice_id } };
}

export async function issueInvoice(input: IssueInvoiceInput): Promise<ActionResult<{ invoice_number: string }>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:issue"))) return { success: false, error: "Permission denied" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id, invoice_status, invoice_number").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!invoice) return { success: false, error: "Invoice not found" };
  if (invoice.invoice_status !== "draft") return { success: false, error: "Only draft invoices can be issued" };
  const { data, error } = await ctx.supabase.rpc("issue_invoice", { p_invoice_id: input.invoice_id });
  if (error) return { success: false, error: error.message };
  const result = readRpcResult(data);
  if (result.success !== true) return { success: false, error: typeof result.error === "string" ? result.error : "Unable to issue invoice" };
  const invoiceNumber = typeof result.invoice_number === "string" ? result.invoice_number : typeof invoice.invoice_number === "string" && invoice.invoice_number ? invoice.invoice_number : input.invoice_id.slice(0, 8);
  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: { invoice_number: invoiceNumber } };
}

export async function recordPayment(input: RecordPaymentInput): Promise<ActionResult<{ payment_id: string }>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:payment"))) return { success: false, error: "Permission denied" };
  if (!Number.isInteger(input.amount_subunits) || input.amount_subunits <= 0) return { success: false, error: "Payment amount must be positive" };

  const rpc = input.installment_id
    ? await ctx.supabase.rpc("record_invoice_payment_with_installment", {
        p_tenant_id: ctx.tenantId,
        p_invoice_id: input.invoice_id,
        p_amount_subunits: input.amount_subunits,
        p_payment_method: input.payment_method,
        p_payment_reference: input.reference_number ?? null,
        p_notes: input.notes ?? null,
        p_collected_by: ctx.clinicUser.id,
        p_installment_id: input.installment_id,
      })
    : await ctx.supabase.rpc("record_invoice_payment", {
        p_tenant_id: ctx.tenantId,
        p_invoice_id: input.invoice_id,
        p_amount_subunits: input.amount_subunits,
        p_payment_method: input.payment_method,
        p_payment_reference: input.reference_number ?? null,
        p_notes: input.notes ?? null,
        p_collected_by: ctx.clinicUser.id,
      });

  if (rpc.error) return { success: false, error: rpc.error.message };
  const result = readRpcResult(rpc.data);
  if (result.success !== true || typeof result.payment_id !== "string") return { success: false, error: typeof result.error === "string" ? result.error : "Unable to record payment" };
  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: { payment_id: result.payment_id } };
}

export async function applyDiscount(input: ApplyDiscountInput): Promise<ActionResult<void>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:discount"))) return { success: false, error: "Permission denied" };
  if (input.discount_amount_subunits === undefined || !Number.isInteger(input.discount_amount_subunits) || input.discount_amount_subunits < 0) return { success: false, error: "Invalid discount amount" };
  if (input.discount_percent !== undefined && (!Number.isFinite(input.discount_percent) || input.discount_percent < 0 || input.discount_percent > 100)) return { success: false, error: "Invalid discount percent" };
  if (!input.discount_reason.trim()) return { success: false, error: "Discount reason is required" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!invoice) return { success: false, error: "Invoice not found" };
  const { data: canEdit } = await ctx.supabase.rpc("can_edit_invoice", { p_invoice_id: input.invoice_id });
  if (!canEdit) return { success: false, error: "Invoice can no longer be edited" };
  const { error } = await ctx.supabase.from("clinic_invoices").update({ discount_approved_by: ctx.clinicUser.id, discount_reason: input.discount_reason.trim(), discount_subunits: input.discount_amount_subunits }).eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId);
  if (error) return { success: false, error: error.message };
  const { error: recalcError } = await ctx.supabase.rpc("recalculate_invoice_totals", { p_invoice_id: input.invoice_id });
  if (recalcError) return { success: false, error: recalcError.message };
  revalidatePath(`/invoices/${input.invoice_id}`);
  return { success: true, data: undefined };
}

export async function cancelInvoice(input: CancelInvoiceInput): Promise<ActionResult<void>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:cancel"))) return { success: false, error: "Permission denied" };
  if (!input.reason.trim()) return { success: false, error: "Cancellation reason is required" };
  const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id").eq("id", input.invoice_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!invoice) return { success: false, error: "Invoice not found" };
  const { data, error } = await ctx.supabase.rpc("cancel_invoice", { p_invoice_id: input.invoice_id });
  if (error) return { success: false, error: error.message };
  const result = readRpcResult(data);
  if (result.success !== true) return { success: false, error: typeof result.error === "string" ? result.error : "Unable to cancel invoice" };
  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: undefined };
}

export async function getInvoiceWithDetails(invoiceId: string): Promise<ActionResult<InvoiceWithItems>> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error ?? "Unauthorized" };
  if (!(await requirePermission(ctx.user.id, ctx.tenantId, "invoices:read"))) return { success: false, error: "Permission denied" };
  const { data: invoice, error } = await ctx.supabase.from("clinic_invoices").select("*, patient:patient_id(id, first_name, last_name, phone_primary), session:session_id(id, session_status, session_started_at)").eq("id", invoiceId).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (error || !invoice) return { success: false, error: error?.message ?? "Invoice not found" };
  const { data: items, error: itemsError } = await ctx.supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId).eq("tenant_id", ctx.tenantId).order("sort_order");
  if (itemsError) return { success: false, error: itemsError.message };
  const { data: payments, error: paymentsError } = await ctx.supabase.from("invoice_payments").select("*").eq("invoice_id", invoiceId).eq("tenant_id", ctx.tenantId).order("payment_date", { ascending: false });
  if (paymentsError) return { success: false, error: paymentsError.message };
  return { success: true, data: { ...invoice, items: (items ?? []).map((item) => ({ ...item, description: item.item_description, description_ar: item.item_description_ar })), payments: payments ?? [] } as unknown as InvoiceWithItems };
}
