# CORE SYSTEM — Global UX / IA / Interaction
## Stage 3 — Workspace Foundation — 2026-08-28

**Status:** IMPLEMENTED — RUNTIME VALIDATION PENDING
**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Execution plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
**Starting repository head:** `e8523f5a613b3b567789cb2d9cfc8c7f161c10a3`

## 1. Scope

Stage 3 establishes the existing CORE Workspace implementation as a reusable principal working surface without creating a second Workspace system, changing authorization, changing Domain ownership, or implementing Stage 4 personalization features as a new subsystem.

The implementation follows:

`READ → INSPECT → MAP → RECONCILE → IMPLEMENT → RUNTIME VALIDATE → DOCUMENT → CLOSE`

and:

`Inspect → Reuse → Extend → Reconcile → Create`.

## 2. Sources inspected

### UX / IA authority

- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `GLOBAL_UX_IA_AUDIT_FINAL_REPORT_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `WORKSPACE_ARCHITECTURE_SPECIFICATION.md`
- `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`
- `WORKSPACE_ARCHITECTURE_STAGE6_AMENDMENT.md`

### AJM

- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `docs/AJM-IMPLEMENTATION-STATUS-MATRIX-2026-08-28.md`

AJM domain ownership and authorization architecture remain unchanged. AJM-1 remains `NEEDS RECONCILIATION`; AJM-2 remains `IN PROGRESS` according to the current matrix.

### PJ

- `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md`
- current `/operation`, `/clinical` and Queue implementation anchors.

PJ ownership, Queue ownership and Patient Flow behavior were not changed.

### Repository implementation

Inspected and reused:

- `src/app/(dashboard)/page.tsx`
- `src/features/workspace/EntitlementAwareWorkspaceShell.tsx`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/features/workspace/WidgetContainer.tsx`
- `src/features/workspace/WidgetToolbar.tsx`
- `src/core/workspace/workspace.types.ts`
- `src/core/workspace/workspace.constants.ts`
- `src/core/workspace/workspaceEngine.ts`
- `src/core/workspace/widgetRegistry.ts`
- `src/core/workspace/workspaceSurfaces.ts`
- `src/core/workspace/hooks/useWorkspace.ts`
- `src/core/workspace/hooks/useWidgetPersistence.ts`
- `src/features/workspace/WorkspaceSurfaceNav.tsx`
- `src/core/i18n/workspaceMessages.ts`
- existing Operations and Clinical workspace routes/components.

## 3. Live database inspection

The production Supabase database was checked for the Workspace permission foundation. The permission catalogue uses `permission_key`, not `key`.

Current Workspace permission records confirmed:

- `workspace:administration`
- `workspace:clinical`
- `workspace:operation`

No database schema or data migration was required for Stage 3.

## 4. Findings

### 4.1 A Workspace engine already existed

The repository already had a canonical Workspace engine, registry, renderer, persistence hook and shell. Creating another Workspace system would violate the approved architecture.

### 4.2 Global/Home was technically routed through the Workspace renderer but was too generic

The `/` route already rendered `WorkspaceRenderer`, but the surface had no explicit working-surface presentation and did not communicate the user's current Workspace context.

### 4.3 Widget defaults were not explicitly mapped to Workspace contexts

The registry had a reusable Widget catalogue but most Widgets did not declare which Workspace contexts should receive them as defaults. This made the same Widget catalogue act as an undifferentiated surface.

### 4.4 Presentation state was shared across Workspace contexts

The existing local persistence key was user-scoped only. A hidden/collapsed/pinned Widget preference could therefore bleed between Home, Operations and Clinical when the same renderer was used for multiple contexts.

### 4.5 Existing authorization remained the correct source

Widget visibility already passed through the existing permission + feature engine. Workspace Foundation must preserve that model rather than add Workspace Membership or another authorization layer.

## 5. Implementation

### 5.1 Reused the canonical Workspace renderer

`WorkspaceRenderer` remains the single renderer. It now accepts an explicit `workspaceKey` and renders the active surface's bilingual label and description.

The Home route continues to use the same renderer; no parallel Home/Workspace engine was created.

### 5.2 Established explicit Workspace-context defaults

`widgetRegistry.ts` now records default Workspace contexts for the existing Widgets:

