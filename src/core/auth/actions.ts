"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const clinicName = String(formData.get("clinic_name") ?? "");

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "فشل إنشاء المستخدم" };
  }

  const { data: tenantData, error: tenantError } = await supabase
    .from("master_tenants")
    .insert({
      clinic_name: clinicName,
      license_key: `LIC-${Date.now()}`,
      subscription_tier: "trial",
      max_devices: 5,
      timezone: "Asia/Amman",
      currency: "JOD",
      currency_subunit: 100,
      is_active: true,
    })
    .select("id")
    .single();

  if (tenantError || !tenantData) {
    return { error: tenantError?.message ?? "فشل إنشاء العيادة" };
  }

  const { error: userError } = await supabase.from("clinic_users").insert({
    tenant_id: tenantData.id,
    full_name: fullName,
    auth_user_id: authData.user.id,
    role: "clinic_owner",
    employee_code: `EMP-${Date.now()}`,
    pin_code: "0000",
    is_active: true,
  });

  if (userError) {
    return { error: userError.message ?? "فشل إنشاء المستخدم في العيادة" };
  }

  revalidatePath("/", "layout");
  redirect("/check-email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
