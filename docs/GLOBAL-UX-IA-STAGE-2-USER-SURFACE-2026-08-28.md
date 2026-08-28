# CORE SYSTEM — Global UX / IA / Interaction
## Stage 2 — User Surface: Role + Permission + Sidebar + Workspace

**Date:** 2026-08-28
**Status:** IMPLEMENTED — RUNTIME VALIDATION PENDING
**Governing master:** `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
**Starting repository commit:** `b62cd6d66f51f5cedb260e6dbca6d53dfb23fa1c`

## 1. Scope

Stage 2 implements the approved user-surface contract without introducing a new authorization architecture:

**User → Role → Permissions → Authorized Capabilities → Sidebar + Workspace + Widgets**

The implementation deliberately keeps Role, Permission, Workspace and Entitlement as separate concepts.

Stage 2 does not implement the Stage 3 Workspace Foundation, Stage 4 personalization, Stage 5 Widget Library, or Stage 6 Patient Flow reconciliation.

## 2. Repository inspection before implementation

Inspected the actual `main` state and governing sources before modification:

### Global UX/IA

- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `docs/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md`
- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`
- Stage 1 navigation reconciliation record.

### AJM

- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`
- `docs/AJM-1-TEAM-ACCESS-FOUNDATION.md`
- `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md`
- `docs/AJM-2-IMPLEMENTATION-LOG.md`

Relevant current interpretation:

- AJM-0: COMPLETED.
- AJM-1: NEEDS RECONCILIATION because its architectural closure record and manual-acceptance follow-up disagree on final acceptance status.
- AJM-2: IN PROGRESS — Authenticated E2E / Closure Gate.
- AJM-3 onward: not started/gated according to the current matrix.

Stage 2 preserves these states and does not reopen or close AJM stages.

### PJ

- `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- Current `/operation`, `/clinical`, `/queue` implementation anchors.

PJ ownership, Queue behavior and Patient Flow ownership were not changed.

### Access implementation

Inspected:

