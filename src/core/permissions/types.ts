export type UserRole = 
  | "clinic_admin" 
  | "clinic_owner" 
  | "doctor" 
  | "nurse" 
  | "receptionist"
  | "accounting";

export type Permission =
  | "patients:read" | "patients:create" | "patients:update" | "patients:delete"
  | "sessions:read" | "sessions:create" | "sessions:update" | "sessions:delete"
  | "agenda:read" | "agenda:create" | "agenda:update" | "agenda:delete"
  | "invoices:read" | "invoices:create" | "invoices:update"
  | "inventory:read" | "inventory:create" | "inventory:update"
  | "analytics:read"
  | "users:read" | "users:create" | "users:update" | "users:delete"
  | "settings:read" | "settings:update"
  | "audit:read"
  | "reports:read"
  | "followup:read" | "followup:create" | "followup:update"
  | "roles:read" | "roles:manage"
  | "templates:manage"
  | "overrides:manage"
  | "subscription:read"
  | "notifications:manage";

export interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
