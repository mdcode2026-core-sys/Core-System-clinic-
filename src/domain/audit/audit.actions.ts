"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { getEffectivePermissions } from "@/core/permissions/permissionEngine";
import type { AuditFilterParams, AuditQueryResult, AuditLogWithActor } from "./audit.types";

const DEFAULT_PAGE_SIZE = 25;

/**
 * Server Action: Fetch audit trail with permission enforcement.
 *
 * Enforces: auth → tenant resolution → audit:read permission → bounded query
 */
export async function fetchAuditTrail(
  filters: AuditFilterParams = {}
): Promise<{ success: boolean; data?: AuditQueryResult; error: string | null }> {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Resolve tenant
  const { data: clinicUser, error: clinicError } = await supabase
    .from("clinic_users")
    .select("tenant_id")
    .eq("auth_user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (clinicError || !clinicUser?.tenant_id) {
    return { success: false, error: "Failed to resolve tenant" };
  }

  const tenantId = clinicUser.tenant_id;

  // 3. Verify audit:read permission
  const effectivePerms = await getEffectivePermissions(user.id, tenantId);
  if (!effectivePerms.includes("audit:read")) {
    return { success: false, error: "Permission denied: audit:read required" };
  }

  // 4. Build bounded query
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_trail")
    .select(
      `
      id,
      action,
      actor_id,
      actor_role,
      created_at,
      ip_address,
      new_values,
      old_values,
      reason,
      record_id,
      table_name,
      tenant_id,
      actor:actor_id (
        id,
        full_name,
        email,
        role
      )
    `,
      { count: "exact" }
    )
    .eq("tenant_id", tenantId);

  if (filters.action) {
    query = query.eq("action", filters.action);
  }
  if (filters.actorId) {
    query = query.eq("actor_id", filters.actorId);
  }
  if (filters.tableName) {
    query = query.eq("table_name", filters.tableName);
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }
  if (filters.dateTo) {
    const dateToExclusive = new Date(`${filters.dateTo}T00:00:00`);
    dateToExclusive.setDate(dateToExclusive.getDate() + 1);
    query = query.lt("created_at", dateToExclusive.toISOString());
  }
  if (filters.search) {
    query = query.or(
      `action.ilike.%${filters.search}%,table_name.ilike.%${filters.search}%,reason.ilike.%${filters.search}%`
    );
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[fetchAuditTrail] error:", error.message);
    return { success: false, error: "Failed to fetch audit trail" };
  }

  const records = (data ?? []).map((row: any) => {
    const actor = row.actor;
    return {
      ...row,
      actor: actor
        ? {
            id: actor.id,
            full_name: actor.full_name,
            email: actor.email,
            role: actor.role,
          }
        : null,
    };
  }) as AuditLogWithActor[];

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    success: true,
    data: {
      records,
      totalCount,
      page,
      pageSize,
      totalPages,
    },
    error: null,
  };
}
