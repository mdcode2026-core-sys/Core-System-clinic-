import type { UserRole, Permission } from "./types";

export const permissionMatrix: Record<string, Permission[]> = {
  super_admin: [
    "patients:read", "patients:create", "patients:update", "patients:delete",
    "sessions:read", "sessions:create", "sessions:update", "sessions:delete",
    "agenda:read", "agenda:create", "agenda:update", "agenda:delete",
    "invoices:read", "invoices:create", "invoices:update",
    "inventory:read", "inventory:create", "inventory:update",
    "analytics:read",
    "users:read", "users:create", "users:update", "users:delete",
    "settings:read", "settings:update",
    "audit:read",
    "reports:read"
  ],
  clinic_admin: [
    "patients:read", "patients:create", "patients:update",
    "sessions:read", "sessions:create", "sessions:update",
    "agenda:read", "agenda:create", "agenda:update", "agenda:delete",
    "invoices:read", "invoices:create", "invoices:update",
    "inventory:read", "inventory:create", "inventory:update",
    "analytics:read",
    "users:read", "users:create", "users:update",
    "settings:read", "settings:update",
    "audit:read",
    "reports:read"
  ],
  doctor: [
    "patients:read", "patients:update",
    "sessions:read", "sessions:create", "sessions:update",
    "agenda:read",
    "inventory:read",
    "reports:read"
  ],
  receptionist: [
    "patients:read", "patients:create", "patients:update",
    "sessions:read", "sessions:create", "sessions:update",
    "agenda:read", "agenda:create", "agenda:update",
    "invoices:read", "invoices:create",
    "reports:read"
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return permissionMatrix[role]?.includes(permission) ?? false;
}
