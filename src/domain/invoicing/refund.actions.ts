"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

type RefundMethod = "cash" | "card" | "bank_transfer" | "online" | "other";
export async function refundInvoicePayment(input: { invoice_id: string; amount_subunits: number; refund_method: RefundMethod; reason: string; payment_id?: string | null; reference?: string | null }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" } as const;
  const { data: cu } = await supabase.from("clinic_users").select("id,tenant_id,is_active").eq("auth_user_id", user.id).maybeSingle();
  if (!cu?.is_active) return { success: false, error: "User not found" } as const;
  if (!(await hasEffectivePermission("invoices:refund", user.id))) return { success: false, error: "Permission denied" } as const;
  if (!Number.isInteger(input.amount_subunits) || input.amount_subunits <= 0 || !input.reason.trim()) return { success: false, error: "Invalid refund" } as const;
  const { data, error } = await supabase.rpc("refund_invoice_payment", { p_tenant_id: cu.tenant_id, p_invoice_id: input.invoice_id, p_amount_subunits: input.amount_subunits, p_refund_method: input.refund_method, p_reason: input.reason.trim(), p_refunded_by: cu.id, p_payment_id: input.payment_id ?? null, p_reference: input.reference ?? null });
  if (error) return { success: false, error: error.message } as const;
  const result = data && typeof data === "object" ? data as Record<string, unknown> : {};
  if (result.success !== true) return { success: false, error: typeof result.error === "string" ? result.error : "Unable to refund" } as const;
  revalidatePath(`/invoices/${input.invoice_id}`);
  revalidatePath("/invoices");
  return { success: true, data: { refund_id: result.refund_id } } as const;
}
