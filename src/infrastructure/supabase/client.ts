import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}


let cachedTenantId: string | null = null;

/**
 * Set tenant_id in the current DB session for RLS policies.
 */
export async function setTenantId(
  supabase: ReturnType<typeof createClient>,
  tenantId: string
) {
  if (cachedTenantId === tenantId) return;

  const { error } = await supabase.rpc("set_tenant_id", {
    tenant_id: tenantId,
  });

  if (error) {
    console.error("[setTenantId] failed:", error.message);
    return;
  }

  cachedTenantId = tenantId;
}
