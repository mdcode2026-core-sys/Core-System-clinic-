# CORE SYSTEM — Primary Work Context Runtime Repair Contract

**Date:** 2026-09-11  
**Status:** DOCUMENTATION / REPAIR CONTRACT — NOT IMPLEMENTED  
**Authority:** Derived from the current binding Workspace / Home / Header / Sidebar reconciliation and direct runtime inspection.

## 1. Binding Product Rule

The **Primary Work Context** is assigned by the **Clinic Admin** when creating or managing a tenant user.

Allowed values:
- `clinical`
- `operation`
- `administration`

The user cannot change their own Primary Work Context.

Primary Work Context does **not** grant, revoke, or otherwise alter permissions. It determines the user's primary **Role Workspace**.

Effective permissions remain an independent authorization layer and may expose authorized domains/capabilities outside the user's Primary Work Context.

Canonical model:

```text
Clinic Admin assigns
    Primary Role
    Primary Work Context
          ↓
    Role Workspace

Separately
    Effective Permissions
          ↓
    Authorized capabilities/domains/actions
          ↓
    Sidebar / Widgets / My Workspace
```

## 2. Verified Runtime Findings

### 2.1 User-management writer exists and is legitimate in purpose

`src/domain/users/users.actions.ts` creates `clinic_user_workspaces` records when a user is created and updates the default workspace through `updateWorkspaceAssignment()` when `input.workspace` is supplied during user update.

This confirms that user management is the application-level administrative writer for Primary Work Context.

### 2.2 Role changes do not automatically overwrite the existing Primary Work Context

`updateClinicUser()` resolves and updates the target Role independently. It only calls `updateWorkspaceAssignment()` when `input.workspace` is explicitly supplied.

Therefore a Role change by itself does not silently redefine an already assigned Primary Work Context. This is compatible with the binding rule and must be preserved.

### 2.3 Database RLS currently permits self-write to `clinic_user_workspaces`

The AJM1 write policy allows a user to write their own `clinic_user_workspaces` row, in addition to users holding `users:update`.

That is incompatible with the binding rule because Primary Work Context is an administrative assignment and is not a personal preference.

**Required repair:** remove self-write authority for `clinic_user_workspaces`; retain only the approved administrative authority path.

### 2.4 `clinic_user_settings.default_workspace` is a competing legacy concept

`clinic_user_settings` contains `default_workspace`, while the current runtime resolver uses `clinic_user_workspaces.is_default` as the Role Workspace source.

The current user-settings UI does not appear to expose `default_workspace`, and the observed save path only persists personal settings such as locale/sidebar state.

**Required repair:** establish one authoritative source for Primary Work Context / Role Workspace and ensure `clinic_user_settings.default_workspace` cannot become a second authority. Removal or retirement must be handled through a separate data-safe migration decision; do not delete the column merely as a code cleanup without checking historical consumers.

### 2.5 Sidebar authorization is correctly independent from Workspace

The Sidebar filters entries using effective permissions rather than the user's workspace classification. This behavior is consistent with the binding architecture and must not be changed as part of the Primary Work Context repair.

### 2.6 `global` is technically conflated between Home and My Workspace

`workspaceSurfaces.ts` defines `global` as the Home/global surface, while `/my-workspace` currently passes `workspaceKey="global"` into the Workspace renderer.

This is an implementation-level identity collision between two distinct product concepts.

**Required repair:** introduce/restore a distinct technical identity for My Workspace and stop using the Home/global key as its workspace identity. This must not redesign the My Workspace product concept or the existing Clinical/Operational Workspace implementations.

## 3. Repair Scope

### In scope

1. Harden `clinic_user_workspaces` RLS so ordinary users cannot self-edit Primary Work Context.
2. Preserve the administrative management path for assigning/updating Primary Work Context.
3. Verify that the administrative writer is restricted to the intended authority model.
4. Ensure Role changes do not implicitly overwrite an existing Primary Work Context.
5. Neutralize `clinic_user_settings.default_workspace` as an authorization/workspace source; preserve historical data until migration impact is verified.
6. Separate the technical identity of My Workspace from the `global` Home surface.
7. Add regression coverage for all above behaviors.

### Explicitly out of scope

- Redesigning Clinical Workspace.
- Redesigning Operational Workspace.
- Turning Patient Flow into a sidebar module.
- Changing effective permission semantics.
- Creating a second authorization system.
- Making My Workspace a second workspace membership.
- Rebuilding Home or Header.

## 4. Required Acceptance Tests

### Primary Work Context

- Clinic Admin can assign Clinical / Operational / Administration to a target user.
- Authorized administrative management can update the target user's Primary Work Context.
- Ordinary user cannot update their own `clinic_user_workspaces` row through Supabase/RLS.
- Ordinary user cannot change Primary Work Context through any settings UI or action.
- Additional permissions do not change Primary Work Context.
- Changing Role without an explicit Primary Work Context change preserves the existing Primary Work Context.

### Personal Settings

- User can still update legitimate personal settings.
- Personal settings cannot alter Primary Work Context.
- `clinic_user_settings.default_workspace` cannot become an alternate runtime source.

### Sidebar / Workspace

- Sidebar remains permission-driven.
- A user may see an authorized domain outside their Primary Work Context.
- Role Workspace remains the primary professional environment.
- My Workspace remains a personal arrangement inside the permitted environment and cannot grant permissions.
- Home remains independent from My Workspace.
- `global` is not used as the technical identity of My Workspace.

## 5. Implementation Order

1. Create dedicated repair branch from the verified current `main` baseline.
2. Implement RLS authority correction.
3. Harden/verify the administrative workspace writer.
4. Neutralize the legacy `default_workspace` competing source.
5. Repair `global` / My Workspace technical identity collision.
6. Run focused tests.
7. Run build/type/lint and relevant regression checks.
8. Review the diff for architecture drift.
9. Document exact changes and verification evidence.
10. Only then propose merge.

## 6. Closure Rule

This contract is **not evidence of implementation**.

The work is not considered repaired until the implementation branch has objective verification proving the acceptance tests above. No production-closure claim is permitted from this document alone.
