# CORE SYSTEM — Global Surfaces Implementation Drift Findings
## Home × Role Workspace × My Workspace × Technical `global`
### 2026-09-11

**Status:** DOCUMENTATION-ONLY FINDING — IMPLEMENTATION RECONCILIATION REQUIRED
**Branch:** `docs/reconcile-global-surfaces-2026-09-11`

## 1. Purpose

This document records concrete implementation evidence discovered after the documentation reconciliation. It does **not** authorize source-code changes.

The product architecture requires Home, Role Workspace and My Workspace to remain distinct. The implementation must therefore be checked for technical reuse that accidentally collapses these concepts.

## 2. Confirmed evidence

### A. `workspaceSurfaces.ts` still contains a technical `global` surface

`src/core/workspace/workspaceSurfaces.ts` defines:

```text
WorkspaceSurfaceKey = global | administration | operation | clinical
```

The `global` entry is labeled Home and explicitly describes itself as a global entry surface, not a business Workspace. `getAvailableWorkspaceSurfaces()` and `canUseWorkspaceSurface()` already exclude `global` from business Workspace availability.

This is partially aligned with the canonical model, but the shared type still permits `global` to flow through Workspace-oriented APIs.

### B. `My Workspace` still invokes the renderer with `workspaceKey="global"`

The repository search found:

`src/app/(dashboard)/my-workspace/page.tsx`

with:

```tsx
return <WorkspaceRenderer workspaceKey="global" />;
```

This is a concrete implementation drift because the canonical model defines:

- `Home` = independent global starting/awareness surface.
- `Role Workspace` = primary professional work environment.
- `My Workspace` = personal arrangement of permitted work/tools.

The `/my-workspace` route therefore must not rely on `global` merely because the renderer historically used that key.

## 3. Related technical evidence

The following implementation files consume `WorkspaceSurfaceKey` / `workspaceKey` and must be reviewed before any repair is designed:

- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/core/workspace/hooks/useWorkspace.ts`
- `src/core/workspace/hooks/useWidgetPersistence.ts`
- `src/features/workspace/WidgetContainer.tsx`
- `src/core/workspace/currentWorkspace.ts`
- `src/core/workspace/workspaceSurfaces.ts`

The presence of `global` in these technical APIs is not by itself a defect. The defect/risk is the use of that key where the product concept is explicitly My Workspace.

## 4. Required architectural interpretation

The repair must preserve the following boundaries:

```text
HOME
  independent global starting / awareness surface

ROLE WORKSPACE
  primary professional work environment

MY WORKSPACE
  personal arrangement/presentation of permitted work/tools
```

Additional permissions may add authorized Domains, widgets and tools to My Workspace without changing the user's Role Workspace.

## 5. What must NOT happen

The implementation repair must not:

- turn My Workspace into Home;
- make Home a Role Workspace;
- create a second authorization engine;
- use My Workspace to grant permissions;
- change Clinical or Operational Workspace architecture as part of this repair;
- introduce a parallel widget persistence model;
- modify database tables merely to fix the naming/rendering boundary;
- treat `global` as proof that the product concepts are the same.

## 6. Next controlled implementation investigation

Before code changes, verify the complete data/rendering path:

1. `/` Home route and its data/widgets.
2. `/my-workspace` route.
3. `WorkspaceRenderer` behavior.
4. `useWorkspace` default and persistence behavior.
5. `useWidgetPersistence` storage keys and isolation.
6. `workspaceSurfaces` definitions and consumers.
7. `currentWorkspace` resolution and any database-backed workspace assignment.
8. Sidebar route/navigation generation.
9. Any `clinic_user_workspaces` reads/writes related to the above.
10. Tests/build/runtime behavior for Home, My Workspace, Clinical and Operational Workspace.

Only after this verification should a minimal repair plan be issued.

## 7. Relationship to the canonical reconciliation

The authoritative product interpretation remains:

`docs/CORE-SYSTEM-GLOBAL-SURFACES-CANONICAL-RECONCILIATION-2026-09-11.md`

This finding document is subordinate to that canonical interpretation and records implementation evidence only.

**No source code, database, or runtime change was made by creating this finding.**
