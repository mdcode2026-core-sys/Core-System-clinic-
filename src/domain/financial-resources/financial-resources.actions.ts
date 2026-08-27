"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

export type FinancialPlanStatus = "draft" | "active" | "completed" | "cancelled";
export type InstallmentStatus = "scheduled" | "due" | "partial" | "paid" | "overdue" | "cancelled";

export interface InstallmentInput { installment_no: number; due_date: string; amount_subunits: number; invoice_id?: string | null; notes?: string | null; }
export interface FinancialPlanInput { patient_id: string; treatment_plan_id?: string | null; total_amount_subunits: number; insurance_covered_subunits?: number; patient_responsibility_subunits?: number; currency?: string | null; notes?: string | null; installments?: InstallmentInput[]; }
export interface InsuranceProfileInput { patient_id: string; payer_name: string; policy_number?: string | null; member_number?: string | null; coverage_summary?: string | null; patient_responsibility_subunits?: number | null; status?: "active" | "inactive" | "expired" | "pending"; claim_ready?: boolean; reconciliation_status?: "not_started" | "ready" | "in_progress" | "reconciled" | "exception"; effective_from?: string | null; effective_to?: string | null; notes?: string | null; }
export interface SupplierInput { name: string; name_ar?: string | null; contact_name?: string | null; phone?: string | null; email?: string | null; address?: string | null; tax_identifier?: string | null; notes?: string | null; }
export interface PurchaseOrderItemInput { inventory_item_id: string; quantity_ordered: number; unit_cost_subunits: number; }
export interface PurchaseOrderInput { supplier_id: string; order_number?: string | null; order_date?: string; expected_date?: string | null; notes?: string | null; items: PurchaseOrderItemInput[]; }

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id, tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

async function allowed(userId: string, permission: string) { return hasEffectivePermission(permission, userId); }

export async function createFinancialPlan(input: FinancialPlanInput) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" };
  if (!(await allowed(ctx.user.id, "invoices:update"))) return { success: false, error: "Permission denied" };
  if (input.total_amount_subunits < 0 || (input.insurance_covered_subunits ?? 0) < 0) return { success: false, error: "Invalid financial amounts" };
  const insurance = input.insurance_covered_subunits ?? 0;
  const responsibility = input.patient_responsibility_subunits ?? Math.max(input.total_amount_subunits - insurance, 0);
  if (insurance + responsibility !== input.total_amount_subunits) return { success: false, error: "Financial plan amounts must balance" };
  const { data: patient } = await ctx.supabase.from("clinic_patients").select("id").eq("id", input.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!patient) return { success: false, error: "Patient not found" };
  if (input.treatment_plan_id) {
    const { data: plan } = await ctx.supabase.from("clinic_treatment_plans").select("id").eq("id", input.treatment_plan_id).eq("patient_id", input.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle();
    if (!plan) return { success: false, error: "Treatment plan not found" };
  }
  const db = ctx.supabase as any;
  const { data: financialPlan, error } = await db.from("financial_plans").insert({ tenant_id: ctx.tenantId, patient_id: input.patient_id, treatment_plan_id: input.treatment_plan_id ?? null, total_amount_subunits: input.total_amount_subunits, insurance_covered_subunits: insurance, patient_responsibility_subunits: responsibility, currency: input.currency ?? null, notes: input.notes ?? null, created_by: ctx.clinicUser.id }).select().single();
  if (error || !financialPlan) return { success: false, error: error?.message ?? "Unable to create financial plan" };
  if (input.installments?.length) {
    const sum = input.installments.reduce((total, item) => total + item.amount_subunits, 0);
    if (sum !== responsibility) return { success: false, error: "Installments must equal patient responsibility" };
    const rows = input.installments.map((item) => ({ tenant_id: ctx.tenantId, financial_plan_id: financialPlan.id, installment_no: item.installment_no, due_date: item.due_date, amount_subunits: item.amount_subunits, invoice_id: item.invoice_id ?? null, notes: item.notes ?? null }));
    const { error: installmentError } = await db.from("financial_installments").insert(rows);
    if (installmentError) return { success: false, error: installmentError.message };
  }
  revalidatePath("/invoices"); return { success: true, data: financialPlan };
}

