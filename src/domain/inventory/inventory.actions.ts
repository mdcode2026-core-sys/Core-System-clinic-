"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import type { InventoryTransactionType } from "./inventory.types";

const TRANSACTION_EFFECT: Record<InventoryTransactionType, number> = { purchase: 1, purchase_return: -1, doctor_request: -1, unused_return: 1, inventory_adjustment_increase: 1, inventory_adjustment_decrease: -1 };
const TENANT_MISSING = "INVENTORY_TENANT_MISSING"; const INCOMPLETE = "INVENTORY_INCOMPLETE_DATA"; const NAME_REQUIRED = "INVENTORY_NAME_REQUIRED"; const INVALID_TYPE = "INVENTORY_INVALID_TRANSACTION_TYPE"; const QUANTITY_INVALID = "INVENTORY_QUANTITY_INVALID"; const NEGATIVE_STOCK = "INVENTORY_NEGATIVE_STOCK"; const DATABASE_ERROR = "INVENTORY_DATABASE_ERROR";

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); if (!tenantId) return { error: TENANT_MISSING }; const name = String(formData.get("name") || "").trim(); if (!name) return { error: NAME_REQUIRED };
  const { data, error } = await supabase.from("inventory_items").insert({ tenant_id: tenantId, name, name_ar: String(formData.get("name_ar") || ""), unit: String(formData.get("unit") || "piece"), reorder_threshold: Number(formData.get("reorder_threshold") || 0), current_stock: Number(formData.get("current_stock") || 0) }).select().single(); if (error) { console.error("[createInventoryItem] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { data };
}

export async function updateInventoryItem(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); const id = String(formData.get("id")); if (!tenantId || !id) return { error: INCOMPLETE }; const name = String(formData.get("name") || "").trim(); if (!name) return { error: NAME_REQUIRED };
  const { data, error } = await supabase.from("inventory_items").update({ name, name_ar: String(formData.get("name_ar") || ""), unit: String(formData.get("unit") || ""), reorder_threshold: Number(formData.get("reorder_threshold") || 0), current_stock: Number(formData.get("current_stock") || 0), is_active: formData.get("is_active") === "true", updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", tenantId).select().single(); if (error) { console.error("[updateInventoryItem] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { data };
}

export async function adjustStock(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); const itemId = String(formData.get("item_id")); const transactionType = String(formData.get("transaction_type")) as InventoryTransactionType; const reason = String(formData.get("reason") || "").trim();
  if (!tenantId || !itemId || !transactionType || !reason) return { error: INCOMPLETE }; if (!(transactionType in TRANSACTION_EFFECT)) return { error: INVALID_TYPE };
  const quantityDelta = TRANSACTION_EFFECT[transactionType] * Math.abs(Number(formData.get("quantity") || 0)); if (quantityDelta === 0) return { error: QUANTITY_INVALID };
  const { data: updated, error: updateError } = await supabase.rpc("adjust_inventory_stock", { p_item_id: itemId, p_tenant_id: tenantId, p_delta: quantityDelta });
  if (updateError) { if (updateError.message.includes("negative") || updateError.message.includes("Insufficient")) return { error: NEGATIVE_STOCK }; console.error("[adjustStock] update error:", updateError.message); return { error: DATABASE_ERROR }; }
  const { error: ledgerError } = await supabase.from("inventory_ledger").insert({ tenant_id: tenantId, item_id: itemId, material_name: reason, quantity_consumed: Math.abs(quantityDelta), consumption_type: transactionType, notes: reason }); if (ledgerError) { console.error("[adjustStock] ledger error:", ledgerError.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { success: true, newStock: updated };
}

export async function softDeleteInventoryItem(formData: FormData) {
  const supabase = await createClient(); const tenantId = String(formData.get("tenant_id")); const id = String(formData.get("id")); if (!tenantId || !id) return { error: INCOMPLETE };
  const { error } = await supabase.from("inventory_items").update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id).eq("tenant_id", tenantId); if (error) { console.error("[softDeleteInventoryItem] error:", error.message); return { error: DATABASE_ERROR }; }
  revalidatePath("/inventory"); return { success: true };
}
