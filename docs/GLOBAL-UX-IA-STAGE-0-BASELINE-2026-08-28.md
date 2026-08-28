# CORE SYSTEM — Global UX / IA / Interaction
## Stage 0 — Baseline + AJM Reconciliation Lock

**Date:** 2026-08-28
**Status:** CLOSED — Baseline established; no broad product restructuring performed
**Branch:** `ux-ia-stage-0-baseline-2026-08-28`
**Base commit inspected:** `7be2c3cfe346eabd47af09a3157b9b0facae837b`

## 1. Governing authority

This Stage 0 record executes `CORE-SYSTEM-GLOBAL-UX-IA-MASTER-EXECUTION.md` Stage 0 and follows the 2026-08-28 Global UX/IA authority, final audit, implementation plan, documentation reconciliation register, AJM UX/IA addendum and PJ UX/IA addendum.

Execution method:

`READ → INSPECT → MAP → RECONCILE → RESEARCH → VALIDATE → IMPLEMENT → DOCUMENT → COMMIT → RECHECK`

Stage 0 is a baseline/reconciliation stage. It intentionally makes **no broad product restructuring** and does not redesign authorization, Patient Journey ownership, Queue, financial engines, or Domain ownership.

## 2. Repository baseline

Repository: `mdcode2026-core-sys/Core-System-clinic-`
Branch inspected: `main`
Current inspected commit: `7be2c3cfe346eabd47af09a3157b9b0facae837b`

### Canonical UX/IA infrastructure found

- `src/core/navigation/navigationRegistry.ts` — current Sidebar/navigation registry.
- `src/core/workspace/workspaceEngine.ts` — permission/feature/user-hidden Widget visibility engine.
- `src/core/workspace/widgetRegistry.ts` — current Widget catalog.
- `src/core/workspace/hooks/useWorkspace.ts` — Widget resolution, state, ordering and reset orchestration.
- `src/core/workspace/hooks/useWidgetPersistence.ts` — per-user localStorage persistence.
- `src/features/workspace/WorkspaceShell.tsx` — current Sidebar + shell.
- `src/features/workspace/WorkspaceRenderer.tsx` — current Widget rendering surface.
- `src/features/workspace/WidgetContainer.tsx` / `WidgetToolbar.tsx` — Widget interaction shell.
- `src/features/workspaces/OperationWorkspace.tsx` — operational Patient Flow/work surface.
- `src/features/workspaces/ClinicalWorkspace.tsx` — clinical Patient Journey work surface.
- `src/domain/queue/queue.engine.ts` — canonical queue business-rule engine candidate.
- `src/domain/queue/workspace.actions.ts` — current server-side operation/clinical workflow transitions.
- `src/features/reception/LiveQueueBoard.tsx` — additional Queue UI implementation.
- `src/features/doctor/MyQueueView.tsx` — additional clinician Queue UI implementation.
- `src/app/(dashboard)/queue/page.tsx` — legacy Queue route that redirects according to workspace/session permissions.
- `src/app/(dashboard)/page.tsx` — `/` currently renders `WorkspaceRenderer`.
- `src/app/(dashboard)/settings/page.tsx` — current Administration/Settings surface.

The repository tree document was also inspected but is dated 2026-08-08 and is therefore treated as historical evidence rather than the current file inventory.

## 3. Current UX Architecture Map

```text
CORE SYSTEM
│
├── Global/Home (`/`)
│   └── Current implementation: WorkspaceRenderer + Widget Registry
│
├── Operations (`/operation`)
│   └── OperationWorkspace
│       └── Queue / patient movement / arrival / clinical handoff / reception close
│
├── Clinical (`/clinical`)
│   └── ClinicalWorkspace
│       └── Queue handoff + clinical visit + procedures + medical files + treatment/follow-up entry
│
├── Patient Flow / Queue
│   ├── `/queue` legacy redirect surface
│   ├── Queue domain engine + queries/actions
│   ├── OperationWorkspace operational view
│   ├── ClinicalWorkspace clinical view
│   ├── LiveQueueBoard legacy/additional reception UI
│   └── MyQueueView legacy/additional clinician UI
│
├── Financial & Resources
│   └── `/financial-resources` parent with hierarchical children
│       ├── Overview
│       ├── Invoices
│       ├── Payments
│       ├── Financial Plans
│       │   └── Installments
│       ├── Insurance
│       │   └── Claims
│       ├── Inventory
│       │   └── Consumption
│       └── Purchasing
│           ├── Suppliers
│           └── Receiving
│
├── Patients (`/patients`)
├── Agenda (`/agenda`)
├── Treatment Plans (`/treatment-plans`)
├── Follow-up (`/follow-up`)
├── Reports (`/reports`)
├── Analytics (`/analytics`)
└── Settings / Administration (`/settings`)
```