- `src/domain/roles/roles.types.ts`
- `src/domain/roles/roles.actions.ts`
- `src/features/settings/templates/RoleTemplatesManager.tsx`
- `src/core/permissions/usePermissions.ts`
- `src/core/navigation/navigationRegistry.ts`
- `src/features/workspace/EntitlementAwareWorkspaceShell.tsx`
- `src/core/workspace/workspace.types.ts`
- `src/core/workspace/workspaceEngine.ts`
- `src/core/workspace/hooks/useWorkspace.ts`
- `src/core/workspace/hooks/useWidgetPersistence.ts`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/features/settings/user/UserSettingsManager.tsx`

## 3. Live database inspection

Production Supabase project was inspected for the actual access model.

The following tables exist:

- `roles`
- `permissions`
- `role_permissions`
- `clinic_users`
- `clinic_user_permissions`
- `clinic_user_settings`
- `clinic_user_workspaces`
- `role_templates`

The live permission catalogue contains explicit Workspace permissions:

- `workspace:administration`
- `workspace:operation`
- `workspace:clinical`

Current live role templates are permission-backed rather than role-label-only. Production currently contains system roles for Accounting, Clinic Admin, Doctor, Nurse, Receptionist and Super Admin, with role-to-permission counts inspected directly.

No database schema change was required for Stage 2.

## 4. Findings

### 4.1 Role templates were already advisory

`RoleTemplatesManager` already describes templates as advisory starting configurations and creates a custom role from the selected permissions. It does not treat the template as authorization itself.

No replacement role-template system was created.

### 4.2 Custom roles already support permission assignment

`createRole()` and `updateRolePermissions()` are permission-gated by `roles:manage`, while custom roles remain tenant-scoped. The role workspace field is not used as a substitute for effective permissions.

No new authorization engine was created.

### 4.3 Sidebar was already reconciled in Stage 1

The canonical navigation registry already derives Sidebar entries from explicit visibility plus effective permission/capability checks. Contextual Operations, Clinical and Queue routes remain protected but are not treated as independent top-level Sidebar domains.

Stage 2 reuses this implementation rather than rebuilding Sidebar.

### 4.4 Workspace capability was permission-filtered, but workspace surfaces were not explicit

The Workspace widget engine already resolves Widget visibility from permission + feature state + user state. However, there was no single permission-derived definition of which implemented working surfaces a user can be offered.

Stage 2 closes this presentation-model gap without making Workspace a security boundary.

### 4.5 Default Workspace setting could offer a surface without proving availability

`UserSettingsManager` previously offered Administration, Operation and Clinical as fixed choices regardless of the user's effective permissions.

Stage 2 changes this to derive selectable implemented workspace surfaces from effective permissions and retains Home as the safe fallback. This is a presentation preference correction; it does not grant or revoke authorization.

## 5. Implementation

### 5.1 Permission-derived Workspace surface model

Created:

`src/core/workspace/workspaceSurfaces.ts`

It defines the user-facing surface contract for:

- Global/Home — always available.
- Operations — requires `workspace:operation` and has a canonical implementation.
- Clinical — requires `workspace:clinical` and has a canonical implementation.
- Administration — declared by the approved model and requires `workspace:administration`, but is intentionally marked not implemented because the repository currently has no canonical Administration Workspace route.

The Stage 2 implementation does not manufacture a fake `/administration` route or relabel Settings as an Administration Workspace.

### 5.2 Workspace surface navigation

Created:

`src/features/workspace/WorkspaceSurfaceNav.tsx`

The active Workspace shell now exposes currently implemented workspace surfaces using the same effective-permission source already used by Sidebar and Widgets.

This gives users a controlled presentation-level way to move between authorized working surfaces without using role labels as access rules.

### 5.3 Default Workspace preference

`UserSettingsManager` now derives its workspace choices from the permission-aware Workspace surface model.

If a previously stored default is no longer available, the UI safely falls back to Home rather than presenting an unusable workspace preference.

The preference remains a preference. It is not a security boundary.

## 6. Explicit non-actions

The following were deliberately not changed:

- Role/permission authorization architecture.
- Tenant isolation or RLS.
- Patient Flow enablement/assignment.
- Queue engine or patient movement logic.
- AJM Domain ownership.
- PJ ownership/lifecycle.
- Widget Library classification.
- Workspace drag/drop/personalization.
- Global Search.
- Patient Context.
- Dashboard redesign.
- Financial & Resources domain implementation.
- Creation of an Administration Workspace route.

## 7. AJM impact

AJM-1 Team & Access is reused as the authorization foundation. Its current acceptance contradiction remains explicitly recorded and is not silently changed by Stage 2.

AJM-2 Financial & Resources remains one hierarchical product surface. Stage 2 does not alter its permissions, engines or ownership.

Future AJM stages remain compatible because workspace presentation is derived from permissions rather than hard-coded role behavior.

## 8. PJ impact

No PJ behavior was changed.

Operations and Clinical workspace routes remain the existing protected surfaces. Queue remains a contextual/protected compatibility route. Patient Flow remains governed by the PJ/AJM reconciliation rules and is not automatically activated by an Operations or Clinical role.

## 9. Validation performed

### Source validation

- Re-read the modified Workspace surface files from `main` after implementation.
- Verified the active shell uses `WorkspaceSurfaceNav`.
- Verified the Workspace surface model derives business workspace availability from effective permissions.
- Verified Administration is not exposed as a fake route.
- Verified Sidebar remains sourced from `getSidebarNavigation()`.
- Verified Widget visibility remains permission-driven.
- Verified custom role creation and permission assignment remain the existing authoritative actions.
- Verified no database migration was introduced.

### Live database validation

Confirmed production contains the explicit three Workspace permissions and the expected access tables. No schema mutation was required.

### Runtime validation gate

A new production deployment was triggered by the repository changes, but the currently observed READY production deployment was created from an earlier Stage 2 change commit before the complete final commit sequence was available.

Therefore this Stage 2 record remains **IMPLEMENTED — RUNTIME VALIDATION PENDING** until a READY deployment is confirmed to contain the final Stage 2 head and the surface is exercised in authenticated runtime.

Required runtime checks:

- Clinic Admin sees all currently implemented workspace surfaces allowed by permissions.
- A user with only `workspace:operation` sees Home + Operations, not Clinical.
- A user with only `workspace:clinical` sees Home + Clinical, not Operations.
- A cross-domain user sees all workspace surfaces explicitly authorized by permissions.
- Removing a workspace permission removes its surface from the presentation navigation without changing unrelated permissions.
- Sidebar remains complete for the user's authorized capabilities.
- Direct `/operation` and `/clinical` authorization remains server-enforced.

## 10. Mobile and bilingual validation gate

Source implementation uses the existing responsive shell and horizontal overflow behavior for the compact Workspace surface navigation.

Arabic/English labels are defined together in the same surface definition and use the existing `I18nProvider` locale.

Production mobile and Arabic/LTR/RTL checks remain part of the runtime gate and are not claimed complete before the final deployment is READY.

## 11. Acceptance criteria

- [x] Role templates remain advisory.
- [x] Custom roles can be created/saved through the existing authoritative role actions.
- [x] Permission assignment remains independent from conventional role labels.
- [x] Sidebar continues to derive from authorization + explicit visibility.
- [x] Workspace is not used as a security boundary.
- [x] Implemented workspace surface availability is derived from effective permissions.
- [x] Default Workspace preference no longer presents unavailable implemented surfaces as valid choices.
- [x] No new authorization engine created.
- [x] No database schema change required.
- [x] No AJM/PJ ownership changed.
- [ ] Final Stage 2 commit is READY in Vercel Production.
- [ ] Authenticated role/permission combinations verified in production.
- [ ] Arabic/English and RTL/LTR verified in production.
- [ ] Mobile navigation verified in production.

## 12. Known limitation intentionally carried forward

The approved model declares an Administration Workspace, but the repository currently has no canonical Administration Workspace implementation. Stage 2 records that fact instead of creating a misleading Settings alias. Stage 3 owns the Workspace Foundation work required to make the daily working surface genuinely useful and to decide the correct implementation of additional workspace contexts.

**Current status: IMPLEMENTED — RUNTIME VALIDATION PENDING.**