- Quick Registration — Global/Home + Operations
- Quick Appointment — Global/Home + Operations
- Queue — Global/Home + Operations + Clinical
- Follow-up — Global/Home + Operations + Clinical
- Medical Files — Global/Home + Clinical
- Billing Summary — Global/Home + Operations
- Analytics Overview — Global/Home

These are presentation defaults only. Effective permission and feature checks still determine whether a Widget is actually visible.

### 5.3 Workspace context is passed through Widget rendering

`WorkspaceRenderer` → `WidgetContainer` → `WidgetToolbar` now preserves the same Workspace context so presentation state is associated with the correct working surface.

### 5.4 Per-surface presentation persistence

`useWidgetPersistence()` now scopes local presentation state by:

`authenticated user + Workspace surface`

This prevents a user preference on Home from silently changing the presentation of Operations or Clinical.

This remains presentation state and does not grant authorization.

### 5.5 Working-surface chrome

The renderer now provides:

- explicit Working Surface label;
- bilingual Workspace title;
- bilingual Workspace description from the canonical Workspace surface model;
- responsive container and readable spacing;
- separate Quick Actions and Status/Analytics sections;
- accessible section headings;
- preserved natural Widget sizing and vertical scrolling.

No business Domain logic was duplicated into the Workspace chrome.

### 5.6 Bilingual parity

The new Working Surface label was added to the existing `workspaceMessages` catalogue in both Arabic and English. No second translation mechanism was introduced.

## 6. Explicit non-actions

The following were not implemented in Stage 3:

- Widget Library implementation/classification as Stage 5 work;
- full add/remove/reorder UX as a new Stage 4 subsystem;
- new authorization or Workspace Membership security;
- Patient Flow redesign or replacement;
- Queue replacement;
- Global Search;
- Patient Context;
- Dashboard redesign;
- Administration Workspace route;
- new database tables or migrations;
- Domain ownership changes;
- PJ workflow changes;
- AJM Domain implementation changes.

Existing Widget toolbar state controls were preserved as existing behavior; Stage 3 did not create a second personalization system around them.

## 7. AJM / PJ compatibility

### AJM

The implementation uses the existing effective permission model and leaves AJM Domain ownership intact. It does not alter AJM-1 or AJM-2 status.

### PJ

Operations and Clinical remain the existing protected workspace implementations. Patient Flow and Queue remain independent workflow surfaces. No PJ lifecycle, state transition, queue engine or patient movement logic was modified.

## 8. Files changed

- `src/core/workspace/widgetRegistry.ts`
- `src/core/workspace/hooks/useWorkspace.ts`
- `src/core/workspace/hooks/useWidgetPersistence.ts`
- `src/features/workspace/WidgetToolbar.tsx`
- `src/features/workspace/WidgetContainer.tsx`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/core/i18n/workspaceMessages.ts`
- `docs/GLOBAL-UX-IA-STAGE-3-WORKSPACE-FOUNDATION-2026-08-28.md`

No files were deleted.

## 9. Validation

### Source validation

- Confirmed `/` still resolves to the canonical `WorkspaceRenderer`.
- Confirmed Widget visibility still uses the existing pure Workspace engine plus effective permissions and feature state.
- Confirmed Workspace context only controls presentation/default placement, not authorization.
- Confirmed Workspace state persistence is now isolated by user and surface.
- Confirmed Operations and Clinical server routes remain independently permission-guarded.
- Confirmed Patient Flow/Queue implementation files were not modified.
- Confirmed no Supabase migration was introduced.
- Confirmed Arabic and English Working Surface labels are both present.

### Live database validation

Production Workspace permission keys were queried directly. All three approved Workspace permissions are present in the live permission catalogue.

### Runtime validation gate

A READY Vercel deployment containing the final Stage 3 head must be confirmed before closure. Required runtime checks:

1. Home loads as the canonical Workspace working surface.
2. Permission-authorized Widgets render; unauthorized Widgets do not.
3. Home/Operations/Clinical context labels remain correct where the renderer is used.
4. Widget presentation state does not bleed between Workspace surfaces.
5. Arabic/English labels and RTL/LTR presentation remain correct.
6. Mobile Workspace remains scrollable and usable without changing the conceptual model.
7. Existing `/operation`, `/clinical` and Patient Flow/Queue behavior remains intact.

**Current status: IMPLEMENTED — RUNTIME VALIDATION PENDING.**
