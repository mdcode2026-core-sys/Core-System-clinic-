"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";
import type { InventoryTransactionType } from "./inventory.types";

const TRANSACTION_EFFECT: Record<InventoryTransactionType, number> = { purchase: 1, purchase_return: -1, doctor_request: -1, unused_return: 1, inventory_adjustment_increase: 1, inventory_adjustment_decrease: -1 };
const TENANT_MISSING = "INVENTORY_TENANT_MISSING"; const INCOMPLETE = "INVENTORY_INCOMPLETE_DATA"; const NAME_REQUIRED = "INVENTORY_NAME_REQUIRED"; const INVALID_TYPE = "INVENTORY_INVALID_TRANSACTION_TYPE"; const QUANTITY_INVALID = "INVENTORY_QUANTITY_INVALID"; const NEGATIVE_STOCK = "INVENTORY_NEGATIVE_STOCK"; const DATABASE_ERROR = "INVENTORY_DATABASE_ERROR";

async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: clinicUser } = await supabase.from("clinic_users").select("id, tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser?.is_active) return null;
  return { supabase, user, clinicUser, tenantId: clinicUser.tenant_id };
}

async function allowed(userId: string, permission: string) { return hasEffectivePermission(permission, userId); }

export async function createInventoryItem(formData: FormData) {
  const ctx = await getAuthContext(); if (!ctx) return { error: TENANT_MISSING }; if (!(await allowed(ctx.user.id, "inventory:create"))) return { error: "INVENTORY_PERMISSION_DENIED" };
  const name = String(formData.get("name") || "").trim(); if (!name) return { error: NAME_REQUIRED };
  const { data, error } = await ctx.supabase.from("inventory_items").insert({ tenant_id: ctx.tenantId, name, name_ar: String(formData.get("name_ar") || ""), unit: String(formData.get("unit") || "piece"), reorder_threshold: Number(formData.get("reorder_threshold") || 0), current_stock: Number(formData.get("current_stock") || 0) }).select().single();
  if (error) { console.error("[createInventoryItem] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { data };
}

export async function updateInventoryItem(formData: FormData) {
  const ctx = await getAuthContext(); if (!ctx) return { error: TENANT_MISSING }; if (!(await allowed(ctx.user.id, "inventory:update"))) return { error: "INVENTORY_PERMISSION_DENIED" };
  const id = String(formData.get("id") || ""); if (!id) return { error: INCOMPLETE }; const name = String(formData.get("name") || "").trim(); if (!name) return { error: NAME_REQUIRED };
  const { data, error } = await ctx.supabase.from("inventory_items").update({ name, name_ar: String(formData.get("name_ar") || ""), unit: String(formData.get("unit") || "piece"), reorder_threshold: Number(formData.get("reorder_threshold") || 0), current_stock: Number(formData.get("current_stock") || 0), is_active: formData.get("is_active") === "true", updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", ctx.tenantId).select().single();
  if (error) { console.error("[updateInventoryItem] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { data };
}

export async function adjustStock(formData: FormData) {
  const ctx = await getAuthContext(); if (!ctx) return { error: TENANT_MISSING }; if (!(await allowed(ctx.user.id, "inventory:adjust"))) return { error: "INVENTORY_PERMISSION_DENIED" };
  const itemId = String(formData.get("item_id") || ""); const transactionType = String(formData.get("transaction_type") || "") as InventoryTransactionType; const reason = String(formData.get("reason") || "").trim();
  if (!itemId || !transactionType || !reason) return { error: INCOMPLETE }; if (!(transactionType in TRANSACTION_EFFECT)) return { error: INVALID_TYPE };
  const quantity = Math.abs(Number(formData.get("quantity") || 0)); if (!Number.isFinite(quantity) || quantity <= 0) return { error: QUANTITY_INVALID };
  const quantityDelta = TRANSACTION_EFFECT[transactionType] * quantity;
  const { data: updated, error: updateError } = await ctx.supabase.rpc("adjust_inventory_stock", { p_item_id: itemId, p_tenant_id: ctx.tenantId, p_delta: quantityDelta });
  if (updateError) { if (updateError.message.includes("negative") || updateError.message.includes("Insufficient")) return { error: NEGATIVE_STOCK }; console.error("[adjustStock] update error:", updateError.message); return { error: DATABASE_ERROR }; }
  const { error: ledgerError } = await ctx.supabase.from("inventory_ledger").insert({ tenant_id: ctx.tenantId, item_id: itemId, material_name: reason, quantity_consumed: Math.abs(quantityDelta), consumption_type: transactionType, notes: reason, logged_by: ctx.clinicUser.id });
  if (ledgerError) { console.error("[adjustStock] ledger error:", ledgerError.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { success: true, newStock: updated };
}

export async function softDeleteInventoryItem(formData: FormData) {
  const ctx = await getAuthContext(); if (!ctx) return { error: TENANT_MISSING }; if (!(await allowed(ctx.user.id, "inventory:update"))) return { error: "INVENTORY_PERMISSION_DENIED" };
  const id = String(formData.get("id") || ""); if (!id) return { error: INCOMPLETE };
  const { error } = await ctx.supabase.from("inventory_items").update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", ctx.tenantId);
  if (error) { console.error("[softDeleteInventoryItem] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { success: true };
}
