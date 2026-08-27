"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { hasEffectivePermission } from "@/core/permissions/permissionEngine";

export async function getPatientFinancialPlan(patientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await hasEffectivePermission("invoices:read", user.id))) return { success: false, error: "Permission denied" };
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser) return { success: false, error: "User not found" };
  const db = supabase as any;
  const { data, error } = await db.from("financial_plans").select("*, installments:financial_installments(*)").eq("tenant_id", clinicUser.tenant_id).eq("patient_id", patientId).order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getPatientInsuranceProfiles(patientId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await hasEffectivePermission("insurance:read", user.id))) return { success: false, error: "Permission denied" };
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser) return { success: false, error: "User not found" };
  const db = supabase as any;
  const { data, error } = await db.from("patient_insurance_profiles").select("*").eq("tenant_id", clinicUser.tenant_id).eq("patient_id", patientId).order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function listSuppliers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await hasEffectivePermission("purchasing:read", user.id))) return { success: false, error: "Permission denied" };
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser) return { success: false, error: "User not found" };
  const db = supabase as any;
  const { data, error } = await db.from("suppliers").select("*").eq("tenant_id", clinicUser.tenant_id).eq("status", "active").order("name");
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function listPurchaseOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await hasEffectivePermission("purchasing:read", user.id))) return { success: false, error: "Permission denied" };
  const { data: clinicUser } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", user.id).maybeSingle();
  if (!clinicUser) return { success: false, error: "User not found" };
  const db = supabase as any;
  const { data, error } = await db.from("purchase_orders").select("*, supplier:supplier_id(id,name), items:purchase_order_items(*)").eq("tenant_id", clinicUser.tenant_id).order("order_date", { ascending: false });
  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}
