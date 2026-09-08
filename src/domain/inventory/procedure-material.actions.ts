"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { resolveTenantId } from "@/core/auth/resolveTenantId";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

type Result<T = null> = { success: true; data?: T } | { success: false; error: string };

async function ctx() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: "Unauthorized" } as const;
  const tenantId = await resolveTenantId(user.id);
  if (!tenantId || !(await hasEffectivePermission(user.id, "inventory:adjust"))) return { error: "Permission denied" } as const;
  return { db, user, tenantId } as const;
}

export async function saveProcedureMaterialRequirement(input: {
  id?: string;
  procedure_id: string;
  inventory_item_id: string;
  standard_quantity: number;
  required?: boolean;
  notes?: string;
}): Promise<Result> {
  const c = await ctx(); if ("error" in c) return { success: false, error: c.error };
  if (!Number.isInteger(input.standard_quantity) || input.standard_quantity <= 0) return { success: false, error: "Quantity must be a positive whole number" };
  const row = { tenant_id: c.tenantId, procedure_id: input.procedure_id, inventory_item_id: input.inventory_item_id, standard_quantity: input.standard_quantity, required: input.required !== false, notes: input.notes?.trim() || null, updated_at: new Date().toISOString() };
  const q = input.id
    ? c.db.from("clinic_procedure_inventory_requirements").update(row).eq("id", input.id).eq("tenant_id", c.tenantId)
    : c.db.from("clinic_procedure_inventory_requirements").insert(row);
  const { error } = await q;
  return error ? { success: false, error: error.message } : { success: true };
}

export async function deleteProcedureMaterialRequirement(id: string): Promise<Result> {
  const c = await ctx(); if ("error" in c) return { success: false, error: c.error };
  const { error } = await c.db.from("clinic_procedure_inventory_requirements").delete().eq("id", id).eq("tenant_id", c.tenantId);
  return error ? { success: false, error: error.message } : { success: true };
}

export async function issueProcedureMaterial(input: {
  visit_id: string;
  treatment_plan_item_id?: string | null;
  item_id: string;
  quantity: number;
  reason?: string;
}): Promise<Result> {
  const c = await ctx(); if ("error" in c) return { success: false, error: c.error };
  const { data, error } = await c.db.rpc("issue_procedure_inventory", {
    p_tenant_id: c.tenantId,
    p_visit_id: input.visit_id,
    p_treatment_plan_item_id: input.treatment_plan_item_id ?? null,
    p_item_id: input.item_id,
    p_quantity: input.quantity,
    p_issued_by: c.user.id,
    p_reason: input.reason?.trim() || "Procedure material prepared",
  });
  if (error) return { success: false, error: error.message };
  return data as Result;
}

export async function consumeIssuedProcedureMaterial(input: { issue_id: string; quantity: number; reason?: string }): Promise<Result> {
  const c = await ctx(); if ("error" in c) return { success: false, error: c.error };
  const { data, error } = await c.db.rpc("consume_issued_procedure_inventory", {
    p_tenant_id: c.tenantId, p_issue_id: input.issue_id, p_quantity: input.quantity, p_consumed_by: c.user.id, p_reason: input.reason?.trim() || "Clinical material used",
  });
  if (error) return { success: false, error: error.message };
  return data as Result;
}

export async function returnUnusedProcedureMaterial(input: { issue_id: string; quantity: number; reason?: string }): Promise<Result> {
  const c = await ctx(); if ("error" in c) return { success: false, error: c.error };
  const { data, error } = await c.db.rpc("return_unused_procedure_inventory", {
    p_tenant_id: c.tenantId, p_issue_id: input.issue_id, p_quantity: input.quantity, p_returned_by: c.user.id, p_reason: input.reason?.trim() || "Unused material returned to available stock",
  });
  if (error) return { success: false, error: error.message };
  return data as Result;
}
