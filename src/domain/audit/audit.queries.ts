"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditTrail } from "./audit.actions";
import { createClient } from "@/infrastructure/supabase/client";
import type { AuditFilterParams, AuditQueryResult } from "./audit.types";

const supabase = createClient();

const DEFAULT_PAGE_SIZE = 25;

/**
 * Fetch audit trail records for the current tenant with filtering and pagination.
 * Filtering is applied server-side via Supabase query builder.
 */
export function useAuditTrail(
  tenantId: string | null,
  filters: AuditFilterParams = {}
) {
  return useQuery({
    queryKey: ["audit-trail", tenantId, filters],
    queryFn: async (): Promise<AuditQueryResult> => {
      if (!tenantId) {
        return {
          records: [],
          totalCount: 0,
          page: 1,
          pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
          totalPages: 0,
        };
      }

      const result = await fetchAuditTrail(filters);

      if (!result.success || !result.data) {
        throw new Error(result.error ?? "Failed to load audit trail");
      }

      return result.data;
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch distinct actions for filter dropdown.
 */
export function useAuditActions(tenantId: string | null) {
  return useQuery({
    queryKey: ["audit-actions", tenantId],
    queryFn: async (): Promise<string[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("audit_trail")
        .select("action")
        .eq("tenant_id", tenantId)
        .order("action", { ascending: true });

      if (error) {
        console.error("[useAuditActions] error:", error.message);
        return [];
      }

      // Deduplicate
      const actions = new Set<string>();
      for (const row of data ?? []) {
        if (row.action) actions.add(row.action);
      }
      return Array.from(actions);
    },
    enabled: !!tenantId,
  });
}

/**
 * Fetch distinct table names for filter dropdown.
 */
export function useAuditTableNames(tenantId: string | null) {
  return useQuery({
    queryKey: ["audit-tables", tenantId],
    queryFn: async (): Promise<string[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("audit_trail")
        .select("table_name")
        .eq("tenant_id", tenantId)
        .order("table_name", { ascending: true });

      if (error) {
        console.error("[useAuditTableNames] error:", error.message);
        return [];
      }

      const tables = new Set<string>();
      for (const row of data ?? []) {
        if (row.table_name) tables.add(row.table_name);
      }
      return Array.from(tables);
    },
    enabled: !!tenantId,
  });
}
