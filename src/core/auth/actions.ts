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

  // 1. إنشاء المستخدم في auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "User creation failed" };
  }

  // 2. إنشاء العيادة (tenant)
  const { data: tenantData, error: tenantError } = await supabase
    .from("master_tenants")
    .insert({
      clinic_name: clinicName,
      subscription_tier: "trial",
      is_active: true,
    })
    .select()
    .single();

  if (tenantError || !tenantData) {
    return { error: "Failed to create clinic. Please try again or contact support." };
  }

  // 3. إنشاء مدير العيادة في clinic_users
  const { error: userError } = await supabase.from("clinic_users").insert({
    auth_user_id: authData.user.id,
    tenant_id: tenantData.id,
    full_name: fullName,
    role: "manager",
    is_active: true,
  });

  if (userError) {
    return { error: "Failed to create user profile. Please try again or contact support." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
