// src/domain/audit/audit.types.ts
// M2.9 — Audit / Activity domain types

import type { Database } from "@/infrastructure/supabase/database.types";

export type AuditTrailRow = Database["public"]["Tables"]["audit_trail"]["Row"];

export interface AuditLogWithActor extends AuditTrailRow {
  actor?: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
  } | null;
}

export interface AuditFilterParams {
  search?: string;
  action?: string;
  actorId?: string;
  tableName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditQueryResult {
  records: AuditLogWithActor[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditActionResult {
  success: boolean;
  data?: AuditQueryResult;
  error: string | null;
}