### Stage 0 interpretation

The current repository already contains substantial reusable Workspace, Queue and Financial & Resources foundations. The primary UX/IA problem is **surface classification and reconciliation**, not absence of all functionality.

## 4. Navigation Map — current state

The current navigation registry exposes these root entries:

| Current entry | Current route | Current classification | Stage 0 finding |
|---|---|---|---|
| Dashboard/Home | `/` | Global/Home working surface | **RECONCILE** naming; implementation is WorkspaceRenderer, not a management Dashboard |
| Operation | `/operation` | Workspace / operational surface | **KEEP / RECONCILE** with final flexible Workspace model |
| Clinical | `/clinical` | Workspace / clinical surface | **KEEP / RECONCILE** with final flexible Workspace model |
| Treatment Plans | `/treatment-plans` | Domain feature | **RECONCILE** placement/context in Stage 1 |
| Patients | `/patients` | Domain | **KEEP / RECONCILE** hierarchy/context |
| Agenda | `/agenda` | Domain | **KEEP / RECONCILE** hierarchy/context |
| Queue | `/queue` | Workflow surface / Patient Flow | **NEEDS RECONCILIATION**; route redirects and Patient Flow is not explicitly represented as its own independent surface |
| Financial & Resources | `/financial-resources` | Domain parent | **KEEP** as current hierarchy reference |
| Reports | `/reports` | Management/reporting surface | **RECONCILE** with Dashboard/management IA |
| Analytics | `/analytics` | Management/analytics surface | **RECONCILE** with Dashboard/management IA |
| Follow-up | `/follow-up` | Domain feature | **RECONCILE** with PJ contextual navigation and future AJM coordination |
| Settings | `/settings` | Administration/configuration | **KEEP / EXTEND** as Administration surface; do not mix operational work into it |

### Important current-state observations

1. `WorkspaceShell` derives Sidebar visibility directly from `navigationRegistry` and effective permissions.
2. Financial & Resources already demonstrates a parent/child hierarchy that should be used as an IA pattern.
3. `/queue` is not an independent implementation surface; it redirects to `/operation`, `/clinical` or `/` based on permissions. This is a strong legacy/IA reconciliation candidate.
4. Patient Flow is not currently represented in the registry as the independent, explicitly assigned cross-workspace surface required by the final authority.
5. No separate Global Search entry is present in the current navigation registry.

## 5. Domain Surface Map

| Domain / capability | Owner / canonical evidence | Current surface | Stage 0 classification |
|---|---|---|---|
| Patient Journey | PJ | Operation, Clinical, Queue-related components | **KEEP / INTEGRATE** |
| Patient Flow | PJ/AJM UX integration | Operation/Clinical + legacy Queue surfaces | **RECONCILE** |
| Queue | `src/domain/queue/*` | Operation/Clinical/legacy Queue | **KEEP canonical domain logic; reconcile UIs** |
| Agenda | `src/domain/agenda/*` | `/agenda` + Quick Appointment Widget | **KEEP / INTEGRATE** |
| Patients | `src/domain/patients/*` | `/patients` + Quick Registration Widget | **KEEP / INTEGRATE** |
| Treatment Plans | PJ/clinical domain | `/treatment-plans`, Clinical contextual action | **KEEP / CONTEXTUALIZE** |
| Follow-up | `src/domain/followup/*` + PJ | `/follow-up`, Clinical contextual action + Widget | **KEEP / CONTEXTUALIZE** |
| Medical Files | PJ/clinical | Clinical + contextual Widget | **KEEP / CONTEXTUALIZE** |
| Financial & Resources | AJM-2 | `/financial-resources` hierarchy | **KEEP / RECONCILE** |
| Analytics | AJM/Insights | `/analytics`, Widget | **KEEP / RECONCILE** |
| Reports | AJM/Insights | `/reports` | **KEEP / RECONCILE** |
| Team & Access | AJM-1 | `/settings` | **KEEP / RECONCILE discoverability** |
| Global Search | Global UX capability | No canonical implementation identified in current source | **BUILD in Stage 8** |
| Patient Context | UX interaction surface | Partial contextual actions exist | **EXTEND later; no new Domain** |

