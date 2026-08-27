# CORE SYSTEM — AJM-1 Team & Access Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-1 — Team & Access Foundation  
**Status:** IMPLEMENTED — validation/closure pending  
**Governing:** AJM Master Blueprint + AJM Implementation Plan + Stage Index + Team & Access Engineering Blueprint

## 1. Stage scope
AJM-1 establishes reliable identity/access organization for the tenant without creating a second authorization engine. Role, Permission, Workspace, Template, Direct Permission and Override remain distinct, with Tenant Entitlement separate from user authorization.

## 2. Baseline finding
The repository already contained a substantial M2 Team & Access implementation. AJM-1 therefore reuses and extends the existing roles, permission catalog, role-permission mappings, overrides, effective-permission calculation, users, settings and audit surfaces.

The principal architectural gap was that `clinic_users.role_template_id` was being used as effective role assignment. AJM-1 introduces canonical `clinic_users.role_id` while retaining the old column temporarily for compatibility. The effective permission engine now resolves authorization from `role_id`, direct user permissions and explicit overrides.

## 3. Implemented data foundation
### Core
- `roles.workspace` with Administrative / Operation / Clinical workspaces.
- `clinic_users.role_id` as canonical role assignment.
- `clinic_user_workspaces` for user workspace membership/default workspace.
- `clinic_user_settings` for non-authorizing personal preferences.
- `clinic_user_permissions` for direct permissions.
- Existing `permissions`, `role_permissions` and overrides retained.

### Advanced foundation
- `role_templates` and `role_template_permissions` as advisory templates.
- `permission_bundles` and `permission_bundle_items` as catalog configuration primitives.
- Template-to-custom-role copy flow.

No AI, skill-routing engine, groups hierarchy or enterprise IAM hierarchy was introduced.

## 4. Authorization hardening
AJM-1 adds `has_tenant_permission()` for database-side authorization enforcement and hardens role, role-permission, override and direct-permission writes. Role permission replacement uses transactional `set_role_permissions()` so a failed replacement cannot leave the role partially updated.

The application permission engine now resolves the authenticated active user within the requested tenant, reads canonical `role_id`, applies role permissions, applies direct permissions, then applies explicit overrides and returns a deterministic effective set.

## 5. Role model
System roles remain shared advisory templates and are not edited directly because modifying a shared system record would affect unrelated tenants. A clinic-owned role can be created from a template and then independently edited.

Clinic-defined roles now require a workspace, are tenant-owned, may receive any catalogued permission, are independent of fixed job titles, and can be assigned to users through `role_id`. `clinic_owner` remains retired.

## 6. User and workspace behavior
User creation/update now selects an actual role record. Workspace membership is organizational/UX state and never a security boundary. Personal settings are persisted separately from authorization.

## 7. Direct permissions and overrides
Legacy positive overrides were reconciled into the direct-permission layer. Explicit negative overrides remain overrides.

```text
Role Permissions
      +
Direct User Permissions
      +
Explicit Overrides
      ↓
Effective Permissions
```

The override editor now stores a positive state as a direct grant and a negative state as an explicit revoke, preserving the distinction between the two concepts.

## 8. Templates and bundles
The advisory system-template layer is seeded from existing system role configurations. The settings surface exposes templates and allows a clinic administrator to copy a template into an independent custom role.

Permission bundles exist as a reusable data foundation over the authoritative Permission Catalog; they do not replace authorization.

## 9. Auditability
AJM-1 reuses `audit_trail` and adds Team & Access audit triggers for roles, role permissions, users, direct permissions, overrides, user settings, workspace memberships, templates and bundle mappings.

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
| Second permission engine | REMOVE / REJECT |
| Enterprise IAM hierarchy | DEFER / REJECT |

## 11. Validation / closure gate
- [ ] production build passes;
- [ ] settings loads for authorized tenant user;
- [ ] custom role creation persists with workspace;
- [ ] role permission replacement is atomic and tenant-scoped;
- [ ] custom role assignment works;
- [ ] direct grant and explicit revoke produce expected effective permission;
- [ ] system roles cannot be mutated by tenant users;
- [ ] cross-tenant role/user access is denied;
- [ ] workspace membership does not grant authorization by itself;
- [ ] user settings do not affect authorization;
- [ ] Team & Access mutations appear in audit trail;
- [ ] Arabic/English settings surfaces remain functional;
- [ ] no relevant production runtime errors are introduced.

## 12. Non-goals
AJM-1 does not implement Workforce, Financial & Resources, Communications, Journey Coordination, Insights or PJ redesign. It does not introduce AI or a new Patient Journey.

## 13. Closure
This document remains **IMPLEMENTED — validation/closure pending** until the validation gate is satisfied.
