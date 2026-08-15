"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import type { InventoryTransactionType } from "./inventory.types";

// Transaction Type to stock effect mapping — Architecture Directive
// Purchase (+), Purchase Return (-), Doctor Request (-)
// Unused Return (+), Inventory Adjustment Increase (+), Inventory Adjustment Decrease (-)
const TRANSACTION_EFFECT: Record<InventoryTransactionType, number> = {
  purchase: 1,
  purchase_return: -1,
  doctor_request: -1,
  unused_return: 1,
  inventory_adjustment_increase: 1,
  inventory_adjustment_decrease: -1,
};

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) return { error: "لم يتم التعرف على العيادة" };


  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "اسم الصنف مطلوب" };

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      tenant_id: tenantId,
      name: name,
      name_ar: String(formData.get("name_ar") || ""),
      unit: String(formData.get("unit") || "piece"),
      reorder_threshold: Number(formData.get("reorder_threshold") || 0),
      current_stock: Number(formData.get("current_stock") || 0),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return { data };
}

export async function updateInventoryItem(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  const id = String(formData.get("id"));
  if (!tenantId || !id) return { error: "بيانات ناقصة" };


  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "اسم الصنف مطلوب" };

  const { data, error } = await supabase
    .from("inventory_items")
    .update({
      name: name,
      name_ar: String(formData.get("name_ar") || ""),
      unit: String(formData.get("unit") || ""),
      reorder_threshold: Number(formData.get("reorder_threshold") || 0),
      current_stock: Number(formData.get("current_stock") || 0),
      is_active: formData.get("is_active") === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return { data };
}

export async function adjustStock(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  const itemId = String(formData.get("item_id"));
  const transactionType = String(formData.get("transaction_type")) as InventoryTransactionType;
  const reason = String(formData.get("reason") || "").trim();

  if (!tenantId || !itemId || !transactionType || !reason) {
    return { error: "بيانات التعديل ناقصة" };
  }

  // Validate transaction type
  if (!(transactionType in TRANSACTION_EFFECT)) {
    return { error: "نوع المعاملة غير صالح" };
  }


  // Derive quantity_delta from transaction type (system derives +/-, user never chooses)
  const effect = TRANSACTION_EFFECT[transactionType];
  const quantityDelta = effect * Math.abs(Number(formData.get("quantity") || 0));

  if (quantityDelta === 0) {
    return { error: "الكمية يجب أن تكون أكبر من صفر" };
  }

  // Atomic update via database function
  const { data: updated, error: updateError } = await supabase.rpc(
    "adjust_inventory_stock",
    {
      p_item_id: itemId,
      p_tenant_id: tenantId,
      p_delta: quantityDelta,
    }
  );

  if (updateError) {
    if (updateError.message.includes("negative") || updateError.message.includes("Insufficient")) {
      return { error: "المخزون لا يمكن أن يكون سالباً" };
    }
    return { error: updateError.message };
  }

  // Write ledger entry with transaction type
  const { error: ledgerError } = await supabase
    .from("inventory_ledger")
    .insert({
      tenant_id: tenantId,
      item_id: itemId,
      material_name: reason,
      quantity_consumed: Math.abs(quantityDelta),
      consumption_type: transactionType,
      notes: reason,
    });

  if (ledgerError) return { error: ledgerError.message };

  revalidatePath("/inventory");
  return { success: true, newStock: updated };
}

export async function softDeleteInventoryItem(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  const id = String(formData.get("id"));
  if (!tenantId || !id) return { error: "بيانات ناقصة" };


  const { error } = await supabase
    .from("inventory_items")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return { success: true };
}