## 6. Parent / Child Map

### Confirmed strong hierarchy

```text
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
```

### Relationships requiring Stage 1 reconciliation

```text
Global/Home
├── Global Search [required; not yet canonical in source]
├── cross-system quick actions
├── recent/attention work
└── entry to available workspaces

Patient Flow
├── Operations view
├── Clinical view
└── Administrative view
```

The second structure is the approved target, not a claim that all three views already exist as one explicit current navigation implementation.

## 7. Workspace / Widget Baseline

### Workspace engine

The current engine already enforces:

`Permission → feature flag → user state → visible Widget`

and therefore preserves the core invariant that a Widget does not grant authorization.

### Current Widget catalog

Current registered Widgets include:

- Quick Registration
- Quick Appointment
- Queue
- Follow-up
- Medical Files
- Billing Summary
- Analytics Overview

The catalog is permission-aware and contains natural size metadata.

### Current personalization reality

The Workspace hook supports Widget ordering, state changes and reset. However:

- persistence is currently browser `localStorage`, not a tenant/user database record;
- the current renderer does not expose a visible drag-and-drop reorder interaction;
- `reorderWidgets()` exists in the hook but no current Stage 0 evidence was found that a drag-and-drop UI calls it;
- there is no visible Widget Library/catalog management surface identified in the current shell;
- default layouts are derived from registry order rather than a clearly documented user-facing default configuration system.

Classification: **KEEP / RECONCILE / EXTEND later**. No Stage 0 implementation change is made.

## 8. Patient Flow / Queue baseline

### Canonical domain logic

`src/domain/queue/queue.engine.ts` contains the queue business rules and transition validation. `src/domain/queue/workspace.actions.ts` contains server-side tenant/authentication/permission checks and persists state transitions in `clinic_visit_sessions`.

The implemented operational flow is materially aligned with the PJ Stage 6 lifecycle:

`waiting → in_consultation → pending_close → completed`

with `no_show` and `cancelled` terminal outcomes.

### Existing operational flow

`OperationWorkspace` provides:

- reception/operations queue;
- patient search;
- drag/drop between valid operational lanes;
- arrival registration;
- handoff to clinical;
- no-show/cancel;
- reception completion after clinical handoff.

### Existing clinical flow

`ClinicalWorkspace` provides:

- waiting list;
- clinical session lock/handoff;
- visit context;
- medical files;
- examination/findings/decision;
- procedures;
- treatment-plan and follow-up contextual entry;
- save/finish visit;
- return to pending reception.

### Additional Queue UIs

`LiveQueueBoard` and `MyQueueView` both consume the Queue domain but use the older `queue.actions` surface rather than the newer `workspace.actions` handoff implementation.

This is a **confirmed reconciliation/duplication risk**, not yet a confirmed safe-to-delete duplicate. Stage 6 must trace all references and runtime usage before removal.

### Critical visibility conflict

The final UX/PJ authority requires explicit Clinic Admin enablement/assignment for Patient Flow and three contextual views of one system. Current `/operation` and `/clinical` access is based on `workspace:operation` / `workspace:clinical`, and `/queue` redirects based on those permissions. No explicit Patient Flow assignment/context mechanism is visible in the inspected navigation/workspace code.

Classification: **NEEDS RECONCILIATION**. Do not alter in Stage 0.

