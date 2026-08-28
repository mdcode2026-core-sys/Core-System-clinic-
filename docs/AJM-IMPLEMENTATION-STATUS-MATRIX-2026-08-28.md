# CORE SYSTEM — AJM Implementation Status Matrix
## Global UX/IA Stage 0 Reconciliation Snapshot — 2026-08-28

**Purpose:** Maintain the AJM status matrix required by the Global UX/IA Master Execution document. This is a reconciliation snapshot from the actual repository documentation and inspected implementation evidence; it does not silently reopen or close an AJM stage.

**Snapshot branch:** `ux-ia-stage-0-baseline-2026-08-28`
**Snapshot base:** `7be2c3cfe346eabd47af09a3157b9b0facae837b`

## Status rules

Allowed status vocabulary:

- COMPLETED
- PARTIALLY COMPLETED
- IMPLEMENTED — VALIDATION PENDING
- IN PROGRESS
- BLOCKED
- NOT STARTED
- NEEDS RECONCILIATION

A stage document, page or component existing in the repository is not sufficient evidence of completion.

## Current matrix

| Stage | Scope | Current status | Evidence / reason | UX/IA dependency |
|---|---|---|---|---|
| AJM-0 | Baseline & Readiness | COMPLETED | `docs/AJM-0-BASELINE-READINESS.md` explicitly records CLOSED and its Definition of Done as satisfied | UX Stage 0 may reuse this baseline; no conflict found |
| AJM-1 | Team & Access Foundation | NEEDS RECONCILIATION | `docs/AJM-1-TEAM-ACCESS-FOUNDATION.md` and `docs/AJM-STAGE-INDEX.md` say CLOSED, but `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md` says manual acceptance pending | UX must preserve the closed architectural implementation while resolving the contradictory validation-status record; do not silently reopen |
| AJM-2 | Financial & Resources Foundation | IN PROGRESS | `docs/AJM-2-IMPLEMENTATION-LOG.md` explicitly says IN PROGRESS — Authenticated E2E / Closure Gate | UX Stage 1/9/10 must preserve the current Financial & Resources hierarchy and canonical engines |
| AJM-3 | Workforce & Operations Foundation | NOT STARTED | Stage Index says GATED; no implementation evidence establishing stage start | Future Workforce must remain independent from Agenda/Team & Access and compatible with the UX model |
| AJM-4 | Communications Foundation | NOT STARTED | Stage Index says GATED; no completed implementation status found | Must integrate without becoming a second workflow engine |
| AJM-5 | Journey Coordination Foundation | NOT STARTED | Stage Index says GATED; no completed implementation status found | Must not duplicate Patient Flow, Agenda, PJ, Follow-up or Communications workflow engines |
| AJM-6 | Insights & Analytics | NOT STARTED | Stage Index says GATED; no completed stage status found | Dashboard/management surface must remain distinct from ordinary Workspace |
| AJM-7 | PJ & Cross-Domain Integration | NOT STARTED | Stage Index says GATED; no completed stage status found | Must preserve PJ ownership and Patient Flow continuity |
| AJM-8 | Final Validation & Closure | NOT STARTED | Stage Index says GATED; no completed stage status found | Must include UX visibility/search/security/runtime invariants |

## AJM-1 status conflict — explicit record

Two current records disagree:

1. `docs/AJM-1-TEAM-ACCESS-FOUNDATION.md` states **CLOSED**, with production build and runtime verification evidence.
2. `docs/AJM-1-VISIBILITY-VALIDATION-FOLLOWUP.md` states **IMPLEMENTATION COMPLETE — MANUAL ACCEPTANCE PENDING** and says the owner must manually verify the Team & Access surface after production readiness.

Stage 0 does **not** decide that the implementation is invalid and does **not** reopen AJM-1. It records the state as `NEEDS RECONCILIATION` so the project has one explicit status after the contradictory follow-up is resolved.

## AJM-2 UX impact

AJM-2 is actively implementing the Financial & Resources product surface. The current Sidebar hierarchy already matches the approved UX pattern:

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

Stage 0 therefore classifies this as **KEEP / RECONCILE**, not rebuild.

## Future-stage compatibility

The UX/IA model does not change AJM Domain ownership. It changes how authorized capabilities are presented through Sidebar, Workspace, Widgets, Patient Flow and contextual navigation.

No AJM stage is authorized by this matrix to bypass its own implementation gate, database reconciliation, runtime validation or closure evidence.

## Update rule

This matrix must be updated whenever a UX/IA stage changes the interpretation or implementation status of an AJM stage. The update must identify the evidence that caused the status change.

**Snapshot decision:** AJM status is now explicitly recorded for Global UX/IA Stage 0. No stage was silently reopened or marked complete solely from source-code presence.
