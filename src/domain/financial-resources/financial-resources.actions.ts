"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

export type FinancialPlanStatus = "draft" | "active" | "completed" | "cancelled";
export type InstallmentStatus = "scheduled" | "due" | "partial" | "paid" | "overdue" | "cancelled";
export type InsuranceClaimStatus = "prepared" | "submitted" | "paid" | "rejected" | "reconciled" | "exception";

export interface InstallmentInput { installment_no: number; due_date: string; amount_subunits: number; invoice_id?: string | null; notes?: string | null; }
export interface FinancialPlanInput { patient_id: string; treatment_plan_id?: string | null; total_amount_subunits: number; insurance_covered_subunits?: number; patient_responsibility_subunits?: number; currency?: string | null; notes?: string | null; installments?: InstallmentInput[]; }
export interface InsuranceProfileInput { patient_id: string; payer_name: string; policy_number?: string | null; member_number?: string | null; coverage_summary?: string | null; patient_responsibility_subunits?: number | null; status?: "active" | "inactive" | "expired" | "pending"; claim_ready?: boolean; reconciliation_status?: "not_started" | "ready" | "in_progress" | "reconciled" | "exception"; effective_from?: string | null; effective_to?: string | null; notes?: string | null; }
export interface InsuranceClaimInput { patient_id: string; insurance_profile_id: string; invoice_id?: string | null; claim_reference?: string | null; amount_claimed_subunits: number; notes?: string | null; }
export interface SupplierInput { name: string; name_ar?: string | null; contact_name?: string | null; phone?: string | null; email?: string | null; address?: string | null; tax_identifier?: string | null; notes?: string | null; }
export interface PurchaseOrderItemInput { inventory_item_id: string; quantity_ordered: number; unit_cost_subunits: number; }
export interface PurchaseOrderInput { supplier_id: string; order_number?: string | null; order_date?: string; expected_date?: string | null; notes?: string | null; items: PurchaseOrderItemInput[]; }

async function context() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: clinicUser, error: clinicUserError } = await supabase.from("clinic_users").select("id, tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (clinicUserError || !clinicUser?.is_active) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

async function allowed(userId: string, permission: string) {
  return hasEffectivePermission(permission, userId);
}

function readResult(data: unknown): Record<string, unknown> {
  return data && typeof data === "object" ? data as Record<string, unknown> : {};
}

export async function createFinancialPlan(input: FinancialPlanInput) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await allowed(ctx.user.id, "invoices:update"))) return { success: false, error: "Permission denied" } as const;

  const insurance = input.insurance_covered_subunits ?? 0;
  const responsibility = input.patient_responsibility_subunits ?? Math.max(input.total_amount_subunits - insurance, 0);
  if (!Number.isInteger(input.total_amount_subunits) || input.total_amount_subunits < 0 || !Number.isInteger(insurance) || insurance < 0 || !Number.isInteger(responsibility) || responsibility < 0 || insurance + responsibility !== input.total_amount_subunits) {
    return { success: false, error: "Financial plan amounts must balance" } as const;
  }
  if (input.installments?.some((item) => !Number.isInteger(item.installment_no) || item.installment_no <= 0 || !Number.isInteger(item.amount_subunits) || item.amount_subunits <= 0 || !item.due_date)) {
    return { success: false, error: "Invalid installment" } as const;
  }

  const { data, error } = await ctx.supabase.rpc("create_financial_plan_with_installments", {
    p_tenant_id: ctx.tenantId,
    p_patient_id: input.patient_id,
    p_treatment_plan_id: input.treatment_plan_id ?? null,
    p_total_amount_subunits: input.total_amount_subunits,
    p_insurance_covered_subunits: insurance,
    p_patient_responsibility_subunits: responsibility,
    p_currency: input.currency ?? null,
    p_notes: input.notes ?? null,
    p_created_by: ctx.clinicUser.id,
    p_installments: input.installments ?? [],
  });
  if (error) return { success: false, error: error.message } as const;
  const result = readResult(data);
  if (result.success !== true || typeof result.financial_plan_id !== "string") return { success: false, error: typeof result.error === "string" ? result.error : "Unable to create financial plan" } as const;
  revalidatePath("/invoices");
  return { success: true, data: { financial_plan_id: result.financial_plan_id, installment_count: typeof result.installment_count === "number" ? result.installment_count : 0 } } as const;
}

export async function createInsuranceProfile(input: InsuranceProfileInput) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await allowed(ctx.user.id, "insurance:manage"))) return { success: false, error: "Permission denied" } as const;
  if (!input.payer_name.trim()) return { success: false, error: "Payer name is required" } as const;
  if (input.patient_responsibility_subunits != null && (!Number.isInteger(input.patient_responsibility_subunits) || input.patient_responsibility_subunits < 0)) return { success: false, error: "Invalid patient responsibility" } as const;
  const { data: patient } = await ctx.supabase.from("clinic_patients").select("id").eq("id", input.patient_id).eq("tenant_id", ctx.tenantId).is("deleted_at", null).maybeSingle();
  if (!patient) return { success: false, error: "Patient not found" } as const;
  const { data, error } = await ctx.supabase.from("patient_insurance_profiles").insert({
    tenant_id: ctx.tenantId,
    patient_id: input.patient_id,
    payer_name: input.payer_name.trim(),
    policy_number: input.policy_number ?? null,
    member_number: input.member_number ?? null,
    coverage_summary: input.coverage_summary ?? null,
    patient_responsibility_subunits: input.patient_responsibility_subunits ?? null,
    status: input.status ?? "active",
    claim_ready: input.claim_ready ?? false,
    reconciliation_status: input.reconciliation_status ?? "not_started",
    effective_from: input.effective_from ?? null,
    effective_to: input.effective_to ?? null,
    notes: input.notes ?? null,
    created_by: ctx.clinicUser.id,
  }).select("id").single();
  if (error || !data) return { success: false, error: error?.message ?? "Unable to create insurance profile" } as const;
  revalidatePath(`/patients/${input.patient_id}`);
  return { success: true, data } as const;
}