export async function upsertInsuranceProfile(input: InsuranceProfileInput) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" };
  if (!(await allowed(ctx.user.id, "insurance:manage"))) return { success: false, error: "Permission denied" };
  const { data: patient } = await ctx.supabase.from("clinic_patients").select("id").eq("id", input.patient_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!patient) return { success: false, error: "Patient not found" };
  const db = ctx.supabase as any;
  const { data, error } = await db.from("patient_insurance_profiles").insert({ ...input, tenant_id: ctx.tenantId, created_by: ctx.clinicUser.id }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createSupplier(input: SupplierInput) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" };
  if (!(await allowed(ctx.user.id, "purchasing:manage"))) return { success: false, error: "Permission denied" };
  if (!input.name.trim()) return { success: false, error: "Supplier name is required" };
  const db = ctx.supabase as any;
  const { data, error } = await db.from("suppliers").insert({ ...input, name: input.name.trim(), tenant_id: ctx.tenantId, created_by: ctx.clinicUser.id }).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" };
  if (!(await allowed(ctx.user.id, "purchasing:manage"))) return { success: false, error: "Permission denied" };
  if (!input.items.length || input.items.some((item) => item.quantity_ordered <= 0 || item.unit_cost_subunits < 0)) return { success: false, error: "Invalid purchase order items" };
  const db = ctx.supabase as any;
  const { data: supplier } = await db.from("suppliers").select("id").eq("id", input.supplier_id).eq("tenant_id", ctx.tenantId).maybeSingle();
  if (!supplier) return { success: false, error: "Supplier not found" };
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity_ordered * item.unit_cost_subunits, 0);
  const { data: order, error } = await db.from("purchase_orders").insert({ tenant_id: ctx.tenantId, supplier_id: input.supplier_id, order_number: input.order_number ?? null, order_date: input.order_date ?? new Date().toISOString().slice(0, 10), expected_date: input.expected_date ?? null, subtotal_subunits: subtotal, tax_subunits: 0, total_subunits: subtotal, notes: input.notes ?? null, created_by: ctx.clinicUser.id }).select().single();
  if (error || !order) return { success: false, error: error?.message ?? "Unable to create purchase order" };
  const rows = input.items.map((item) => ({ tenant_id: ctx.tenantId, purchase_order_id: order.id, inventory_item_id: item.inventory_item_id, quantity_ordered: item.quantity_ordered, unit_cost_subunits: item.unit_cost_subunits, line_total_subunits: item.quantity_ordered * item.unit_cost_subunits }));
  const { error: itemError } = await db.from("purchase_order_items").insert(rows);
  if (itemError) return { success: false, error: itemError.message };
  revalidatePath("/inventory"); return { success: true, data: order };
}

export async function receivePurchaseOrder(purchaseOrderId: string, items: { purchase_order_item_id: string; quantity: number }[]) {
  const ctx = await context(); if (!ctx) return { success: false, error: "Unauthorized" };
  if (!(await allowed(ctx.user.id, "purchasing:manage"))) return { success: false, error: "Permission denied" };
  if (!items.length || items.some((item) => item.quantity <= 0)) return { success: false, error: "Invalid receiving quantities" };
  const db = ctx.supabase as any;
  const { data, error } = await db.rpc("receive_purchase_order", { p_tenant_id: ctx.tenantId, p_purchase_order_id: purchaseOrderId, p_received_by: ctx.clinicUser.id, p_items: items });
  if (error) return { success: false, error: error.message };
  if (!(data as { success?: boolean })?.success) return { success: false, error: (data as { error?: string })?.error ?? "Unable to receive purchase order" };
  revalidatePath("/inventory"); return { success: true, data };
}