## 9. Global Search assessment

### Current source evidence

The current `WorkspaceShell` contains Sidebar, language switching and sign-out, but no Global Search control.

The current navigation registry contains no Global Search entry.

No canonical Global Search implementation was identified by repository code search during Stage 0.

### Assessment

Global Search is therefore a **documented required capability but not yet evidenced as a canonical current implementation**.

It must not be simulated by adding another page-local search box. Stage 8 must inspect any newly introduced search work and consolidate it into one authorization-aware cross-system search capability.

## 10. Discoverability findings

| Finding | Severity | Classification |
|---|---|---|
| `/` is labelled `dashboard` in navigation while its implementation is WorkspaceRenderer/working surface | High | RECONCILE |
| Patient Flow is not a distinct current navigation capability with explicit assignment/context | Critical | RECONCILE before Stage 6 finalization |
| `/queue` behaves as a redirect compatibility route rather than a canonical Patient Flow surface | High | RECONCILE |
| Operations/Clinical are exposed as workspace-permission roots; final model requires flexible user surface and separate Patient Flow assignment | High | RECONCILE in Stage 2/6 |
| Financial & Resources hierarchy is significantly clearer than the rest of the Sidebar | Medium | KEEP as pattern |
| Reports and Analytics are peers of operational Domains without a finalized management-surface hierarchy | Medium | RECONCILE in Stage 9/10 |
| Settings already has grouped Team & Access cards and permission filtering | Low/Positive | KEEP |
| Widget state controls exist but visible drag/drop personalization is not evidenced | Medium | EXTEND in Stage 4 |
| No canonical Global Search control is visible in the current shell | Critical | BUILD in Stage 8 |

## 11. Usability findings

### Positive

- Operations has a direct, understandable patient-flow working surface.
- Clinical has a real visit-work surface rather than only a dashboard.
- Financial & Resources already uses a coherent hierarchy.
- Widget visibility is permission-aware.
- Server-side Queue actions validate tenant and effective permissions.
- Settings provides a clear Team & Access landing area and permission-filtered managers.

### Risks

- Users can encounter several Queue representations without a clear canonical Patient Flow identity.
- `/` is conceptually named Dashboard although it is currently the Workspace/Widget surface.
- Global discovery is not yet a stable cross-system capability.
- Workspace personalization is partially implemented at engine level but not fully exposed as the approved drag/drop Widget Library experience.
- The current Workspace model and the final flexible user model are not yet fully reconciled in navigation/presentation.

## 12. Runtime discrepancy list

Current Vercel production project: `core-system-clinic`.
Latest production deployment inspected: READY, deployment `dpl_ESTGhYWWCSccqCTtEUeP4xmatm34`, commit `7be2c3cfe346eabd47af09a3157b9b0facae837b`.

Production runtime error groups observed in the latest 24-hour error window:

1. `isFeatureEnabled` → permission denied for function `get_current_user_role` — 34 occurrences, route `/`, last seen 2026-08-27 23:03:36Z.
2. `AnalyticsEngine` → `inventory.low_stock_risk_rate` KPI failure — 4 occurrences, route `/`, last seen 2026-08-27 23:04:21Z.
3. Supabase client missing URL/key — 2 occurrences, route `/financial-resources`, last seen 2026-08-27 20:55:43Z.
4. `Not authenticated` — 1 occurrence, route `/clinical`, last seen 2026-08-27 23:03:33Z.

These are runtime defects/discrepancies observed in production evidence. Stage 0 does not fix them because they are not UX/IA-only defects and broad restructuring is explicitly out of scope.

## 13. AJM ↔ UX/IA conflict map