export async function createInsuranceClaim(input: InsuranceClaimInput) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await allowed(ctx.user.id, "insurance:manage"))) return { success: false, error: "Permission denied" } as const;
  if (!Number.isInteger(input.amount_claimed_subunits) || input.amount_claimed_subunits <= 0) return { success: false, error: "Claim amount must be positive" } as const;
  const { data: profile } = await ctx.supabase.from("patient_insurance_profiles").select("id, patient_id").eq("id", input.insurance_profile_id).eq("patient_id", input.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!profile) return { success: false, error: "Insurance profile not found" } as const;
  if (input.invoice_id) {
    const { data: invoice } = await ctx.supabase.from("clinic_invoices").select("id").eq("id", input.invoice_id).eq("patient_id", input.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle();
    if (!invoice) return { success: false, error: "Invoice not found" } as const;
  }
  const { data, error } = await ctx.supabase.from("insurance_claims").insert({
    tenant_id: ctx.tenantId,
    patient_id: input.patient_id,
    insurance_profile_id: input.insurance_profile_id,
    invoice_id: input.invoice_id ?? null,
    claim_reference: input.claim_reference ?? null,
    amount_claimed_subunits: input.amount_claimed_subunits,
    amount_reconciled_subunits: 0,
    status: "prepared",
    prepared_at: new Date().toISOString(),
    notes: input.notes ?? null,
    created_by: ctx.clinicUser.id,
  }).select("id").single();
  if (error || !data) return { success: false, error: error?.message ?? "Unable to create insurance claim" } as const;
  return { success: true, data } as const;
}

export async function createSupplier(input: SupplierInput) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await allowed(ctx.user.id, "purchasing:manage"))) return { success: false, error: "Permission denied" } as const;
  if (!input.name.trim()) return { success: false, error: "Supplier name is required" } as const;
  const { data, error } = await ctx.supabase.from("suppliers").insert({ ...input, name: input.name.trim(), tenant_id: ctx.tenantId, created_by: ctx.clinicUser.id }).select("id").single();
  if (error || !data) return { success: false, error: error?.message ?? "Unable to create supplier" } as const;
  revalidatePath("/inventory");
  return { success: true, data } as const;
}

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await allowed(ctx.user.id, "purchasing:manage"))) return { success: false, error: "Permission denied" } as const;
  if (!input.items.length || input.items.some((item) => !Number.isInteger(item.quantity_ordered) || item.quantity_ordered <= 0 || !Number.isInteger(item.unit_cost_subunits) || item.unit_cost_subunits < 0)) return { success: false, error: "Invalid purchase order items" } as const;

  const { data, error } = await ctx.supabase.rpc("create_purchase_order_with_items", {
    p_tenant_id: ctx.tenantId,
    p_supplier_id: input.supplier_id,
    p_order_number: input.order_number ?? null,
    p_order_date: input.order_date ?? new Date().toISOString().slice(0, 10),
    p_expected_date: input.expected_date ?? null,
    p_notes: input.notes ?? null,
    p_created_by: ctx.clinicUser.id,
    p_items: input.items,
  });
  if (error) return { success: false, error: error.message } as const;
  const result = readResult(data);
  if (result.success !== true || typeof result.purchase_order_id !== "string") return { success: false, error: typeof result.error === "string" ? result.error : "Unable to create purchase order" } as const;
  revalidatePath("/inventory");
  return { success: true, data: { purchase_order_id: result.purchase_order_id } } as const;
}

export async function receivePurchaseOrder(purchaseOrderId: string, items: { purchase_order_item_id: string; quantity: number }[]) {
  const ctx = await context();
  if (!ctx) return { success: false, error: "Unauthorized" } as const;
  if (!(await allowed(ctx.user.id, "purchasing:manage"))) return { success: false, error: "Permission denied" } as const;
  if (!items.length || items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) return { success: false, error: "Invalid receiving quantities" } as const;
  const { data, error } = await ctx.supabase.rpc("receive_purchase_order", { p_tenant_id: ctx.tenantId, p_purchase_order_id: purchaseOrderId, p_received_by: ctx.clinicUser.id, p_items: items });
  if (error) return { success: false, error: error.message } as const;
  const result = readResult(data);
  if (result.success !== true) return { success: false, error: typeof result.error === "string" ? result.error : "Unable to receive purchase order" } as const;
  revalidatePath("/inventory");
  return { success: true, data: result } as const;
}
