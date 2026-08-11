"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/infrastructure/supabase/client";
import type { Database } from "@/infrastructure/supabase/database.types";

type TenantRow = Pick<
  Database["public"]["Tables"]["master_tenants"]["Row"],
  | "id"
  | "clinic_name"
  | "clinic_name_ar"
  | "primary_phone"
  | "whatsapp_number"
  | "address"
  | "timezone"
  | "currency"
  | "logo_url"
  | "primary_color"
  | "country_code"
  | "updated_at"
>;

type BranchRow = Pick<
  Database["public"]["Tables"]["branches"]["Row"],
  | "id"
  | "branch_name"
  | "branch_name_ar"
  | "address"
  | "phone"
  | "is_default"
  | "is_active"
>;

export interface ClinicProfileResult {
  tenant: TenantRow | null;
  defaultBranch: BranchRow | null;
  error: string | null;
}

const supabase = createClient();

const TENANT_FIELDS = [
  "id",
  "clinic_name",
  "clinic_name_ar",
  "primary_phone",
  "whatsapp_number",
  "address",
  "timezone",
  "currency",
  "logo_url",
  "primary_color",
  "country_code",
  "updated_at",
].join(",");

const BRANCH_FIELDS = [
  "id",
  "branch_name",
  "branch_name_ar",
  "address",
  "phone",
  "is_default",
  "is_active",
].join(",");

export function useClinicProfile(tenantId: string | null) {
  return useQuery({
    queryKey: ["clinic-profile", tenantId],
    queryFn: async (): Promise<ClinicProfileResult> => {
      if (!tenantId) {
        return { tenant: null, defaultBranch: null, error: "No tenant" };
      }

      const { data: tenantData, error: tenantError } = await supabase
        .from("master_tenants")
        .select(TENANT_FIELDS)
        .eq("id", tenantId)
        .limit(1)
        .maybeSingle();

      const tenant = tenantData as TenantRow | null;

      if (tenantError) {
        console.error("[useClinicProfile] master_tenants error:", tenantError.message);
        return { tenant: null, defaultBranch: null, error: "Failed to load clinic profile" };
      }

      const { data: defaultBranchData, error: branchError } = await supabase
        .from("branches")
        .select(BRANCH_FIELDS)
        .eq("tenant_id", tenantId)
        .eq("is_default", true)
        .limit(1)
        .maybeSingle();

      const defaultBranch = defaultBranchData as BranchRow | null;

      if (branchError) {
        console.error("[useClinicProfile] branches error:", branchError.message);
      }

      return { tenant, defaultBranch: defaultBranch ?? null, error: null };
    },
    enabled: !!tenantId,
  });
}
