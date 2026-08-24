"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";

interface UseTenantIdReturn { tenantId: string | null; userId: string | null; isLoading: boolean; error: string | null; }
interface TenantQueryResult { tenantId: string | null; userId: string | null; }

async function fetchTenantId(): Promise<TenantQueryResult> {
  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!session?.user) return { tenantId: null, userId: null };
  const { data: clinicUser, error: clinicError } = await supabase.from("clinic_users").select("tenant_id").eq("auth_user_id", session.user.id).limit(1).maybeSingle();
  if (clinicError) throw new Error(`Failed to fetch clinic user: ${clinicError.message}`);
  return { tenantId: clinicUser?.tenant_id ?? null, userId: session.user.id };
}

/** Shared tenant identity query. Keep the shell identity warm across route navigation. */
export function useTenantId(): UseTenantIdReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tenant-id"],
    queryFn: fetchTenantId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
  return { tenantId: data?.tenantId ?? null, userId: data?.userId ?? null, isLoading, error: error instanceof Error ? error.message : null };
}
