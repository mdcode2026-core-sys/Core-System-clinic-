"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";

export async function createInventoryItem(formData: FormData) {
  const supabase = await createClient();

  const tenantId = String(formData.get("tenant_id"));
  if (!tenantId) return { error: "لم يتم التعرف على العيادة" };

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

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

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

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
  const quantityDelta = Number(formData.get("quantity_delta"));
  const reason = String(formData.get("reason") || "").trim();
  const consumptionType = String(formData.get("consumption_type")) as "stock_adjustment" | "stock_in";

  if (!tenantId || !itemId || isNaN(quantityDelta) || !reason) {
    return { error: "بيانات التعديل ناقصة" };
  }

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  // ATOMIC UPDATE: single SQL statement with guard
  const { data: updated, error: updateError } = await supabase.rpc(
    "adjust_inventory_stock",
    {
      p_item_id: itemId,
      p_tenant_id: tenantId,
      p_delta: quantityDelta,
    }
  );

  if (updateError) {
    // Check if it's the negative-stock guard
    if (updateError.message.includes("negative") || updateError.message.includes("sufficient")) {
      return { error: "المخزون لا يمكن أن يكون سالباً" };
    }
    return { error: updateError.message };
  }

  // Write ledger entry with item_id FK populated
  const { error: ledgerError } = await supabase
    .from("inventory_ledger")
    .insert({
      tenant_id: tenantId,
      item_id: itemId,
      material_name: reason,
      quantity_consumed: Math.abs(quantityDelta),
      consumption_type: consumptionType,
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

  await supabase.rpc("set_tenant_id", { tenant_id: tenantId });

  const { error } = await supabase
    .from("inventory_items")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenantId);

  if (error) return { error: error.message };

  revalidatePath("/inventory");
  return { success: true };
}
