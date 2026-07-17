"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createServerClient } from "@supabase/ssr";

// Admin client باستخدام Service Role Key
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "فشل تسجيل الدخول" };
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
  const admin = getAdminClient();

  // 1. إنشاء مستخدم في Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "فشل إنشاء المستخدم" };
  }

  // 2. إنشاء Tenant + Subscription + User باستخدام Admin (يتجاوز RLS)
  const { data: result, error: dbError } = await admin.rpc(
    "create_tenant_with_subscription",
    {
      p_clinic_name: clinicName,
      p_full_name: fullName,
      p_email: email,
      p_auth_user_id: authData.user.id,
    }
  );

  if (dbError || !result) {
    // محاولة حذف المستخدم من Auth
    try {
      await admin.auth.admin.deleteUser(authData.user.id);
    } catch {
      // ignore
    }
    return { error: dbError?.message ?? "فشل إنشاء العيادة" };
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