| AJM area | Current AJM reality | UX/IA conflict | Stage 0 action |
|---|---|---|---|
| AJM-0 | CLOSED | None material; baseline authority aligns with UX reconciliation method | KEEP |
| AJM-1 | CLOSED in stage authority/index | `AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md` still says manual acceptance pending | **NEEDS RECONCILIATION**; do not silently reopen closed stage |
| AJM-2 | IN PROGRESS — runtime/closure gate | Financial & Resources surface is already hierarchical and matches UX target; runtime closure remains pending | KEEP; Stage 0 records dependency |
| AJM-3 | GATED / not started | Future Workforce must not be forced into current Workspace/Sidebar model | Compatible; no implementation |
| AJM-4 | GATED / not started | Communications must integrate without creating a second workflow/navigation engine | Compatible |
| AJM-5 | GATED / not started | Coordination must remain independent and not become Patient Flow/Agenda/PJ duplicate | Compatible; future check required |
| AJM-6 | GATED / not started | Insights/Reports must remain management surfaces and not become ordinary Workspace | Compatible |
| AJM-7 | GATED / not started | PJ integration must preserve Patient Flow ownership and contextual integration | Compatible; future check required |
| AJM-8 | GATED / not started | Final runtime/security validation must include UX visibility/search invariants | Compatible |

## 14. PJ ↔ UX/IA conflict map

| PJ reference/implementation | Current reality | Conflict | Classification |
|---|---|---|---|
| `PJ_FINAL_IMPLEMENTATION_STATE.md` | PJ Stage 15 closure; Patient Journey is implemented as one canonical journey | No ownership conflict | KEEP |
| `docs/PJ-UX-IA-RECONCILIATION-ADDENDUM-2026-08-28.md` | Explicitly requires independent Patient Flow, Queue reuse, 3 views, explicit assignment and contextual navigation | Current code does not yet expose explicit Patient Flow assignment/context | **NEEDS RECONCILIATION** |
| `PJ_STAGE6_WORKSPACE_ARCHITECTURE.md` | Historical Stage 6 model names Operation/Clinical/Administration workspaces | Later 2026-08-28 authority supersedes fixed user-facing interpretation | **DOCUMENTATION SUPERSEDED / KEEP HISTORY** |
| Queue domain | Canonical queue engine and persisted session state exist | Multiple UI consumers exist | **RECONCILE in Stage 6** |
| Clinical workspace | Real visit workflow exists | Must remain one Patient Flow system, not a second queue | KEEP / RECONCILE |
| Operation workspace | Real reception/operational workflow exists | Must not be mistaken for automatic Patient Flow assignment | KEEP / RECONCILE |

## 15. Required future-stage gates identified by Stage 0

### Stage 1 — Navigation / IA
- classify every current Sidebar item;
- resolve `/` Dashboard naming;
- resolve Queue/Patient Flow navigation;
- establish parent/child relationships beyond Financial & Resources;
- preserve Settings as Administration/configuration.

### Stage 2 — User Surface
- reconcile flexible Workspace model with current Operations/Clinical roots;
- verify no Workspace Membership security layer is introduced;
- verify permissions remain independent of presentation.

### Stage 4 — Personalization
- expose actual drag/drop ordering;
- expose Widget Library/available Widgets;
- verify persistence and reset;
- verify permission removal invalidates previously selected Widgets.

### Stage 6 — Patient Flow
- identify canonical Queue transition/action engine;
- trace `queue.actions` vs `workspace.actions` consumers;
- reconcile LiveQueueBoard/MyQueueView/OperationWorkspace/ClinicalWorkspace;
- implement/verify explicit Patient Flow assignment/context without creating a second authorization model;
- preserve persisted patient movement and visit closure.

### Stage 8 — Global Search
- inspect any search code introduced after this baseline;
- establish one canonical search capability;
- support cross-domain authorized results and direct navigation;
- Arabic/English parity.

### Stage 9/10 — Overview/Dashboard/Sidebar
- separate management/monitoring from daily work;
- finalize Sidebar only after Workspace/Widget/Patient Flow decisions are established.

## 16. Stage 0 non-goals respected

No code restructuring, route deletion, Queue deletion, authorization redesign, Patient Journey redesign, Domain merge, duplicate removal or Global Search implementation was performed in this Stage 0 change.

## 17. Closure

Stage 0 baseline is complete when this report, the AJM status matrix and the documentation reconciliation update are committed together.

**Stage 0 decision: CLOSED — proceed to Stage 1 only from this recorded baseline.**
