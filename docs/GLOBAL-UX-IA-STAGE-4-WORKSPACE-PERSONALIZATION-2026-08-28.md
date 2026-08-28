# CORE SYSTEM — Global UX / IA / Interaction
## Stage 4 — Workspace Personalization — 2026-08-28

**Status:** IMPLEMENTED — RUNTIME VALIDATION PENDING
**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Execution plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
**Base:** `main` at `5fc022a01a6fd7e20afe998b200cd56058e5c60a3`
**Branch:** `feat/global-ux-stage-4-workspace-personalization`

## 1. Scope

Stage 4 implements Workspace personalization on top of the canonical Stage 3 Workspace engine. It does not create a second Workspace system, Workspace Membership security layer, new Domain, or new authorization mechanism.

The implemented personalization contract is:

- add authorized Widgets;
- remove/hide Widgets from the current Workspace;
- reorder Widgets within their existing Workspace layer;
- desktop drag-and-drop reordering;
- mobile-friendly move up/down controls;
- vertical scrolling for additional Widgets;
- per-user + per-Workspace-surface persistence;
- restore the default Workspace configuration;
- preserve permission/feature enforcement regardless of personalization state.

## 2. Reconciliation performed before implementation

### UX / IA

Read and reconciled:

- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`
- `docs/GLOBAL-UX-IA-STAGE-3-WORKSPACE-FOUNDATION-2026-08-28.md`

### AJM

Read and reconciled:

- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`
- `docs/AJM-IMPLEMENTATION-PLAN.md`
- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`

Current AJM interpretation remains unchanged. Stage 4 does not claim completion or closure of any AJM stage.

### PJ

Read and reconciled:

- `PJ_FINAL_IMPLEMENTATION_STATE.md`
- `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`
- `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`

Patient Flow, Queue, visit lifecycle, patient movement and PJ ownership are untouched.

## 3. Actual repository findings

The Stage 3 repository already contained:

- canonical `WorkspaceRenderer`;
- `useWorkspace` orchestration;
- `workspaceEngine` permission/feature visibility resolution;
- Widget registry with default Workspace contexts;
- `useWidgetPersistence` scoped to user + Workspace surface;
- existing Widget toolbar state controls.

Stage 4 therefore extended those implementations rather than creating parallel infrastructure.

## 4. Implementation

### 4.1 Permission-aware Widget Library

Added `src/features/workspace/WidgetLibrary.tsx`.

The library receives the existing registry entries that pass the current permission + feature checks. It cannot expose an unauthorized Widget as an addable capability.

A Widget already present on the current surface is shown as added and cannot be duplicated.

### 4.2 Add / remove

`useWorkspace()` now exposes:

- `availableWidgets`;
- `addWidget(key)`;
- `removeWidget(key)`.

Adding a Widget writes a visible layout entry using the Widget's canonical default size. Removing a Widget changes only presentation state to `hidden` and does not delete the Widget definition or business capability.

### 4.3 Non-default authorized Widgets

A Widget selected by the user is retained on the current Workspace surface even if it was not one of that surface's Stage 3 defaults. This is required by the approved personalization model: defaults are a starting configuration, not a capability restriction.

### 4.4 Reordering

Desktop users receive a native drag handle. Dragging is restricted to the Widget's existing layer so the approved Workspace distinction between Quick Actions and Status/Analytics remains intact.

Mobile users receive accessible move-up and move-down controls because native desktop drag-and-drop is not a reliable mobile interaction pattern.

The existing natural Widget dimensions are preserved; the implementation does not introduce arbitrary compression to fit a fixed grid.

### 4.5 Canonical state ownership

Stage 3's Widget toolbar previously created its own `useWorkspace()` instance. Stage 4 connects Widget controls to the single `WorkspaceRenderer` orchestration instance instead. This ensures hide/show, collapse, pin and reorder changes update the rendered surface immediately and persist through the canonical state path.

No second persistence or authorization system was introduced.

### 4.6 Persistence and reset

Existing `useWidgetPersistence()` remains the persistence boundary and continues to scope state by:

`authenticated user + Workspace surface`

`resetLayout()` restores an empty personalized layout, allowing the canonical Workspace defaults to become active again. This resets customization without changing permissions or Widget definitions.

### 4.7 Mobile / scrolling

The Workspace continues to use normal vertical page scrolling. Additional authorized Widgets are not suppressed merely because they are beyond the first visible area. Mobile reordering is supported through explicit move controls.

### 4.8 Arabic / English

All new personalization controls have Arabic and English labels through the existing `workspaceMessages` render-time i18n catalogue. No parallel translation mechanism was introduced.

## 5. Security / authorization invariants

The following remain unchanged and were preserved deliberately:

- Role ≠ Permission.
- Workspace ≠ Security Boundary.
- Widget ≠ Permission.
- Permission + feature state remain authoritative for Widget visibility.
- A personalized Widget cannot grant a permission.
- A Widget whose permission is removed is not rendered even if its layout entry remains in local persistence.
- Tenant isolation and server-side/domain authorization remain authoritative.
- No database migration was introduced.

## 6. Files changed

- `src/core/workspace/hooks/useWorkspace.ts`
- `src/features/workspace/WidgetLibrary.tsx`
- `src/features/workspace/WidgetToolbar.tsx`
- `src/features/workspace/WidgetContainer.tsx`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/core/i18n/workspaceMessages.ts`
- `docs/GLOBAL-UX-IA-STAGE-4-WORKSPACE-PERSONALIZATION-2026-08-28.md`
- `DOCUMENTATION_STATUS.md`
- `PROJECT_HANDOFF.md`
- `CHANGELOG.md`

No Workspace or Domain implementation was deleted.

## 7. Validation gate

### Repository validation

- Confirm canonical Workspace renderer remains the only Workspace renderer.
- Confirm personalization uses existing permission + feature checks.
- Confirm the Widget Library only receives authorized/enabled Widgets.
- Confirm adding a non-default authorized Widget persists it on the current surface.
- Confirm hide/show and reorder are driven by the canonical renderer state.
- Confirm desktop drag/drop is layer-local.
- Confirm mobile move controls are available.
- Confirm reset returns the surface to canonical defaults.
- Confirm no Supabase migration is required.
- Confirm Arabic/English labels are provided through the existing i18n catalogue.

### Preview build note

The first Vercel preview was created from the initial branch commit before the subsequent i18n and Workspace commits had landed in the branch. That preview failed because it referenced the older `workspaceMessages` type and therefore did not contain the completed Stage 4 source. The branch was subsequently updated with the complete implementation; a new READY deployment must be used for closure verification rather than treating that stale first preview as a Stage 4 build result.

### Runtime closure requirements

A READY Vercel deployment containing the final Stage 4 commit must be verified for:

1. Workspace loads successfully.
2. Customize controls open and close correctly.
3. Authorized Widgets can be added from the Widget Library.
4. Existing Widgets can be hidden and restored.
5. Desktop drag-and-drop reorders Widgets correctly within a layer.
6. Mobile move controls reorder Widgets correctly.
7. Reloading the same authenticated user + Workspace surface preserves personalization.
8. Switching Workspace surfaces does not leak presentation state.
9. Reset restores the default configuration.
10. Removing/revoking a Widget's permission prevents it from rendering despite any stored layout entry.
11. Arabic/English and RTL/LTR behavior remain correct.
12. Existing Patient Flow/Queue and PJ workflows remain unaffected.

**Current status:** IMPLEMENTED — RUNTIME VALIDATION PENDING.
