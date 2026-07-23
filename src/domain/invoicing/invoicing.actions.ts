// ============================================================
// src/domain/invoicing/invoicing.actions.ts
// Phase 5 — Invoice Server Actions
// ============================================================

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import type {
  CreateInvoiceFromSessionInput,
  CreateManualInvoiceInput,
  IssueInvoiceInput,
  RecordPaymentInput,
  ApplyDiscountInput,
  CancelInvoiceInput,
  ActionResult,
  InvoiceWithItems,
} from "./invoicing.types";

// -----------------------------------------------------------
// Helper: Get authenticated user with tenant
// -----------------------------------------------------------

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" };
  }

  const { data: clinicUser, error: userError } = await supabase
    .from("clinic_users")
    .select("tenant_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (userError || !clinicUser) {
    return { error: "User not found in clinic_users" };
  }

  return { supabase, user, tenantId: clinicUser.tenant_id, role: clinicUser.role };
}

// -----------------------------------------------------------
// Create Invoice from Session
// -----------------------------------------------------------

export async function createInvoiceFromSession(
  input: CreateInvoiceFromSessionInput
): ActionResult<{ invoice_id: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId, role } = ctx;

  if (!["receptionist", "admin", "super_admin"].includes(role)) {
    return { success: false, error: "Permission denied" };
  }

  const { data: session } = await supabase
    .from("clinic_visit_sessions")
    .select("id, tenant_id, patient_id, session_status")
    .eq("id", input.session_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  if (session.session_status === "cancelled") {
    return { success: false, error: "Cannot invoice a cancelled session" };
  }

  const { data, error } = await supabase.rpc("create_invoice_from_session", {
    p_session_id: input.session_id,
    p_tenant_id: tenantId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/invoices");
  return { success: true, data: { invoice_id: data.invoice_id as string } };
}

// -----------------------------------------------------------
// Create Manual Invoice
// -----------------------------------------------------------

export async function createManualInvoice(
  input: CreateManualInvoiceInput
): ActionResult<{ invoice_id: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId, role } = ctx;

  if (!["receptionist", "admin", "super_admin"].includes(role)) {
    return { success: false, error: "Permission denied" };
  }

  const { data: patient } = await supabase
    .from("clinic_patients")
    .select("id")
    .eq("id", input.patient_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!patient) {
    return { success: false, error: "Patient not found" };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("clinic_invoices")
    .insert({
      tenant_id: tenantId,
      patient_id: input.patient_id,
      session_id: input.session_id ?? null,
      invoice_date: input.invoice_date ?? new Date().toISOString().split("T")[0],
      invoice_status: "draft",
      payment_terms: input.payment_terms ?? "cash",
      notes: input.notes ?? null,
      subtotal_subunits: 0,
      total_subunits: 0,
      tax_subunits: 0,
      discount_subunits: 0,
      amount_paid_subunits: 0,
      amount_due_subunits: 0,
    })
    .select()
    .single();

  if (invoiceError) {
    return { success: false, error: invoiceError.message };
  }

  if (input.items.length > 0) {
    const itemsToInsert = input.items.map((item, index) => ({
      tenant_id: tenantId,
      invoice_id: invoice.id,
      procedure_id: item.procedure_id ?? null,
      description: item.description,
      quantity: item.quantity,
      unit_price_subunits: item.unit_price_subunits,
      original_unit_price_subunits: item.unit_price_subunits,
      discount_amount_subunits: item.discount_amount_subunits ?? 0,
      discount_percent: item.discount_percent ?? null,
      discount_reason: item.discount_reason ?? null,
      tax_rate_percent: item.tax_rate_percent ?? 16,
      tax_amount_subunits: 0,
      line_total_subunits: 0,
      sort_order: index,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsToInsert);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    await supabase.rpc("recalculate_invoice_totals", {
      p_invoice_id: invoice.id,
    });
  }

  revalidatePath("/invoices");
  return { success: true, data: { invoice_id: invoice.id } };
}

// -----------------------------------------------------------
// Issue Invoice
// -----------------------------------------------------------

export async function issueInvoice(
  input: IssueInvoiceInput
): ActionResult<{ invoice_number: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId, role } = ctx;

  if (!["receptionist", "admin", "super_admin"].includes(role)) {
    return { success: false, error: "Permission denied" };
  }

  const { data: invoice } = await supabase
    .from("clinic_invoices")
    .select("id, invoice_status, tenant_id")
    .eq("id", input.invoice_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  if (invoice.invoice_status !== "draft") {
    return { success: false, error: "Only draft invoices can be issued" };
  }

  const { data, error } = await supabase.rpc("issue_invoice", {
    p_invoice_id: input.invoice_id,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: { invoice_number: data.invoice_number as string } };
}

// -----------------------------------------------------------
// Record Payment
// -----------------------------------------------------------

export async function recordPayment(
  input: RecordPaymentInput
): ActionResult<{ payment_id: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId, role, user } = ctx;

  if (!["receptionist", "admin", "super_admin"].includes(role)) {
    return { success: false, error: "Permission denied" };
  }

  const { data: invoice } = await supabase
    .from("clinic_invoices")
    .select("id, invoice_status, tenant_id, total_subunits, amount_paid_subunits")
    .eq("id", input.invoice_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  if (invoice.invoice_status === "cancelled") {
    return { success: false, error: "Cannot pay a cancelled invoice" };
  }

  if (invoice.invoice_status === "draft") {
    return { success: false, error: "Invoice must be issued before payment" };
  }

  const remaining = invoice.total_subunits - invoice.amount_paid_subunits;
  if (input.amount_subunits > remaining) {
    return { success: false, error: "Payment exceeds remaining balance" };
  }

  const { data, error } = await supabase.rpc("record_invoice_payment", {
    p_invoice_id: input.invoice_id,
    p_amount_subunits: input.amount_subunits,
    p_payment_method: input.payment_method,
    p_reference_number: input.reference_number ?? null,
    p_notes: input.notes ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: { payment_id: data.payment_id as string } };
}

// -----------------------------------------------------------
// Apply Discount
// -----------------------------------------------------------

export async function applyDiscount(
  input: ApplyDiscountInput
): ActionResult<void> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId, role, user } = ctx;

  if (!["admin", "super_admin"].includes(role)) {
    return { success: false, error: "Only admin can approve discounts" };
  }

  const { data: invoice } = await supabase
    .from("clinic_invoices")
    .select("id, tenant_id, invoice_status")
    .eq("id", input.invoice_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  const { data: canEdit } = await supabase.rpc("can_edit_invoice", {
    p_invoice_id: input.invoice_id,
  });

  if (!canEdit) {
    return { success: false, error: "Invoice can no longer be edited" };
  }

  const updateData: Record<string, unknown> = {
    discount_approved_by: user.id,
    discount_reason: input.discount_reason,
  };

  if (input.discount_amount_subunits !== undefined) {
    updateData.discount_subunits = input.discount_amount_subunits;
  }

  const { error } = await supabase
    .from("clinic_invoices")
    .update(updateData)
    .eq("id", input.invoice_id);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.rpc("recalculate_invoice_totals", {
    p_invoice_id: input.invoice_id,
  });

  revalidatePath(`/invoices/${input.invoice_id}`);
  return { success: true, data: undefined };
}

// -----------------------------------------------------------
// Cancel Invoice
// -----------------------------------------------------------

export async function cancelInvoice(
  input: CancelInvoiceInput
): ActionResult<void> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId, role } = ctx;

  if (!["admin", "super_admin"].includes(role)) {
    return { success: false, error: "Only admin can cancel invoices" };
  }

  const { data: invoice } = await supabase
    .from("clinic_invoices")
    .select("id, tenant_id, invoice_status")
    .eq("id", input.invoice_id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!invoice) {
    return { success: false, error: "Invoice not found" };
  }

  if (invoice.invoice_status === "cancelled") {
    return { success: false, error: "Invoice already cancelled" };
  }

  const { error } = await supabase.rpc("cancel_invoice", {
    p_invoice_id: input.invoice_id,
    p_reason: input.reason,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: undefined };
}

// -----------------------------------------------------------
// Get Invoice with Details
// -----------------------------------------------------------

export async function getInvoiceWithDetails(
  invoiceId: string
): ActionResult<InvoiceWithItems> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const { supabase, tenantId } = ctx;

  const { data: invoice, error: invoiceError } = await supabase
    .from("clinic_invoices")
    .select(`
      *,
      patient:patient_id(id, first_name, last_name, phone_primary),
      session:session_id(id, session_status, session_started_at)
    `)
    .eq("id", invoiceId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (invoiceError || !invoice) {
    return { success: false, error: invoiceError?.message ?? "Invoice not found" };
  }

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .eq("tenant_id", tenantId)
    .order("sort_order");

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("invoice_payments")
    .select("*")
    .eq("invoice_id", invoiceId)
    .eq("tenant_id", tenantId)
    .order("paid_at", { ascending: false });

  if (paymentsError) {
    return { success: false, error: paymentsError.message };
  }

  return {
    success: true,
    data: {
      ...invoice,
      items: items ?? [],
      payments: payments ?? [],
    } as InvoiceWithItems,
  };
}
