"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createServerClient } from "@supabase/ssr";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError || !authData.user) return { errorCode: "AUTH_SIGN_IN_FAILED" as const };
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const clinicName = String(formData.get("clinic_name") ?? "");
  const supabase = await createClient();
  const admin = getAdminClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (authError || !authData.user) return { errorCode: "AUTH_SIGN_UP_FAILED" as const };

  const { data: result, error: dbError } = await admin.rpc("create_tenant_with_subscription", {
    p_clinic_name: clinicName,
    p_full_name: fullName,
    p_email: email,
    p_auth_user_id: authData.user.id,
  });

  if (dbError || !result) {
    try { await admin.auth.admin.deleteUser(authData.user.id); } catch { /* ignore cleanup failure */ }
    return { errorCode: "AUTH_CLINIC_CREATION_FAILED" as const };
  }

  const typedResult = result as { tenant_id: string; role: string };
  const { error: metaError } = await admin.auth.admin.updateUserById(authData.user.id, {
    user_metadata: { full_name: fullName, tenant_id: typedResult.tenant_id, role: typedResult.role },
    app_metadata: { tenant_id: typedResult.tenant_id, user_role: typedResult.role },
  });

  if (metaError) {
    try { await admin.auth.admin.deleteUser(authData.user.id); } catch { /* ignore cleanup failure */ }
    return { errorCode: "AUTH_SESSION_SETUP_FAILED" as const };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
