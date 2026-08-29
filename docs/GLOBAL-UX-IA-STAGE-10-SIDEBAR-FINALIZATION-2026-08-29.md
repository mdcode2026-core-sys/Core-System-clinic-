# CORE SYSTEM — Global UX/IA Stage 10 — Sidebar Finalization

**Date:** 2026-08-29  
**Stage:** Global UX/IA Stage 10  
**Status:** IMPLEMENTED — VALIDATION PENDING  
**Branch:** `ux-stage-10-sidebar-finalization`  
**PR:** #37

## Authority

Execution follows:

- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
- `GLOBAL_UX_IA_FINAL_AUTHORITY_2026-08-28.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28-FINAL.md`
- `docs/AJM-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md`
- current AJM status matrix and current `PROJECT_HANDOFF.md`
- current repository implementation

## 1. Scope

Stage 10 finalizes Sidebar presentation after Workspace, Widget Library, Patient Flow, Patient Context, Global Search and Overview/Dashboard reconciliation.

The stage does not redesign authorization, move Domain ownership, replace Patient Flow/Queue, rebuild Workspace, or introduce a database schema change.

## 2. Inspection baseline

### Repository

Inspected the current `main` state at `39d4ecdef63b78f86ee71e7f851427ddfe2828fc`, including:

- canonical `src/core/navigation/navigationRegistry.ts`;
- active `src/features/workspace/EntitlementAwareWorkspaceShell.tsx`;
- legacy `src/features/workspace/WorkspaceShell.tsx` alignment;
- `src/core/workspace/workspaceSurfaces.ts` and `WorkspaceSurfaceNav`;
- Stage 5–9 UX audits and records;
- current route hierarchy under `src/app/(dashboard)`;
- current i18n navigation messages;
- Stage 9 production handoff and validation records.

### AJM

The current AJM matrix was checked. AJM Domain ownership and authorization status are unchanged by Stage 10. AJM-2 remains independently governed; later AJM stages remain gated/not started according to current evidence. The Sidebar changes do not introduce a new AJM Domain or authorization layer.

### PJ

The current PJ reconciliation and repository evidence were checked. Patient Flow remains an independent system with Operations, Clinical and Administrative interfaces; Queue remains canonical; patient/visit lifecycle ownership remains with the established PJ/AJM implementation. Stage 10 only changes the navigation surface.

## 3. Reconciliation findings

1. The navigation registry was already the canonical source of Sidebar entries and route permissions.
2. Operations, Clinical and Queue were correctly contextual/protected rather than Sidebar domains.
3. Patient Flow and Financial & Resources were hierarchical groups but their parent entries were rendered as direct links, creating duplicate/competing entry semantics with child surfaces.
4. The active Workspace shell still contained `WorkspaceSurfaceNav`, which exposed the older fixed Workspace-context switcher even though the final authority supersedes fixed user-facing Workspace organization.
5. Sidebar order did not yet present the final conceptual grouping established after Stage 9.
6. Authorization filtering was already permission/entitlement-aware and was preserved.

## 4. Implementation

### 4.1 Canonical Sidebar hierarchy

Final top-level order:

```text
Workspace
Patients
Agenda
Patient Flow
  ├── Operations
  ├── Clinical
  └── Administrative
Treatment Plans
Financial & Resources
  ├── Overview
  ├── Invoices
  ├── Payments
  ├── Financial Plans
  │   └── Installments
  ├── Insurance
  │   └── Claims
  ├── Inventory
  │   └── Consumption
  └── Purchasing
      ├── Suppliers
      └── Receiving
Follow-up
Reports
Analytics
Dashboard
Settings
```

Dashboard remains a management surface and is intentionally grouped with management/reporting capabilities rather than presented as the everyday Workspace.

### 4.2 Navigation groups

Added `navigationOnly` metadata to the canonical navigation registry. Patient Flow and Financial & Resources now render as expandable groups rather than acting as competing destination pages in the Sidebar.

Their underlying routes remain intact and directly addressable where needed.

### 4.3 Active Sidebar shell

The active `EntitlementAwareWorkspaceShell` now:

- consumes only `getSidebarNavigation()`;
- honors `navigationOnly` groups;
- provides keyboard/screen-reader friendly expand/collapse semantics;
- keeps groups open automatically when the current route is inside the group;
- preserves Arabic RTL indentation behavior;
- removes the obsolete `WorkspaceSurfaceNav` from the active shell;
- keeps bilingual primary-navigation labeling;
- keeps permission and entitlement filtering;
- preserves route-aware active-state behavior.

### 4.4 Authorization preservation

No permission was added, removed or reinterpreted. Sidebar visibility remains derived from effective permissions/capabilities. Direct route authorization remains governed by the existing middleware/server authorization model.

## 5. Database

No database migration was required. Stage 10 is presentation/IA work only.

## 6. Runtime / CI validation

A blocking `.github/workflows/stage10-validation.yml` was added. It runs:

1. lockfile verification;
2. dependency installation;
3. TypeScript;
4. i18n audit and parity;
5. Stage 5 Widget Catalog audit;
6. Stage 5 Domain Surface audit;
7. Stage 6 Patient Flow audit;
8. Stage 7 Patient Context audit;
9. Stage 8 Global Search audit;
10. Stage 9 Overview/Dashboard audit;
11. Stage 10 Sidebar audit;
12. changed-surface ESLint;
13. production build.

At the time this implementation record was written, the final validation run was still executing. Stage 10 is therefore not yet marked closed in this record.

## 7. Reusable evidence

`tools/sidebar-stage10-audit.mjs` verifies the canonical order, contextual route separation, Patient Flow hierarchy, Financial & Resources hierarchy, Dashboard permission-awareness, canonical registry use, group disclosure semantics, bilingual navigation labeling and root active-state behavior.

## 8. Explicit non-actions

- No second Sidebar registry.
- No second Workspace system.
- No database change.
- No Patient Flow/Queue replacement.
- No PJ ownership change.
- No AJM ownership change.
- No role/permission redesign.
- No deletion of the legacy `WorkspaceSurfaceNav` component in Stage 10; unused legacy cleanup remains governed by the dedicated Legacy Cleanup stage.

## 9. Acceptance criteria

- [x] Sidebar is derived from the canonical navigation registry.
- [x] Workspace is the principal top-level working surface.
- [x] Operations/Clinical/Queue remain contextual rather than top-level Sidebar domains.
- [x] Patient Flow exposes the three approved interfaces through one grouped system.
- [x] Financial & Resources exposes its approved parent/child hierarchy.
- [x] Dashboard remains a management surface and is permission-aware.
- [x] Fixed Workspace context switching is removed from the active Sidebar shell.
- [x] Group expansion/collapse is explicit and accessible.
- [x] Arabic/English navigation labels remain supported by the existing i18n architecture.
- [x] Existing authorization/entitlement filtering is preserved.
- [x] No database migration is introduced.
- [ ] Stage 10 blocking CI passes on the final candidate.
- [ ] Final preview/runtime verification passes.
- [ ] Final production verification passes if required by the final UX/IA DoD.

**Current status: IMPLEMENTED — VALIDATION PENDING.**
