# CORE SYSTEM — Role Workspace Source-of-Truth Finding
## Primary Role × Primary Work Context × Workspace Membership
### 2026-09-11

**Status:** IMPLEMENTATION RECONCILIATION FINDING — NO CODE CHANGE
**Branch:** `docs/reconcile-global-surfaces-2026-09-11`

## 1. Finding

The documentation reconciliation correctly separates Role, Permissions and Workspace, but repository implementation shows an additional distinction that must be preserved explicitly:

- `roles.workspace` is part of the role/template definition.
- `clinic_user_workspaces` stores the user's actual workspace membership/default workspace.
- `currentWorkspace.ts` resolves the user's assigned/default workspace from `clinic_user_workspaces` and intentionally does not infer it directly from Role, job title or permissions.

Therefore the implementation currently treats the persisted user workspace assignment as the operational source for the user's primary workspace presentation, while the role's `workspace` value is a default/template/workspace classification associated with the role.

## 2. Evidence

`docs/AJM-1-TEAM-ACCESS-FOUNDATION.md` states that:

- `roles.workspace` contains Administrative / Operation / Clinical.
- `clinic_user_workspaces` stores workspace membership/default workspace.
- workspace memberships are persisted independently of permissions.

The migration `20260827113825_ajm_1_workspace_memberships.sql` initially creates a default `clinic_user_workspaces` record from `roles.workspace` for each clinic user.

`src/core/workspace/currentWorkspace.ts` then reads the user's default workspace membership first and falls back to an existing membership for compatibility. Its explicit contract says Workspace is not inferred from Role, job title or permissions.

## 3. Canonical interpretation required

These facts are compatible with the product model only if the terms are kept precise:

```text
Primary Role
    ↓
Role's default / template Work Context

Actual user assignment
    ↓
Primary Work Context / Workspace assignment
    ↓
Role Workspace

Effective Permissions
    ↓
Capabilities inside and across authorized Domains
```

The key invariant is:

**Permissions do not determine or redefine Role Workspace.**

A user-level workspace assignment may intentionally determine the user's primary work environment. That assignment is a work-context/organizational decision, not an authorization grant.

## 4. Required verification before implementation repair

Before changing `currentWorkspace`, `clinic_user_workspaces`, or any Role/Workspace UI:

1. Verify how Clinic Admin assigns or changes a user's workspace.
2. Verify whether one membership is intended to be the single Primary Work Context or whether multiple memberships are genuinely supported for the UI.
3. Verify whether changing `clinic_user_workspaces.is_default` is considered a work-context change and therefore legitimately changes Role Workspace.
4. Verify that direct permissions never trigger automatic workspace changes.
5. Verify that role edits/templates do not silently overwrite an intentionally customized user workspace.
6. Verify Sidebar authorization separately from workspace membership.
7. Verify My Workspace personalization separately from workspace membership.

No database or runtime change should be made until these relationships are verified against the current production implementation and approved Team & Access behavior.

## 5. Important consequence

The canonical global-surface document should not be interpreted as requiring a new runtime inference engine of the form:

`Role → Workspace`

if the approved Team & Access implementation intentionally uses:

`Role/default context → user workspace assignment → Role Workspace`

The architectural requirement is separation of concerns, not a mandated implementation mechanism.

**No source code, database, or runtime change was made by this finding.**
