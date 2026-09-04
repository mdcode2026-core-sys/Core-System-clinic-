"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

type Result<T = null> = { success: true; data?: T } | { success: false; error: string };

async function ctx(permission: string) {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "غير مصرح" } as const;
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId || !(await hasEffectivePermission(permission, user.id))) return { error: "لا تملك صلاحية تنفيذ هذه العملية" } as const;
  return { db, user, tenantId } as const;
}

export async function saveInventoryItem(input: { id?: string; name: string; name_ar?: string; sku?: string; category?: string; unit: string; reorder_threshold: number; purchase_cost_subunits?: number | null; valuation_cost_subunits?: number | null; selling_price_subunits?: number | null; is_procedure_material: boolean; is_operating_consumable: boolean; requires_batch_tracking: boolean; requires_expiry_tracking: boolean; description?: string; manufacturer?: string }): Promise<Result> {
  const c = await ctx("inventory:adjust"); if ("error" in c) return { success: false, error: c.error };
  const row = { tenant_id: c.tenantId, name: input.name.trim(), name_ar: input.name_ar?.trim() || null, sku: input.sku?.trim() || null, category: input.category?.trim() || null, unit: input.unit.trim(), reorder_threshold: Math.max(0, Math.trunc(input.reorder_threshold || 0)), purchase_cost_subunits: input.purchase_cost_subunits ?? null, valuation_cost_subunits: input.valuation_cost_subunits ?? null, selling_price_subunits: input.selling_price_subunits ?? null, is_procedure_material: input.is_procedure_material, is_operating_consumable: input.is_operating_consumable, requires_batch_tracking: input.requires_batch_tracking, requires_expiry_tracking: input.requires_expiry_tracking, description: input.description?.trim() || null, manufacturer: input.manufacturer?.trim() || null, is_active: true, deleted_at: null };
  const q = input.id ? c.db.from("inventory_items").update(row).eq("id", input.id).eq("tenant_id", c.tenantId) : c.db.from("inventory_items").insert({ ...row, created_by: c.user.id });
  const { error } = await q; return error ? { success: false, error: error.message } : { success: true };
}

export async function adjustInventory(input: { item_id: string; delta: number; reason: string }): Promise<Result> {
  const c = await ctx("inventory:adjust"); if ("error" in c) return { success: false, error: c.error };
  if (!input.delta || !Number.isInteger(input.delta) || !input.reason.trim()) return { success: false, error: "أدخل كمية صحيحة وسبب التعديل" };
  const { error } = await c.db.rpc("adjust_inventory_stock", { p_item_id: input.item_id, p_tenant_id: c.tenantId, p_delta: input.delta, p_movement_type: "adjustment", p_source_type: "manual_adjustment", p_source_id: null, p_procedure_id: null, p_session_id: null, p_treatment_plan_item_id: null, p_actor_id: c.user.id, p_reason: input.reason.trim() });
  return error ? { success: false, error: error.message } : { success: true };
}

export async function saveInsuranceProvider(input: { id?: string; name: string; name_ar?: string; contact_name?: string; phone?: string; email?: string; address?: string; notes?: string }): Promise<Result> {
  const c = await ctx("insurance:manage"); if ("error" in c) return { success: false, error: c.error };
  const row = { tenant_id: c.tenantId, name: input.name.trim(), name_ar: input.name_ar?.trim() || null, contact_name: input.contact_name?.trim() || null, phone: input.phone?.trim() || null, email: input.email?.trim() || null, address: input.address?.trim() || null, notes: input.notes?.trim() || null, status: "active", deleted_at: null };
  const q = input.id ? c.db.from("insurance_providers").update(row).eq("id", input.id).eq("tenant_id", c.tenantId) : c.db.from("insurance_providers").insert({ ...row, created_by: c.user.id });
  const { error } = await q; return error ? { success: false, error: error.message } : { success: true };
}

export async function saveInsuranceContract(input: { id?: string; provider_id: string; contract_number: string; starts_on: string; ends_on?: string; coverage_rules?: string; default_coverage_percent: number; patient_responsibility_percent: number; claim_method?: string; claim_requirements?: string; status: "draft" | "active" | "expired" | "suspended" }): Promise<Result> {
  const c = await ctx("insurance:manage"); if ("error" in c) return { success: false, error: c.error };
  const row = { tenant_id: c.tenantId, provider_id: input.provider_id, contract_number: input.contract_number.trim(), starts_on: input.starts_on, ends_on: input.ends_on || null, coverage_rules: input.coverage_rules?.trim() || null, default_coverage_percent: input.default_coverage_percent, patient_responsibility_percent: input.patient_responsibility_percent, claim_method: input.claim_method?.trim() || null, claim_requirements: input.claim_requirements?.trim() || null, status: input.status };
  const q = input.id ? c.db.from("insurance_contracts").update(row).eq("id", input.id).eq("tenant_id", c.tenantId) : c.db.from("insurance_contracts").insert({ ...row, created_by: c.user.id });
  const { error } = await q; return error ? { success: false, error: error.message } : { success: true };
}

export async function saveSupplierBill(input: { id?: string; supplier_id: string; purchase_order_id?: string; bill_number: string; bill_date: string; due_date?: string; subtotal_subunits: number; tax_subunits: number; total_subunits: number; notes?: string }): Promise<Result> {
  const c = await ctx("purchasing:manage"); if ("error" in c) return { success: false, error: c.error };
  const row = { tenant_id: c.tenantId, supplier_id: input.supplier_id, purchase_order_id: input.purchase_order_id || null, bill_number: input.bill_number.trim(), bill_date: input.bill_date, due_date: input.due_date || null, subtotal_subunits: input.subtotal_subunits, tax_subunits: input.tax_subunits, total_subunits: input.total_subunits, status: "open", notes: input.notes?.trim() || null };
  const q = input.id ? c.db.from("supplier_bills").update(row).eq("id", input.id).eq("tenant_id", c.tenantId) : c.db.from("supplier_bills").insert({ ...row, created_by: c.user.id });
  const { error } = await q; return error ? { success: false, error: error.message } : { success: true };
}

export async function saveOperatingExpense(input: { category: string; description?: string; amount_subunits: number; expense_date: string; supplier_id?: string }): Promise<Result> {
  const c = await ctx("expenses:manage"); if ("error" in c) return { success: false, error: c.error };
  const { error } = await c.db.from("operating_expenses").insert({ tenant_id: c.tenantId, category: input.category.trim(), description: input.description?.trim() || null, amount_subunits: input.amount_subunits, amount_paid_subunits: 0, expense_date: input.expense_date, supplier_id: input.supplier_id || null, payment_status: "unpaid", currency: "JOD", created_by: c.user.id });
  return error ? { success: false, error: error.message } : { success: true };
}
