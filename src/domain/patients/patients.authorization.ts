import type { createClient } from "@/infrastructure/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getAuthorizedTenantId(supabase: SupabaseServerClient): Promise<string | null> {
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || typeof userId !== "string" || !userId) return null;

  const { data, error } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[patients] tenant lookup failed", {
      message: error.message,
      code: error.code,
    });
    return null;
  }

  return data?.tenant_id ?? null;
}
