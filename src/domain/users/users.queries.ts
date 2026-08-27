"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { ClinicUserWithRole } from "./users.types";

const supabase = createClient();

const userSelect = `
  id, auth_user_id, tenant_id, role, role_id, role_template_id,
  full_name, phone, email, is_active, created_at, updated_at,
  roles:role_id (id, role_key, role_name, role_name_ar, is_system_role, workspace)
`;

function mapUser(row: any): ClinicUserWithRole {
  const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
  return {
    ...row,
    role_name: role?.role_name ?? null,
    role_name_ar: role?.role_name_ar ?? null,
    is_system_role: role?.is_system_role ?? false,
    role_workspace: role?.workspace ?? null,
  } as ClinicUserWithRole;
}

export function useClinicUsers(tenantId: string | null) {
  return useQuery({
    queryKey: ["clinic-users", tenantId],
    queryFn: async (): Promise<ClinicUserWithRole[]> => {
      if (!tenantId) return [];
      const { data, error } = await supabase.from("clinic_users").select(userSelect).eq("tenant_id", tenantId).order("created_at", { ascending: false });
      if (error) throw new Error("Failed to load clinic users");
      return (data ?? []).map(mapUser);
    },
    enabled: !!tenantId,
  });
}

export function useClinicUser(userId: string | null, tenantId: string | null) {
  return useQuery({
    queryKey: ["clinic-user", userId, tenantId],
    queryFn: async (): Promise<ClinicUserWithRole | null> => {
      if (!userId || !tenantId) return null;
      const { data, error } = await supabase.from("clinic_users").select(userSelect).eq("id", userId).eq("tenant_id", tenantId).maybeSingle();
      if (error) throw new Error("Failed to load clinic user");
      return data ? mapUser(data) : null;
    },
    enabled: !!userId && !!tenantId,
  });
}
