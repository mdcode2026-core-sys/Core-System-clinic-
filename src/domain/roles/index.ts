// src/domain/roles/index.ts
// M2.2 + M2.5 — Roles & Permissions domain barrel export

export * from "./roles.types";
export * from "./roles.queries";
export {
  updateRolePermissions,
  createRole,
  updateRole,
  deleteRole,
} from "./roles.actions";
