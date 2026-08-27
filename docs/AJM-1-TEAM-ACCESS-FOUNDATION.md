# CORE SYSTEM — AJM-1 Team & Access Foundation

**Workstream:** AJM — Administrative & Journey Management  
**Stage:** AJM-1 — Team & Access Foundation  
**Status:** IMPLEMENTED — validation/closure pending  
**Governing:** AJM Master Blueprint + AJM Implementation Plan + Stage Index + Team & Access Engineering Blueprint

## 1. Stage scope

AJM-1 establishes reliable identity/access organization for the tenant without creating a second authorization engine. It preserves the approved distinctions:

- Role ≠ Permission.
- Role ≠ Skill/Capability.
- Workspace ≠ authorization boundary.
- Template ≠ authorization authority.
- Direct permission ≠ role permission.
- Override is an explicit exception layer.
- Tenant entitlement remains separate from user authorization.

The approved Team & Access contract makes Clinic Admin the primary tenant operational authority and keeps Super Admin outside tenant operations. fileciteturn15file0

## 2. Read / Inspect findings

The repository already had a substantial M2 Team & Access implementation: roles, permission catalog, role-permission mappings, overrides, effective permission calculation, user management, settings, and audit UI. The prior implementation was therefore reused and extended rather than replaced. The existing permission engine was located in `src/core/permissions/permissionEngine.ts`, and existing role/user/settings surfaces were retained. fileciteturn21file0 fileciteturn33file0

The main architectural gap was that `clinic_users.role_template_id` was being used as the effective role assignment while the blueprint requires a role to be an independent organizational construct. AJM-1 therefore introduces canonical `clinic_users.role_id` while retaining the old column temporarily for compatibility. The effective permission engine now resolves authorization from `role_id`, direct user permissions and overrides. 

## 3. Implemented data foundation

### Core

- `roles.workspace` with the three approved workspaces.
- `clinic_users.role_id` as canonical role assignment.
- `clinic_user_workspaces` for user workspace membership/default workspace.
- `clinic_user_settings` for non-authorizing personal preferences.
- `clinic_user_permissions` for direct permissions.
- Existing `permissions` catalog retained as authoritative.
- Existing `role_permissions` retained as role-to-catalog mapping.
- Existing overrides retained as explicit grant/revoke exception layer.

### Advanced foundation

- `role_templates` and `role_template_permissions` as advisory system templates.
- `permission_bundles` and `permission_bundle_items` as configuration primitives over the catalog.
- Template-to-custom-role copy flow.

No AI, skill-routing engine, groups hierarchy, or enterprise IAM hierarchy was introduced.

## 4. Authorization hardening

AJM-1 adds the database authorization helper `has_tenant_permission()` and uses it to harden role, role-permission, override and direct-permission writes. This closes the earlier gap where tenant RLS existed but some write policies did not independently enforce the caller's administrative permission.

Role permission replacement is performed through the transactional `set_role_permissions()` function to avoid leaving a role partially updated if an insert fails.

The application permission engine now:

1. resolves the authenticated user inside the requested tenant;
2. requires the clinic user to be active;
3. reads the canonical `role_id`;
4. applies role permissions;
5. applies direct user permissions;
6. applies explicit overrides;
7. returns the deterministic effective set.

This remains one conceptual authorization model, not a second policy engine. fileciteturn21file0

## 5. Role model behavior

System roles remain shared advisory templates and are not edited directly, because changing a shared system record would affect unrelated tenants. The editable clinic-owned role is created from the catalog/template and is then independently configurable.

Clinic-defined roles now:

- require a workspace;
- use a tenant-owned role record;
- may receive any catalogued permission;
- are independent of fixed job titles;
- may be assigned directly to clinic users through `role_id`;
- may be edited/retired subject to usage and authorization controls.

`clinic_owner` remains retired and is not reintroduced.

## 6. User and workspace behavior

User creation/update now selects an actual role record rather than pretending that a role template is the user role. Users may be associated with workspace memberships without turning workspaces into security boundaries.

Personal settings are persisted separately from authorization. Changing a preference does not change permissions.

## 7. Direct permissions and overrides

Legacy positive overrides were reconciled into the new direct-permission layer. Explicit negative overrides remain overrides. The effective model is therefore:

```text
Role Permissions
      +
Direct User Permissions
      +
Explicit Overrides
      ↓
Effective Permissions
```

The existing override editor was extended so a positive state is stored as a direct grant while a negative state is stored as an explicit revoke. This preserves explainability and prevents conflating two concepts.

## 8. Templates and bundles

The system now has an advisory system-template data layer seeded from the existing system role configurations. The settings surface exposes these templates and allows a clinic administrator to copy a template into an independent custom role.

Permission bundles are present as a reusable data foundation over the authoritative Permission Catalog. They are not a replacement authorization engine.

## 9. Auditability

AJM-1 reuses `audit_trail` and adds AJM-1 audit triggers for Team & Access data changes. Changes to roles, role permissions, users, direct permissions, overrides, user settings, workspace memberships, templates and bundle mappings are recorded through the existing audit architecture rather than a parallel audit system.

## 10. Classifications

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

## 11. Validation requirements

Before closure, validate:

- [ ] production build passes;
- [ ] settings loads for authorized tenant user;
- [ ] custom role creation persists with workspace;
- [ ] role permission replacement is atomic and tenant-scoped;
- [ ] custom role assignment to a user works;
- [ ] direct grant and explicit revoke produce the expected effective permission;
- [ ] system roles cannot be mutated by tenant users;
- [ ] cross-tenant role/user access is denied;
- [ ] workspace membership does not grant authorization by itself;
- [ ] user settings do not affect authorization;
- [ ] Team & Access mutations appear in existing audit trail;
- [ ] Arabic/English settings surfaces remain functional;
- [ ] no relevant production runtime errors are introduced.

## 12. Non-goals

AJM-1 does not implement Workforce, Financial & Resources, Communications, Journey Coordination, Insights, or PJ redesign. It does not introduce AI or a new Patient Journey.

## 13. Closure

This document remains **IMPLEMENTED — validation/closure pending** until repository, database and production/runtime evidence satisfies the validation checklist above.
