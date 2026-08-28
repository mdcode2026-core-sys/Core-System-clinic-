# CORE SYSTEM — Global UX / IA / Interaction
## Stage 1 — Navigation & Information Architecture Reconciliation

**Date:** 2026-08-28
**Status:** IMPLEMENTED — RUNTIME VALIDATION PENDING
**Governing master:** `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
**Implementation plan:** `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md`

## 1. Execution method

`READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT → DOCUMENT → COMMIT → RECHECK`

Stage 1 is limited to navigation and information-architecture reconciliation. It does not implement Patient Flow itself, Workspace personalization, Widget Library, Global Search, Patient Context, Dashboard redesign, or Queue consolidation. Those remain gated to their dedicated stages.

## 2. Repository and authority baseline inspected

The following were inspected from the actual repository state on `main` before implementation:

### Global UX/IA

- `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md`
- `docs/GLOBAL-UX-IA-IMPLEMENTATION-PLAN-2026-08-28.md`
- `docs/GLOBAL_UX_IA_DOCUMENTATION_RECONCILIATION_2026-08-28.md`
- current navigation registry and active Workspace shell
- current root `/` implementation
- current route implementations for `/operation`, `/clinical`, `/queue`, `/patients`, `/agenda`, `/treatment-plans`, `/financial-resources`, `/reports`, `/analytics`, `/follow-up`, `/settings`

The previously produced Stage 0 branch was also inspected as evidence of the baseline/reconciliation work; its documentation is not assumed to be present on `main` until merged.

### AJM

Inspected current AJM-0 readiness, AJM Stage Index, AJM Implementation Plan, AJM Master Blueprint, AJM-1/2 implementation records and the AJM UX/IA reconciliation addendum.

Current AJM interpretation relevant to Stage 1:

- AJM-0: CLOSED.
- AJM-1: repository/stage authority says CLOSED, while the visibility follow-up records manual acceptance pending; this remains a documentation/status reconciliation item and is not reopened by UX Stage 1.
- AJM-2: IN PROGRESS / closure gate work remains independent from this navigation implementation.
- AJM-3 onward: not started/gated according to current stage records; Stage 1 does not create navigation commitments that conflict with their future domains.

### PJ

Inspected the PJ UX/IA reconciliation material and the current Queue/Operation/Clinical implementation anchors. PJ remains the Patient Journey authority; Stage 1 does not redefine PJ ownership or lifecycle behavior.

## 3. Current-state navigation classification

| Surface | Route | Classification | Stage 1 decision |
|---|---|---|---|
| Workspace | `/` | Workspace capability / principal working surface | Sidebar, label changed from Dashboard/Home to Workspace |
| Operations | `/operation` | Contextual operational workspace route | Keep canonical route; remove from Sidebar until Patient Flow reconciliation |
| Clinical | `/clinical` | Contextual clinical workspace route | Keep canonical route; remove from Sidebar until Patient Flow reconciliation |
| Treatment Plans | `/treatment-plans` | Domain feature | Sidebar |
| Patients | `/patients` | Domain | Sidebar |
| Agenda | `/agenda` | Domain | Sidebar |
| Queue | `/queue` | Legacy/contextual Patient Flow compatibility route | Keep protected route; remove from Sidebar |
| Financial & Resources | `/financial-resources` | Domain parent | Sidebar with existing parent/child hierarchy |
| Reports | `/reports` | Management/reporting surface | Sidebar; Dashboard/management reconciliation remains later |
| Analytics | `/analytics` | Management/analytics surface | Sidebar; deeper management IA remains later |
| Follow-up | `/follow-up` | Domain feature / PJ contextual capability | Sidebar; contextual entry points remain allowed |
| Settings | `/settings` | Administration/configuration | Sidebar; operational work remains outside Settings |

## 4. Authoritative Sidebar after Stage 1

```text
Workspace
Patients
Agenda
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
Reports
Analytics
Follow-up
Settings
```

Patient Flow is intentionally not inserted as a fake `/queue` entry. The master authority requires Patient Flow to be independently enabled/assigned and to expose Operations, Clinical and Administrative views of one system. The current repository does not yet contain that canonical independent Patient Flow assignment/context surface. Stage 6 owns that reconciliation.

## 5. Root-cause implementation changes

### 5.1 Navigation registry

`src/core/navigation/navigationRegistry.ts` now distinguishes:

- `sidebar` — complete user-facing navigation;
- `contextual` — canonical routes that remain addressable/protected but are not independent Sidebar domains.

Operations, Clinical and Queue are currently contextual. They were not deleted, redirected away, or visually hidden by CSS.

The registry remains the single source of truth for route permission requirements, while visibility is explicitly modeled rather than inferred from route existence.

The permission resolver now recursively traverses nested navigation children so nested financial routes can be resolved from the same canonical registry.

### 5.2 Active Workspace shell

`src/features/workspace/EntitlementAwareWorkspaceShell.tsx` now consumes `getSidebarNavigation()` rather than treating every registered route as Sidebar navigation.

This preserves:

`Permission → Capability → Sidebar visibility`

without turning contextual routes into top-level navigation entries.

Nested children remain permission/entitlement filtered.

### 5.3 Legacy Workspace shell alignment

`src/features/workspace/WorkspaceShell.tsx`, although not the active dashboard layout shell, was also reconciled to the same `getSidebarNavigation()` contract. This prevents a second shell implementation from retaining the superseded Sidebar model if it is reused later.

### 5.4 Middleware authorization

`middleware.ts` previously constructed a route permission map from root navigation entries only. That meant nested routes and contextual route semantics could diverge from the canonical registry.

It now resolves the required permission through `getRequiredPermission()` from the navigation registry. Contextual routes therefore remain protected even though they no longer appear in Sidebar.

This is a root-cause reconciliation, not a visual hiding patch.

### 5.5 Workspace naming

`src/app/(dashboard)/page.tsx` now identifies `/` as the Workspace home route rather than naming it a Dashboard page. The rendered implementation remains the existing `WorkspaceRenderer`.

No Dashboard management implementation was created in Stage 1.

## 6. Explicit non-actions

The following were deliberately not changed:

- Patient Flow assignment/enablement model.
- Operations/Clinical Queue business logic.
- Queue engine or workspace actions.
- PJ lifecycle.
- Authorization model.
- Tenant isolation.
- Financial domain ownership.
- Workspace personalization.
- Widget drag/drop.
- Widget Library.
- Global Search.
- Patient Context.
- Reports/Analytics management architecture.
- Settings domain ownership.

These remain in their governing stages.

## 7. Validation performed

### Source validation

- Navigation registry inspected before modification.
- Active Workspace shell inspected before modification.
- Legacy Workspace shell inspected before modification.
- Middleware route-permission behavior inspected before modification.
- `/`, `/operation`, `/clinical`, `/queue` route behavior inspected.
- Financial parent/child hierarchy inspected.
- AJM and PJ ownership boundaries inspected.
- Main branch was re-read after implementation to verify the commits are present.
- Vercel production runtime errors were rechecked; the existing four error groups are pre-existing production issues and are not attributed to Stage 1 source changes.

### Runtime validation gate

The repository changes were committed to `main`, but Vercel has not yet produced a deployment for the new Stage 1 commits at the time of closure preparation. The most recent Vercel production deployments available during this execution predate the Stage 1 commits.

Therefore production runtime validation of the changed Sidebar/route behavior cannot honestly be marked complete yet.

This document remains `IMPLEMENTED — RUNTIME VALIDATION PENDING` until a deployment containing the Stage 1 commits is READY and the changed navigation flows are checked in production.

## 8. Acceptance criteria

- [x] One canonical navigation registry remains in use.
- [x] Workspace is no longer labeled as Dashboard in the root route implementation.
- [x] Operations and Clinical remain available as protected contextual routes rather than independent Sidebar domains.
- [x] Queue remains available as a protected compatibility/contextual route rather than being presented as Patient Flow.
- [x] Financial & Resources retains its approved hierarchy.
- [x] Sidebar is derived from explicit navigation visibility rather than route existence.
- [x] Nested route permission resolution is centralized in the navigation registry.
- [x] Middleware still protects contextual routes after Sidebar removal.
- [x] Both current and legacy Workspace shells use the same Sidebar visibility contract.
- [x] No PJ/AJM domain ownership was changed.
- [ ] Production deployment containing Stage 1 commits is READY.
- [ ] Production Sidebar verified in Arabic and English.
- [ ] Production contextual-route authorization verified.

## 9. Closure rule

Stage 1 must not be marked CLOSED until the runtime gate above passes. No later UX stage should treat the current source implementation as production-verified merely because the source changes exist.

**Current status: IMPLEMENTED — RUNTIME VALIDATION PENDING.**
