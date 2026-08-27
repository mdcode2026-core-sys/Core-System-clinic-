"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

async function context() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: clinicUser, error: clinicUserError } = await supabase.from("clinic_users").select("tenant_id, is_active").eq("auth_user_id", user.id).maybeSingle();
  if (clinicUserError || !clinicUser?.is_active) return null;
  return { supabase, user, tenantId: clinicUser.tenant_id };
}

export async function getPatientFinancialPlan(patientId: string) {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission("invoices:read", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.from("financial_plans").select("*, installments:financial_installments(*)").eq("tenant_id", ctx.tenantId).eq("patient_id", patientId).order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message } as const;
  return { success: true, data: data ?? [] } as const;
}

export async function getPatientInsuranceProfiles(patientId: string) {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission("insurance:read", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.from("patient_insurance_profiles").select("*").eq("tenant_id", ctx.tenantId).eq("patient_id", patientId).order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message } as const;
  return { success: true, data: data ?? [] } as const;
}

export async function getPatientInsuranceClaims(patientId: string) {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission("insurance:read", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.from("insurance_claims").select("*").eq("tenant_id", ctx.tenantId).eq("patient_id", patientId).order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message } as const;
  return { success: true, data: data ?? [] } as const;
}

export async function listSuppliers() {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission("purchasing:read", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.from("suppliers").select("*").eq("tenant_id", ctx.tenantId).eq("status", "active").order("name");
  if (error) return { success: false, error: error.message } as const;
  return { success: true, data: data ?? [] } as const;
}

export async function listPurchaseOrders() {
  const ctx = await context();
  if (!ctx || !(await hasEffectivePermission("purchasing:read", ctx.user.id))) return { success: false, error: "Permission denied" } as const;
  const { data, error } = await ctx.supabase.from("purchase_orders").select("*, supplier:supplier_id(id,name), items:purchase_order_items(*)").eq("tenant_id", ctx.tenantId).order("order_date", { ascending: false });
  if (error) return { success: false, error: error.message } as const;
  return { success: true, data: data ?? [] } as const;
}
