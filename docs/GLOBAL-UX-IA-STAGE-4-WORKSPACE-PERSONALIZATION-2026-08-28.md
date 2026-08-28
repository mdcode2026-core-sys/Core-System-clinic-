# CORE SYSTEM — Global UX / IA / Interaction
## Stage 4 — Workspace Personalization — 2026-08-28

**Status:** IMPLEMENTED — PRE-DEPLOYMENT VALIDATION IN PROGRESS; RUNTIME CLOSURE BLOCKED BY VERCEL RATE LIMIT
**Authority:** `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
**Execution plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`

## 1. Objective

Stage 4 completes the approved Workspace personalization contract using the existing Workspace engine, registry, renderer and persistence mechanism.

The implementation must provide:

- permission-aware Widget Library;
- add authorized Widgets;
- remove/hide selected Widgets;
- desktop drag-and-drop ordering;
- mobile move-up/move-down ordering;
- per-user/per-Workspace persistence;
- Restore Defaults;
- no authorization bypass;
- no second Workspace engine;
- Arabic/English parity and RTL/LTR support.

## 2. Implementation

### 2.1 Canonical state ownership

`WorkspaceRenderer` remains the principal Workspace renderer. Widget state changes are passed from the renderer into `WidgetContainer` and `WidgetToolbar` rather than creating an independent `useWorkspace()` state owner inside each Widget toolbar.

This prevents competing Workspace state instances from being created by individual Widgets.

### 2.2 Widget Library

The Workspace customization surface exposes the existing Widget Registry as a permission-aware catalog.

A Widget is addable only when:

- the current user has the Widget's required permission;
- the Widget's module/feature is enabled.

The Library is not an authorization engine and cannot grant permissions.

A Widget may be added even when it is not a default Widget for the current Workspace surface. Default placement and user selection are separate concepts.

### 2.3 Add / remove

Adding a Widget creates or restores its user Workspace layout entry as `visible`.

Removing a Widget changes its user presentation state to `hidden`. It does not delete the Widget definition, capability, permission, domain, or business functionality.

Restore Defaults clears user-specific layout overrides so the canonical default Workspace configuration is restored.

### 2.4 Ordering

Desktop supports native drag-and-drop ordering within the existing Workspace layer.

Mobile exposes explicit Move Up / Move Down controls because touch drag-and-drop is less reliable for compact screens.

Widgets cannot be reordered across their defined Workspace layers. Ordering remains within the existing layer structure.

### 2.5 Persistence

Existing persistence remains local presentation state scoped by:

`authenticated user + Workspace surface`

No new database schema or authorization model was introduced.

### 2.6 Authorization invariant

The effective permission and feature checks remain the source of Widget visibility.

If a permission is removed, a previously selected Widget cannot restore access to the protected capability.

Workspace personalization is therefore presentation state, not a security boundary.

## 3. Existing architecture reused

The implementation reuses:

- `src/core/workspace/widgetRegistry.ts`
- `src/core/workspace/workspaceEngine.ts`
- `src/core/workspace/workspace.types.ts`
- `src/core/workspace/hooks/useWorkspace.ts`
- `src/core/workspace/hooks/useWidgetPersistence.ts`
- `src/features/workspace/WorkspaceRenderer.tsx`
- `src/features/workspace/WidgetContainer.tsx`
- `src/features/workspace/WidgetToolbar.tsx`
- existing Workspace surface definitions and i18n catalog.

No parallel Workspace engine was created.

## 4. AJM / PJ impact

AJM ownership remains unchanged.

PJ ownership, Patient Flow, Queue, patient movement and visit lifecycle remain unchanged.

Stage 4 does not recreate Queue or Patient Flow as Widgets.

## 5. Database impact

No Supabase migration or database schema change is required for Stage 4 personalization. Existing local user/surface presentation persistence is retained.

## 6. Pre-deployment validation

Required gates:

- dependency installation;
- TypeScript;
- i18n audit/parity;
- ESLint;
- production build;
- Stage 4 structural checks;
- interactive Workspace verification where available.

The shared `.github/workflows/ux-stages-0-4-ci.yml` is intended to perform the repository-level pre-deployment gates.

**Important:** the existence of the workflow is not itself evidence of a passing run. An actual CI run for the final candidate commit must be recorded before the stage can be marked CI validated.

## 7. Runtime closure

Runtime acceptance requires verification of:

1. customization opens and closes correctly;
2. authorized Widgets appear in the Library;
3. unauthorized Widgets are not offered;
4. Add makes an authorized Widget appear;
5. Remove hides the selected Widget;
6. Restore Defaults restores the default arrangement;
7. desktop drag-and-drop persists ordering;
8. mobile Move Up / Move Down persists ordering;
9. changing Workspace surface does not leak personalization state;
10. Arabic/English labels remain equivalent;
11. RTL/LTR remains correct;
12. Widget state cannot bypass authorization;
13. existing Sidebar, AJM and PJ behavior remains intact.

A new Vercel deployment is currently blocked by the platform's deployment rate limit. The latest GitHub commit status reports: **Deployment rate limited — retry in 24 hours**. Therefore deployed-runtime closure is not claimed yet.

## 8. Current status

Stage 4 source implementation is present in `main`.

The stage is **not yet Production Ready** because the final pre-deployment CI evidence and deployed runtime evidence have not both been established for the final candidate.

This is an evidence gate, not an implementation shortcut.
