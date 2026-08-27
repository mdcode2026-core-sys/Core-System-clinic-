# CORE SYSTEM — AJM-1 Team & Access Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-1 — Team & Access Foundation  
**Status:** **CLOSED**  
**Governing:** AJM Master Blueprint + AJM Implementation Plan + AJM Stage Index + Team & Access Engineering Blueprint

## 1. Scope and architectural contract
AJM-1 establishes tenant Team & Access without creating a second authorization engine. Role, Permission, Workspace, Template, Direct Permission and Override remain distinct. Workspace is UX/organization and never an authorization boundary. Tenant entitlement remains separate from user authorization. Clinic Admin remains the tenant operational authority; Super Admin remains platform-only.

## 2. Inspect → Reuse → Extend result
The existing M2 Team & Access implementation was retained and extended. Existing roles, Permission Catalog, role-permission mappings, overrides, effective permission calculation, users, settings and audit surfaces were reused.

The main architectural correction was making `clinic_users.role_id` the canonical role assignment. `role_template_id` remains only as a compatibility field during transition and is not the authorization authority.

## 3. Implemented core foundation
- `roles.workspace` with Administrative / Operation / Clinical.
- canonical `clinic_users.role_id`.
- `clinic_user_workspaces` for workspace membership/default workspace.
- `clinic_user_settings` for non-authorizing personal preferences.
- `clinic_user_permissions` for direct grants.
- existing `permissions` catalog and `role_permissions` retained.
- existing explicit overrides retained for exception/revoke behavior.
- custom clinic roles may be created, edited, assigned and deleted when unused.
- custom roles require a workspace and are tenant-owned.

## 4. Authorization hardening
`has_tenant_permission()` provides database-side enforcement using the same role/direct/override data model used by the application. It is not a second authorization model.

`set_role_permissions()` replaces a custom role's permissions transactionally, preventing partial role-permission updates.

Write policies now enforce tenant scope plus the appropriate management permission for users, roles, role permissions, direct permissions, overrides, templates and bundles. User settings/workspace membership may be changed by the user for their own record or by an authorized user manager.

The effective permission order is:

```text
Role Permissions
      +
Direct User Permissions
      +
Explicit Overrides
      ↓
Effective Permissions
```

Explicit negative overrides take precedence over positive sources for the same permission.

## 5. Templates and bundles
System role configurations are represented as advisory templates. The tenant-facing template set intentionally excludes `super_admin`; platform ownership must never be copied into a tenant role.

A template can be copied into an independent clinic-owned custom role. Permission bundles are available as a reusable catalog-based data foundation and do not authorize users directly.

## 6. Users and workspaces
User management now selects a real role record by `role_id`, including clinic-defined roles. The old fixed role constraint was removed so the compatibility role key can represent custom roles while authorization remains anchored to `role_id`.

Workspace memberships are persisted independently of permissions. A user being a member of a workspace does not grant access to that workspace's features.

User settings are persisted independently of authorization and cannot change effective permissions.

## 7. Direct permissions / overrides reconciliation
Existing positive legacy overrides were migrated to the direct-permission layer. Negative overrides remain explicit revokes. This separates normal direct grants from exceptions and makes the effective access model explainable.

## 8. Auditability
AJM-1 reuses the existing `audit_trail` and adds Team & Access audit triggers for role/user/permission configuration changes, direct permissions, overrides, settings, workspaces, templates and bundles.

During validation an audit-trigger defect for join tables without `tenant_id` was discovered and corrected by resolving tenant context from the parent record. The final trigger safely handles INSERT/UPDATE/DELETE across all AJM-1 audited tables.

## 9. Validation evidence
- [x] AJM governing documents and Team & Access blueprint reviewed from GitHub.
- [x] Repository implementation inspected and reused rather than rebuilt.
- [x] Live Supabase schema/RLS/constraints inspected.
- [x] All current clinic users have canonical `role_id`.
- [x] Direct permission layer exists and legacy positive overrides were reconciled.
- [x] Advisory templates seeded; `super_admin` excluded from tenant templates.
- [x] Workspace memberships and personal settings persisted separately from authorization.
- [x] Database permission check verified: operational doctor without role-management access is denied.
- [x] Database permission check verified: clinic administrator with role-management access is allowed.
- [x] Cross-tenant permission check verified denied.
- [x] Explicit revoke precedence verified denied even when the role grants the permission.
- [x] Audit-trigger defect found during validation and fixed; subsequent join-table deletion succeeded.
- [x] Production Vercel deployment for the merged `main` commit completed **READY**.
- [x] Production build passed i18n parity, TypeScript, static generation and deployment.
- [x] Production `/` returned HTTP 200 and rendered the login surface.
- [x] Production `/login` rendered correctly with Arabic/English language switcher.
- [x] No production error/fatal runtime logs found in the validation window.

## 10. Classification
| Element | Classification |
|---|---|
| Existing permission engine | KEEP / FIX / EXTEND |
| Existing roles | KEEP / EXTEND |
| Permission Catalog | KEEP / CORE |
| Role permissions | KEEP / CORE |
| Overrides | KEEP / EXTEND |
| Clinic users | KEEP / EXTEND |
| Workspaces | KEEP / EXTEND |
| User settings | BUILD / CORE |
| Direct permissions | BUILD / CORE |
| Role templates | BUILD / CORE |
| Permission bundles | BUILD / ADVANCED FOUNDATION |
| Skill/Capability | DEFER / ADVANCED |
| Delegation | DEFER / ADVANCED |
| Change Impact Preview | DEFER / ADVANCED |
| Groups | DEFER / FUTURE |
| Second permission engine | REJECT |
| Enterprise IAM hierarchy | DEFER / REJECT |

## 11. Non-goals
AJM-1 does not implement Workforce, Financial & Resources, Communications, Journey Coordination, Insights or PJ redesign. It does not introduce AI or a new Patient Journey. It does not turn Workspaces into security boundaries.

## 12. Closure decision
**AJM-1 is CLOSED.**

The Team & Access foundation is implemented, database-hardened, production-built and production-verified on `main`.

**Next stage:** AJM-2 — Financial & Resources Foundation.
